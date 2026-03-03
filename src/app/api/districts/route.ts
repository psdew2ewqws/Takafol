import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse, District } from "@/types";

export async function GET() {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { nameAr: "asc" },
    });

    return NextResponse.json<ApiResponse<District[]>>({
      data: districts,
    });
  } catch (error) {
    logger.error("Failed to fetch districts", "DistrictsAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل المناطق" },
      { status: 500 },
    );
  }
}
