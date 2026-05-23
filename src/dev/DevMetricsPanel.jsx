export default function DevMetricsPanel({ metrics }) {
  const events = metrics.events();
  return (
    <aside className="dev-metrics panel">
      <div className="panel-head">Dev metrics</div>
      <div className="panel-body">
        <div className="stat-grid">
          <div className="stat">
            <span className="micro">Win completion</span>
            <span className="stat-v">{(metrics.winCompletionRate() * 100).toFixed(0)}%</span>
          </div>
          <div className="stat">
            <span className="micro">Terminal rate</span>
            <span className="stat-v">{(metrics.terminalResolutionRate() * 100).toFixed(0)}%</span>
          </div>
          <div className="stat">
            <span className="micro">Rematch</span>
            <span className="stat-v">{(metrics.rematchRate() * 100).toFixed(0)}%</span>
          </div>
          <div className="stat">
            <span className="micro">Return</span>
            <span className="stat-v">{(metrics.returnRate() * 100).toFixed(0)}%</span>
          </div>
        </div>
        <pre className="dev-events">{JSON.stringify(events.slice(-8), null, 2)}</pre>
      </div>
    </aside>
  );
}
