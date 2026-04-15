const fetch = require("node-fetch");

const OLLAMA_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODEL = "meta-llama/llama-3-8b-instruct";

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

Respond ONLY in JSON:
{
  "emotional_insight": "...",
  "recommendation": "...",
  "data_explanation": "...",
  "supportive_note": "..."
}
`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mental-health-digital-twin-mkoj.vercel.app",
        "X-Title": "Mental Health App",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("🧠 OpenRouter RAW:", data);

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text);

  } catch (error) {
    console.error("❌ OpenRouter Error:", error.message);
    throw error;
  }
}

module.exports = { analyzeWithOllama };