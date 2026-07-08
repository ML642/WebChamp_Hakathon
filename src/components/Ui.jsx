import "./Ui.css";

export function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`button ${variant} ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function MetricCard({ label, value, detail }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

export function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <section className="empty-state">
      <span className="empty-icon">!</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {actionLabel ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </section>
  );
}
