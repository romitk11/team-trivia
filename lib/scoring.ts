export function computePoints(
  basePoints: number,
  timeLimitSec: number,
  questionStartedAt: number,
  answeredAt: number,
): number {
  const timeLimitMs = timeLimitSec * 1000;
  const elapsedMs = Math.max(0, answeredAt - questionStartedAt);
  const remainingFraction = Math.max(0, (timeLimitMs - elapsedMs) / timeLimitMs);
  return Math.round(basePoints * (0.5 + 0.5 * remainingFraction));
}
