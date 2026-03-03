import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/challenges/history
 *
 * Returns the authenticated user's full UserChallenge history, paginated and
 * ordered by creation date (newest first).  Each record includes the related
 * DailyChallenge fields required for display.
 *
 * Query params:
 *   page  – page number (default: 1)
 *   limit – records per page (default: 20)
 *
 * Response:
 *   { challenges: [...], total: number, page: number, totalPages: number }
 */
export async function GET(request: NextRequest) {
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

    // Parse and validate pagination params.
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20),
    );
    const skip = (page - 1) * limit;

    // Run count and data fetch in parallel.
    const [total, challenges] = await Promise.all([
      prisma.userChallenge.count({ where: { userId } }),
      prisma.userChallenge.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          challenge: {
            select: {
              titleEn: true,
              titleAr: true,
              descriptionEn: true,
              descriptionAr: true,
              points: true,
              iconEmoji: true,
              category: true,
              date: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ challenges, total, page, totalPages });
  } catch (error) {
    logger.error("Failed to fetch challenge history", "ChallengesHistoryAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to fetch challenge history" },
      { status: 500 },
    );
  }
}
