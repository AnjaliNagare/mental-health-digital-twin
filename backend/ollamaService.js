const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "llama3.2";

async function analyzeWithOllama(entries, avgStress, avgSleep, warnings) {
  const entrySummary = entries
    .map((e, i) => {
      const date = new Date(e.timestamp).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      return `Entry ${i + 1} (${date}): mood=${e.mood}, stress=${e.stress_level}/10, sleep=${e.sleep_hours}h${e.note ? `, note: "${e.note}"` : ""}`;
    })
    .join("\n");

  const prompt = `You are a compassionate mental health support assistant. A user has shared their recent mood tracking data. Analyse it carefully and respond with empathy.

Here is their data:
${entrySummary}

Summary statistics:
- Average stress level: ${avgStress}/10
- Average sleep: ${avgSleep} hours
- Moods logged: ${entries.map((e) => e.mood).join(", ")}
${warnings.length > 0 ? `- Detected patterns: ${warnings.join("; ")}` : ""}

Respond ONLY with a valid JSON object. No explanation before or after it. No markdown. No backticks. Just raw JSON in this exact structure:
{
  "emotional_insight": "2 to 3 sentences acknowledging how they feel and validating their experience",
  "recommendation": "2 to 3 specific, practical suggestions based on their exact stress and sleep numbers",
  "data_explanation": "1 sentence explaining which specific data points led to this insight",
  "supportive_note": "One short warm encouraging closing message"
}`;

  console.log("Sending request to Ollama...");

  let response;

  try {
    response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false,
      }),
    });
  } catch (err) {
    console.error("Fetch failed:", err.message);
    throw new Error("Ollama is not running");
  }

  console.log("Ollama response status:", response.status);

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();

  const rawText = data.response.trim();

  let cleaned = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Count opening and closing braces and add missing ones
  const openBraces = (cleaned.match(/{/g) || []).length;
  const closeBraces = (cleaned.match(/}/g) || []).length;
  const missingBraces = openBraces - closeBraces;

  for (let i = 0; i < missingBraces; i++) {
    cleaned = cleaned + "\n}";
  }

  console.log("Cleaned text:", cleaned);

  const parsed = JSON.parse(cleaned);
  console.log("Parsed successfully");

  return parsed;
}

module.exports = { analyzeWithOllama };
