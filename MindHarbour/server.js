import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

// In-memory cache
// {
//   [url]: {
//     url,
//     chunks: [{ id, text, chunk_index }],
//     scrapedAt
//   }
// }
const inMemoryStore = {};

function normalizeUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) throw new Error("URL is required");
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}



async function scrape(url) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) {
    throw new Error(`URL did not return HTML. Content-Type: ${contentType}`);
  }

  const html = await response.text();

  if (!html || html.trim().length < 50) {
    throw new Error("Received empty or very small HTML response");
  }

  const $ = cheerio.load(html);

  $("script, style, aside, form, noscript, svg, iframe").remove();

  const text = $("body").text();
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const cleaned = lines.join("\n");

  if (!cleaned || cleaned.length < 80) {
    throw new Error(
      "The page loaded, but there was not enough readable text. This site may require JavaScript rendering."
    );
  }

  return cleaned;
}

function chunkText(text) {
  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    chunks.push({
      id: `chunk_${index}`,
      text: text.slice(start, start + CHUNK_SIZE),
      chunk_index: index,
    });
    start += CHUNK_SIZE - CHUNK_OVERLAP;
    index += 1;
  }

  return chunks;
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreChunk(question, chunkTextValue) {
  const qTokens = new Set(tokenize(question));
  const cTokens = tokenize(chunkTextValue);

  let score = 0;
  for (const token of cTokens) {
    if (qTokens.has(token)) score += 1;
  }

  return score;
}

function getTopMatchingChunks(question, chunks, n = 4) {
  return [...chunks]
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(question, chunk.text),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

async function getOrBuildSiteData(url) {
  if (inMemoryStore[url]?.chunks?.length > 0) {
    return inMemoryStore[url];
  }

  const rawText = await scrape(url);
  const chunks = chunkText(rawText);

  inMemoryStore[url] = {
    url,
    chunks,
    scrapedAt: new Date().toISOString(),
  };

  return inMemoryStore[url];
}

async function ragQuery(siteData, question, url, n = 4) {
  const topChunks = getTopMatchingChunks(question, siteData.chunks, n);
  const context = topChunks.map((c) => c.text).join("\n\n---\n\n");

  if (!context.trim()) {
    return `I don't have that info - try visiting ${url} directly.`;
  }

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
    console.log("Fetching URL:", normalizedUrl);

    const siteData = await getOrBuildSiteData(normalizedUrl);
    console.log("Chunks created:", siteData.chunks.length);

    const answer = await ragQuery(siteData, question, normalizedUrl);

    res.json({
      answer,
      cached: true,
      chunkCount: siteData.chunks.length,
      scrapedAt: siteData.scrapedAt,
    });
  } catch (error) {
    console.error("SITE_RAG_ERROR:", error);
    res.status(500).json({
      error: error.message || "Server error",
    });
  }
});

app.post("/api/site-rag/test-fetch", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const normalizedUrl = normalizeUrl(url);

    const response = await fetch(normalizedUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    res.json({
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      contentType,
      preview: html.slice(0, 1000),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Fetch test failed",
    });
  }
});


app.post("/api/anthropic/messages", async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "messages array is required",
      });
    }

    const response = await anthropic.messages.create({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: max_tokens || 1024,
      ...(system ? { system } : {}),
      messages,
    });

    res.json(response);
  } catch (error) {
    console.error("ANTHROPIC_PROXY_ERROR:", error);
    res.status(500).json({
      error: error.message || "Anthropic request failed",
    });
  }
});


app.get("/api/site-rag/debug", (req, res) => {
  const summary = Object.values(inMemoryStore).map((item) => ({
    url: item.url,
    chunkCount: item.chunks.length,
    scrapedAt: item.scrapedAt,
  }));

  res.json(summary);
});

app.post("/api/site-rag/clear", (req, res) => {
  Object.keys(inMemoryStore).forEach((key) => {
    delete inMemoryStore[key];
  });

  res.json({ success: true, message: "In-memory store cleared" });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});