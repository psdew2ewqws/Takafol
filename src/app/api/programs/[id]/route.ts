import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.volunteerProgram.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "البرنامج غير موجود" },
        { status: 404 },
      );
    }

    const program = await prisma.volunteerProgram.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleAr !== undefined && { titleAr: body.titleAr.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr?.trim() || null }),
        ...(body.charityId !== undefined && { charityId: body.charityId }),
        ...(body.capacity !== undefined && { capacity: Number(body.capacity) }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
    });

    return NextResponse.json<ApiResponse<typeof program>>({
      data: program,
      message: "تم تحديث البرنامج بنجاح",
    });
  } catch (error) {
    logger.error("Failed to update program", "ProgramsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحديث البرنامج" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    await prisma.volunteerProgram.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse<null>>({
      message: "تم تعطيل البرنامج بنجاح",
    });
  } catch (error) {
    logger.error("Failed to deactivate program", "ProgramsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تعطيل البرنامج" },
      { status: 500 },
    );
  }
}
