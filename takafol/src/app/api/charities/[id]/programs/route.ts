import { NextRequest, NextResponse } from 'next/server';
import { getMockCharity } from '@/lib/mock-data';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { prisma } = await import('@/lib/db');
    const programs = await prisma.volunteerProgram.findMany({
      where: { charityId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(programs);
  } catch {
    const mock = getMockCharity(id);
    return NextResponse.json(mock?.programs || []);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { programId, userId, userName } = body;

  if (!programId || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { prisma } = await import('@/lib/db');
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

    await prisma.userImpact.upsert({
      where: { userId },
      update: { impactScore: { increment: 5 } },
      create: { userId, userName: userName || 'Volunteer', impactScore: 5 },
    });

    return NextResponse.json(application);
  } catch {
    // Mock response for demo
    return NextResponse.json({
      id: `app-${Date.now()}`,
      programId,
      userId,
      userName,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    });
  }
}
