// Constant-notional illustration: percentages use percentage points, not decimals.
// Compare price travel to the same net equity target, not a time forecast.
export function executionMetrics(feePercent, leverage, targetPercent = 10) {
  if (feePercent == null || leverage == null || !Number.isFinite(feePercent) || !Number.isFinite(leverage) || feePercent < 0 || leverage <= 0 || !Number.isFinite(targetPercent) || targetPercent <= 0) {
    return { feeDrag: null, requiredMove: null, reach: null };
  }
  const feeDrag = 2 * feePercent * leverage;
  const requiredMove = (targetPercent + feeDrag) / leverage;
  return { feeDrag, requiredMove, reach: 1 / requiredMove };
}
