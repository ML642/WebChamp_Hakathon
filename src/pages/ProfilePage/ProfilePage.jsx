import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Flag, GraduationCap, Layers3, LogOut, Mail, Sparkles } from "lucide-react";
import { Badge, Button } from "../../components/Ui";
import { tracks } from "../../data/mockData";
import "./ProfilePage.css";

function ProfilePage({ playerProfile, onBack, onLogout }) {
  if (!playerProfile) return null;
  const track = tracks.find((item) => item.id === playerProfile.track);

  return (
    <motion.section className="page profile-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <motion.div className="profile-layout" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <div className="panel profile-card">
          <div className="profile-topline">
            <Badge tone="success">Your profile</Badge>
            <span className="profile-live"><span /> Practice ready</span>
          </div>

          <div className="profile-identity">
            <div className="profile-avatar" aria-hidden="true">{playerProfile.name?.slice(0, 1).toUpperCase()}</div>
            <div>
              <h1>{playerProfile.name}</h1>
              <p className="profile-email"><Mail size={15} aria-hidden="true" />{playerProfile.email}</p>
            </div>
          </div>

          <div className="profile-stats">
            <motion.div className="stat-box" whileHover={{ y: -3 }}><GraduationCap size={19} aria-hidden="true" /><span className="stat-label">Level</span><span className="stat-value">{playerProfile.level || "Not set"}</span></motion.div>
            <motion.div className="stat-box" whileHover={{ y: -3 }}><Layers3 size={19} aria-hidden="true" /><span className="stat-label">Track</span><span className="stat-value">{track ? track.title : "Not set"}</span></motion.div>
          </div>

          <div className="profile-details">
            <div className="detail-item"><span className="detail-icon"><Flag size={17} aria-hidden="true" /></span><div><strong>Current goal</strong><p>{playerProfile.goal || "Interview preparation"}</p></div></div>
            <div className="detail-item"><span className="detail-icon"><BookOpen size={17} aria-hidden="true" /></span><div><strong>Studying</strong><p>{playerProfile.studying || "Not specified yet"}</p></div></div>
          </div>

          <div className="profile-tip"><Sparkles size={16} aria-hidden="true" /> Your profile helps Answerly tailor each practice session.</div>
          <div className="profile-actions"><Button variant="secondary" onClick={onBack}><ArrowLeft size={17} /> Back to app</Button><Button variant="danger" onClick={onLogout}><LogOut size={17} /> Log out</Button></div>
        </div>
      </motion.div>
    </motion.section>
  );
}

export default ProfilePage;
