import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

interface BreakdownItem {
  id: string;
  nameEn: string;
  nameAr: string;
  icon?: string;
  count: number;
}

interface AnalyticsData {
  categoryBreakdown: BreakdownItem[];
  districtBreakdown: BreakdownItem[];
  completionRate: {
    total: number;
    completed: number;
    rate: number;
  };
  totalPosts: number;
  totalConnections: number;
  totalUsers: number;
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

    const [categories, districts, totalPosts, totalConnections, completedConnections, totalUsers] =
      await Promise.all([
        prisma.category.findMany({
          include: { _count: { select: { posts: true } } },
          orderBy: { nameAr: "asc" },
        }),
        prisma.district.findMany({
          include: { _count: { select: { posts: true } } },
          orderBy: { nameAr: "asc" },
        }),
        prisma.post.count(),
        prisma.connection.count(),
        prisma.connection.count({ where: { status: "COMPLETED" } }),
        prisma.user.count(),
      ]);

    const categoryBreakdown: BreakdownItem[] = categories.map((c) => ({
      id: c.id,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      icon: c.icon,
      count: c._count.posts,
    }));

    const districtBreakdown: BreakdownItem[] = districts
      .map((d) => ({
        id: d.id,
        nameEn: d.nameEn,
        nameAr: d.nameAr,
        count: d._count.posts,
      }))
      .sort((a, b) => b.count - a.count);

    const completionRate = {
      total: totalConnections,
      completed: completedConnections,
      rate: totalConnections > 0 ? Math.round((completedConnections / totalConnections) * 100) : 0,
    };

    const analytics: AnalyticsData = {
      categoryBreakdown,
      districtBreakdown,
      completionRate,
      totalPosts,
      totalConnections,
      totalUsers,
    };

    return NextResponse.json<ApiResponse<AnalyticsData>>({ data: analytics });
  } catch (error) {
    logger.error("Failed to fetch analytics", "AdminAnalyticsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل الإحصائيات" },
      { status: 500 },
    );
  }
}
