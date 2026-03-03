import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const charity = await prisma.charity.findUnique({
      where: { id },
      include: {
        volunteerPrograms: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { zakatDonations: true, volunteerPrograms: true },
        },
      },
    });

    if (!charity) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "المنظمة غير موجودة" },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<typeof charity>>({
      data: charity,
    });
  } catch (error) {
    logger.error("Failed to fetch charity", "CharityAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل بيانات المنظمة" },
      { status: 500 },
    );
  }
}
