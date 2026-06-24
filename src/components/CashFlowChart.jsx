import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/calculations';

function formatYAxis(value) {
  if (Math.abs(value) >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'k';
  }
  return '$' + value;
}

function CustomTooltip({ active, payload, label, comparing }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-month">Month {label}</p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey}
            className="chart-tooltip-value"
            style={{ color: entry.color }}
          >
            {comparing ? `${entry.name}: ` : ''}{formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function CashFlowChart({ data, comparing, colorA, colorB }) {
  // Read CSS variables so chart lines respect the active theme
  const style = getComputedStyle(document.documentElement);
  const gridColor = style.getPropertyValue('--chart-grid').trim() || '#2a2a3e';
  const refLineColor = style.getPropertyValue('--chart-refline').trim() || '#555577';
  const axisColor = style.getPropertyValue('--text-secondary').trim() || '#8888aa';

  return (
    <div className="card chart-card" id="cashflow-chart">
      <h2 className="section-title">Cumulative Cash Flow</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="month"
            label={{ value: 'Month', position: 'insideBottomRight', offset: -5, fill: axisColor }}
            tick={{ fill: axisColor, fontSize: 12 }}
          />
          <YAxis tickFormatter={formatYAxis} tick={{ fill: axisColor, fontSize: 12 }} />
          <Tooltip content={<CustomTooltip comparing={comparing} />} />
          {comparing && (
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 13 }}
              formatter={(value) => (
                <span style={{ color: value === 'Scenario A' ? colorA : colorB }}>{value}</span>
              )}
            />
          )}
          <ReferenceLine
            y={0}
            stroke={refLineColor}
            strokeDasharray="6 3"
            label={{ value: 'Break-even', fill: axisColor, fontSize: 11 }}
          />
          {comparing ? (
            <>
              <Line
                type="monotone"
                dataKey="valueA"
                name="Scenario A"
                stroke={colorA}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: colorA }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="valueB"
                name="Scenario B"
                stroke={colorB}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: colorB }}
                connectNulls
              />
            </>
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={colorA || '#3399ff'}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: colorA || '#3399ff' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CashFlowChart;
