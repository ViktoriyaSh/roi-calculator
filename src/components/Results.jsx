import { formatCurrency, formatPercent } from '../utils/calculations';

function MetricCard({ label, value, color }) {
  const isHighlight = !!color;
  return (
    <div
      className={`metric-card${isHighlight ? ' metric-card--highlight' : ''}`}
      style={isHighlight ? { borderColor: color, background: `${color}18` } : {}}
    >
      <span className="metric-label">{label}</span>
      <span className="metric-value" style={isHighlight ? { color } : {}}>
        {value}
      </span>
    </div>
  );
}

function Results({ roi, payback, totalNetProfit, monthlyNetProfit, label, color }) {
  return (
    <div className="card results">
      <h2 className="section-title">
        {label && color ? (
          <span className="scenario-label" style={{ borderLeftColor: color, color }}>
            {label}
          </span>
        ) : null}
        Results
      </h2>
      <div className="metrics-grid">
        <MetricCard
          label="ROI"
          value={formatPercent(roi)}
          color={color}
        />
        <MetricCard
          label="Payback Period"
          value={typeof payback === 'number' ? `${payback} months` : payback}
        />
        <MetricCard
          label="Total Net Profit"
          value={formatCurrency(totalNetProfit)}
        />
        <MetricCard
          label="Monthly Net Profit"
          value={formatCurrency(monthlyNetProfit)}
        />
      </div>
    </div>
  );
}

export default Results;
