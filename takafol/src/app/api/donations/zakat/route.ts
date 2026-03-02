import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logZakatDonation } from '@/lib/blockchain';
import { generateReceiptNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { donorId, donorName, charityId, amount, currency = 'JOD' } = body;

  if (!donorId || !charityId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity || !charity.isVerified) {
    return NextResponse.json({ error: 'Charity not found or not verified' }, { status: 400 });
  }

  const receiptNumber = generateReceiptNumber();

  // Create donation record
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

  // Log to blockchain (non-blocking)
  const txResult = await logZakatDonation(
    donation.id,
    donorId,
    charityId,
    amount.toString(),
    currency
  );

  // Update donation with TX hash
  if (txResult) {
    await prisma.zakatDonation.update({
      where: { id: donation.id },
      data: {
        txHash: txResult.txHash,
        explorerUrl: txResult.explorerUrl,
      },
    });
  }

  // Update user impact score
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
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const donations = await prisma.zakatDonation.findMany({
    where: { donorId: userId },
    include: { charity: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(donations);
}
