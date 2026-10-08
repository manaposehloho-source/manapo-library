export default function StatCard({ label, value, alert = false }) {
  return (
    <div className={'stat-card' + (alert ? ' alert' : '')}>
      <p className="stat-value">{String(value)}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}
