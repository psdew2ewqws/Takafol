import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { grantPoints } from '@/lib/gamification';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const volunteerId = session.user.id;
    const volunteerName = session.user.name || 'Volunteer';

    // Use transaction to prevent race condition on capacity
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id } });
      if (!task) throw new Error('NOT_FOUND');
      if (task.status !== 'approved' && task.status !== 'in_progress') {
        throw new Error('NOT_ACCEPTING');
      }
      if (task.currentVolunteers >= task.maxVolunteers) {
        throw new Error('FULL');
      }
      if (task.creatorId === volunteerId) {
        throw new Error('OWN_TASK');
      }

      const existing = await tx.taskApplication.findUnique({
        where: { taskId_volunteerId: { taskId: id, volunteerId } },
      });
      if (existing) throw new Error('ALREADY_JOINED');

      const application = await tx.taskApplication.create({
        data: { taskId: id, volunteerId, volunteerName, status: 'accepted' },
      });

      const newCount = task.currentVolunteers + 1;
      await tx.task.update({
        where: { id },
        data: {
          currentVolunteers: { increment: 1 },
          status: newCount >= task.maxVolunteers ? 'in_progress' : task.status,
        },
      });

      // Award impact points
      await tx.userImpact.upsert({
        where: { userId: volunteerId },
        update: { impactScore: { increment: 5 }, tasksCompleted: { increment: 1 } },
        create: { userId: volunteerId, userName: volunteerName, impactScore: 5, tasksCompleted: 1 },
      });

      return application;
    });

    // Gamification: award points for joining task
    grantPoints(volunteerId, "APPLY_VOLUNTEER_TASK", JSON.stringify({ taskId: id }))
      .catch((err) => console.error("Gamification error:", err));

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const statusMap: Record<string, [string, number]> = {
      NOT_FOUND: ['Task not found', 404],
      NOT_ACCEPTING: ['Task is not accepting volunteers', 400],
      FULL: ['Task is full', 400],
      OWN_TASK: ['Cannot join your own task', 400],
      ALREADY_JOINED: ['Already joined this task', 400],
    };
    const [errMsg, status] = statusMap[msg] || ['Failed to join task', 500];
    if (!statusMap[msg]) console.error('POST /api/tasks/[id]/apply error:', error);
    return NextResponse.json({ error: errMsg }, { status });
  }
}
