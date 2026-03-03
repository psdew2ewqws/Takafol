import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tryAutoCompleteChallenge } from "@/lib/challenge-auto-complete";
import { grantPoints } from "@/lib/gamification";
import type { ApiResponse } from "@/types";

/**
 * POST /api/donations
 * Record a zakat donation and award impact points (1 JOD = 10 points).
 * Accepts: { charityId, amount }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<null>>(
      { error: "يجب تسجيل الدخول أولاً" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { charityId, amount, receiptImage } = body;

    if (!charityId || !amount || Number(amount) <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "بيانات غير صالحة" },
        { status: 400 },
      );
    }

    if (!receiptImage) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "يرجى إرفاق صورة إثبات التحويل" },
        { status: 400 },
      );
    }

    const numericAmount = Number(amount);

    // Verify charity exists
    const charity = await prisma.charity.findUnique({
      where: { id: charityId },
    });

    if (!charity || !charity.isActive) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنظمة غير موجودة" },
        { status: 404 },
      );
    }

    // Calculate points: 1 JOD = 10 points
    const pointsEarned = Math.floor(numericAmount * 10);

    // Create donation record and update user impact score
    const [donation] = await prisma.$transaction([
      prisma.zakatDonation.create({
        data: {
          donorId: session.user.id,
          charityId,
          amount: numericAmount,
          currency: "JOD",
          receiptUrl: receiptImage,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          impactScore: { increment: pointsEarned },
        },
      }),
    ]);

    // Auto-complete daily challenge
    tryAutoCompleteChallenge(session.user.id, "MAKE_DONATION", donation.id);

    // Gamification: award points for donation
    grantPoints(session.user.id, "DONATE_ZAKAT", JSON.stringify({ donationId: donation.id, amount: numericAmount }))
      .catch((err) => console.error("Gamification error:", err));

    return NextResponse.json<ApiResponse<{ donation: typeof donation; pointsEarned: number }>>({
      data: { donation, pointsEarned },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تسجيل التبرع" },
      { status: 500 },
    );
  }
}
