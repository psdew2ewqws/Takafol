import { prisma } from "@/lib/prisma";
import { getJordanToday, getStreakMultiplier } from "@/lib/challenge-utils";
import { sendStreakMilestoneNotification } from "@/lib/push-notifications";

const STREAK_MILESTONES = [3, 7, 14, 30];

/**
 * Check if the user's action matches today's daily challenge and auto-complete it.
 * Call this from existing API routes after a successful action.
 */
export async function tryAutoCompleteChallenge(
  userId: string,
  actionType: string,
  proofId?: string
): Promise<void> {
  try {
    const today = getJordanToday();

    // Find today's challenge
    const challenge = await prisma.dailyChallenge.findUnique({
      where: { date: today },
    });

    if (!challenge || challenge.actionType !== actionType) return;

    // Check if user already has a completed challenge for today
    const existing = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
    });

    if (existing?.status === "COMPLETED") return;

    // Calculate streak from completed challenges
    const completedChallenges = await prisma.userChallenge.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { select: { date: true } } },
      orderBy: { challenge: { date: "desc" } },
    });

    const completedDates = new Set(
      completedChallenges.map((uc) => new Date(uc.challenge.date).toISOString().split("T")[0])
    );

    let streak = 0;
    const checkDate = new Date(today);
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);

    while (completedDates.has(checkDate.toISOString().split("T")[0])) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }
    // Add 1 for today's completion
    streak += 1;

    const multiplier = getStreakMultiplier(streak);
    const pointsAwarded = Math.round(challenge.points * multiplier);

    // Upsert user challenge as completed
    await prisma.userChallenge.upsert({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
      create: {
        userId,
        challengeId: challenge.id,
        status: "COMPLETED",
        completedAt: new Date(),
        pointsAwarded,
        proofType: actionType,
        proofId,
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
        pointsAwarded,
        proofType: actionType,
        proofId,
      },
    });

    // Update user impact score
    await prisma.user.update({
      where: { id: userId },
      data: { impactScore: { increment: pointsAwarded } },
    });

    // Update Streak model
    const currentStreak = await prisma.streak.findUnique({
      where: { userId },
    });

    const longestStreak = Math.max(streak, currentStreak?.longestStreak ?? 0);

    await prisma.streak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: streak,
        longestStreak,
        lastActionDate: today,
      },
      update: {
        currentStreak: streak,
        longestStreak,
        lastActionDate: today,
      },
    });

    // Log point transaction
    await prisma.pointTransaction.create({
      data: {
        userId,
        action: "DAILY_CHALLENGE",
        points: pointsAwarded,
        metadata: JSON.stringify({
          challengeId: challenge.id,
          actionType,
          streak,
          multiplier,
          basePoints: challenge.points,
        }),
      },
    });

    // Send milestone notification if streak hits a milestone
    if (STREAK_MILESTONES.includes(streak)) {
      sendStreakMilestoneNotification(userId, streak);
    }
  } catch (error) {
    // Silently fail - challenge auto-completion should never break the main action
    console.error("Challenge auto-complete error:", error);
  }
}
