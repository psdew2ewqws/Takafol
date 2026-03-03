import { NextRequest, NextResponse } from 'next/server';
import { generateReceiptNumber } from '@/lib/utils';
import { MOCK_DONATIONS, getMockCharity } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { donorId, donorName, charityId, amount, currency = 'JOD' } = body;

  if (!donorId || !charityId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const receiptNumber = generateReceiptNumber();
  const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  try {
    const { prisma } = await import('@/lib/db');
    const { logZakatDonation } = await import('@/lib/blockchain');

    const charity = await prisma.charity.findUnique({ where: { id: charityId } });
    if (!charity || !charity.isVerified) {
      return NextResponse.json({ error: 'Charity not found or not verified' }, { status: 400 });
    }

    const donation = await prisma.zakatDonation.create({
      data: {
        donorId,
        donorName,
        charityId,
        amount: parseFloat(amount),
        currency,
        receiptNumber,
        status: 'confirmed',
      },
    });

    const txResult = await logZakatDonation(
      donation.id,
      donorId,
      charityId,
      amount.toString(),
      currency
    );

    if (txResult) {
      await prisma.zakatDonation.update({
        where: { id: donation.id },
        data: {
          txHash: txResult.txHash,
          explorerUrl: txResult.explorerUrl,
        },
      });
    }

    await prisma.userImpact.upsert({
      where: { userId: donorId },
      update: {
        impactScore: { increment: 10 },
        totalDonated: { increment: parseFloat(amount) },
      },
      create: {
        userId: donorId,
        userName: donorName || 'Anonymous',
        impactScore: 10,
        totalDonated: parseFloat(amount),
      },
    });

    return NextResponse.json({
      donation: {
        ...donation,
        txHash: txResult?.txHash || null,
        explorerUrl: txResult?.explorerUrl || null,
      },
      receipt: {
        receiptNumber,
        charityName: charity.name,
        amount: parseFloat(amount),
        currency,
        date: donation.createdAt,
        txHash: txResult?.txHash || null,
        explorerUrl: txResult?.explorerUrl || null,
      },
    });
  } catch {
    // Mock response for demo
    const charity = getMockCharity(charityId);
    return NextResponse.json({
      donation: {
        id: `don-${Date.now()}`,
        donorId,
        charityId,
        amount: parseFloat(amount),
        currency,
        receiptNumber,
        txHash: mockTxHash,
        explorerUrl: `https://sepolia.etherscan.io/tx/${mockTxHash}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      receipt: {
        receiptNumber,
        charityName: charity?.name || 'Charity',
        amount: parseFloat(amount),
        currency,
        date: new Date().toISOString(),
        txHash: mockTxHash,
        explorerUrl: `https://sepolia.etherscan.io/tx/${mockTxHash}`,
      },
    });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const { prisma } = await import('@/lib/db');
    const donations = await prisma.zakatDonation.findMany({
      where: { donorId: userId },
      include: { charity: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(donations);
  } catch {
    return NextResponse.json(MOCK_DONATIONS.filter((d) => d.donorId === userId));
  }
}
