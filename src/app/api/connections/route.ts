import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse, ConnectionWithRelations, CreateConnectionInput } from "@/types";

const CONNECTION_SELECT = {
  id: true,
  postId: true,
  giverId: true,
  requesterId: true,
  status: true,
  proofImageUrl: true,
  proofNote: true,
  completedAt: true,
  giverRating: true,
  requesterRating: true,
  giverReview: true,
  requesterReview: true,
  giverPoints: true,
  requesterPoints: true,
  createdAt: true,
  updatedAt: true,
  post: {
    select: {
      id: true,
      type: true,
      description: true,
      status: true,
      categoryId: true,
      districtId: true,
      urgency: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      expiresAt: true,
      category: true,
    },
  },
  giver: {
    select: { id: true, name: true, image: true },
  },
  requester: {
    select: { id: true, name: true, image: true },
  },
  _count: {
    select: { messages: true },
  },
} as const;

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

    const body = (await request.json()) as CreateConnectionInput;

    if (!body.postId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "معرف المنشور مطلوب" },
        { status: 400 },
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: body.postId },
      select: { id: true, type: true, userId: true, status: true },
    });

    if (!post) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنشور غير موجود" },
        { status: 404 },
      );
    }

    if (post.status !== "ACTIVE") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنشور لم يعد متاحاً" },
        { status: 400 },
      );
    }

    if (post.userId === session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "لا يمكنك التواصل مع منشورك الخاص" },
        { status: 400 },
      );
    }

    // Check for existing connection
    const existingConnection = await prisma.connection.findFirst({
      where: {
        postId: body.postId,
        OR: [
          { giverId: session.user.id },
          { requesterId: session.user.id },
        ],
        status: { notIn: ["CANCELLED"] },
      },
    });

    if (existingConnection) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "لديك تواصل موجود بالفعل على هذا المنشور" },
        { status: 400 },
      );
    }

    // OFFER: post author = giver, connector = requester
    // REQUEST: post author = requester, connector = giver
    const giverId = post.type === "OFFER" ? post.userId : session.user.id;
    const requesterId = post.type === "OFFER" ? session.user.id : post.userId;

    const connection = await prisma.connection.create({
      data: {
        postId: body.postId,
        giverId,
        requesterId,
        status: "PENDING",
      },
      select: CONNECTION_SELECT,
    });

    logger.info("Connection created", "ConnectionsAPI", {
      connectionId: connection.id,
      postId: body.postId,
      userId: session.user.id,
    });

    return NextResponse.json<ApiResponse<ConnectionWithRelations>>(
      {
        data: connection as unknown as ConnectionWithRelations,
        message: "تم إنشاء التواصل بنجاح",
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to create connection", "ConnectionsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في إنشاء التواصل" },
      { status: 500 },
    );
  }
}

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
    const status = searchParams.get("status") ?? undefined;

    const where = {
      OR: [
        { giverId: session.user.id },
        { requesterId: session.user.id },
      ],
      ...(status && { status: status as ConnectionWithRelations["status"] }),
    };

    const connections = await prisma.connection.findMany({
      where,
      select: CONNECTION_SELECT,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json<ApiResponse<ConnectionWithRelations[]>>({
      data: connections as unknown as ConnectionWithRelations[],
    });
  } catch (error) {
    logger.error("Failed to fetch connections", "ConnectionsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل التواصلات" },
      { status: 500 },
    );
  }
}
