import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse, PostWithRelations, UpdatePostInput } from "@/types";

const POST_SELECT = {
  id: true,
  type: true,
  description: true,
  categoryId: true,
  districtId: true,
  urgency: true,
  status: true,
  userId: true,
  imageUrl: true,
  latitude: true,
  longitude: true,
  aiModerated: true,
  aiScore: true,
  aiSummary: true,
  blockchainTx: true,
  blockchainVerified: true,
  createdAt: true,
  updatedAt: true,
  expiresAt: true,
  user: {
    select: { id: true, name: true, image: true, averageRating: true },
  },
  category: true,
  district: true,
  _count: {
    select: { connections: true },
  },
} as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      select: POST_SELECT,
    });

    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنشور غير موجود" },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<PostWithRelations>>({
      data: post as unknown as PostWithRelations,
    });
  } catch (error) {
    logger.error("Failed to fetch post", "PostAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل المنشور" },
      { status: 500 },
    );
  }
}

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

    const { id } = await params;
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنشور غير موجود" },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بتعديل هذا المنشور" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as UpdatePostInput;

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(body.description && { description: body.description }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.districtId && { districtId: body.districtId }),
        ...(body.urgency && { urgency: body.urgency }),
        ...(body.status && { status: body.status }),
      },
      select: POST_SELECT,
    });

    logger.info("Post updated", "PostAPI", { postId: id, userId: session.user.id });

    return NextResponse.json<ApiResponse<PostWithRelations>>({
      data: post as unknown as PostWithRelations,
      message: "تم تحديث المنشور بنجاح",
    });
  } catch (error) {
    logger.error("Failed to update post", "PostAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحديث المنشور" },
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

    const { id } = await params;
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنشور غير موجود" },
        { status: 404 },
      );
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بحذف هذا المنشور" },
        { status: 403 },
      );
    }

    await prisma.post.delete({ where: { id } });

    logger.info("Post deleted", "PostAPI", { postId: id, userId: session.user.id });

    return NextResponse.json<ApiResponse<null>>({
      message: "تم حذف المنشور بنجاح",
    });
  } catch (error) {
    logger.error("Failed to delete post", "PostAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في حذف المنشور" },
      { status: 500 },
    );
  }
}
