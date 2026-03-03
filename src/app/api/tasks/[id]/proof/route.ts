import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logProof, logCompletion } from '@/lib/blockchain';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { volunteerId, proofPhotoBase64, proofHash } = body;

  if (!volunteerId || !proofHash) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const application = await prisma.taskApplication.findUnique({
    where: { taskId_volunteerId: { taskId: id, volunteerId } },
  });

  if (!application) {
    return NextResponse.json({ error: 'No application found' }, { status: 404 });
  }

  // Log proof to blockchain
  const txResult = await logProof(id, proofHash);

  const updated = await prisma.taskApplication.update({
    where: { id: application.id },
    data: {
      proofPhotoBase64: proofPhotoBase64 || null,
      proofHash,
      proofTxHash: txResult?.txHash || null,
      proofExplorerUrl: txResult?.explorerUrl || null,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Award proof points (+15)
  await prisma.userImpact.upsert({
    where: { userId: volunteerId },
    update: { impactScore: { increment: 15 } },
    create: {
      userId: volunteerId,
      userName: application.volunteerName,
      impactScore: 15,
    },
  });

  // Check if all volunteers completed — mark task as completed
  const task = await prisma.task.findUnique({
    where: { id },
    include: { applications: true },
  });

  if (task) {
    const allCompleted = task.applications.every((a) => a.status === 'completed');
    if (allCompleted && task.applications.length > 0) {
      const completionTx = await logCompletion(id, 'system');
      await prisma.task.update({
        where: { id },
        data: {
          status: 'completed',
          txHash: completionTx?.txHash || null,
          explorerUrl: completionTx?.explorerUrl || null,
        },
      });
    }
  }

  return NextResponse.json(updated);
}
