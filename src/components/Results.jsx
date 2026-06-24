import { formatCurrency, formatPercent } from '../utils/calculations';

function MetricCard({ label, value, highlight }) {
  return (
    <div className={`metric-card${highlight ? ' metric-card--highlight' : ''}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}

function Results({ roi, payback, totalNetProfit, monthlyNetProfit }) {
  return (
    <div className="card results">
      <h2 className="section-title">Results</h2>
      <div className="metrics-grid">
        <MetricCard
          label="ROI"
          value={formatPercent(roi)}
          highlight
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
