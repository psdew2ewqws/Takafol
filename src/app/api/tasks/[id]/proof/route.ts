import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { logProof, logCompletion } from '@/lib/blockchain';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const volunteerId = session.user.id;
    const body = await req.json();
    const { proofPhotoBase64, proofHash } = body;

    if (!proofHash) {
      return NextResponse.json({ error: 'Missing proof hash' }, { status: 400 });
    }

    const application = await prisma.taskApplication.findUnique({
      where: { taskId_volunteerId: { taskId: id, volunteerId } },
    });

    if (!application) {
      return NextResponse.json({ error: 'You have not joined this task' }, { status: 404 });
    }
    if (application.status === 'completed') {
      return NextResponse.json({ error: 'Proof already submitted' }, { status: 400 });
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
        userName: session.user.name || application.volunteerName,
        impactScore: 15,
      },
    });

    // Check if all volunteers completed — mark task as completed
    const task = await prisma.task.findUnique({
      where: { id },
      include: { applications: true },
    });

    if (task && task.applications.length > 0) {
      const allCompleted = task.applications.every((a) => a.status === 'completed');
      if (allCompleted) {
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
  } catch (error) {
    console.error('POST /api/tasks/[id]/proof error:', error);
    return NextResponse.json({ error: 'Failed to submit proof' }, { status: 500 });
  }
}
