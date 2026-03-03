import { NextResponse } from 'next/server';
import { getMockCharity } from '@/lib/mock-data';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { prisma } = await import('@/lib/db');
    const charity = await prisma.charity.findUnique({
      where: { id },
      include: {
        programs: { orderBy: { createdAt: 'desc' } },
        donations: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { donations: true, programs: true } },
      },
    });

    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }
    return NextResponse.json(charity);
  } catch {
    const mock = getMockCharity(id);
    if (!mock) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }
    return NextResponse.json(mock);
  }
}
