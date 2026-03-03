import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { volunteerId, volunteerName } = body;

  if (!volunteerId || !volunteerName) {
    return NextResponse.json({ error: 'Missing volunteerId or volunteerName' }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  if (task.status !== 'approved' && task.status !== 'in_progress') {
    return NextResponse.json({ error: 'Task is not accepting volunteers' }, { status: 400 });
  }
  if (task.currentVolunteers >= task.maxVolunteers) {
    return NextResponse.json({ error: 'Task is full' }, { status: 400 });
  }

  const existing = await prisma.taskApplication.findUnique({
    where: { taskId_volunteerId: { taskId: id, volunteerId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already joined this task' }, { status: 400 });
  }

  const application = await prisma.taskApplication.create({
    data: {
      taskId: id,
      volunteerId,
      volunteerName,
      status: 'accepted',
    },
  });

  const newCount = task.currentVolunteers + 1;
  await prisma.task.update({
    where: { id },
    data: {
      currentVolunteers: { increment: 1 },
      status: newCount >= task.maxVolunteers ? 'in_progress' : task.status,
    },
  });

  // Award impact points
  await prisma.userImpact.upsert({
    where: { userId: volunteerId },
    update: {
      impactScore: { increment: 5 },
      tasksCompleted: { increment: 1 },
    },
    create: {
      userId: volunteerId,
      userName: volunteerName,
      impactScore: 5,
      tasksCompleted: 1,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
