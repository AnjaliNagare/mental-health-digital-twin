import { useState } from "react";
import axios from "axios";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Heart, Activity, Moon } from "lucide-react";

const MOODS = [
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "calm", emoji: "😌", label: "Calm" },
  { key: "neutral", emoji: "😐", label: "Neutral" },
  { key: "anxious", emoji: "😰", label: "Anxious" },
  { key: "sad", emoji: "😔", label: "Sad" },
  { key: "overwhelmed", emoji: "😩", label: "Overwhelmed" },
  { key: "angry", emoji: "😠", label: "Angry" },
];

export default function MoodForm({ onMoodAdded }) {
  const [selectedMood, setSelectedMood] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMood) {
      setError("Please select a mood!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const moodData = {
      user_id: "user_01",
      mood: selectedMood,
      stress_level: stressLevel,
      sleep_hours: sleepHours,
      note: note.trim(),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/mental/add-mood",
        moodData
      );

      console.log("✅ Mood logged:", response.data);

      // Reset form
      setSelectedMood("");
      setStressLevel(5);
      setSleepHours(7);
      setNote("");
      setSuccess(true);

      // Notify parent to refresh
      if (onMoodAdded) {
        onMoodAdded();
      }

      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
  console.error("❌ Error logging mood:", err);

  setError(
    err.response?.data?.message ||
    err.message ||
    "Unknown error occurred"
  );

    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mm-card fade-in">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <Heart size={20} style={{ color: "#8B5CF6" }} />
          <h5 className="mb-0 fw-bold" style={{ color: "#8B5CF6" }}>
            How Are You Feeling Today?
          </h5>
        </div>

        {success && (
          <Alert
            variant="success"
            className="mb-3"
            style={{ borderRadius: "12px" }}
          >
            🎉 Mood logged successfully!
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-3" style={{ borderRadius: "12px" }}>
            ❌ {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Mood Selection */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: "600", color: "#333", fontSize: "13px" }}>
              SELECT YOUR MOOD
            </Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.key}
                  type="button"
                  onClick={() => setSelectedMood(mood.key)}
                  disabled={loading}
                  className={`btn ${
                    selectedMood === mood.key ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  style={{
                    borderRadius: "12px",
                    padding: "10px 16px",
                    fontSize: selectedMood === mood.key ? "32px" : "28px",
                    border:
                      selectedMood === mood.key
                        ? "3px solid #8B5CF6"
                        : "1px solid #ddd",
                    background:
                      selectedMood === mood.key
                        ? "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)"
                        : "white",
                    transform: selectedMood === mood.key ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.3s ease",
                    boxShadow:
                      selectedMood === mood.key
                        ? "0 8px 20px rgba(139, 92, 246, 0.4)"
                        : "none",
                  }}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </Form.Group>

          {/* Stress Level */}
          <Form.Group className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <Activity size={16} style={{ color: "#FF5722" }} />
                <Form.Label className="mb-0" style={{ fontWeight: "600", color: "#333" }}>
                  💨 Stress Level
                </Form.Label>
              </div>
              <span
                className="badge"
                style={{
                  background: "#8B5CF6",
                  color: "white",
                  fontSize: "14px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}
              >
                {stressLevel}/10
              </span>
            </div>
            <Form.Range
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              min="0"
              max="10"
              step="1"
              disabled={loading}
              style={{
                background: `linear-gradient(to right, #4ade80 0%, #fbbf24 50%, #ef4444 100%)`,
                height: "8px",
                borderRadius: "10px",
              }}
            />
            <div className="d-flex justify-content-between mt-1">
              <small className="text-muted">😌 Calm</small>
              <small className="text-muted">😰 Stressed</small>
            </div>
          </Form.Group>

          {/* Sleep Hours */}
          <Form.Group className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <Moon size={16} style={{ color: "#3F51B5" }} />
                <Form.Label className="mb-0" style={{ fontWeight: "600", color: "#333" }}>
                  🌙 Hours of Sleep
                </Form.Label>
              </div>
              <span
                className="badge"
                style={{
                  background: "#3B82F6",
                  color: "white",
                  fontSize: "14px",
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}
              >
                {sleepHours}h
              </span>
            </div>
            <Form.Range
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              min="0"
              max="12"
              step="0.5"
              disabled={loading}
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #60a5fa 50%, #818cf8 100%)`,
                height: "8px",
                borderRadius: "10px",
              }}
            />
            <div className="d-flex justify-content-between mt-1">
              <small className="text-muted">😵 Exhausted</small>
              <small className="text-muted">😴 Rested</small>
            </div>
          </Form.Group>

          {/* Note */}
          <Form.Group className="mb-4">
            <Form.Label style={{ fontWeight: "600", color: "#333" }}>
              📝 Daily Journal
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write about your day..."
              className="textareaStyle"
              disabled={loading}
            />
          </Form.Group>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !selectedMood}
            className="w-100"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "12px",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "⏳ Saving..." : "✨ Save Entry"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}