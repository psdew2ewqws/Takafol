import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const charities = await prisma.charity.findMany({
    where: { isActive: true },
    include: {
      programs: { where: { status: 'open' } },
      _count: { select: { donations: true, programs: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(charities);
}
