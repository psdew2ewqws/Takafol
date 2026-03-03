import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { broadcastNotification } from "@/lib/push-notifications";

interface SendNotificationBody {
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  iconUrl?: string;
  linkUrl?: string;
  targetType?: "ALL" | "SPECIFIC";
  userIds?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = (await request.json()) as SendNotificationBody;
    const { titleEn, titleAr, bodyEn, bodyAr, iconUrl, linkUrl, targetType = "ALL", userIds } = body;

    if (!titleEn || !titleAr || !bodyEn || !bodyAr) {
      return NextResponse.json(
        { error: "titleEn, titleAr, bodyEn, and bodyAr are required" },
        { status: 400 },
      );
    }

    // Create the notification log record before sending
    const log = await prisma.notificationLog.create({
      data: {
        titleEn,
        titleAr,
        bodyEn,
        bodyAr,
        iconUrl,
        linkUrl,
        targetType,
        sentById: session.user.id,
        status: "SENT",
        recipientCount: 0,
      },
    });

    // Broadcast to all active subscribers
    await broadcastNotification({
      title: titleEn,
      body: bodyEn,
      icon: iconUrl,
      url: linkUrl,
    });

    // Count active subscriptions to update recipientCount
    const recipientCount = await prisma.pushSubscription.count({
      where: { isActive: true },
    });

    // Update the log with the actual recipient count
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: { recipientCount },
    });

    return NextResponse.json({ success: true, recipientCount }, { status: 200 });
  } catch (error) {
    console.error("[admin/notifications/send] Error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
