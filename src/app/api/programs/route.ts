import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const programs = await prisma.volunteerProgram.findMany({
      where: { isActive: true },
      include: {
        charity: { select: { id: true, name: true, nameAr: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<typeof programs>>({ data: programs });
  } catch (error) {
    logger.error("Failed to fetch programs", "ProgramsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل البرامج" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { title, titleAr, description, descriptionAr, charityId, capacity } = body;

    if (!title?.trim() || !titleAr?.trim() || !charityId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "عنوان البرنامج والجمعية مطلوبة" },
        { status: 400 },
      );
    }

    const program = await prisma.volunteerProgram.create({
      data: {
        title: title.trim(),
        titleAr: titleAr.trim(),
        description: description?.trim() || null,
        descriptionAr: descriptionAr?.trim() || null,
        charityId,
        capacity: Number(capacity) || 0,
        isActive: true,
      },
    });

    return NextResponse.json<ApiResponse<typeof program>>(
      { data: program, message: "تم إنشاء البرنامج بنجاح" },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to create program", "ProgramsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في إنشاء البرنامج" },
      { status: 500 },
    );
  }
}
