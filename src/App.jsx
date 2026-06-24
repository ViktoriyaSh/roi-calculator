import { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import CashFlowChart from './components/CashFlowChart';
import {
  calcMonthlyNetProfit,
  calcCumulativeCashFlow,
  calcPaybackPeriod,
  calcTotalNetProfit,
  calcROI,
} from './utils/calculations';

const DEFAULTS = {
  initialInvestment: 100000,
  monthlyRevenue: 15000,
  monthlyCosts: 5000,
  period: 12,
};

function App() {
  const [values, setValues] = useState(DEFAULTS);

  const monthlyNetProfit = calcMonthlyNetProfit(values.monthlyRevenue, values.monthlyCosts);
  const totalNetProfit = calcTotalNetProfit(monthlyNetProfit, values.period, values.initialInvestment);
  const roi = calcROI(totalNetProfit, values.initialInvestment);
  const payback = calcPaybackPeriod(values.initialInvestment, monthlyNetProfit);
  const chartData = calcCumulativeCashFlow(monthlyNetProfit, values.initialInvestment, values.period);

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
        </header>

        <div className="content-grid">
          <section className="col-left">
            <InputForm values={values} onChange={setValues} />
          </section>

          <section className="col-right">
            <Results
              roi={roi}
              payback={payback}
              totalNetProfit={totalNetProfit}
              monthlyNetProfit={monthlyNetProfit}
            />
            <CashFlowChart data={chartData} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
