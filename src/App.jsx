import { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import CashFlowChart from './components/CashFlowChart';
import BreakdownTable from './components/BreakdownTable';
import {
  calcMonthlyNetProfit,
  calcCumulativeCashFlow,
  calcPaybackPeriod,
  calcTotalNetProfit,
  calcROI,
  calcMonthlyBreakdown,
} from './utils/calculations';
import { exportPdf } from './utils/exportPdf';

const DEFAULTS_A = {
  initialInvestment: 100000,
  monthlyRevenue: 15000,
  monthlyCosts: 5000,
  period: 12,
};

const DEFAULTS_B = {
  initialInvestment: 150000,
  monthlyRevenue: 20000,
  monthlyCosts: 8000,
  period: 12,
};

const SCENARIO_COLORS = {
  A: '#3399ff',
  B: '#ff8c00',
};

function calcScenario(values) {
  const monthlyNetProfit = calcMonthlyNetProfit(values.monthlyRevenue, values.monthlyCosts);
  const totalNetProfit = calcTotalNetProfit(monthlyNetProfit, values.period, values.initialInvestment);
  return {
    monthlyNetProfit,
    totalNetProfit,
    roi: calcROI(totalNetProfit, values.initialInvestment),
    payback: calcPaybackPeriod(values.initialInvestment, monthlyNetProfit),
    chartData: calcCumulativeCashFlow(monthlyNetProfit, values.initialInvestment, values.period),
    breakdown: calcMonthlyBreakdown(values.monthlyRevenue, values.monthlyCosts, values.initialInvestment, values.period),
  };
}

function App() {
  const [valuesA, setValuesA] = useState(DEFAULTS_A);
  const [valuesB, setValuesB] = useState(DEFAULTS_B);
  const [comparing, setComparing] = useState(false);
  const [validA, setValidA] = useState(true);
  const [validB, setValidB] = useState(true);
  const [exporting, setExporting] = useState(false);

  const scenarioA = calcScenario(valuesA);
  const scenarioB = calcScenario(valuesB);

  const resultsValid = comparing ? validA && validB : validA;

  async function handleExportPdf() {
    setExporting(true);
    await exportPdf({ valuesA, valuesB, scenarioA, scenarioB, comparing });
    setExporting(false);
  }

  const maxPeriod = comparing ? Math.max(valuesA.period, valuesB.period) : valuesA.period;
  const mergedChartData = Array.from({ length: maxPeriod }, (_, i) => {
    const month = i + 1;
    const pointA = scenarioA.chartData.find(d => d.month === month);
    const pointB = scenarioB.chartData.find(d => d.month === month);
    return {
      month,
      valueA: pointA ? pointA.value : undefined,
      valueB: pointB ? pointB.value : undefined,
    };
  });

  return (
    <div className="app-shell">
      {/* Dark sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-epam">EPAM</span>
          <span className="sidebar-logo-sub">ROI Calculator</span>
        </div>
        <nav className="sidebar-nav">
          <a className="sidebar-nav-item sidebar-nav-item--active" href="#">
            <span className="nav-icon">&#9698;</span> Calculator
          </a>
          <a className="sidebar-nav-item" href="#">
            <span className="nav-icon">&#9776;</span> Reports
          </a>
          <a className="sidebar-nav-item" href="#">
            <span className="nav-icon">&#9881;</span> Settings
          </a>
        </nav>
        <div className="sidebar-footer">Theme B — EPAM Brand</div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="top-bar-title">Business ROI Calculator</h1>
          <span className="top-bar-badge">Live</span>
          <div className="top-bar-spacer" />
          <button
            className="btn btn--export"
            onClick={handleExportPdf}
            disabled={!resultsValid || exporting}
            title={!resultsValid ? 'Fix errors before exporting' : 'Download PDF report'}
          >
            {exporting ? 'Exporting...' : '↓ Export PDF'}
          </button>
          {comparing ? (
            <button className="btn btn--danger" onClick={() => setComparing(false)}>
              ✕ Remove Scenario
            </button>
          ) : (
            <button className="btn btn--primary" onClick={() => setComparing(true)}>
              + Add Scenario
            </button>
          )}
        </header>

        <div className={`content-grid${comparing ? ' content-grid--compare' : ''}`}>
          {/* Scenario A form */}
          <section className="col-left">
            <InputForm
              values={valuesA}
              onChange={setValuesA}
              label="Scenario A"
              color={SCENARIO_COLORS.A}
              showLabel={comparing}
              onValidChange={setValidA}
            />
          </section>

          {/* Scenario B form — only in comparison mode */}
          {comparing && (
            <section className="col-left">
              <InputForm
                values={valuesB}
                onChange={setValuesB}
                label="Scenario B"
                color={SCENARIO_COLORS.B}
                showLabel={true}
                onValidChange={setValidB}
              />
            </section>
          )}

          {/* Results + Chart */}
          <section className={`col-right${comparing ? ' col-right--compare' : ''}`}>
            <div className={`results-wrapper${!resultsValid ? ' results-wrapper--disabled' : ''}`}>
              {!resultsValid && (
                <div className="results-overlay">
                  <span className="results-overlay-msg">Fix the errors above to see results</span>
                </div>
              )}

              {comparing ? (
                <div className="results-comparison">
                  <Results
                    {...scenarioA}
                    label="Scenario A"
                    color={SCENARIO_COLORS.A}
                  />
                  <Results
                    {...scenarioB}
                    label="Scenario B"
                    color={SCENARIO_COLORS.B}
                  />
                </div>
              ) : (
                <Results {...scenarioA} />
              )}

              <CashFlowChart
                data={comparing ? mergedChartData : scenarioA.chartData}
                comparing={comparing}
                colorA={SCENARIO_COLORS.A}
                colorB={SCENARIO_COLORS.B}
              />

              <BreakdownTable
                comparing={comparing}
                scenarios={comparing ? [
                  { rows: scenarioA.breakdown, color: SCENARIO_COLORS.A },
                  { rows: scenarioB.breakdown.slice(0, scenarioA.breakdown.length), color: SCENARIO_COLORS.B },
                ] : [
                  { rows: scenarioA.breakdown, color: SCENARIO_COLORS.A },
                ]}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
