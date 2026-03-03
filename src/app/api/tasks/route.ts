import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { creatorId, creatorName, title, description, category, impactLetter, maxVolunteers, location, district } = body;

  if (!creatorId || !title || !description || !category || !maxVolunteers) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      creatorId,
      creatorName: creatorName || 'Anonymous',
      title,
      description,
      category,
      impactLetter: impactLetter || null,
      maxVolunteers: parseInt(maxVolunteers),
      location: location || null,
      district: district || null,
      status: 'pending',
    },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');
  const category = req.nextUrl.searchParams.get('category');
  const creatorId = req.nextUrl.searchParams.get('creatorId');

  const where: Record<string, string> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (creatorId) where.creatorId = creatorId;

  const tasks = await prisma.task.findMany({
    where,
    include: { applications: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tasks);
}
