import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const programs = await prisma.volunteerProgram.findMany({
    where: { charityId: id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(programs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { programId, userId, userName } = body;

  if (!programId || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const program = await prisma.volunteerProgram.findUnique({ where: { id: programId } });
  if (!program || program.status !== 'open') {
    return NextResponse.json({ error: 'Program not available' }, { status: 400 });
  }

  if (program.maxVolunteers && program.currentVolunteers >= program.maxVolunteers) {
    return NextResponse.json({ error: 'Program is full' }, { status: 400 });
  }

  const application = await prisma.volunteerApplication.create({
    data: { programId, userId, userName, status: 'pending' },
  });

  await prisma.volunteerProgram.update({
    where: { id: programId },
    data: { currentVolunteers: { increment: 1 } },
  });

  // Award points
  await prisma.userImpact.upsert({
    where: { userId },
    update: { impactScore: { increment: 5 } },
    create: { userId, userName: userName || 'Volunteer', impactScore: 5 },
  });

  return NextResponse.json(application);
}
