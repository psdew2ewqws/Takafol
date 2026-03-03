import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [total, active] = await Promise.all([
      prisma.pushSubscription.count(),
      prisma.pushSubscription.count({ where: { isActive: true } }),
    ]);

    const inactive = total - active;

    return NextResponse.json({ total, active, inactive }, { status: 200 });
  } catch (error) {
    console.error("[admin/notifications/stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch subscription stats" }, { status: 500 });
  }
}
