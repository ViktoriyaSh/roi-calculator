import { useState, useEffect, useRef } from 'react';

function validate(values) {
  const errors = {};

  if (!values.initialInvestment || values.initialInvestment <= 0) {
    errors.initialInvestment = 'Must be a positive number.';
  } else if (values.initialInvestment < 1000) {
    errors.initialInvestment = 'Must be at least $1,000.';
  }

  if (!values.monthlyRevenue || values.monthlyRevenue <= 0) {
    errors.monthlyRevenue = 'Must be greater than zero.';
  }

  if (values.monthlyCosts < 0) {
    errors.monthlyCosts = 'Cannot be negative.';
  }

  return errors;
}

function Field({ label, children, error }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function InputForm({ values, onChange, label, color, showLabel, onValidChange }) {
  const [touched, setTouched] = useState({});
  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  // Notify parent when validity changes
  const prevValidRef = useRef(null);
  useEffect(() => {
    if (onValidChange && prevValidRef.current !== isValid) {
      prevValidRef.current = isValid;
      onValidChange(isValid);
    }
  });

  function handle(e) {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    onChange({ ...values, [name]: Number(value) });
  }

  function handleBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  }

  // Only show error for a field after the user has touched it
  function errorFor(name) {
    return touched[name] ? errors[name] : null;
  }

  // Accent color on bottom border only when no error and in compare mode
  function accentStyle(name) {
    if (showLabel && color && !errorFor(name)) {
      return { borderBottomColor: color };
    }
    return {};
  }

  return (
    <div className="card input-form">
      <h2 className="section-title">
        {showLabel && color && (
          <span className="scenario-label" style={{ borderLeftColor: color, color }}>
            {label}
          </span>
        )}
        Project Parameters
      </h2>

      <Field label="Initial Investment ($)" error={errorFor('initialInvestment')}>
        <input
          name="initialInvestment"
          type="number"
          min="0"
          value={values.initialInvestment}
          onChange={handle}
          onBlur={handleBlur}
          style={accentStyle('initialInvestment')}
        />
      </Field>

      <Field label="Expected Monthly Revenue ($)" error={errorFor('monthlyRevenue')}>
        <input
          name="monthlyRevenue"
          type="number"
          min="0"
          value={values.monthlyRevenue}
          onChange={handle}
          onBlur={handleBlur}
          style={accentStyle('monthlyRevenue')}
        />
      </Field>

      <Field label="Monthly Operating Costs ($)" error={errorFor('monthlyCosts')}>
        <input
          name="monthlyCosts"
          type="number"
          min="0"
          value={values.monthlyCosts}
          onChange={handle}
          onBlur={handleBlur}
          style={accentStyle('monthlyCosts')}
        />
      </Field>

      <Field label="Calculation Period (months)">
        <select name="period" value={values.period} onChange={handle}>
          <option value={12}>12 months</option>
          <option value={24}>24 months</option>
          <option value={36}>36 months</option>
        </select>
      </Field>
    </div>
  );
}

export default InputForm;
