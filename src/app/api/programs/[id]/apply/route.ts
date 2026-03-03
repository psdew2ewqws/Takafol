import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tryAutoCompleteChallenge } from "@/lib/challenge-auto-complete";
import { grantPoints } from "@/lib/gamification";
import type { ApiResponse } from "@/types";

/**
 * POST /api/programs/:id/apply
 * Apply to a volunteer program. Creates a VolunteerApplication record.
 * Accepts: { fullName, phone, note }
 */
export async function POST(
  request: NextRequest,
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

  // Parse form data from request body
  let fullName: string | undefined;
  let phone: string | undefined;
  let note: string | undefined;
  try {
    const body = await request.json();
    fullName = body.fullName?.trim() || undefined;
    phone = body.phone?.trim() || undefined;
    note = body.note?.trim() || undefined;
  } catch {
    // Empty body is fine — fields are optional
  }

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
        fullName,
        phone,
        note,
      },
    }),
    prisma.volunteerProgram.update({
      where: { id },
      data: { enrolled: { increment: 1 } },
    }),
  ]);

  // Auto-complete daily challenge
  tryAutoCompleteChallenge(session.user.id, "APPLY_PROGRAM", application.id);

  // Gamification: award points for charity program application
  grantPoints(session.user.id, "APPLY_CHARITY_PROGRAM", JSON.stringify({ programId: id }))
    .catch((err) => console.error("Gamification error:", err));

  return NextResponse.json<ApiResponse<typeof application>>({
    data: application,
    message: `تم التقديم بنجاح على برنامج ${program.charity.nameAr}`,
  });
}
