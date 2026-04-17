const { GoogleGenerativeAI } = require("@google/generative-ai");

async function analyzeWithGemini(entries, avgStress, avgSleep, warnings) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

Please provide:

1. **Emotional Insight** (2-3 sentences): A warm, empathetic analysis of their current emotional state based on the data.

2. **Practical Recommendation** (2-3 sentences): Specific, actionable advice to improve their mental wellbeing.

Keep your tone supportive and non-judgmental. Focus on actionable steps they can take today.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini raw response:", text);

    // Parse the response - Gemini usually formats nicely
    const sections = text.split(/\*\*|##/).filter(s => s.trim());
    
    let insight = "";
    let recommendation = "";

    // Extract insight and recommendation
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].toLowerCase();
      if (section.includes('insight') || section.includes('emotional')) {
        insight = sections[i + 1]?.trim() || "";
      } else if (section.includes('recommendation') || section.includes('practical')) {
        recommendation = sections[i + 1]?.trim() || "";
      }
    }

    // Fallback if parsing fails
    if (!insight || !recommendation) {
      const lines = text.split('\n').filter(line => line.trim() && !line.includes('**'));
      insight = lines.slice(0, Math.ceil(lines.length / 2)).join(' ').trim();
      recommendation = lines.slice(Math.ceil(lines.length / 2)).join(' ').trim();
    }

    return {
      insight: insight || "You're navigating a complex emotional landscape. Your willingness to track and understand your moods shows self-awareness and commitment to your wellbeing.",
      recommendation: recommendation || "Continue monitoring your patterns, prioritize sleep and stress management, and don't hesitate to reach out for support when needed."
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Gemini AI analysis failed: " + error.message);
  }
}

module.exports = { analyzeWithGemini };