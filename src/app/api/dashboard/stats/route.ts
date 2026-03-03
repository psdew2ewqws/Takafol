import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

interface DashboardStats {
  impactScore: number;
  tasksCompleted: number;
  activeConnections: number;
  unreadMessages: number;
  totalPosts: number;
  averageRating: number;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const [user, activeConnections, unreadMessages, totalPosts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { impactScore: true, tasksCompleted: true, averageRating: true },
      }),
      prisma.connection.count({
        where: {
          OR: [{ giverId: userId }, { requesterId: userId }],
          status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] },
        },
      }),
      prisma.message.count({
        where: {
          connection: {
            OR: [{ giverId: userId }, { requesterId: userId }],
          },
          senderId: { not: userId },
          isRead: false,
        },
      }),
      prisma.post.count({ where: { userId } }),
    ]);

    const stats: DashboardStats = {
      impactScore: user?.impactScore ?? 0,
      tasksCompleted: user?.tasksCompleted ?? 0,
      activeConnections,
      unreadMessages,
      totalPosts,
      averageRating: user?.averageRating ?? 0,
    };

    return NextResponse.json<ApiResponse<DashboardStats>>({ data: stats });
  } catch (error) {
    logger.error("Failed to fetch dashboard stats", "DashboardAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل الإحصائيات" },
      { status: 500 },
    );
  }
}
