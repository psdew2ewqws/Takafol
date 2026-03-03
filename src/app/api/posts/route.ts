import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logOffer, logRequest } from "@/lib/blockchain";
import type { ApiResponse, PostWithRelations, CreatePostInput, PostFilters } from "@/types";
import type { Prisma } from "@/generated/prisma/client";

const POST_SELECT = {
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
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filters: PostFilters = {
      type: searchParams.get("type") as PostFilters["type"] ?? undefined,
      status: searchParams.get("status") as PostFilters["status"] ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      districtId: searchParams.get("districtId") ?? undefined,
      urgency: searchParams.get("urgency") as PostFilters["urgency"] ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Math.min(Number(searchParams.get("limit")) || 20, 50),
    };

    const where: Prisma.PostWhereInput = {};

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    else where.status = "ACTIVE";
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.districtId) where.districtId = filters.districtId;
    if (filters.urgency) where.urgency = filters.urgency;
    if (filters.search) {
      where.description = { contains: filters.search, mode: "insensitive" };
    }

    const skip = ((filters.page ?? 1) - 1) * (filters.limit ?? 20);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: POST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take: filters.limit ?? 20,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<{ posts: PostWithRelations[]; total: number }>>({
      data: { posts: posts as unknown as PostWithRelations[], total },
    });
  } catch (error) {
    logger.error("Failed to fetch posts", "PostsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل المنشورات" },
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

    if (session.user.isBanned) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "حسابك محظور" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as CreatePostInput;

    if (!body.type || !body.description || !body.categoryId || !body.districtId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 },
      );
    }

    if (!["OFFER", "REQUEST"].includes(body.type)) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "نوع المنشور غير صالح" },
        { status: 400 },
      );
    }

    if (body.description.length < 10 || body.description.length > 2000) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "الوصف يجب أن يكون بين 10 و 2000 حرف" },
        { status: 400 },
      );
    }

    const [category, district] = await Promise.all([
      prisma.category.findUnique({ where: { id: body.categoryId } }),
      prisma.district.findUnique({ where: { id: body.districtId } }),
    ]);

    if (!category) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "الفئة غير موجودة" },
        { status: 400 },
      );
    }

    if (!district) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنطقة غير موجودة" },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        type: body.type,
        description: body.description,
        categoryId: body.categoryId,
        districtId: body.districtId,
        urgency: body.urgency ?? "MEDIUM",
        userId: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: POST_SELECT,
    });

    logger.info("Post created", "PostsAPI", {
      postId: post.id,
      userId: session.user.id,
      type: body.type,
    });

    // Log to blockchain (non-blocking)
    const blockchainFn = body.type === "REQUEST" ? logRequest : logOffer;
    blockchainFn(
      post.id,
      session.user.id,
      category.nameEn,
      district.nameEn,
      body.description,
    ).then(async (result) => {
      if (result) {
        await prisma.post.update({
          where: { id: post.id },
          data: { blockchainTx: result.txHash, blockchainVerified: true },
        });
        logger.info("Post blockchain tx logged", "PostsAPI", {
          postId: post.id,
          txHash: result.txHash,
        });
      }
    }).catch((err) => {
      logger.error("Post blockchain logging failed", "PostsAPI", {
        postId: post.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    return NextResponse.json<ApiResponse<PostWithRelations>>(
      { data: post as unknown as PostWithRelations, message: "تم إنشاء المنشور بنجاح" },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to create post", "PostsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في إنشاء المنشور" },
      { status: 500 },
    );
  }
}
