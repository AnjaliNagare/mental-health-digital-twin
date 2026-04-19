const axios = require('axios');

async function analyzeWithGemini(entries, avgStress, avgSleep, warnings) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }

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

  // Try multiple model names in order of preference
  const modelNames = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-flash'
  ];

  let lastError = null;

  for (const modelName of modelNames) {
    try {
      console.log(`🔄 Trying model: ${modelName}`);
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log(`✅ Success with model: ${modelName}`);

      // Extract the generated text
      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        console.error("No text in response");
        continue; // Try next model
      }

      console.log("📝 Gemini response:", generatedText.substring(0, 200) + "...");

      // Parse the response
      let insight = "";
      let recommendation = "";

      // Split by common section markers
      const sections = generatedText.split(/\n\n|\d\.\s+/);
      
      for (let section of sections) {
        const lowerSection = section.toLowerCase();
        
        if ((lowerSection.includes('insight') || lowerSection.includes('emotional')) && !insight) {
          const text = section.replace(/\*\*.*?\*\*/g, '').replace(/emotional insight:?/gi, '').trim();
          if (text && text.length > 20) {
            insight = text;
          }
        } else if ((lowerSection.includes('recommendation') || lowerSection.includes('practical')) && !recommendation) {
          const text = section.replace(/\*\*.*?\*\*/g, '').replace(/practical recommendation:?/gi, '').trim();
          if (text && text.length > 20) {
            recommendation = text;
          }
        }
      }

      // Fallback parsing
      if (!insight || !recommendation) {
        const cleaned = generatedText
          .replace(/\*\*/g, '')
          .replace(/#+/g, '')
          .split('\n')
          .filter(line => line.trim().length > 0);
        
        const midpoint = Math.ceil(cleaned.length / 2);
        insight = insight || cleaned.slice(0, midpoint).join(' ').trim();
        recommendation = recommendation || cleaned.slice(midpoint).join(' ').trim();
      }

      // Final safety fallback
      if (!insight || insight.length < 20) {
        insight = "You're navigating a complex emotional landscape. Your willingness to track and understand your moods shows self-awareness and commitment to your wellbeing.";
      }
      
      if (!recommendation || recommendation.length < 20) {
        recommendation = "Continue monitoring your patterns, prioritize adequate sleep and stress management, and don't hesitate to reach out for support when needed.";
      }

      return {
        insight: insight.substring(0, 500).trim(),
        recommendation: recommendation.substring(0, 400).trim()
      };

    } catch (error) {
      console.log(`❌ Model ${modelName} failed:`, error.response?.data?.error?.message || error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // If all models failed
  console.error("❌ All models failed. Last error:", lastError?.response?.data || lastError?.message);
  throw new Error("All Gemini models failed. Please check API key permissions.");
}

module.exports = { analyzeWithGemini };