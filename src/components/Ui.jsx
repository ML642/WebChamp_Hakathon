import { motion, useMotionValue, useTransform } from "framer-motion";
import "./Ui.css";

export function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <motion.button
      className={`button ${variant} ${className}`.trim()}
      type="button"
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return (
    <motion.span
      className={`badge ${tone}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
}

export function MetricCard({ label, value, detail }) {
  return (
    <motion.div
      className="metric-card"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </motion.div>
  );
}

export function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <motion.section
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <span className="empty-icon">!</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </motion.section>
  );
}

export function Card3D({ children, className = "", ...props }) {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  const rotateX = useTransform(y, [0, 400], [12, -12]);
  const rotateY = useTransform(x, [0, 400], [-12, 12]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set((mouseX / width) * 400);
    y.set((mouseY / height) * 400);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  return (
    <motion.div
      className={`panel ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.15)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      {...props}
    >
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

