function InputForm({ values, onChange, label, color, showLabel }) {
  function handle(e) {
    const { name, value } = e.target;
    onChange({ ...values, [name]: Number(value) });
  }

  return (
    <div className="card input-form">
      <h2 className="section-title">
        {showLabel && color ? (
          <span className="scenario-label" style={{ borderLeftColor: color, color }}>
            {label}
          </span>
        ) : null}
        Project Parameters
      </h2>

      <div className="field">
        <label htmlFor={`${label}-initialInvestment`}>Initial Investment ($)</label>
        <input
          id={`${label}-initialInvestment`}
          name="initialInvestment"
          type="number"
          min="0"
          value={values.initialInvestment}
          onChange={handle}
          style={showLabel && color ? { borderBottomColor: color } : {}}
        />
      </div>

      <div className="field">
        <label htmlFor={`${label}-monthlyRevenue`}>Expected Monthly Revenue ($)</label>
        <input
          id={`${label}-monthlyRevenue`}
          name="monthlyRevenue"
          type="number"
          min="0"
          value={values.monthlyRevenue}
          onChange={handle}
          style={showLabel && color ? { borderBottomColor: color } : {}}
        />
      </div>

      <div className="field">
        <label htmlFor={`${label}-monthlyCosts`}>Monthly Operating Costs ($)</label>
        <input
          id={`${label}-monthlyCosts`}
          name="monthlyCosts"
          type="number"
          min="0"
          value={values.monthlyCosts}
          onChange={handle}
          style={showLabel && color ? { borderBottomColor: color } : {}}
        />
      </div>

      <div className="field">
        <label htmlFor={`${label}-period`}>Calculation Period (months)</label>
        <select
          id={`${label}-period`}
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
