const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());



const PORT = process.env.PORT || 5000;

const moodStore = {};

const MOOD_SCORE = {
  happy: 10,
  calm: 8,
  neutral: 5,
  anxious: 3,
  sad: 2,
  overwhelmed: 1,
  angry: 2,
};

function detectWarnings(entries) {
  const warnings = [];

  if (entries.length < 2) return warnings;

  const recent = entries.slice(0, 3);

  const highStressEntries = recent.filter((e) => e.stress_level >= 7);
  if (highStressEntries.length >= 2) {
    warnings.push(
      `Your stress levels have been consistently high for the past ${highStressEntries.length} entries.`,
    );
  }

  const lowSleepEntries = recent.filter((e) => e.sleep_hours < 6);
  if (lowSleepEntries.length >= 2) {
    warnings.push(
      `You've had low sleep (under 6h) in ${lowSleepEntries.length} recent entries.`,
    );
  }

  const negativeMoods = ["sad", "anxious", "overwhelmed", "angry"];
  const negativeCount = recent.filter((e) =>
    negativeMoods.includes(e.mood),
  ).length;
  if (negativeCount >= 2) {
    warnings.push(
      `You've logged predominantly negative moods recently (${negativeCount} out of ${recent.length} entries).`,
    );
  }

  const latestScore = MOOD_SCORE[entries[0].mood] || 5;
  const previousScore = MOOD_SCORE[entries[1].mood] || 5;
  const drop = previousScore - latestScore;
  if (drop >= 3) {
    warnings.push(
      `Significant mood drop detected: from "${entries[1].mood}" to "${entries[0].mood}".`,
    );
  }

  return warnings;
}

// POST /mental/add-mood
app.post("/mental/add-mood", (req, res) => {
  const { user_id, mood, stress_level, sleep_hours, note } = req.body;

  if (!user_id || !mood) {
    return res.status(400).json({ error: "user_id and mood are required" });
  }

  const entry = {
    id: Date.now().toString(),
    user_id,
    mood,
    stress_level: Number(stress_level) || 5,
    sleep_hours: Number(sleep_hours) || 7,
    note: note || "",
    timestamp: new Date().toISOString(),
  };

  if (!moodStore[user_id]) {
    moodStore[user_id] = [];
  }

  moodStore[user_id].unshift(entry);

  res.status(201).json({ success: true, entry });
});

// GET /mental/history
app.get("/mental/history", (req, res) => {
  const { user_id, limit = 10 } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const allEntries = moodStore[user_id] || [];
  const entries = allEntries.slice(0, Number(limit));
  const warnings = detectWarnings(entries);

  res.json({ user_id, entries, warnings, total: entries.length });
});

// POST /mental/analyze
app.post("/mental/analyze", async (req, res) => {
  const { user_id, limit = 5 } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const entries = (moodStore[user_id] || []).slice(0, Number(limit));

  if (entries.length === 0) {
    return res.status(400).json({
      error: "No mood entries found. Please log at least one mood first.",
    });
  }

  const avgStress = (
    entries.reduce((sum, e) => sum + e.stress_level, 0) / entries.length
  ).toFixed(1);

  const avgSleep = (
    entries.reduce((sum, e) => sum + e.sleep_hours, 0) / entries.length
  ).toFixed(1);

  const warnings = detectWarnings(entries);

  try {
    console.log("Calling OpenRouter for analysis...");
    const insight = await analyzeWithOllama(
      entries,
      avgStress,
      avgSleep,
      warnings,
    );
    console.log("OpenRouter responded successfully");

    res.json({
      success: true,
      user_id,
      source: "openrouter",
      analysis: {
        ...insight,
        data_used: {
          entries_analysed: entries.length,
          avg_stress: avgStress,
          avg_sleep: avgSleep,
          moods_logged: entries.map((e) => e.mood).join(", "),
          warnings,
        },
      },
    });
  } catch (error) {
  console.error("❌ OPENROUTER FULL ERROR:");
  console.error("status:", error.response?.status);
  console.error("data:", error.response?.data);
  console.error("message:", error.message);
    res.status(500).json({
      error:
        "OpenRouter AI analysis failed. Make sure the API is running with the correct model and your API key is set.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
