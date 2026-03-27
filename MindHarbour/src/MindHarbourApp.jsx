import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import Tesseract from "tesseract.js";

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
  accent2Soft: "#FCE7F3",
  buttonBg: "#FFF4CC",
  buttonHover: "#FDE68A",
  white: "#FFFFFF",
  success: "#10B981",
  warning: "#EAB308",
  danger: "#EF4444",
};

const COMMON_HELP_PHONE = "+353 1 000 0000";
const COMMON_HELP_EMAIL = "support@mindharbour.ie";

const HTML_TOOL_URL = "/process.html";

const CATEGORY_COLORS = {
  Depression: "#C084FC",
  Anxiety: "#FB7185",
  "Social Anxiety": "#E879F9",
  Loneliness: "#A78BFA",
  "Stress Burnout": "#F472B6",
  "Grief Loss": "#D8B4FE",
  "Ptsd Trauma": "#F9A8D4",
};

const LANGUAGES = [
  { code: "en", name: "English", speech: "en-IE" },
  { code: "ga", name: "Gaeilge", speech: "ga-IE" },
  { code: "pl", name: "Polski", speech: "pl-PL" },
  { code: "es", name: "Español", speech: "es-ES" },
  { code: "fr", name: "Français", speech: "fr-FR" },
  { code: "pt", name: "Português", speech: "pt-PT" },
  { code: "ro", name: "Română", speech: "ro-RO" },
  { code: "zh", name: "中文", speech: "zh-CN" },
  { code: "ar", name: "العربية", speech: "ar-SA" },
];

const T = {
  en: {
    subtitle:
      "A safe space to support refugees and immigrants through emotional wellbeing, documents, and important life processes in a new country.",
    start: "Let's Talk",
    disclaimer:
      "This is a support and screening aid, not a diagnostic or legal service. Always consult a professional where needed.",
    howFeeling: "How are you feeling?",
    takeTime: "Type or speak about what is on your mind. Take your time.",
    text: "Text",
    voice: "Voice",
    document: "Document",
    placeholder: "I've been feeling...",
    tapRecord: "Tap to start recording",
    recLabel: (s) => `Recording... ${s}s`,
    analyze: "Analyze",
    analyzing: "Analyzing...",
    results: "Screening Results",
    basedOn: "Based on what you shared, here is what we identified.",
    summary: "Summary",
    concerns: "Detected Concerns",
    clinicalNote:
      "DISCLAIMER: This is NOT a clinical diagnosis. These are indicators detected from text patterns. Please consult a licensed mental health professional.",
    findGP: "Find Nearest GP",
    nearestGP: "Your Nearest GP",
    gpSub: "We found the closest GP who can help.",
    consent: "Consent & Notify GP",
    decline: "Decline -- Keep Private",
    confirmTitle: "Confirm Sharing",
    willShare: "Will be shared:",
    willNot: "Will NOT be shared:",
    shareItem1: "Summary of your speech (not the full text)",
    noShare1: "Your full text / raw recording",
    noShare2: "Any personal identifiers",
    sendingTo: (n, p) => `Sending to: ${n} at ${p}`,
    cancel: "Cancel",
    confirmSend: "Confirm & Send",
    sent: "Notification Sent",
    failed: "Sending Failed",
    sentMsg: (n, p) =>
      `Your screening summary has been sent to ${n} at ${p}. They will review it and respond.`,
    failMsg:
      "The email could not be sent. Please check your connection or contact the GP directly.",
    gpContact: "GP Contact Details",
    crisis: "Crisis Resources:",
    crisisNums:
      "Samaritans: 116 123 | Pieta House: 1800 247 247 | Text: 50808",
    newSession: "Start New Session",
    profileTitle: "Your Profile",
    fName: "Name",
    fLocation: "Location",
    fAge: "Age",
    fEmergency: "Emergency Contact",
    privacy:
      "Your profile data stays on your device. It is only used to find the nearest GP and is never shared without your consent.",
    uploadDoc: "Upload or click a photo of a document",
    readingDoc: "Reading document...",
    documentType: "Document Type",
    simpleSummary: "Simple Summary",
    whatToDo: "What You Should Do",
    importantDetails: "Important Details",
    noReadableText: "No readable text found in the image.",
    docError: "Document processing failed.",
    backHome: "Back to Home",
  },
};

