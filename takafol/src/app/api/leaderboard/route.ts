import { NextResponse } from 'next/server';
import { MOCK_LEADERBOARD } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/db');
    const leaderboard = await prisma.userImpact.findMany({
      orderBy: { impactScore: 'desc' },
      take: 50,
    });
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(MOCK_LEADERBOARD);
  }
}
