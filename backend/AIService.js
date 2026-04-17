const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeWithGemini(entries, avgStress, avgSleep, warnings) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const entrySummary = entries
    .map((e, i) => {
      return `Entry ${i + 1}: mood=${e.mood}, stress=${e.stress_level}, sleep=${e.sleep_hours}`;
    })
    .join("\n");

  const prompt = `
You are a mental health assistant.

User data:
${entrySummary}

Average stress: ${avgStress}
Average sleep: ${avgSleep}
Warnings: ${warnings.join(", ")}

Respond ONLY in valid JSON:
{
  "insight": "",
  "recommendation": ""
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("🧠 Gemini RAW:", text);

    // ✅ clean + safe parse
    let cleanText = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleanText);
    } catch (err) {
      console.error("❌ JSON parse failed:", cleanText);

      return {
        insight: "AI response formatting issue.",
        recommendation: "Try again."
      };
    }

  } catch (error) {
    console.error("❌ Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { analyzeWithGemini };