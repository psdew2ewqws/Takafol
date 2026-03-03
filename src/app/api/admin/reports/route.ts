import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

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

    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true, isBanned: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<typeof reports>>({ data: reports });
  } catch (error) {
    logger.error("Failed to fetch reports", "AdminReportsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل البلاغات" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { reportId, status, adminNote, banUser } = body;

    if (!reportId || !status) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "معرف البلاغ والحالة مطلوبة" },
        { status: 400 },
      );
    }

    const validStatuses = ["REVIEWING", "RESOLVED", "DISMISSED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "حالة غير صالحة" },
        { status: 400 },
      );
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        ...(adminNote !== undefined && { adminNote: adminNote?.trim() || null }),
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true, isBanned: true } },
      },
    });

    if (banUser && report.reportedUserId) {
      await prisma.user.update({
        where: { id: report.reportedUserId },
        data: { isBanned: true },
      });
    }

    return NextResponse.json<ApiResponse<typeof report>>({
      data: report,
      message: "تم تحديث البلاغ بنجاح",
    });
  } catch (error) {
    logger.error("Failed to update report", "AdminReportsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحديث البلاغ" },
      { status: 500 },
    );
  }
}
