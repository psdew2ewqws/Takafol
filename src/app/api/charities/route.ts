import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const charities = await prisma.charity.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { volunteerPrograms: true, zakatDonations: true },
        },
      },
    });

    return NextResponse.json<ApiResponse<typeof charities>>({
      data: charities,
    });
  } catch (error) {
    logger.error("Failed to fetch charities", "CharitiesAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل المنظمات الخيرية" },
      { status: 500 },
    );
  }
}
