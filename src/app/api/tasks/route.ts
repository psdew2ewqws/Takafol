import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, impactLetter, maxVolunteers, location, district } = body;

    if (!title || !description || !category || !maxVolunteers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        creatorId: session.user.id,
        creatorName: session.user.name || 'Anonymous',
        title: title.trim(),
        description: description.trim(),
        category,
        impactLetter: impactLetter?.trim() || null,
        maxVolunteers: Math.max(1, Math.min(100, parseInt(maxVolunteers))),
        location: location?.trim() || null,
        district: district?.trim() || null,
        status: 'pending',
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status');
    const category = req.nextUrl.searchParams.get('category');
    const creatorId = req.nextUrl.searchParams.get('creatorId');
    const limit = req.nextUrl.searchParams.get('limit');

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (creatorId) where.creatorId = creatorId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        applications: {
          select: { id: true, volunteerId: true, volunteerName: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
