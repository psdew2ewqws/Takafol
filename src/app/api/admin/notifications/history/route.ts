import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10));
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notificationLog.findMany({
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
        include: {
          sentBy: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.notificationLog.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ notifications, total, page, totalPages }, { status: 200 });
  } catch (error) {
    console.error("[admin/notifications/history] Error:", error);
    return NextResponse.json({ error: "Failed to fetch notification history" }, { status: 500 });
  }
}
