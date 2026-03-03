import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getJordanToday, getStreakMultiplier } from "@/lib/challenge-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/challenges/streak
 *
 * Returns the authenticated user's current daily-challenge streak and
 * aggregate stats.
 *
 * A "streak" is the number of consecutive calendar days (Jordan time,
 * UTC+3), counting backwards from today/yesterday, on which the user
 * completed a challenge.
 *
 * Response:
 *   {
 *     streak:         number,   // consecutive days
 *     totalPoints:    number,   // sum of all pointsAwarded across COMPLETED challenges
 *     totalCompleted: number,   // count of COMPLETED challenges
 *     multiplier:     number,   // current streak multiplier
 *   }
 */
export async function GET() {
  try {
    // Auth required.
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Fetch all COMPLETED UserChallenge rows with their DailyChallenge date,
    // ordered by date descending so we can walk from most-recent backwards.
    const completedRows = await prisma.userChallenge.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { select: { date: true } } },
      orderBy: { challenge: { date: "desc" } },
    });

    // Aggregate totals over all completed rows.
    const totalCompleted = completedRows.length;
    const totalPoints = completedRows.reduce(
      (sum, uc) => sum + uc.pointsAwarded,
      0,
    );

    // ── Streak calculation ──────────────────────────────────────────────────
    // Build a Set of completed date strings for O(1) lookup.
    const completedDates = new Set(
      completedRows.map((uc) => uc.challenge.date.toISOString().slice(0, 10)),
    );

    const today = getJordanToday();
    const todayKey = today.toISOString().slice(0, 10);
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Determine starting point: if today is already completed, include it in
    // the streak; otherwise start from yesterday.
    let streak = 0;
    let cursor: Date;

    if (completedDates.has(todayKey)) {
      streak = 1;
      cursor = new Date(today.getTime() - oneDayMs); // move to yesterday
    } else {
      cursor = new Date(today.getTime() - oneDayMs); // start from yesterday
    }

    // Walk backwards until we find a day without a completion.
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!completedDates.has(key)) break;
      streak++;
      cursor = new Date(cursor.getTime() - oneDayMs);
    }

    const multiplier = getStreakMultiplier(streak);

    // Also fetch the Streak model for longestStreak
    const streakRecord = await prisma.streak.findUnique({
      where: { userId },
      select: { longestStreak: true },
    });

    return NextResponse.json({
      streak,
      longestStreak: streakRecord?.longestStreak ?? streak,
      totalPoints,
      totalCompleted,
      multiplier,
    });
  } catch (error) {
    logger.error("Failed to fetch challenge streak", "ChallengesStreakAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch challenge streak" },
      { status: 500 },
    );
  }
}
