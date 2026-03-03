import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getJordanToday } from "@/lib/challenge-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/challenges/today
 *
 * Returns today's daily challenge (open to everyone) plus the authenticated
 * user's progress record for that challenge (if logged in).
 *
 * If no UserChallenge row exists yet for the logged-in user, one is created
 * with status "PENDING" so progress can be tracked from first view.
 *
 * Response shape:
 *   { challenge: DailyChallenge | null,
 *     userStatus: { status, completedAt, pointsAwarded } | null }
 */
export async function GET() {
  try {
    const today = getJordanToday();

    // Look up today's challenge (date is a unique @db.Date column).
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { date: today },
    });

    // No challenge published for today — return early.
    if (!challenge) {
      return NextResponse.json({ challenge: null, userStatus: null });
    }

    // Attempt to read the session — auth is optional for this endpoint.
    const session = await auth();

    if (!session?.user?.id) {
      // Unauthenticated: return the challenge without any personal status.
      return NextResponse.json({ challenge, userStatus: null });
    }

    const userId = session.user.id;

    // Find or create a UserChallenge row for this user + today's challenge.
    let userChallenge = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
      select: { status: true, completedAt: true, pointsAwarded: true },
    });

    if (!userChallenge) {
      // First time this user is viewing today's challenge — seed a PENDING row.
      userChallenge = await prisma.userChallenge.create({
        data: {
          userId,
          challengeId: challenge.id,
          status: "PENDING",
        },
        select: { status: true, completedAt: true, pointsAwarded: true },
      });
    }

    return NextResponse.json({
      challenge,
      userStatus: {
        status: userChallenge.status,
        completedAt: userChallenge.completedAt,
        pointsAwarded: userChallenge.pointsAwarded,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch today's challenge", "ChallengesTodayAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch today's challenge" },
      { status: 500 },
    );
  }
}
