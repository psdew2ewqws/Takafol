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

    const existing = await prisma.charity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "الجمعية غير موجودة" },
        { status: 404 },
      );
    }

    const charity = await prisma.charity.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.nameAr !== undefined && { nameAr: body.nameAr.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr?.trim() || null }),
        ...(body.website !== undefined && { website: body.website?.trim() || null }),
        ...(body.isVerified !== undefined && { isVerified: Boolean(body.isVerified) }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
    });

    return NextResponse.json<ApiResponse<typeof charity>>({
      data: charity,
      message: "تم تحديث الجمعية بنجاح",
    });
  } catch (error) {
    logger.error("Failed to update charity", "CharityAdminAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحديث الجمعية" },
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

    await prisma.charity.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse<null>>({
      message: "تم تعطيل الجمعية بنجاح",
    });
  } catch (error) {
    logger.error("Failed to deactivate charity", "CharityAdminAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تعطيل الجمعية" },
      { status: 500 },
    );
  }
}
