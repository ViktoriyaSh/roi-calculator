import { useState } from 'react';
import { formatCurrency } from '../utils/calculations';

function BreakdownTable({ scenarios, comparing }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="card breakdown-card">
      <div className="breakdown-header">
        <h2 className="section-title breakdown-title">Monthly Breakdown</h2>
        <button
          className="btn btn--ghost"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? 'Hide Table' : 'Show Table'}
        </button>
      </div>

      {visible && (
        <div className="table-scroll">
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Month</th>
                {comparing ? (
                  <>
                    <th style={{ color: scenarios[0].color }}>Revenue (A)</th>
                    <th style={{ color: scenarios[0].color }}>Costs (A)</th>
                    <th style={{ color: scenarios[0].color }}>Net Profit (A)</th>
                    <th style={{ color: scenarios[0].color }}>Cash Flow (A)</th>
                    <th style={{ color: scenarios[1].color }}>Revenue (B)</th>
                    <th style={{ color: scenarios[1].color }}>Costs (B)</th>
                    <th style={{ color: scenarios[1].color }}>Net Profit (B)</th>
                    <th style={{ color: scenarios[1].color }}>Cash Flow (B)</th>
                  </>
                ) : (
                  <>
                    <th>Monthly Revenue</th>
                    <th>Monthly Costs</th>
                    <th>Net Profit</th>
                    <th>Cumulative Cash Flow</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {scenarios[0].rows.map((rowA, i) => {
                const rowB = comparing ? scenarios[1].rows[i] : null;
                const isBreakEvenA = rowA.isBreakEven;
                const isBreakEvenB = rowB && rowB.isBreakEven;
                const isBreakEvenRow = isBreakEvenA || isBreakEvenB;

                return (
                  <tr
                    key={rowA.month}
                    className={
                      isBreakEvenRow
                        ? 'row-breakeven'
                        : i % 2 === 1
                        ? 'row-striped'
                        : ''
                    }
                  >
                    <td className="month-cell">
                      {rowA.month}
                      {isBreakEvenRow && (
                        <span className="breakeven-badge">Break-even</span>
                      )}
                    </td>
                    {comparing ? (
                      <>
                        <td>{formatCurrency(rowA.monthlyRevenue)}</td>
                        <td>{formatCurrency(rowA.monthlyCosts)}</td>
                        <td className={rowA.monthlyNetProfit >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(rowA.monthlyNetProfit)}
                        </td>
                        <td className={rowA.cumulative >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(rowA.cumulative)}
                        </td>
                        <td>{formatCurrency(rowB.monthlyRevenue)}</td>
                        <td>{formatCurrency(rowB.monthlyCosts)}</td>
                        <td className={rowB.monthlyNetProfit >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(rowB.monthlyNetProfit)}
                        </td>
                        <td className={rowB.cumulative >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(rowB.cumulative)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{formatCurrency(rowA.monthlyRevenue)}</td>
                        <td>{formatCurrency(rowA.monthlyCosts)}</td>
                        <td className={rowA.monthlyNetProfit >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(rowA.monthlyNetProfit)}
                        </td>
                        <td className={rowA.cumulative >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(rowA.cumulative)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BreakdownTable;