const GP_DATABASE = [
  {
    name: "Dr. Sarah Mitchell",
    county: "Dublin",
    practice: "Merrion Square Medical Centre",
    lat: 53.3398,
    lon: -6.2468,
    address: "45 Merrion Square East, Dublin 2",
    phone: "+353-1-676-1234",
    email: "reception@merrionsquaremc.ie",
  },
  {
    name: "Dr. James O'Connor",
    county: "Dublin",
    practice: "Grafton Medical Practice",
    lat: 53.3418,
    lon: -6.2624,
    address: "12 Aungier Street, Dublin 2",
    phone: "+353-1-478-5678",
    email: "info@graftonmedical.ie",
  },
  {
    name: "Dr. Aoife Kelly",
    county: "Dublin",
    practice: "Clontarf Family Practice",
    lat: 53.3647,
    lon: -6.1778,
    address: "9 Clontarf Road, Dublin 3",
    phone: "+353-1-833-2345",
    email: "appointments@clontarffp.ie",
  },
  {
    name: "Dr. Fiona Walsh",
    county: "Cork",
    practice: "South Mall Medical Centre",
    lat: 51.8979,
    lon: -8.4691,
    address: "22 South Mall, Cork City",
    phone: "+353-21-427-1234",
    email: "reception@southmallmc.ie",
  },
  {
    name: "Dr. Patrick Doyle",
    county: "Cork",
    practice: "Douglas Village Surgery",
    lat: 51.8768,
    lon: -8.4352,
    address: "5 Douglas Village, Cork",
    phone: "+353-21-489-5678",
    email: "info@douglassurgery.ie",
  },
  {
    name: "Dr. Ciara Murphy",
    county: "Cork",
    practice: "Bandon Health Centre",
    lat: 51.7452,
    lon: -8.7413,
    address: "Main Street, Bandon, Co. Cork",
    phone: "+353-23-882-2345",
    email: "bandonhc@eircom.net",
  },
  {
    name: "Dr. Roisin McCarthy",
    county: "Galway",
    practice: "Eyre Square Medical Practice",
    lat: 53.2743,
    lon: -9.049,
    address: "3 Eyre Square, Galway City",
    phone: "+353-91-562-1234",
    email: "info@eyresquaremedical.ie",
  },
  {
    name: "Dr. Sean Byrne",
    county: "Galway",
    practice: "Salthill Family Clinic",
    lat: 53.2599,
    lon: -9.077,
    address: "Upper Salthill, Galway",
    phone: "+353-91-521-5678",
    email: "appointments@salthillclinic.ie",
  },
  {
    name: "Dr. Orla Maguire",
    county: "Galway",
    practice: "Tuam Primary Care Centre",
    lat: 53.5133,
    lon: -8.8558,
    address: "Vicar Street, Tuam, Co. Galway",
    phone: "+353-93-241-2345",
    email: "tuampcc@hse.ie",
  },
  {
    name: "Dr. Tom Higgins",
    county: "Limerick",
    practice: "O'Connell Street Medical Centre",
    lat: 52.6638,
    lon: -8.6267,
    address: "48 O'Connell Street, Limerick City",
    phone: "+353-61-415-1234",
    email: "reception@oconnellmc.ie",
  },
  {
    name: "Dr. Margaret Daly",
    county: "Limerick",
    practice: "Castletroy Medical Practice",
    lat: 52.6741,
    lon: -8.5524,
    address: "Castletroy Shopping Centre, Limerick",
    phone: "+353-61-331-5678",
    email: "info@castletroymedical.ie",
  },
  {
    name: "Dr. Kevin Barry",
    county: "Limerick",
    practice: "Newcastle West Health Centre",
    lat: 52.4491,
    lon: -9.059,
    address: "Gortboy, Newcastle West, Co. Limerick",
    phone: "+353-69-621-2345",
    email: "nwesthc@hse.ie",
  },
  {
    name: "Dr. Emily Brennan",
    county: "Kildare",
    practice: "Naas Medical Centre",
    lat: 53.2159,
    lon: -6.6597,
    address: "Dublin Road, Naas, Co. Kildare",
    phone: "+353-45-897-1234",
    email: "reception@naasmedical.ie",
  },
  {
    name: "Dr. Ronan Gallagher",
    county: "Kildare",
    practice: "Maynooth Family Practice",
    lat: 53.3813,
    lon: -6.5916,
    address: "22 Main Street, Maynooth, Co. Kildare",
    phone: "+353-1-628-5678",
    email: "info@maynoothfp.ie",
  },
  {
    name: "Dr. Helen O'Brien",
    county: "Kildare",
    practice: "Celbridge Primary Care",
    lat: 53.3388,
    lon: -6.5441,
    address: "Main Street, Celbridge, Co. Kildare",
    phone: "+353-1-627-2345",
    email: "celbridgepc@hse.ie",
  },
];

