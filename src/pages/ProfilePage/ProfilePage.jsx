import { motion } from "framer-motion";
import { Badge, Button, Card3D } from "../../components/Ui";
import { tracks } from "../../data/mockData";
import "./ProfilePage.css";

function ProfilePage({ playerProfile, onBack, onLogout }) {
  if (!playerProfile) return null;

  const track = tracks.find((t) => t.id === playerProfile.track);

  return (
    <motion.section
      className="page profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="profile-layout">
        <Card3D className="profile-card">
          <div className="profile-header">
            <Badge tone="primary">Your Profile</Badge>
            <h1>{playerProfile.name}</h1>
            <p className="profile-email">{playerProfile.email}</p>
          </div>

          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-label">Level</span>
              <span className="stat-value">{playerProfile.level || "Not set"}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Track</span>
              <span className="stat-value">{track ? track.title : "Not set"}</span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <strong>Goal:</strong>
              <p>{playerProfile.goal || "Interview preparation"}</p>
            </div>
            <div className="detail-item">
              <strong>Studying:</strong>
              <p>{playerProfile.studying || "Not specified"}</p>
            </div>
          </div>

          <div className="profile-actions">
            <Button variant="secondary" onClick={onBack}>
              Back to App
            </Button>
            <Button className="logout-btn" onClick={onLogout}>
              Log out
            </Button>
          </div>
        </Card3D>
      </div>
    </motion.section>
  );
}

export default ProfilePage;
