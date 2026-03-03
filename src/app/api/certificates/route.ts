import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { logCertificate } from "@/lib/blockchain";
import { createHash } from "crypto";
import type { ApiResponse } from "@/types";

// Generate SHA-256 hash of certificate data
function hashCertificate(data: {
  recipientId: string;
  recipientName: string;
  title: string;
  connectionId?: string;
  taskId?: string;
  issuedAt: string;
}): string {
  const payload = JSON.stringify(data);
  return "0x" + createHash("sha256").update(payload).digest("hex");
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

    const body = await request.json();
    const { connectionId, taskId } = body as { connectionId?: string; taskId?: string };

    if (!connectionId && !taskId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "معرف التواصل أو المهمة مطلوب" },
        { status: 400 },
      );
    }

    let recipientName = session.user.name || "متطوع";
    let title = "";
    let description = "";
    let category = "";

    // Certificate from connection completion
    if (connectionId) {
      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
        select: {
          id: true,
          status: true,
          giverId: true,
          requesterId: true,
          post: {
            select: {
              description: true,
              type: true,
              category: { select: { nameEn: true, nameAr: true, icon: true } },
            },
          },
          giver: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true } },
        },
      });

      if (!connection) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "التواصل غير موجود" },
          { status: 404 },
        );
      }

      if (connection.status !== "COMPLETED") {
        return NextResponse.json<ApiResponse<null>>(
          { error: "لا يمكن إصدار شهادة لتواصل غير مكتمل" },
          { status: 400 },
        );
      }

      // Check user is part of the connection
      if (connection.giverId !== session.user.id && connection.requesterId !== session.user.id) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "غير مصرح لك بإصدار هذه الشهادة" },
          { status: 403 },
        );
      }

      // Check if certificate already exists for this user + connection
      const existing = await prisma.certificate.findFirst({
        where: { recipientId: session.user.id, connectionId },
      });
      if (existing) {
        return NextResponse.json<ApiResponse<typeof existing>>({
          data: existing,
          message: "الشهادة موجودة بالفعل",
        });
      }

      const isGiver = session.user.id === connection.giverId;
      recipientName = isGiver
        ? (connection.giver.name || "متطوع")
        : (connection.requester.name || "متطوع");

      const roleLabel = isGiver ? "Volunteer Giver" : "Help Requester";
      title = `${connection.post.category.icon} ${connection.post.category.nameEn} — ${roleLabel}`;
      description = `Successfully completed a ${connection.post.type.toLowerCase()} connection in the ${connection.post.category.nameEn} category on the Takafol platform. This certificate verifies the volunteer's contribution, authenticated and immutably recorded on the Ethereum blockchain.`;
      category = connection.post.category.nameEn;
    }

    // Certificate from task completion
    if (taskId) {
      const application = await prisma.taskApplication.findFirst({
        where: { taskId, volunteerId: session.user.id, status: "completed" },
        select: {
          id: true,
          volunteerName: true,
          task: {
            select: { title: true, description: true, category: true },
          },
        },
      });

      if (!application) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "لم يتم العثور على طلب مكتمل لهذه المهمة" },
          { status: 404 },
        );
      }

      // Check if certificate already exists
      const existing = await prisma.certificate.findFirst({
        where: { recipientId: session.user.id, taskId },
      });
      if (existing) {
        return NextResponse.json<ApiResponse<typeof existing>>({
          data: existing,
          message: "الشهادة موجودة بالفعل",
        });
      }

      recipientName = application.volunteerName || session.user.name || "متطوع";
      title = application.task.title;
      description = `Successfully completed the volunteer task "${application.task.title}" on the Takafol platform. This certificate verifies the volunteer's contribution, authenticated and immutably recorded on the Ethereum blockchain.`;
      category = application.task.category;
    }

    const issuedAt = new Date().toISOString();

    // Generate certificate hash (like the verifiable-pdfs approach)
    const certHash = hashCertificate({
      recipientId: session.user.id,
      recipientName,
      title,
      connectionId,
      taskId,
      issuedAt,
    });

    // Create certificate record
    const certificate = await prisma.certificate.create({
      data: {
        recipientId: session.user.id,
        recipientName,
        connectionId: connectionId || null,
        taskId: taskId || null,
        title,
        description,
        category,
        certHash,
      },
    });

    // Log certificate to blockchain (non-blocking)
    logCertificate(certificate.id, session.user.id, certHash)
      .then(async (result) => {
        if (result) {
          await prisma.certificate.update({
            where: { id: certificate.id },
            data: {
              blockchainTx: result.txHash,
              explorerUrl: result.explorerUrl,
            },
          });
          logger.info("Certificate blockchain tx logged", "CertificateAPI", {
            certificateId: certificate.id,
            txHash: result.txHash,
          });
        }
      })
      .catch((err) => {
        logger.error("Certificate blockchain logging failed", "CertificateAPI", {
          certificateId: certificate.id,
          error: err instanceof Error ? err.message : String(err),
        });
      });

    logger.info("Certificate issued", "CertificateAPI", {
      certificateId: certificate.id,
      recipientId: session.user.id,
    });

    return NextResponse.json<ApiResponse<typeof certificate>>(
      { data: certificate, message: "تم إصدار الشهادة بنجاح" },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Failed to issue certificate", "CertificateAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في إصدار الشهادة" },
      { status: 500 },
    );
  }
}

// Get certificates for current user
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
    const certId = searchParams.get("id");

    // Get single certificate by ID (for verification)
    if (certId) {
      const certificate = await prisma.certificate.findUnique({
        where: { id: certId },
      });
      if (!certificate) {
        return NextResponse.json<ApiResponse<null>>(
          { error: "الشهادة غير موجودة" },
          { status: 404 },
        );
      }
      return NextResponse.json<ApiResponse<typeof certificate>>({
        data: certificate,
      });
    }

    // Get all certificates for current user
    const certificates = await prisma.certificate.findMany({
      where: { recipientId: session.user.id },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json<ApiResponse<typeof certificates>>({
      data: certificates,
    });
  } catch (error) {
    logger.error("Failed to fetch certificates", "CertificateAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل الشهادات" },
      { status: 500 },
    );
  }
}
