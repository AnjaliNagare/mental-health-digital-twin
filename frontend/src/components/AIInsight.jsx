import { useState } from "react";
import axios from "axios";
import { Card, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { Brain, Lightbulb, AlertTriangle, Info } from "lucide-react";

export default function AIInsight() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  

  const generateInsight = async () => {
  setLoading(true);
  setError("");

  try {
    const response = await axios.post(
      "https://mental-health-digital-twin-1.onrender.com/mental/analyze",
      { user_id: "user_01" }
    );

    console.log("✅ AI Analysis:", response.data);
    setInsight(response.data.analysis);
  } catch (err) {
    console.error("❌ FULL ERROR:", err.response?.data);

    if (err.response?.status === 400) {
      setError(err.response.data.error);
    } else {
      setError(err.response?.data?.error || "Failed to generate insight.");
    }
  } finally {
    setLoading(false);
  }
};

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: "20px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
  };

  return (
    <Card style={cardStyle}>
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <Brain size={24} style={{ color: "#8B5CF6" }} />
            <h5
              className="mb-0"
              style={{ color: "#8B5CF6", fontWeight: "bold" }}
            >
              🤖 AI Insight Analysis
            </h5>
          </div>
          <Badge bg="info" pill>
            Powered by Gemini AI
          </Badge>
        </div>

        <p className="text-muted mb-4">
          Our AI analyzes your recent mood entries and gives you personalized
          insights and recommendations.
        </p>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <AlertTriangle size={16} className="me-2" />
            {error}
          </Alert>
        )}

        {/* Generate Button */}
        {!insight && (
          <div className="text-center">
            <Button
              onClick={generateInsight}
              disabled={loading}
              style={{
                backgroundColor: "#8B5CF6",
                border: "none",
                borderRadius: "12px",
                padding: "12px 32px",
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  🧠 Analyzing your patterns...
                </>
              ) : (
                "✨ Generate AI Insight"
              )}
            </Button>
          </div>
        )}

        {/* Insight Results */}
        {insight && (
          <div>
            {/* Main Insight */}
            <Card
              className="mb-3 border-0"
              style={{
                backgroundColor: "#F3E8FF",
                borderRadius: "12px",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-start gap-2 mb-2">
                  <Lightbulb
                    size={20}
                    style={{ color: "#8B5CF6", marginTop: "2px" }}
                  />
                  <div>
                    <h6
                      className="mb-2"
                      style={{ color: "#8B5CF6", fontWeight: "600" }}
                    >
                      💡 Your Insight
                    </h6>
                    <p
                      className="mb-0"
                      style={{ color: "#333", lineHeight: "1.6" }}
                    >
                      {insight.insight}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Recommendation */}
            <Card
              className="mb-3 border-0"
              style={{
                backgroundColor: "#E0F2FE",
                borderRadius: "12px",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-start gap-2">
                  <Info
                    size={20}
                    style={{ color: "#0EA5E9", marginTop: "2px" }}
                  />
                  <div>
                    <h6
                      className="mb-2"
                      style={{ color: "#0EA5E9", fontWeight: "600" }}
                    >
                      💊 Recommendation
                    </h6>
                    <p
                      className="mb-0"
                      style={{ color: "#333", lineHeight: "1.6" }}
                    >
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Warnings */}
            {insight.data_used?.warnings?.length > 0 && (
              <Alert variant="warning" className="mb-3">
                <div className="d-flex align-items-start gap-2">
                  <AlertTriangle size={18} style={{ marginTop: "2px" }} />
                  <div>
                    <strong>⚠️ Alerts Detected:</strong>
                    <ul className="mb-0 mt-2">
                      {insight.data_used.warnings.map((warning, idx) => (
                        <li key={idx} style={{ fontSize: "14px" }}>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Alert>
            )}

            {/* Explainability */}
            <Card
              className="border-0"
              style={{
                backgroundColor: "#F8F9FA",
                borderRadius: "12px",
              }}
            >
              <Card.Body className="p-4">
                <h6
                  className="mb-3"
                  style={{ color: "#6B7280", fontWeight: "600" }}
                >
                  🔍 How We Got This
                </h6>
                <div style={{ fontSize: "14px", color: "#555" }}>
                  <p className="mb-2">
                    <strong>Analyzed:</strong>{" "}
                    {insight.data_used.entries_analysed} recent mood entries
                  </p>
                  <p className="mb-2">
                    <strong>Moods logged:</strong>{" "}
                    {insight.data_used.moods_logged}
                  </p>
                  <p className="mb-2">
                    <strong>Average stress level:</strong>{" "}
                    {insight.data_used.avg_stress}/10
                  </p>
                  <p className="mb-0">
                    <strong>Average sleep:</strong>{" "}
                    {insight.data_used.avg_sleep} hours
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Regenerate Button */}
            <div className="text-center mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setInsight(null);
                  setError("");
                }}
                style={{ borderRadius: "12px" }}
              >
                🔄 Analyze Again
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
