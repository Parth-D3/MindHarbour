import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import { ChromaClient } from "chromadb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const chroma = new ChromaClient({
  path: process.env.CHROMA_URL || "http://localhost:8000",
});

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function normalizeUrl(url) {
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
}

function collectionNameFor(url) {
  return new URL(url).host.replace(/\./g, "_").replace(/-/g, "_").slice(0, 63);
}

async function scrape(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, aside, form").remove();

  const text = $.text();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.join("\n");
}

function chunkText(text) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

async function getOrBuildCollection(url) {
  const name = collectionNameFor(url);
  let collection;

  try {
    collection = await chroma.getCollection({ name });
    const count = await collection.count();
    if (count > 0) return collection;
  } catch {
    collection = await chroma.createCollection({ name });
  }

  const rawText = await scrape(url);
  const chunks = chunkText(rawText);

  await collection.upsert({
    ids: chunks.map((_, i) => `chunk_${i}`),
    documents: chunks,
    metadatas: chunks.map((_, i) => ({
      source: url,
      chunk_index: i,
    })),
  });

  return collection;
}

async function ragQuery(collection, question, url, n = 4) {
  const results = await collection.query({
    queryTexts: [question],
    nResults: n,
  });

  const docs = results.documents?.[0] || [];
  const context = docs.join("\n\n---\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a helpful assistant for the website: ${url}
Answer the user's question using ONLY the context below.
If the answer isn't in the context, say "I don't have that info - try visiting ${url} directly."

CONTEXT:
${context}

QUESTION: ${question}

ANSWER:`,
      },
    ],
  });

  return message.content?.[0]?.text || "No answer returned.";
}

app.post("/api/site-rag", async (req, res) => {
  try {
    const { url, question } = req.body;

    if (!url || !question) {
      return res.status(400).json({
        error: "url and question are required",
      });
    }

    const normalizedUrl = normalizeUrl(url);
    const collection = await getOrBuildCollection(normalizedUrl);
    const answer = await ragQuery(collection, question, normalizedUrl);

    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});