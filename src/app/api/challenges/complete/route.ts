import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getJordanToday, getStreakMultiplier } from "@/lib/challenge-utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/challenges/complete
 *
 * Marks a challenge as completed for the authenticated user, calculates
 * streak-adjusted points, and credits them to the user's impactScore.
 *
 * Body: { challengeId: string, proofType?: string, proofId?: string }
 *
 * Response:
 *   { completed: true, pointsAwarded: number, streak: number, multiplier: number }
 *   { alreadyCompleted: true }
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { challengeId, proofType, proofId } = body as {
      challengeId: string;
      proofType?: string;
      proofId?: string;
    };

    if (!challengeId) {
      return NextResponse.json(
        { error: "challengeId is required" },
        { status: 400 },
      );
    }

    // Load the challenge so we can read its base points.
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId },
      select: { id: true, points: true },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 },
      );
    }

    // Find an existing UserChallenge row (may or may not exist yet).
    const existing = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      select: { id: true, status: true },
    });

    // Guard: already completed — nothing more to do.
    if (existing?.status === "COMPLETED") {
      return NextResponse.json({ alreadyCompleted: true });
    }

    // ── Streak calculation ──────────────────────────────────────────────────
    // Count consecutive days (going backwards from yesterday) where the user
    // already has a COMPLETED UserChallenge.

    const today = getJordanToday();

    // Fetch all COMPLETED user challenges with their challenge dates, sorted
    // newest-first.  We only need the date field from the related challenge.
    const completedRows = await prisma.userChallenge.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { select: { date: true } } },
      orderBy: { challenge: { date: "desc" } },
    });

    // Build a Set of ISO date strings (YYYY-MM-DD) for O(1) lookup.
    const completedDates = new Set(
      completedRows.map((uc) =>
        uc.challenge.date.toISOString().slice(0, 10),
      ),
    );

    // Walk backwards from yesterday, counting consecutive completed days.
    let streak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    let cursor = new Date(today.getTime() - oneDayMs); // start at yesterday

    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!completedDates.has(key)) break;
      streak++;
      cursor = new Date(cursor.getTime() - oneDayMs);
    }

    // ── Point calculation ───────────────────────────────────────────────────
    const multiplier = getStreakMultiplier(streak);
    const pointsAwarded = Math.round(challenge.points * multiplier);

    // ── Persist the completion ──────────────────────────────────────────────
    const now = new Date();

    if (existing) {
      // Row already exists (PENDING) — update it.
      await prisma.userChallenge.update({
        where: { id: existing.id },
        data: {
          status: "COMPLETED",
          completedAt: now,
          pointsAwarded,
          ...(proofType !== undefined && { proofType }),
          ...(proofId !== undefined && { proofId }),
        },
      });
    } else {
      // No row yet — create it as COMPLETED straight away.
      await prisma.userChallenge.create({
        data: {
          userId,
          challengeId,
          status: "COMPLETED",
          completedAt: now,
          pointsAwarded,
          proofType: proofType ?? null,
          proofId: proofId ?? null,
        },
      });
    }

    // Credit points to the user's overall impactScore.
    await prisma.user.update({
      where: { id: userId },
      data: { impactScore: { increment: pointsAwarded } },
    });

    logger.info("Challenge completed", "ChallengesCompleteAPI", {
      userId,
      challengeId,
      pointsAwarded,
      streak,
      multiplier,
    });

    return NextResponse.json({
      completed: true,
      pointsAwarded,
      streak,
      multiplier,
    });
  } catch (error) {
    logger.error("Failed to complete challenge", "ChallengesCompleteAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to complete challenge" },
      { status: 500 },
    );
  }
}
