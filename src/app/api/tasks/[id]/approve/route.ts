import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can approve tasks
    if ((session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can approve tasks' }, { status: 403 });
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (task.status !== 'pending') {
      return NextResponse.json({ error: 'Task is not pending approval' }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status: 'approved' },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('POST /api/tasks/[id]/approve error:', error);
    return NextResponse.json({ error: 'Failed to approve task' }, { status: 500 });
  }
}