const LOCATIONS = {
  dublin: [53.3498, -6.2603],
  "dublin 2": [53.3382, -6.2591],
  cork: [51.8985, -8.4756],
  galway: [53.2707, -9.0568],
  limerick: [52.6638, -8.6267],
  naas: [53.2159, -6.6597],
  maynooth: [53.3813, -6.5916],
  clontarf: [53.3647, -6.1778],
  ranelagh: [53.3244, -6.2514],
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toR = (n) => (n * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) *
      Math.cos(toR(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function analyzeWithLLM(text, lang = "en") {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY is not set");

  const langName = LANGUAGES.find((l) => l.code === lang)?.name || "English";

  const prompt = `Analyze the following personal message for mental health concerns. Return ONLY valid JSON, no explanation or markdown.

Pick from these categories (use the exact names):
Depression, Anxiety, Social Anxiety, Loneliness, Stress Burnout, Grief Loss, Ptsd Trauma

Message: ${JSON.stringify(text)}

Write the "summary" and flag "description" fields in ${langName}. Write the "emailBody" in English. No em dashes anywhere.

Return this structure:
{
  "flags": [
    {
      "category": "exact category name",
      "confidence": 0.0,
      "description": "one sentence clinical description in ${langName}",
      "matched": ["short phrase or theme from the message"]
    }
  ],
  "summary": "2-3 sentences describing what the person is experiencing, in warm and plain language, written in ${langName}. No em dashes.",
  "emailBody": "A short email to a GP written in English. Open with 'Dear Dr. [GP_NAME],' and sign off 'The MindHarbour Team'. No em dashes. Warm, direct tone. Briefly describe what the person shared and list the detected concerns. Three short paragraphs. Use [GP_NAME] and [PRACTICE_NAME] as placeholders."
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      `API ${res.status}: ${
        errBody?.error?.message || JSON.stringify(errBody)
      }`
    );
  }

  const data = await res.json();
  const raw = data.content[0].text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const result = JSON.parse(raw);

  result.flags = result.flags.map((f) => ({
    ...f,
    color: CATEGORY_COLORS[f.category] || COLORS.accent,
  }));
  result.primary = result.flags[0] || null;
  result.timestamp = new Date().toISOString();
  return result;
}

async function summarizeDocumentWithLLM(extractedText, lang = "en") {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY is not set");

  const langName = LANGUAGES.find((l) => l.code === lang)?.name || "English";

  const prompt = `You are helping a refugee or immigrant understand an official document.

Read the OCR text below and return ONLY valid JSON.

The person may have:
- low literacy
- limited English
- difficulty understanding formal documents

Explain the document in very simple language, in ${langName}.

Focus mainly on:
1. what this document is
2. what the person needs to do next
3. what documents or information they may need
4. any important dates, warnings, or deadlines

Always include the same support contact details below in the response.
Phone: ${COMMON_HELP_PHONE}
Email: ${COMMON_HELP_EMAIL}

Be practical and action-oriented.
Do not copy the full document back.

OCR TEXT:
${JSON.stringify(extractedText)}

Return this exact JSON structure:
{
  "documentType": "short guess of document type in ${langName}",
  "summary": "2-4 sentence simple summary in ${langName}",
  "actionItems": [
    "short action item in ${langName}",
    "short action item in ${langName}"
  ],
  "importantDetails": [
    "important detail in ${langName}",
    "important detail in ${langName}"
  ],
  "supportContact": {
    "phone": "${COMMON_HELP_PHONE}",
    "email": "${COMMON_HELP_EMAIL}"
  }
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      `API ${res.status}: ${
        errBody?.error?.message || JSON.stringify(errBody)
      }`
    );
  }

  const data = await res.json();
  const raw = data.content[0].text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(raw);
}

function findClosestGP(location) {
  const loc = location.toLowerCase().trim();
  let coords = LOCATIONS[loc] || LOCATIONS["dublin"];
  for (const [k, v] of Object.entries(LOCATIONS)) {
    if (loc.includes(k) || k.includes(loc)) {
      coords = v;
      break;
    }
  }
  const sorted = GP_DATABASE.map((gp) => ({
    ...gp,
    distance: haversine(coords[0], coords[1], gp.lat, gp.lon),
  })).sort((a, b) => a.distance - b.distance);
  return sorted[0];
}

function HomeScreen({
  onJournal,
  onDocument,
  onHtmlTool,
  onScraper,
  t,
  lang,
  setLang,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const cardStyle = {
    width: "100%",
    padding: "18px 20px",
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    color: COLORS.text,
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 20px rgba(236,72,153,0.08)",
  };

  const titleStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 6px",
    color: COLORS.text,
  };

  const descStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    lineHeight: 1.6,
    margin: 0,
    color: COLORS.textSoft,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #FFFFFF 0%, #FFFDF7 45%, #FFF8FC 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(217,70,239,0.10) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.10) 0%, transparent 50%)",
        }}
      />

      <div
        style={{
          textAlign: "center",
          zIndex: 1,
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
          maxWidth: 760,
          width: "100%",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            margin: "0 auto 32px",
            borderRadius: 20,
            background: "linear-gradient(135deg, #D946EF, #EC4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(217,70,239,0.20)",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 42,
            color: COLORS.text,
            margin: "0 0 12px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          MindHarbour
        </h1>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 17,
            color: COLORS.textSoft,
            margin: "0 0 24px",
            lineHeight: 1.7,
          }}
        >
          {t.subtitle}
        </p>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            padding: "10px 16px",
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            color: COLORS.text,
            marginBottom: 28,
            cursor: "pointer",
            outline: "none",
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 8,
          }}
        >
          <button
            onClick={onJournal}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            <p style={titleStyle}>Emotional Check-In</p>
            <p style={descStyle}>
              Journal with text or voice, convert speech to text, screen for
              mental health concerns, and get guidance to the nearest GP.
            </p>
          </button>

          <button
            onClick={onDocument}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            <p style={titleStyle}>Document Helper</p>
            <p style={descStyle}>
              Upload a photo of a document and get a simple explanation of what
              it means, what to do next, and key details to remember.
            </p>
          </button>

          <button
            onClick={onHtmlTool}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            <p style={titleStyle}>Process Guide</p>
            <p style={descStyle}>
              Get guided help for practical tasks like opening a bank account,
              applying for a PPSN number, and understanding official steps.
            </p>
          </button>

          <button
            onClick={onScraper}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            <p style={titleStyle}>Website Summary</p>
            <p style={descStyle}>
              Open your web summarizer tool to fetch and simplify information
              from a website link.
            </p>
          </button>
        </div>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: COLORS.textMuted,
            marginTop: 28,
          }}
        >
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}

