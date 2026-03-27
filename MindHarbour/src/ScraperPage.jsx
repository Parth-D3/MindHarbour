import { useState } from "react";

const COLORS = {
  pageBg: "#FFFFFF",
  sectionBg: "#FFFDF7",
  cardBg: "#FFFBEF",
  cardBgSoft: "#FFF8E7",
  border: "#F1E6C8",
  text: "#6B3FA0",
  textSoft: "#8E5BBF",
  textMuted: "#A67CCF",
  accent: "#D946EF",
  accentSoft: "#F3D6FA",
  accent2: "#EC4899",
  buttonBg: "#FFF4CC",
  buttonHover: "#FDE68A",
  white: "#FFFFFF",
  success: "#10B981",
  warning: "#EAB308",
  danger: "#EF4444",
};

const API_URL = "http://localhost:3001/api/site-rag";

export default function ScraperPage() {
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askWebsite = async () => {
    if (!url.trim() || !question.trim()) {
      setError("Please enter a website URL and a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setStatus("Scraping website and preparing answer...");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          question: question.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setAnswer(data.answer || "No answer returned.");
      setStatus("Done");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(145deg, #FFFFFF 0%, #FFFDF7 45%, #FFF8FC 100%)",
        padding: "32px 20px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            marginBottom: 18,
            background: COLORS.buttonBg,
            color: COLORS.text,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Back to Home
        </button>

        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 8px 30px rgba(236,72,153,0.08)",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 34,
              color: COLORS.text,
              margin: "0 0 10px",
            }}
          >
            Website Summary
          </h1>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: COLORS.textSoft,
              margin: "0 0 24px",
              lineHeight: 1.7,
            }}
          >
            Paste a website link, ask a question, and the app will scrape the
            page, split the content into chunks, store/query it, and answer from
            the website context.
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: "100%",
                padding: 14,
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                color: COLORS.text,
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            <textarea
              placeholder="What do you want to know about this website?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              style={{
                width: "100%",
                padding: 14,
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                color: COLORS.text,
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.7,
              }}
            />

            <button
              onClick={askWebsite}
              disabled={loading}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                padding: "14px 36px",
                background: "linear-gradient(135deg, #D946EF, #EC4899)",
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                boxShadow: "0 4px 16px rgba(217,70,239,0.18)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Processing..." : "Ask Website"}
            </button>
          </div>

          {status && !error && (
            <p
              style={{
                marginTop: 14,
                color: COLORS.textSoft,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              {status}
            </p>
          )}

          {error && (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                borderRadius: 10,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: COLORS.danger,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                }}
              >
                {error}
              </p>
            </div>
          )}

          {answer && (
            <div
              style={{
                marginTop: 20,
                padding: 18,
                background: COLORS.cardBgSoft,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: COLORS.textMuted,
                  margin: "0 0 8px",
                  fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Answer
              </p>

              <p
                style={{
                  fontSize: 15,
                  color: COLORS.text,
                  margin: 0,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}