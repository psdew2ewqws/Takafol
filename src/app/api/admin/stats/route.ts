import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalConnections: number;
  completedConnections: number;
  activePosts: number;
  bannedUsers: number;
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 },
      );
    }

    const [totalUsers, totalPosts, totalConnections, completedConnections, activePosts, bannedUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.connection.count(),
        prisma.connection.count({ where: { status: "COMPLETED" } }),
        prisma.post.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({ where: { isBanned: true } }),
      ]);

    const stats: AdminStats = {
      totalUsers,
      totalPosts,
      totalConnections,
      completedConnections,
      activePosts,
      bannedUsers,
    };

    return NextResponse.json<ApiResponse<AdminStats>>({ data: stats });
  } catch (error) {
    logger.error("Failed to fetch admin stats", "AdminAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل إحصائيات المنصة" },
      { status: 500 },
    );
  }
}
