import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, EmptyState } from "../../components/Ui";
import { mentorApi } from "../../api/client";
import "../MentorView/MentorView.css";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

function MentorCommentBox({ req, onSave, onMarkReviewed }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await mentorApi.submitComment(req.answer_id, value, null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setValue("");
      onSave();
    } catch (err) {
      alert("Failed to save comment: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mentor-comment" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {req.answer.comments && req.answer.comments.length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" }}>
          <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px", fontWeight: "600" }}>Past Comments</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {req.answer.comments.map(c => (
              <li key={c.id} style={{ fontSize: "14px", color: "#fff", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {c.comment_text}
              </li>
            ))}
          </ul>
        </div>
      )}
      <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--muted)", fontWeight: "600" }}>Add New Comment</span>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Leave one precise next step for this answer."
          style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", resize: "vertical", minHeight: "80px" }}
        />
      </label>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <Button onClick={handleSave} disabled={saving}>Save comment</Button>
        <Button onClick={() => onMarkReviewed(req.id)} tone="secondary">Mark as Reviewed</Button>
        {saved && (
          <span style={{ color: "var(--success)", fontSize: "13px", fontWeight: "600", marginLeft: "8px" }}>
            Saved ✓
          </span>
        )}
      </div>
    </div>
  );
}

function MentorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await mentorApi.getRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  async function handleMarkReviewed(reqId) {
    try {
      await mentorApi.updateRequestStatus(reqId, "reviewed");
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "reviewed" } : r));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  }

  async function refreshRequests() {
    try {
      const data = await mentorApi.getRequests();
      setRequests(data);
    } catch (e) {}
  }

  if (loading) {
    return (
      <section className="page mentor-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2>Loading requests...</h2>
      </section>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No incoming requests"
        text="When your friends send you their answers for review, they will appear here."
      />
    );
  }

  return (
    <motion.section
      className="page mentor-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mentor-hero panel">
        <div>
          <Badge tone="success">Incoming Requests</Badge>
          <h1>Review answers from your friends</h1>
          <p>
            Leave targeted feedback for specific questions they asked you to review.
          </p>
        </div>
      </div>

      <motion.div
        className="mentor-list"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {requests.map((req, index) => {
          return (
            <motion.article
              className="panel mentor-card"
              variants={itemVariants}
              key={req.id}
              layout
            >
              <div className="mentor-video-col">
                {req.answer.video_url ? (
                  <video 
                    src={`http://localhost:8000/${req.answer.video_url}`} 
                    controls 
                    className="answer-video-player" 
                    style={{ width: "100%", borderRadius: "12px", background: "#000", objectFit: "cover", display: "block" }} 
                  />
                ) : (
                  <div className="video-placeholder">No video recorded</div>
                )}
              </div>

              <div className="mentor-answer">
                <div className="inline-row">
                  <Badge>Request {index + 1}</Badge>
                  <Badge tone={req.status === "reviewed" ? "success" : "warning"}>
                    {req.status === "reviewed" ? "Reviewed" : "Pending"}
                  </Badge>
                </div>
                <h2>{req.answer.question.specialization} - {req.answer.question.level}</h2>
                <p>{req.answer.question.text}</p>
                <div className="mentor-review-grid" style={{ gridTemplateColumns: "1fr", marginTop: "16px" }}>
                  <div>
                    <strong>Candidate transcript</strong>
                    <p>{req.answer.transcript || "No transcript available."}</p>
                  </div>
                </div>
              </div>

              <MentorCommentBox
                req={req}
                onSave={refreshRequests}
                onMarkReviewed={handleMarkReviewed}
              />
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
}

export default MentorRequests;
