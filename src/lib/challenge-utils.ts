/**
 * Shared utilities for the daily challenge system.
 */

/**
 * Returns today's date at midnight UTC, representing the current calendar day
 * in Jordan time (UTC+3). Used to match the @db.Date column in DailyChallenge.
 */
export function getJordanToday(): Date {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Returns the streak multiplier for point calculation based on the number of
 * consecutive days the user has completed challenges.
 *
 * Thresholds:
 *   30+ days → 3x
 *   14+ days → 2.5x
 *    7+ days → 2x
 *    3+ days → 1.5x
 *      else  → 1x
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2.5;
  if (streak >= 7) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}
