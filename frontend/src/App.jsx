import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import MoodForm from "./components/MoodForm";
import MoodHistory from "./components/MoodHistory";
import AIInsight from "./components/AIInsight";
import { Brain } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMoodAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="dashboard-gradient">
      {/* Header */}
      <header className="mm-navbar shadow-sm border-bottom">
        <Container>
          <div className="d-flex justify-content-center align-items-center py-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="logo-icon"
                style={{
                  width: "50px",
                  height: "50px",
                  background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={28} />
              </div>
              <div>
                <h2
                  className="mb-0 fw-bold landing-title"
                  style={{
                    color: "#8B5CF6",
                    fontSize: "1.8rem",
                  }}
                >
                  Mental Health Digital App
                </h2>
                <p
                  className="mb-0 landing-subtitle"
                  style={{ fontSize: "14px", color: "#6B7280" }}
                >
                  Track your mood, understand patterns, get AI insights
                </p>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container className="py-5">
        <Row className="g-4">
          {/* Left Column - Mood Form */}
          <Col lg={4}>
            <MoodForm onMoodAdded={handleMoodAdded} />
          </Col>

          {/* Right Column - Mood History */}
          <Col lg={8}>
            <MoodHistory refreshKey={refreshKey} />
          </Col>

          {/* Full Width - AI Insight */}
          <Col xs={12}>
            <AIInsight />
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="mt-5 bg-white bg-opacity-75 border-top">
        <Container className="py-4 text-center">
          <p className="mb-1 fw-semibold" style={{ color: "#6B7280" }}>
            🧠 Mental Health Digital Twin - Your personal mental health journal
          </p>
          <p className="mb-0" style={{ fontSize: "12px", color: "#9CA3AF" }}>
            Helping you understand yourself better, one mood at a time.
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
