import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getPusherServer } from "@/lib/pusher";
import type { ApiResponse, MessageWithSender } from "@/types";

const MESSAGE_SELECT = {
  id: true,
  connectionId: true,
  senderId: true,
  content: true,
  isRead: true,
  createdAt: true,
  sender: {
    select: { id: true, name: true, image: true },
  },
} as const;

export async function GET(
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

    // Verify user is part of this connection
    const connection = await prisma.connection.findUnique({
      where: { id },
      select: { giverId: true, requesterId: true },
    });

    if (!connection) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "التواصل غير موجود" },
        { status: 404 },
      );
    }

    if (
      connection.giverId !== session.user.id &&
      connection.requesterId !== session.user.id
    ) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بمشاهدة الرسائل" },
        { status: 403 },
      );
    }

    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const messages = await prisma.message.findMany({
      where: { connectionId: id },
      select: MESSAGE_SELECT,
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        connectionId: id,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json<ApiResponse<MessageWithSender[]>>({
      data: messages as unknown as MessageWithSender[],
    });
  } catch (error) {
    logger.error("Failed to fetch messages", "MessagesAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل الرسائل" },
      { status: 500 },
    );
  }
}

export async function POST(
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

    const connection = await prisma.connection.findUnique({
      where: { id },
      select: { giverId: true, requesterId: true, status: true },
    });

    if (!connection) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "التواصل غير موجود" },
        { status: 404 },
      );
    }

    if (
      connection.giverId !== session.user.id &&
      connection.requesterId !== session.user.id
    ) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بإرسال رسائل" },
        { status: 403 },
      );
    }

    if (connection.status === "CANCELLED" || connection.status === "COMPLETED") {
      return NextResponse.json<ApiResponse<null>>(
        { error: "لا يمكن إرسال رسائل في تواصل منتهي" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const content = (body.content as string)?.trim();

    if (!content || content.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "محتوى الرسالة مطلوب" },
        { status: 400 },
      );
    }

    if (content.length > 2000) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "الرسالة طويلة جداً (حد 2000 حرف)" },
        { status: 400 },
      );
    }

    const message = await prisma.message.create({
      data: {
        connectionId: id,
        senderId: session.user.id,
        content,
      },
      select: MESSAGE_SELECT,
    });

    // Trigger Pusher event if configured
    const pusher = getPusherServer();
    if (pusher) {
      await pusher.trigger(`connection-${id}`, "new-message", message);
    }

    return NextResponse.json<ApiResponse<MessageWithSender>>(
      { data: message as unknown as MessageWithSender },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to send message", "MessagesAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في إرسال الرسالة" },
      { status: 500 },
    );
  }
}