function TopNav({ screen, profile, setShowProfile }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #D946EF, #EC4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <circle cx="9" cy="9" r="1" fill="white" />
            <circle cx="15" cy="9" r="1" fill="white" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            color: COLORS.text,
            fontWeight: 600,
          }}
        >
          MindHarbour
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {["analysis", "gp", "email"].includes(screen) && (
          <>
            {["analysis", "gp", "email"].map((s, i) => (
              <div
                key={s}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      screen === s
                        ? COLORS.accent
                        : ["analysis", "gp", "email"].indexOf(screen) > i
                        ? COLORS.success
                        : COLORS.border,
                    transition: "all 0.3s",
                  }}
                />
                {i < 2 && (
                  <div
                    style={{
                      width: 24,
                      height: 1,
                      background: COLORS.border,
                    }}
                  />
                )}
              </div>
            ))}
          </>
        )}

        <button
          onClick={() => setShowProfile((v) => !v)}
          style={{
            marginLeft: 8,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.textSoft,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          {profile.name ? profile.name[0].toUpperCase() : "?"}
        </button>
      </div>
    </nav>
  );
}

function ProfileTab({ profile, setProfile, onClose, t }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 380,
        background: COLORS.cardBg,
        borderLeft: `1px solid ${COLORS.border}`,
        zIndex: 100,
        padding: 32,
        overflowY: "auto",
        boxShadow: "-8px 0 32px rgba(236,72,153,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 24,
            color: COLORS.text,
            margin: 0,
          }}
        >
          {t.profileTitle}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: COLORS.textSoft,
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {[
        { label: t.fName, key: "name", placeholder: t.fName },
        {
          label: t.fLocation,
          key: "location",
          placeholder: "e.g. Dublin 2, Cork, Galway",
        },
        { label: t.fAge, key: "age", placeholder: t.fAge },
        {
          label: t.fEmergency,
          key: "emergency",
          placeholder: "Phone number",
        },
      ].map((f) => (
        <div key={f.key} style={{ marginBottom: 20 }}>
          <label
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: COLORS.textSoft,
              display: "block",
              marginBottom: 6,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {f.label}
          </label>
          <input
            value={profile[f.key] || ""}
            onChange={(e) =>
              setProfile({ ...profile, [f.key]: e.target.value })
            }
            placeholder={f.placeholder}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              color: COLORS.text,
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: COLORS.accentSoft,
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: COLORS.textSoft,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {t.privacy}
        </p>
      </div>
    </div>
  );
}

function JournalScreen({ onAnalyze, analyzing, lang, t, onBackHome }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("text");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [loadProgress, setLoadProgress] = useState(null);
  const [voiceError, setVoiceError] = useState("");

  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const workerRef = useRef(null);

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL("./whisper.worker.js", import.meta.url),
        { type: "module" }
      );

      workerRef.current.onmessage = ({ data }) => {
        if (data.status === "loading") {
          setTranscribing(true);
          setLoadProgress(data.progress);
        } else if (data.status === "transcribing") {
          setLoadProgress(null);
        } else if (data.status === "done") {
          setText(data.text);
          setTranscribing(false);
          setLoadProgress(null);
        } else if (data.status === "error") {
          setVoiceError("Transcription failed: " + data.error);
          setTranscribing(false);
          setLoadProgress(null);
        }
      };
    } catch {}

    return () => {
      workerRef.current?.terminate?.();
    };
  }, []);

  const startRecording = async () => {
    setVoiceError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setTranscribing(true);

        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const arrayBuffer = await blob.arrayBuffer();
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const audio = decoded.getChannelData(0);

          if (!workerRef.current) {
            throw new Error("Voice transcription worker not available");
          }

          workerRef.current.postMessage({ audio, language: lang }, [
            audio.buffer,
          ]);
        } catch (err) {
          setVoiceError("Audio processing failed: " + err.message);
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setVoiceError(
        "Microphone access denied. Please allow microphone access and try again."
      );
    }
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 24px",
        color: COLORS.text,
      }}
    >
      <button
        onClick={onBackHome}
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
        {t.backHome}
      </button>

      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          color: COLORS.text,
          margin: "0 0 8px",
        }}
      >
        Emotional Check-In
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: COLORS.textSoft,
          margin: "0 0 20px",
          lineHeight: 1.7,
        }}
      >
        Share how you feel by typing or speaking. We convert voice to text,
        analyze what you share, and guide you toward support when needed.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "text", label: t.text },
          { id: "voice", label: t.voice },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 24px",
              background:
                mode === m.id ? COLORS.accentSoft : COLORS.buttonBg,
              color: mode === m.id ? COLORS.accent : COLORS.textSoft,
              border: `1px solid ${
                mode === m.id ? COLORS.accent : COLORS.border
              }`,
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          rows={8}
          style={{
            width: "100%",
            padding: 16,
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            color: COLORS.text,
            fontSize: 16,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.7,
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            padding: 48,
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          {!recording ? (
            <button
              onClick={startRecording}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D946EF, #EC4899)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 4px 24px rgba(217,70,239,0.2)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: COLORS.cardBg,
                border: `3px solid ${COLORS.accent2}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                animation: "pulse 1.5s infinite",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: COLORS.accent2,
                }}
              />
            </button>
          )}

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: COLORS.textSoft,
              margin: 0,
            }}
          >
            {loadProgress !== null
              ? `Downloading model... ${loadProgress}%`
              : transcribing
              ? "Transcribing..."
              : recording
              ? t.recLabel(seconds)
              : t.tapRecord}
          </p>

          {loadProgress !== null && (
            <div
              style={{
                width: "100%",
                height: 4,
                background: COLORS.cardBgSoft,
                borderRadius: 2,
                marginTop: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${loadProgress}%`,
                  background: "linear-gradient(90deg,#D946EF,#EC4899)",
                  borderRadius: 2,
                  transition: "width 0.3s",
                }}
              />
            </div>
          )}

          {recording && (
            <style>{`
              @keyframes pulse {
                0%,100% { box-shadow:0 0 0 0 rgba(236,72,153,0.25) }
                50% { box-shadow:0 0 0 16px rgba(236,72,153,0) }
              }
            `}</style>
          )}

          {voiceError && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: COLORS.danger,
                marginTop: 12,
              }}
            >
              {voiceError}
            </p>
          )}

          {text && !recording && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                background: COLORS.cardBgSoft,
                borderRadius: 8,
                textAlign: "left",
                maxHeight: 150,
                overflowY: "auto",
              }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: COLORS.textMuted,
                  margin: "0 0 6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Transcription
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: COLORS.text,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {text}
              </p>
            </div>
          )}
        </div>
      )}

      {text && (
        <button
          onClick={() => onAnalyze(text)}
          disabled={analyzing}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            padding: "14px 36px",
            background: "linear-gradient(135deg, #D946EF, #EC4899)",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: analyzing ? "not-allowed" : "pointer",
            marginTop: 20,
            width: "100%",
            letterSpacing: "0.3px",
            boxShadow: "0 4px 16px rgba(217,70,239,0.18)",
            opacity: analyzing ? 0.7 : 1,
          }}
        >
          {analyzing ? t.analyzing : t.analyze}
        </button>
      )}
    </div>
  );
}

