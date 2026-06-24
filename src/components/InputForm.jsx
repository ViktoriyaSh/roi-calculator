function InputForm({ values, onChange }) {
  function handle(e) {
    const { name, value } = e.target;
    onChange({ ...values, [name]: name === 'period' ? Number(value) : Number(value) });
  }

  return (
    <div className="card input-form">
      <h2 className="section-title">Project Parameters</h2>

      <div className="field">
        <label htmlFor="initialInvestment">Initial Investment ($)</label>
        <input
          id="initialInvestment"
          name="initialInvestment"
          type="number"
          min="0"
          value={values.initialInvestment}
          onChange={handle}
        />
      </div>

      <div className="field">
        <label htmlFor="monthlyRevenue">Expected Monthly Revenue ($)</label>
        <input
          id="monthlyRevenue"
          name="monthlyRevenue"
          type="number"
          min="0"
          value={values.monthlyRevenue}
          onChange={handle}
        />
      </div>

      <div className="field">
        <label htmlFor="monthlyCosts">Monthly Operating Costs ($)</label>
        <input
          id="monthlyCosts"
          name="monthlyCosts"
          type="number"
          min="0"
          value={values.monthlyCosts}
          onChange={handle}
        />
      </div>

      <div className="field">
        <label htmlFor="period">Calculation Period (months)</label>
        <select
          id="period"
          name="period"
          value={values.period}
          onChange={handle}
        >
          <option value={12}>12 months</option>
          <option value={24}>24 months</option>
          <option value={36}>36 months</option>
        </select>
      </div>
    </div>
  );
}

export default InputForm;
