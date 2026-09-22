// A comparison scenario, not a forecast: 1R is 1% of account equity.
export function executionMetrics(feePercent, leverage, riskPercent = 1) {
  if (feePercent == null || leverage == null || !Number.isFinite(feePercent) || !Number.isFinite(leverage) || feePercent < 0 || leverage <= 0 || !Number.isFinite(riskPercent) || riskPercent <= 0) {
    return { retained: null, timeFactor: null, velocity: null };
  }
  const retained = 1 - (2 * feePercent * leverage) / riskPercent;
  const timeFactor = leverage / 10;
  return { retained, timeFactor, velocity: retained * timeFactor };
}
