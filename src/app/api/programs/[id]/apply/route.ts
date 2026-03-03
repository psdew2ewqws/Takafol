import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

/**
 * POST /api/programs/:id/apply
 * Apply to a volunteer program. Creates a VolunteerApplication record.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<null>>(
      { error: "يجب تسجيل الدخول أولاً" },
      { status: 401 },
    );
  }

  const { id } = await params;

  // Check program exists and is active
  const program = await prisma.volunteerProgram.findUnique({
    where: { id },
    include: { charity: { select: { nameAr: true } } },
  });

  if (!program || !program.isActive) {
    return NextResponse.json<ApiResponse<null>>(
      { error: "البرنامج غير موجود أو غير نشط" },
      { status: 404 },
    );
  }

  // Check if already at capacity
  if (program.capacity > 0 && program.enrolled >= program.capacity) {
    return NextResponse.json<ApiResponse<null>>(
      { error: "البرنامج مكتمل العدد" },
      { status: 400 },
    );
  }

  // Check if already applied
  const existing = await prisma.volunteerApplication.findUnique({
    where: {
      userId_programId: {
        userId: session.user.id,
        programId: id,
      },
    },
  });

  if (existing) {
    return NextResponse.json<ApiResponse<null>>(
      { error: "لقد تقدمت لهذا البرنامج مسبقاً", data: null },
      { status: 400 },
    );
  }

  // Create application and increment enrolled count
  const [application] = await prisma.$transaction([
    prisma.volunteerApplication.create({
      data: {
        userId: session.user.id,
        programId: id,
        status: "PENDING",
      },
    }),
    prisma.volunteerProgram.update({
      where: { id },
      data: { enrolled: { increment: 1 } },
    }),
  ]);

  return NextResponse.json<ApiResponse<typeof application>>({
    data: application,
    message: `تم التقديم بنجاح على برنامج ${program.charity.nameAr}`,
  });
}
