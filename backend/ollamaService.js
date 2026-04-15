const fetch = require("node-fetch");

const OpenRouter_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODEL = "openai/gpt-4o-mini";

async function analyzeWithOllama(entries, avgStress, avgSleep, warnings) {
  const entrySummary = entries
    .map((e, i) => {
      return `Entry ${i + 1}: mood=${e.mood}, stress=${e.stress_level}, sleep=${e.sleep_hours}`;
    })
    .join("\n");

  const prompt = `
You are a mental health assistant.

User data:
${entrySummary}

Avg stress: ${avgStress}
Avg sleep: ${avgSleep}
Warnings: ${warnings.join(", ")}

Respond ONLY in valid JSON:
{
  "emotional_insight": "",
  "recommendation": "",
  "data_explanation": "",
  "supportive_note": ""
}
`;

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing in environment variables");
}

  const response = await fetch(OpenRouter_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mental-health-digital-twin-mkoj.vercel.app",
      "X-Title": "Mental Health App",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    }),
  });

  const data = await response.json();

  console.log("🧠 RAW RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }

  let text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Empty AI response");
  }

  // ✅ SAFE JSON extraction (VERY IMPORTANT FIX)
  try {
    // remove ```json blocks if present
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.error("❌ JSON PARSE FAILED. RAW TEXT:\n", text);

    // fallback so backend never crashes
    return {
      emotional_insight: "AI returned malformed response.",
      recommendation: "Try again.",
      data_explanation: text,
      supportive_note: "System recovered from parsing error."
    };
  }
}

module.exports = { analyzeWithOllama };