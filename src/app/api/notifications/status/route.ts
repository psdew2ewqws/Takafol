import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

interface SubscriptionStatus {
  subscribed: boolean;
  count: number;
}

/**
 * GET /api/notifications/status
 * Returns whether the logged-in user has active push subscriptions and how many devices.
 * Requires authentication.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const count = await prisma.pushSubscription.count({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    const status: SubscriptionStatus = {
      subscribed: count > 0,
      count,
    };

    return NextResponse.json<ApiResponse<SubscriptionStatus>>({ data: status });
  } catch (error) {
    console.error("[notifications/status] GET error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: "Failed to fetch subscription status" },
      { status: 500 },
    );
  }
}
