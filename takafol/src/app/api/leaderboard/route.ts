import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const leaderboard = await prisma.userImpact.findMany({
    orderBy: { impactScore: 'desc' },
    take: 50,
  });

  return NextResponse.json(leaderboard);
}
