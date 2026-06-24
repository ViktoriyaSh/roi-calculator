/**
 * ROI Calculator — pure calculation functions
 */

export function calcMonthlyNetProfit(monthlyRevenue, monthlyCosts) {
  return monthlyRevenue - monthlyCosts;
}

export function calcCumulativeCashFlow(monthlyNetProfit, initialInvestment, months) {
  return Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    value: monthlyNetProfit * (i + 1) - initialInvestment,
  }));
}

export function calcPaybackPeriod(initialInvestment, monthlyNetProfit) {
  if (monthlyNetProfit <= 0) return 'Never';
  return Math.ceil(initialInvestment / monthlyNetProfit);
}

export function calcTotalNetProfit(monthlyNetProfit, period, initialInvestment) {
  return monthlyNetProfit * period - initialInvestment;
}

export function calcROI(totalNetProfit, initialInvestment) {
  if (initialInvestment === 0) return 0;
  return (totalNetProfit / initialInvestment) * 100;
}

export function formatCurrency(value) {
  return '$' + Math.round(value).toLocaleString('en-US');
}

export function formatPercent(value) {
  return value.toFixed(1) + '%';
}
