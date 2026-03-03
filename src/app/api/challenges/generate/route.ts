import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getTodayTemplate } from "@/lib/challenge-templates";
import { broadcastNotification } from "@/lib/push-notifications";

/**
 * Returns the start of today in Jordan time (UTC+3) as a plain Date
 * normalised to midnight UTC so it aligns with the @db.Date column.
 */
function getJordanTodayUTC(): Date {
  // Jordan is UTC+3 – shift "now" forward by 3 hours, then strip the time
  // component so we get a clean calendar date that Prisma can store as a
  // date-only value.
  const now = new Date();
  const jordanOffsetMs = 3 * 60 * 60 * 1000;
  const jordanNow = new Date(now.getTime() + jordanOffsetMs);

  // Build a midnight-UTC Date that represents the same calendar day in Jordan.
  return new Date(
    Date.UTC(
      jordanNow.getUTCFullYear(),
      jordanNow.getUTCMonth(),
      jordanNow.getUTCDate(),
    ),
  );
}

/**
 * Verify request is authorised either via:
 *  1. A valid CRON_SECRET header (for scheduled jobs / CRON)
 *  2. An authenticated admin session
 *
 * Returns true if authorised, false otherwise.
 */
async function isAuthorised(request: NextRequest): Promise<boolean> {
  // 1. CRON secret check
  const cronSecret = process.env.CRON_SECRET;
  const incomingSecret = request.headers.get("x-cron-secret");
  if (cronSecret && incomingSecret === cronSecret) {
    return true;
  }

  // 2. Admin session check
  const session = await auth();
  if (session?.user?.id && session.user.role === "ADMIN") {
    return true;
  }

  return false;
}

/**
 * POST /api/challenges/generate
 *
 * Generates today's daily challenge if it does not already exist.
 * Can be called by:
 *   - A CRON job supplying the `x-cron-secret` header
 *   - An authenticated ADMIN user
 *
 * Response: { challenge, isNew: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorised(request))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 },
      );
    }

    const todayUTC = getJordanTodayUTC();

    // Return the existing challenge if one was already generated today.
    const existing = await prisma.dailyChallenge.findUnique({
      where: { date: todayUTC },
    });

    if (existing) {
      logger.info("Daily challenge already exists for today", "ChallengeGenerate", {
        date: todayUTC.toISOString(),
        challengeId: existing.id,
      });
      return NextResponse.json({ challenge: existing, isNew: false });
    }

    // Pick today's template based on day-of-year rotation.
    const template = getTodayTemplate(todayUTC);

    const challenge = await prisma.dailyChallenge.create({
      data: {
        date: todayUTC,
        titleEn: template.titleEn,
        titleAr: template.titleAr,
        descriptionEn: template.descriptionEn,
        descriptionAr: template.descriptionAr,
        category: template.category,
        actionType: template.actionType,
        points: template.points,
        iconEmoji: template.iconEmoji,
        isActive: true,
      },
    });

    logger.info("Daily challenge generated", "ChallengeGenerate", {
      date: todayUTC.toISOString(),
      challengeId: challenge.id,
      category: challenge.category,
      actionType: challenge.actionType,
    });

    // Expire yesterday's pending user challenges
    const yesterday = new Date(todayUTC);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayChallenge = await prisma.dailyChallenge.findUnique({
      where: { date: yesterday },
    });
    if (yesterdayChallenge) {
      await prisma.userChallenge.updateMany({
        where: { challengeId: yesterdayChallenge.id, status: "PENDING" },
        data: { status: "EXPIRED" },
      });
    }

    // Broadcast notification about new challenge (fire-and-forget)
    broadcastNotification({
      title: `Today's Challenge: ${template.titleEn}`,
      body: template.descriptionEn,
      icon: "/icons/icon-192x192.png",
      url: "/challenges",
    });

    return NextResponse.json({ challenge, isNew: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to generate daily challenge", "ChallengeGenerate", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to generate daily challenge" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/challenges/generate
 *
 * Returns today's already-generated daily challenge, or null if none exists yet.
 * Open endpoint – no authentication required.
 */
export async function GET() {
  try {
    const todayUTC = getJordanTodayUTC();

    const challenge = await prisma.dailyChallenge.findUnique({
      where: { date: todayUTC },
    });

    return NextResponse.json({ challenge: challenge ?? null });
  } catch (error) {
    logger.error("Failed to fetch today's challenge", "ChallengeGenerate", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch today's challenge" },
      { status: 500 },
    );
  }
}
