const axios = require('axios');

// ─── Groq (cloud, free tier) ────────────────────────────────────────────────

async function analyzeWithGroq(entries, avgStress, avgSleep, warnings) {
  const moods = entries.map(e => e.mood).join(", ");
  const latestEntry = entries[0];

  const prompt = `You are a compassionate mental health assistant. Analyze this user's mood data and provide supportive insights.

📊 User's Recent Data:
- Recent moods: ${moods}
- Average stress level: ${avgStress}/10
- Average sleep: ${avgSleep} hours per night
- Latest mood: ${latestEntry.mood}
- Latest note: "${latestEntry.note || 'No note provided'}"

${warnings.length > 0 ? `⚠️ Detected Patterns:\n${warnings.join('\n')}` : '✅ No concerning patterns detected'}

Please provide exactly 2 sections:

1. Emotional Insight: A warm, empathetic analysis of their current emotional state (2-3 sentences).

2. Practical Recommendation: Specific, actionable advice to improve their mental wellbeing (2-3 sentences).

Keep your tone supportive and non-judgmental.`;

  try {
    console.log("☁️  Sending request to Groq...");

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",   // free tier model — fast and capable
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        timeout: 30000
      }
    );

    console.log("✅ Groq response received");

    const text = response.data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("❌ No response text from Groq. Full response:", JSON.stringify(response.data));
      throw new Error("No text in Groq response");
    }

    return parseAIResponse(text);

  } catch (error) {
    console.error("❌ Groq error:", error.message);

if (error.response) {
  console.error(
    "Groq response:",
    JSON.stringify(error.response.data, null, 2)
  );
}

    if (error.response?.status === 401) {
      throw new Error("Invalid Groq API key. Check your GROQ_API_KEY in .env");
    } else if (error.response?.status === 429) {
      throw new Error("Groq rate limit reached. Try again in a moment.");
    } else {
      throw new Error("Groq error: " + error.message);
    }
  }
}

// ─── Ollama (local) ─────────────────────────────────────────────────────────

async function analyzeWithOllama(entries, avgStress, avgSleep, warnings) {
  const moods = entries.map(e => e.mood).join(", ");
  const latestEntry = entries[0];

  const prompt = `You are a compassionate mental health assistant. Analyze this user's mood data and provide supportive insights.

📊 User's Recent Data:
- Recent moods: ${moods}
- Average stress level: ${avgStress}/10
- Average sleep: ${avgSleep} hours per night
- Latest mood: ${latestEntry.mood}
- Latest note: "${latestEntry.note || 'No note provided'}"

${warnings.length > 0 ? `⚠️ Detected Patterns:\n${warnings.join('\n')}` : '✅ No concerning patterns detected'}

Please provide exactly 2 sections:

1. Emotional Insight: A warm, empathetic analysis of their current emotional state (2-3 sentences).

2. Practical Recommendation: Specific, actionable advice to improve their mental wellbeing (2-3 sentences).

Keep your tone supportive and non-judgmental.`;

  try {
    console.log("📡 Sending request to Ollama...");

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2",
        prompt: prompt,
        stream: false
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000
      }
    );

    console.log("✅ Ollama response received");

    const text = response.data?.response;

    if (!text) {
      console.error("❌ No response text from Ollama. Full response:", JSON.stringify(response.data));
      throw new Error("No text in Ollama response");
    }

    return parseAIResponse(text);

  } catch (error) {
    console.error("❌ Ollama error:", error.message);

    if (error.code === 'ECONNREFUSED') {
      throw new Error("Ollama is not running. Start it with: ollama serve");
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("Ollama request timed out. Model may be loading.");
    } else {
      throw new Error("Ollama error: " + error.message);
    }
  }
}

// ─── Shared response parser ──────────────────────────────────────────────────

function parseAIResponse(text) {
  console.log("📝 AI output preview:", text.substring(0, 150) + "...");

  let insight = "";
  let recommendation = "";

  const sections = text.split(/\n\n+/);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const lower = section.toLowerCase();

    if ((lower.includes("emotional insight") || lower.includes("1.")) && !insight) {
      const lines = section.split('\n');
      const contentLines = lines.filter(l =>
        !l.match(/^1\.|emotional insight/i) && l.trim()
      );
      insight = contentLines.join(' ').replace(/\*\*/g, '').trim();
    }

    if ((lower.includes("practical recommendation") || lower.includes("recommendation") || lower.includes("2.")) && !recommendation) {
      const lines = section.split('\n');
      const contentLines = lines.filter(l =>
        !l.match(/^2\.|practical recommendation|recommendation/i) && l.trim()
      );
      recommendation = contentLines.join(' ').replace(/\*\*/g, '').trim();
    }
  }

  if (!insight || !recommendation) {
    console.log("⚠️ Using fallback parsing...");
    const cleanLines = text
      .replace(/\*\*/g, '')
      .replace(/#+/g, '')
      .split('\n')
      .filter(line => line.trim().length > 10);

    const midpoint = Math.ceil(cleanLines.length / 2);
    insight = insight || cleanLines.slice(0, midpoint).join(' ').trim();
    recommendation = recommendation || cleanLines.slice(midpoint).join(' ').trim();
  }

  if (!insight || insight.length < 20) {
    insight = "You're navigating a complex emotional landscape. Your willingness to track your moods shows real self-awareness and commitment to your wellbeing.";
  }

  if (!recommendation || recommendation.length < 20) {
    recommendation = "Continue monitoring your patterns and prioritize adequate sleep and stress management. Don't hesitate to reach out for professional support when needed.";
  }

  return {
    insight: insight.substring(0, 500).trim(),
    recommendation: recommendation.substring(0, 400).trim()
  };
}

// ─── Main export — auto-selects provider ────────────────────────────────────

async function analyzeWithAI(entries, avgStress, avgSleep, warnings) {

  console.log("USE_CLOUD_AI =", process.env.USE_CLOUD_AI);
  console.log("GROQ_API_KEY exists =", !!process.env.GROQ_API_KEY);

  const useGroq =
    String(process.env.USE_CLOUD_AI).toLowerCase() === "true";

  if (useGroq) {
    console.log("☁️ AI provider: Groq");
    return analyzeWithGroq(entries, avgStress, avgSleep, warnings);
  }

  console.log("🏠 AI provider: Ollama");
  return analyzeWithOllama(entries, avgStress, avgSleep, warnings);
}
module.exports = { analyzeWithAI, analyzeWithGroq, analyzeWithOllama };