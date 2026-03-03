import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse, Category } from "@/types";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nameAr: "asc" },
    });

    return NextResponse.json<ApiResponse<Category[]>>({
      data: categories,
    });
  } catch (error) {
    logger.error("Failed to fetch categories", "CategoriesAPI", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في تحميل الفئات" },
      { status: 500 },
    );
  }
}
