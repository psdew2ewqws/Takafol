import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logCompletion, logTaskCompleted } from "@/lib/blockchain";
import { IMPACT_POINTS } from "@/lib/constants";
import type { ApiResponse, ConnectionWithRelations, UpdateConnectionInput } from "@/types";

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
  blockchainTx: true,
  blockchainVerified: true,
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
      blockchainTx: true,
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

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
};

export async function GET(
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
    const connection = await prisma.connection.findUnique({
      where: { id },
      select: CONNECTION_SELECT,
    });

    if (!connection) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "التواصل غير موجود" },
        { status: 404 },
      );
    }

    if (
      connection.giverId !== session.user.id &&
      connection.requesterId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بمشاهدة هذا التواصل" },
        { status: 403 },
      );
    }

    return NextResponse.json<ApiResponse<ConnectionWithRelations>>({
      data: connection as unknown as ConnectionWithRelations,
    });
  } catch (error) {
    logger.error("Failed to fetch connection", "ConnectionAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل التواصل" },
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
    const existing = await prisma.connection.findUnique({
      where: { id },
      select: {
        id: true,
        giverId: true,
        requesterId: true,
        status: true,
        postId: true,
      },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "التواصل غير موجود" },
        { status: 404 },
      );
    }

    if (
      existing.giverId !== session.user.id &&
      existing.requesterId !== session.user.id
    ) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "غير مصرح لك بتعديل هذا التواصل" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as UpdateConnectionInput;

    // Handle status transition
    if (body.status) {
      const allowed = VALID_TRANSITIONS[existing.status] ?? [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json<ApiResponse<null>>(
          { error: `لا يمكن الانتقال من ${existing.status} إلى ${body.status}` },
          { status: 400 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    if (body.status) updateData.status = body.status;
    if (body.proofImageUrl) updateData.proofImageUrl = body.proofImageUrl;
    if (body.proofNote) updateData.proofNote = body.proofNote;

    // Handle ratings
    if (body.giverRating !== undefined && session.user.id === existing.requesterId) {
      if (body.giverRating < 1 || body.giverRating > 5) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "التقييم يجب أن يكون بين 1 و 5" },
          { status: 400 },
        );
      }
      updateData.giverRating = body.giverRating;
      if (body.giverReview) updateData.giverReview = body.giverReview;
    }

    if (body.requesterRating !== undefined && session.user.id === existing.giverId) {
      if (body.requesterRating < 1 || body.requesterRating > 5) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "التقييم يجب أن يكون بين 1 و 5" },
          { status: 400 },
        );
      }
      updateData.requesterRating = body.requesterRating;
      if (body.requesterReview) updateData.requesterReview = body.requesterReview;
    }

    // On completion: award impact points and update user stats
    if (body.status === "COMPLETED") {
      updateData.completedAt = new Date();
      updateData.giverPoints = IMPACT_POINTS.CONNECTION_COMPLETED_GIVER;
      updateData.requesterPoints = IMPACT_POINTS.CONNECTION_COMPLETED_REQUESTER;

      await prisma.$transaction([
        prisma.connection.update({
          where: { id },
          data: updateData,
        }),
        prisma.user.update({
          where: { id: existing.giverId },
          data: {
            impactScore: { increment: IMPACT_POINTS.CONNECTION_COMPLETED_GIVER },
            tasksCompleted: { increment: 1 },
          },
        }),
        prisma.user.update({
          where: { id: existing.requesterId },
          data: {
            impactScore: { increment: IMPACT_POINTS.CONNECTION_COMPLETED_REQUESTER },
            tasksCompleted: { increment: 1 },
          },
        }),
        prisma.post.update({
          where: { id: existing.postId },
          data: { status: "COMPLETED" },
        }),
      ]);

      const updated = await prisma.connection.findUnique({
        where: { id },
        select: CONNECTION_SELECT,
      });

      logger.info("Connection completed", "ConnectionAPI", {
        connectionId: id,
        giverId: existing.giverId,
        requesterId: existing.requesterId,
      });

      // Log completion to blockchain (non-blocking)
      logCompletion(id, session.user.id)
        .then(async (result) => {
          if (result) {
            await prisma.connection.update({
              where: { id },
              data: { blockchainTx: result.txHash, blockchainVerified: true },
            });
            logger.info("Completion blockchain tx logged", "ConnectionAPI", {
              connectionId: id,
              txHash: result.txHash,
            });
          }
        })
        .catch((err) => {
          logger.error("Completion blockchain logging failed", "ConnectionAPI", {
            connectionId: id,
            error: err instanceof Error ? err.message : String(err),
          });
        });

      return NextResponse.json<ApiResponse<ConnectionWithRelations>>({
        data: updated as unknown as ConnectionWithRelations,
        message: "تم إكمال التواصل بنجاح! تم تحديث نقاط التأثير.",
      });
    }

    const connection = await prisma.connection.update({
      where: { id },
      data: updateData,
      select: CONNECTION_SELECT,
    });

    // Log to blockchain when both ratings are submitted
    if (
      connection.giverRating &&
      connection.requesterRating
    ) {
      logTaskCompleted(id, connection.giverRating, connection.requesterRating)
        .then(async (result) => {
          if (result) {
            logger.info("TaskCompleted blockchain tx logged", "ConnectionAPI", {
              connectionId: id,
              txHash: result.txHash,
            });
          }
        })
        .catch((err) => {
          logger.error("TaskCompleted blockchain logging failed", "ConnectionAPI", {
            connectionId: id,
            error: err instanceof Error ? err.message : String(err),
          });
        });
    }

    logger.info("Connection updated", "ConnectionAPI", {
      connectionId: id,
      userId: session.user.id,
      newStatus: body.status,
    });

    return NextResponse.json<ApiResponse<ConnectionWithRelations>>({
      data: connection as unknown as ConnectionWithRelations,
      message: "تم تحديث التواصل بنجاح",
    });
  } catch (error) {
    logger.error("Failed to update connection", "ConnectionAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحديث التواصل" },
      { status: 500 },
    );
  }
}
