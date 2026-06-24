import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/calculations';

function formatYAxis(value) {
  if (Math.abs(value) >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'k';
  }
  return '$' + value;
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-month">Month {label}</p>
        <p className="chart-tooltip-value">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

function CashFlowChart({ data }) {
  return (
    <div className="card chart-card">
      <h2 className="section-title">Cumulative Cash Flow</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            dataKey="month"
            label={{ value: 'Month', position: 'insideBottomRight', offset: -5, fill: '#8888aa' }}
            tick={{ fill: '#8888aa', fontSize: 12 }}
          />
          <YAxis tickFormatter={formatYAxis} tick={{ fill: '#8888aa', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#555577" strokeDasharray="6 3" label={{ value: 'Break-even', fill: '#8888aa', fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3399ff"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#3399ff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CashFlowChart;
