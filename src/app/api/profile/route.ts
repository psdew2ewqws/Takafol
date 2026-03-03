import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  phone: true,
  bio: true,
  districtId: true,
  impactScore: true,
  tasksCompleted: true,
  averageRating: true,
  role: true,
  createdAt: true,
  district: true,
} as const;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: PROFILE_SELECT,
    });

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المستخدم غير موجود" },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<typeof user>>({ data: user });
  } catch (error) {
    logger.error("Failed to fetch profile", "ProfileAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل الملف الشخصي" },
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

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = (body.name as string).trim();
      if (name.length < 2 || name.length > 100) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "الاسم يجب أن يكون بين 2 و 100 حرف" },
          { status: 400 },
        );
      }
      updateData.name = name;
    }

    if (body.phone !== undefined) {
      const phone = (body.phone as string).trim();
      if (phone && !/^[\d+\-() ]{7,20}$/.test(phone)) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "رقم الهاتف غير صالح" },
          { status: 400 },
        );
      }
      updateData.phone = phone || null;
    }

    if (body.bio !== undefined) {
      const bio = (body.bio as string).trim();
      if (bio.length > 500) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "النبذة يجب أن لا تتجاوز 500 حرف" },
          { status: 400 },
        );
      }
      updateData.bio = bio || null;
    }

    if (body.districtId !== undefined) {
      if (body.districtId) {
        const district = await prisma.district.findUnique({
          where: { id: body.districtId },
        });
        if (!district) {
          return NextResponse.json<ApiResponse<null>>(
            { error: "المنطقة غير موجودة" },
            { status: 400 },
          );
        }
      }
      updateData.districtId = body.districtId || null;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: PROFILE_SELECT,
    });

    logger.info("Profile updated", "ProfileAPI", { userId: session.user.id });

    return NextResponse.json<ApiResponse<typeof user>>({
      data: user,
      message: "تم تحديث الملف الشخصي بنجاح",
    });
  } catch (error) {
    logger.error("Failed to update profile", "ProfileAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحديث الملف الشخصي" },
      { status: 500 },
    );
  }
}
