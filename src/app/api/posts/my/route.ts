import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse, PostWithRelations } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") as "OFFER" | "REQUEST" | null;
    const status = searchParams.get("status") as "ACTIVE" | "COMPLETED" | "CANCELLED" | null;

    const posts = await prisma.post.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type }),
        ...(status && { status }),
      },
      select: {
        id: true,
        type: true,
        description: true,
        categoryId: true,
        districtId: true,
        urgency: true,
        status: true,
        userId: true,
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
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<PostWithRelations[]>>({
      data: posts as unknown as PostWithRelations[],
    });
  } catch (error) {
    logger.error("Failed to fetch user posts", "MyPostsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل منشوراتك" },
      { status: 500 },
    );
  }
}
