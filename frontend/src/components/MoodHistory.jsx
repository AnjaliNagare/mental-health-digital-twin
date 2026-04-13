import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Badge } from "react-bootstrap";
import { Calendar, Wind, Moon } from "lucide-react";

const MOOD_EMOJIS = {
  happy: "😊",
  calm: "😌",
  neutral: "😐",
  anxious: "😰",
  sad: "😔",
  overwhelmed: "😩",
  angry: "😠",
};

const MOOD_COLORS = {
  happy: { bg: "#FEF3C7", text: "#92400E" },
  calm: { bg: "#DBEAFE", text: "#1E40AF" },
  neutral: { bg: "#F3F4F6", text: "#374151" },
  anxious: { bg: "#FED7AA", text: "#9A3412" },
  sad: { bg: "#BFDBFE", text: "#1E3A8A" },
  overwhelmed: { bg: "#FECACA", text: "#991B1B" },
  angry: { bg: "#FCA5A5", text: "#7F1D1D" },
};

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MoodHistory({ refreshKey }) {
  const [entries, setEntries] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodHistory();
  }, [refreshKey]);

  const fetchMoodHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://mental-health-digital-twin-1.onrender.com/mental/history", {
        params: {
          user_id: "user_01",
          limit: 20,
        },
      });

      console.log("✅ Fetched mood history:", response.data);
      setEntries(response.data.entries || []);
      setWarnings(response.data.warnings || []);
    } catch (error) {
      console.error("❌ Error fetching mood history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mm-card fade-in">
        <Card.Body className="p-4">
          <h5 className="mb-4 fw-bold" style={{ color: "#8B5CF6" }}>
            📋 Past Entries
          </h5>
          <div className="d-flex flex-column gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-secondary bg-opacity-10 rounded-3"
                style={{ height: "80px" }}
              />
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="mm-card fade-in">
        <Card.Body className="p-4">
          <h5 className="mb-4 fw-bold" style={{ color: "#8B5CF6" }}>
            📋 Past Entries
          </h5>
          <p className="text-center text-muted py-5">
            No mood entries yet. Start tracking to see your history!
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mm-card fade-in">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold" style={{ color: "#8B5CF6" }}>
            📋 Past Entries
          </h5>
          <Badge bg="secondary" pill>
            {entries.length} entries
          </Badge>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div
            className="mb-3 p-3"
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: "12px",
              border: "1px solid #FDE68A",
            }}
          >
            <strong style={{ color: "#92400E" }}>⚠️ Alerts:</strong>
            <ul
              className="mb-0 mt-2"
              style={{ fontSize: "14px", color: "#92400E" }}
            >
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Entries List */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }} className="pe-2">
          <div className="d-flex flex-column gap-3">
            {entries.map((entry) => {
              const moodColor = MOOD_COLORS[entry.mood] || MOOD_COLORS.neutral;

              return (
                <Card
                  key={entry.id}
                  className="border"
                  style={{
                    borderRadius: "12px",
                    borderColor: "#E5E7EB",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Card.Body className="p-3">
                    {/* Top Row */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <span style={{ fontSize: "32px" }}>
                          {MOOD_EMOJIS[entry.mood]}
                        </span>
                        <div>
                          <Badge
                            style={{
                              backgroundColor: moodColor.bg,
                              color: moodColor.text,
                              fontWeight: "600",
                              fontSize: "11px",
                            }}
                          >
                            {entry.mood.charAt(0).toUpperCase() +
                              entry.mood.slice(1)}
                          </Badge>
                          <div
                            className="d-flex align-items-center gap-1 mt-1"
                            style={{ fontSize: "12px", color: "#6B7280" }}
                          >
                            <Calendar size={12} />
                            {formatTime(entry.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div
                      className="d-flex gap-4 mb-2"
                      style={{ marginLeft: "48px" }}
                    >
                      <div
                        className="d-flex align-items-center gap-1"
                        style={{ fontSize: "13px", color: "#6B7280" }}
                      >
                        <Wind size={14} />
                        <span>Stress: {entry.stress_level}/10</span>
                      </div>
                      <div
                        className="d-flex align-items-center gap-1"
                        style={{ fontSize: "13px", color: "#6B7280" }}
                      >
                        <Moon size={14} />
                        <span>Sleep: {entry.sleep_hours}h</span>
                      </div>
                    </div>

                    {/* Note */}
                    {entry.note && (
                      <p
                        className="mb-0"
                        style={{
                          fontSize: "14px",
                          color: "#374151",
                          marginLeft: "48px",
                          backgroundColor: "#F3E8FF",
                          padding: "10px",
                          borderRadius: "8px",
                          borderLeft: "3px solid #8B5CF6",
                        }}
                      >
                        "{entry.note}"
                      </p>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