function DocumentScreen({ lang, t, onBackHome }) {
  const [documentImage, setDocumentImage] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [docSummary, setDocSummary] = useState(null);
  const [docError, setDocError] = useState("");

  useEffect(() => {
    return () => {
      if (documentImage?.startsWith("blob:")) {
        URL.revokeObjectURL(documentImage);
      }
    };
  }, [documentImage]);

  const handleDocumentUpload = async (file) => {
    if (!file) return;

    setDocError("");
    setDocSummary(null);
    setOcrProgress(0);

    const imageUrl = URL.createObjectURL(file);
    setDocumentImage(imageUrl);
    setOcrLoading(true);

    try {
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round((m.progress || 0) * 100));
          }
        },
      });

      const cleanedText = data?.text?.trim() || "";

      if (!cleanedText) {
        throw new Error(t.noReadableText);
      }

      const summary = await summarizeDocumentWithLLM(cleanedText, lang);
      setDocSummary(summary);
    } catch (err) {
      setDocError(err.message || t.docError);
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "40px 24px",
        color: COLORS.text,
      }}
    >
      <button
        onClick={onBackHome}
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
        {t.backHome}
      </button>

      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          color: COLORS.text,
          margin: "0 0 8px",
        }}
      >
        Document Helper
      </h2>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: COLORS.textSoft,
          margin: "0 0 12px",
          lineHeight: 1.7,
        }}
      >
        This tool helps users understand official documents in a simple and
        practical way.
      </p>

      <div
        style={{
          padding: 18,
          background: COLORS.accentSoft,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            color: COLORS.text,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          How it works
        </p>
        <ol
          style={{
            margin: 0,
            paddingLeft: 18,
            color: COLORS.textSoft,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.8,
          }}
        >
          <li>You upload or take a photo of a document.</li>
          <li>The app reads the text from the image using OCR.</li>
          <li>The AI summarizes the document in simple language.</li>
          <li>
            It focuses on what the user should do next, key dates, and important
            details.
          </li>
        </ol>
      </div>

      <div
        style={{
          padding: 24,
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
        }}
      >
        <label
          style={{
            display: "block",
            padding: "18px",
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 10,
            textAlign: "center",
            cursor: "pointer",
            color: COLORS.textSoft,
            fontFamily: "'DM Sans', sans-serif",
            background: COLORS.white,
          }}
        >
          {t.uploadDoc}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => handleDocumentUpload(e.target.files?.[0])}
          />
        </label>

        {documentImage && (
          <img
            src={documentImage}
            alt="Uploaded document"
            style={{
              width: "100%",
              marginTop: 16,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
            }}
          />
        )}

        {ocrLoading && (
          <div style={{ marginTop: 16 }}>
            <p
              style={{
                color: COLORS.textSoft,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              {t.readingDoc} {ocrProgress}%
            </p>
            <div
              style={{
                width: "100%",
                height: 6,
                background: COLORS.cardBgSoft,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${ocrProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#D946EF,#EC4899)",
                }}
              />
            </div>
          </div>
        )}

        {docSummary && (
          <div
            style={{
              marginTop: 16,
              padding: 18,
              background: "rgba(217,70,239,0.06)",
              border: "1px solid rgba(217,70,239,0.12)",
              borderRadius: 12,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                margin: "0 0 6px",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
              }}
            >
              {t.documentType}
            </p>
            <p
              style={{
                fontSize: 16,
                color: COLORS.text,
                margin: "0 0 14px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              {docSummary.documentType}
            </p>

            <p
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                margin: "0 0 6px",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
              }}
            >
              {t.simpleSummary}
            </p>
            <p
              style={{
                fontSize: 14,
                color: COLORS.text,
                margin: "0 0 14px",
                lineHeight: 1.7,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {docSummary.summary}
            </p>

            <p
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                margin: "0 0 6px",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
              }}
            >
              {t.whatToDo}
            </p>
            <ul
              style={{
                margin: "0 0 14px 18px",
                padding: 0,
                color: COLORS.text,
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.8,
              }}
            >
              {docSummary.actionItems?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <p
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                margin: "0 0 6px",
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
              }}
            >
              {t.importantDetails}
            </p>
            <ul
              style={{
                margin: "0 0 0 18px",
                padding: 0,
                color: COLORS.text,
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.8,
              }}
            >
              {docSummary.importantDetails?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                background: COLORS.cardBgSoft,
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: COLORS.textMuted,
                  margin: "0 0 8px",
                  fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase",
                }}
              >
                Help Contact
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: COLORS.text,
                  margin: "0 0 4px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Phone: {COMMON_HELP_PHONE}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: COLORS.text,
                  margin: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Email: {COMMON_HELP_EMAIL}
              </p>
            </div>
          </div>
        )}

        {docError && (
          <p
            style={{
              marginTop: 12,
              color: COLORS.danger,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          >
            {docError}
          </p>
        )}
      </div>
    </div>
  );
}

function AnalysisScreen({ analysis, onNext, t }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease-out",
      }}
    >
      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          color: COLORS.text,
          margin: "0 0 8px",
        }}
      >
        {t.results}
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: COLORS.textSoft,
          margin: "0 0 32px",
        }}
      >
        {t.basedOn}
      </p>

      <div
        style={{
          padding: 20,
          background: COLORS.accentSoft,
          border: "1px solid rgba(217,70,239,0.12)",
          borderRadius: 12,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: COLORS.textMuted,
            margin: "0 0 4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {t.summary}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: COLORS.text,
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          {analysis.summary}
        </p>
      </div>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: COLORS.textMuted,
          margin: "0 0 16px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {t.concerns}
      </p>

      {analysis.flags.map((flag, i) => (
        <div
          key={i}
          style={{
            padding: 20,
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              {flag.category}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: flag.color,
                background: `${flag.color}18`,
                padding: "4px 12px",
                borderRadius: 20,
              }}
            >
              {Math.round(flag.confidence * 100)}%
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: COLORS.cardBgSoft,
              borderRadius: 3,
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${flag.confidence * 100}%`,
                background: `linear-gradient(90deg, ${flag.color}, ${flag.color}88)`,
                borderRadius: 3,
                transition: "width 1s ease-out",
              }}
            />
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: COLORS.textSoft,
              margin: "0 0 8px",
            }}
          >
            {flag.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {flag.matched.map((kw, j) => (
              <span
                key={j}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: flag.color,
                  background: `${flag.color}12`,
                  border: `1px solid ${flag.color}30`,
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div
        style={{
          padding: 16,
          background: "rgba(234,179,8,0.08)",
          border: "1px solid rgba(234,179,8,0.15)",
          borderRadius: 10,
          marginTop: 20,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: COLORS.warning,
            margin: 0,
          }}
        >
          {t.clinicalNote}
        </p>
      </div>

      <button
        onClick={onNext}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          padding: "14px 36px",
          background: "linear-gradient(135deg, #D946EF, #EC4899)",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          width: "100%",
          boxShadow: "0 4px 16px rgba(217,70,239,0.18)",
        }}
      >
        {t.findGP}
      </button>
    </div>
  );
}

function GPScreen({ gp, onConsent, t }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease-out",
      }}
    >
      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          color: COLORS.text,
          margin: "0 0 8px",
        }}
      >
        {t.nearestGP}
      </h2>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: COLORS.textSoft,
          margin: "0 0 32px",
        }}
      >
        {t.gpSub}
      </p>

      <div
        style={{
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            background:
              "linear-gradient(135deg, rgba(217,70,239,0.08), rgba(236,72,153,0.08))",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 22,
                  color: COLORS.text,
                  margin: "0 0 4px",
                }}
              >
                {gp.name}
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: COLORS.textSoft,
                  margin: 0,
                }}
              >
                {gp.practice}
              </p>
            </div>
            <div
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.success,
                }}
              >
                {gp.distance.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {[
            {
              icon: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
              sub: "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
              label: gp.address,
            },
            {
              icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
              label: gp.phone,
            },
            {
              icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              label: gp.email,
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: i < 2 ? 16 : 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: COLORS.accentSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth="2"
                >
                  <path d={item.icon} />
                  {item.sub && <path d={item.sub} />}
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: COLORS.text,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: 16,
              padding: "8px 14px",
              background: COLORS.accentSoft,
              borderRadius: 8,
              display: "inline-block",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: COLORS.textSoft,
              }}
            >
              County: {gp.county}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onConsent(true)}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          padding: "14px 36px",
          background: "linear-gradient(135deg, #D946EF, #EC4899)",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          width: "100%",
          marginTop: 24,
          boxShadow: "0 4px 16px rgba(217,70,239,0.18)",
        }}
      >
        {t.consent}
      </button>

      <button
        onClick={() => onConsent(false)}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          padding: "12px 36px",
          background: COLORS.buttonBg,
          color: COLORS.text,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          cursor: "pointer",
          width: "100%",
          marginTop: 10,
        }}
      >
        {t.decline}
      </button>
    </div>
  );
}

function ConsentDialog({ analysis, gp, onConfirm, onCancel, t }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 32,
          maxWidth: 480,
          width: "90%",
          boxShadow: "0 24px 48px rgba(236,72,153,0.12)",
        }}
      >
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            color: COLORS.text,
            margin: "0 0 16px",
          }}
        >
          {t.confirmTitle}
        </h3>

        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: COLORS.textMuted,
              margin: "0 0 8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {t.willShare}
          </p>
          <div
            style={{
              padding: 14,
              background: COLORS.cardBgSoft,
              borderRadius: 8,
            }}
          >
            {[
              t.shareItem1,
              `Detected concern(s): ${analysis.flags
                .map((f) => f.category)
                .join(", ")}`,
              `Timestamp: ${new Date(analysis.timestamp).toLocaleString()}`,
            ].map((item, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: COLORS.text,
                  margin: i < 2 ? "0 0 6px" : 0,
                }}
              >
                - {item}
              </p>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: COLORS.textMuted,
              margin: "0 0 8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {t.willNot}
          </p>
          <div
            style={{
              padding: 14,
              background: COLORS.cardBgSoft,
              borderRadius: 8,
            }}
          >
            {[t.noShare1, t.noShare2].map((item, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: COLORS.text,
                  margin: i < 1 ? "0 0 6px" : 0,
                }}
              >
                - {item}
              </p>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 12,
            background: COLORS.accentSoft,
            borderRadius: 8,
            marginBottom: 24,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: COLORS.textSoft,
              margin: 0,
            }}
          >
            {t.sendingTo(gp.name, gp.practice)}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              flex: 1,
              padding: "12px",
              background: COLORS.buttonBg,
              color: COLORS.text,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              flex: 1,
              padding: "12px",
              background: "linear-gradient(135deg, #D946EF, #EC4899)",
              color: "white",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {t.confirmSend}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailStatus({ success, gp, onFinish, t }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 200);
  }, []);

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        textAlign: "center",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease-out",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: success
            ? "rgba(16,185,129,0.12)"
            : "rgba(239,68,68,0.12)",
          border: success
            ? "2px solid rgba(16,185,129,0.3)"
            : "2px solid rgba(239,68,68,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        {success ? (
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.success}
            strokeWidth="2"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.danger}
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        )}
      </div>

      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28,
          color: COLORS.text,
          margin: "0 0 12px",
        }}
      >
        {success ? t.sent : t.failed}
      </h2>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          color: COLORS.textSoft,
          margin: "0 0 32px",
          lineHeight: 1.7,
        }}
      >
        {success ? t.sentMsg(gp.name, gp.practice) : t.failMsg}
      </p>

      {success && (
        <div
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 20,
            textAlign: "left",
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: COLORS.textMuted,
              margin: "0 0 12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {t.gpContact}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: COLORS.text,
              margin: "0 0 4px",
              fontWeight: 600,
            }}
          >
            {gp.name}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: COLORS.text,
              margin: "0 0 4px",
            }}
          >
            {gp.practice}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: COLORS.text,
              margin: "0 0 4px",
            }}
          >
            {gp.phone}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: COLORS.accent,
              margin: 0,
            }}
          >
            {gp.email}
          </p>
        </div>
      )}

      <div
        style={{
          padding: 16,
          background: COLORS.accentSoft,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: COLORS.textSoft,
            margin: "0 0 4px",
          }}
        >
          {t.crisis}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: COLORS.text,
            margin: 0,
          }}
        >
          {t.crisisNums}
        </p>
      </div>

      <button
        onClick={onFinish}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          padding: "14px 36px",
          background: "linear-gradient(135deg, #D946EF, #EC4899)",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(217,70,239,0.18)",
        }}
      >
        {t.newSession}
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [profile, setProfile] = useState({
    name: "",
    location: "Dublin",
    age: "",
    emergency: "",
  });
  const [showProfile, setShowProfile] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [gp, setGP] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lang, setLang] = useState("en");
  const t = T[lang] || T.en;

  const handleOpenJournal = () => {
    setScreen("journal");
  };

  const handleOpenDocument = () => {
    setScreen("document");
  };

  const handleOpenHtmlTool = () => {
    window.location.href = HTML_TOOL_URL;
  };

  const handleOpenScraperTool = () => {
  window.location.href = "/scraper";
};

  const handleAnalyze = async (text) => {
    setAnalyzing(true);
    try {
      const result = await analyzeWithLLM(text, lang);
      setAnalysis({ ...result, original_text: text });
      if (result.flags.length > 0) {
        setScreen("analysis");
      } else {
        alert(
          "No mental health indicators detected. If you are struggling, please reach out to a professional."
        );
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Analysis failed: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFindGP = () => {
    const closest = findClosestGP(profile.location);
    setGP(closest);
    setScreen("gp");
  };

  const handleConsent = (agreed) => {
    if (agreed) {
      setShowConsent(true);
    } else {
      setScreen("home");
      setAnalysis(null);
      setGP(null);
    }
  };

  const handleConfirmSend = async () => {
    setShowConsent(false);
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      const body = analysis.emailBody
        .replace(/\[GP_NAME\]/g, gp.name.replace("Dr. ", ""))
        .replace(/\[PRACTICE_NAME\]/g, gp.practice);

      await emailjs.send(
        serviceId,
        templateId,
        {
          to_name: gp.name,
          to_email: "creedguns21@gmail.com",
          from_name: "MindHarbour Mental Health Screening",
          subject: "Mental Health Screening Referral",
          message: body,
        },
        publicKey
      );

      setEmailSent(true);
    } catch (err) {
      console.error("Email send failed:", err);
      setEmailSent(false);
    } finally {
      setScreen("email");
    }
  };

  const handleFinish = () => {
    setScreen("home");
    setAnalysis(null);
    setGP(null);
    setEmailSent(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.pageBg,
        position: "relative",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {screen !== "home" && (
        <TopNav
          screen={screen}
          profile={profile}
          setShowProfile={setShowProfile}
        />
      )}

      {screen === "home" && (
        <HomeScreen
          onJournal={handleOpenJournal}
          onDocument={handleOpenDocument}
          onHtmlTool={handleOpenHtmlTool}
          onScraper={handleOpenScraperTool}
          t={t}
          lang={lang}
          setLang={setLang}
        />
      )}

      {screen === "journal" && (
        <JournalScreen
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          lang={lang}
          t={t}
          onBackHome={() => setScreen("home")}
        />
      )}

      {screen === "document" && (
        <DocumentScreen
          lang={lang}
          t={t}
          onBackHome={() => setScreen("home")}
        />
      )}

      {screen === "analysis" && analysis && (
        <AnalysisScreen analysis={analysis} onNext={handleFindGP} t={t} />
      )}

      {screen === "gp" && gp && (
        <GPScreen gp={gp} onConsent={handleConsent} t={t} />
      )}

      {screen === "email" && gp && (
        <EmailStatus success={emailSent} gp={gp} onFinish={handleFinish} t={t} />
      )}

      {showConsent && analysis && gp && (
        <ConsentDialog
          analysis={analysis}
          gp={gp}
          onConfirm={handleConfirmSend}
          onCancel={() => setShowConsent(false)}
          t={t}
        />
      )}

      {showProfile && (
        <ProfileTab
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowProfile(false)}
          t={t}
        />
      )}
    </div>
  );
}