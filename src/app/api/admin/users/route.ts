import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  isBanned: true,
  impactScore: true,
  tasksCompleted: true,
  createdAt: true,
  _count: {
    select: { posts: true },
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 },
      );
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<{ users: typeof users; total: number }>>({
      data: { users, total },
    });
  } catch (error) {
    logger.error("Failed to fetch users", "AdminAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل المستخدمين" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بالوصول" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { userId, isBanned } = body as { userId: string; isBanned: boolean };

    if (!userId || typeof isBanned !== "boolean") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "بيانات غير صالحة" },
        { status: 400 },
      );
    }

    // Prevent banning yourself
    if (userId === session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "لا يمكنك حظر نفسك" },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBanned },
      select: USER_SELECT,
    });

    logger.info(`User ${isBanned ? "banned" : "unbanned"}`, "AdminAPI", {
      targetUserId: userId,
      adminId: session.user.id,
    });

    return NextResponse.json<ApiResponse<typeof user>>({
      data: user,
      message: isBanned ? "تم حظر المستخدم" : "تم رفع الحظر عن المستخدم",
    });
  } catch (error) {
    logger.error("Failed to update user ban status", "AdminAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحديث حالة المستخدم" },
      { status: 500 },
    );
  }
}
