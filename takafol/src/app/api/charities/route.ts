import { NextResponse } from 'next/server';
import { MOCK_CHARITIES } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/db');
    const charities = await prisma.charity.findMany({
      where: { isActive: true },
      include: {
        programs: { where: { status: 'open' } },
        _count: { select: { donations: true, programs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(charities);
  } catch {
    return NextResponse.json(MOCK_CHARITIES);
  }
}
