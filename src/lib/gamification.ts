import { prisma } from "@/lib/prisma";

// ─── Points Economy ─────────────────────────────────────

export const POINT_VALUES = {
  CREATE_OFFER: 5,
  CREATE_REQUEST: 3,
  ACCEPT_CONNECTION: 5,
  COMPLETE_CONNECTION_GIVER: 20,
  COMPLETE_CONNECTION_REQUESTER: 10,
  UPLOAD_PROOF: 10,
  RATE_PARTNER: 3,
  RECEIVE_FIVE_STAR: 5,
  APPLY_VOLUNTEER_TASK: 5,
  COMPLETE_TASK_WITH_PROOF: 15,
  APPLY_CHARITY_PROGRAM: 5,
  DONATE_ZAKAT: 10,
  COMPLETE_DAILY_CHALLENGE: 10,
  STREAK_BONUS_7: 20,
  STREAK_BONUS_30: 100,
  STREAK_BONUS_100: 500,
} as const;

export type PointAction = keyof typeof POINT_VALUES;

// ─── Tier System ────────────────────────────────────────

export const TIERS = [
  { level: 1, nameAr: "مبتدئ", nameEn: "Newcomer", minPoints: 0, color: "emerald" },
  { level: 2, nameAr: "مساعد", nameEn: "Helper", minPoints: 100, color: "teal" },
  { level: 3, nameAr: "بطل", nameEn: "Champion", minPoints: 500, color: "amber" },
  { level: 4, nameAr: "ملهم", nameEn: "Inspirer", minPoints: 2000, color: "orange" },
  { level: 5, nameAr: "أسطورة", nameEn: "Legend", minPoints: 10000, color: "rose" },
] as const;

export function getTierForPoints(points: number): (typeof TIERS)[number] {
  let tier: (typeof TIERS)[number] = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.minPoints) tier = t;
  }
  return tier;
}

export function getNextTier(currentLevel: number) {
  const idx = TIERS.findIndex((t) => t.level === currentLevel);
  if (idx < TIERS.length - 1) return TIERS[idx + 1];
  return null;
}

export function getTierProgress(points: number) {
  const current = getTierForPoints(points);
  const next = getNextTier(current.level);
  if (!next) return { current, next: null, progress: 100, pointsToNext: 0 };

  const rangeTotal = next.minPoints - current.minPoints;
  const rangeProgress = points - current.minPoints;
  const progress = Math.min(100, Math.round((rangeProgress / rangeTotal) * 100));

  return {
    current,
    next,
    progress,
    pointsToNext: next.minPoints - points,
  };
}

// ─── Streak Milestones ──────────────────────────────────

const STREAK_MILESTONES = [
  { days: 3, bonus: 0 },
  { days: 7, bonus: POINT_VALUES.STREAK_BONUS_7 },
  { days: 14, bonus: 50 },
  { days: 30, bonus: POINT_VALUES.STREAK_BONUS_30 },
  { days: 60, bonus: 300 },
  { days: 100, bonus: POINT_VALUES.STREAK_BONUS_100 },
];

// ─── Core: Grant Points ─────────────────────────────────

export async function grantPoints(
  userId: string,
  action: PointAction,
  metadata?: string,
): Promise<{
  points: number;
  newTotal: number;
  newLevel: number;
  leveledUp: boolean;
  badgesEarned: string[];
  streakUpdated: boolean;
  streakBonus: number;
}> {
  const points = POINT_VALUES[action];

  // 1. Create point transaction + update user score in one go
  const [, user] = await prisma.$transaction([
    prisma.pointTransaction.create({
      data: { userId, action, points, metadata },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { impactScore: { increment: points } },
      select: { impactScore: true, level: true, name: true },
    }),
  ]);

  const newTotal = user.impactScore;

  // 2. Update leaderboard
  await prisma.userImpact.upsert({
    where: { userId },
    update: { impactScore: newTotal },
    create: {
      userId,
      userName: user.name || "Anonymous",
      impactScore: newTotal,
    },
  });

  // 3. Check tier level-up
  const newTier = getTierForPoints(newTotal);
  const leveledUp = newTier.level > user.level;
  if (leveledUp) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newTier.level },
    });
  }

  // 4. Update streak
  const { streakUpdated, streakBonus } = await updateStreak(userId);

  // 5. Check badges
  const badgesEarned = await checkAndAwardBadges(userId);

  return {
    points,
    newTotal,
    newLevel: leveledUp ? newTier.level : user.level,
    leveledUp,
    badgesEarned,
    streakUpdated,
    streakBonus,
  };
}

// ─── Streak Logic ───────────────────────────────────────

async function updateStreak(userId: string): Promise<{ streakUpdated: boolean; streakBonus: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.streak.upsert({
    where: { userId },
    update: {},
    create: { userId, currentStreak: 0, longestStreak: 0 },
  });

  const lastAction = streak.lastActionDate ? new Date(streak.lastActionDate) : null;
  if (lastAction) lastAction.setHours(0, 0, 0, 0);

  // Same day — no streak update
  if (lastAction && lastAction.getTime() === today.getTime()) {
    return { streakUpdated: false, streakBonus: 0 };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak: number;
  if (lastAction && lastAction.getTime() === yesterday.getTime()) {
    // Consecutive day
    newStreak = streak.currentStreak + 1;
  } else {
    // Streak broken or first action
    newStreak = 1;
  }

  const newLongest = Math.max(streak.longestStreak, newStreak);

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActionDate: today,
    },
  });

  // Check for streak milestone bonuses
  let streakBonus = 0;
  for (const milestone of STREAK_MILESTONES) {
    if (newStreak === milestone.days && milestone.bonus > 0) {
      streakBonus = milestone.bonus;
      // Grant the bonus
      await prisma.$transaction([
        prisma.pointTransaction.create({
          data: {
            userId,
            action: `STREAK_BONUS_${milestone.days}`,
            points: milestone.bonus,
            metadata: JSON.stringify({ streakDays: milestone.days }),
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { impactScore: { increment: milestone.bonus } },
        }),
      ]);
      break;
    }
  }

  return { streakUpdated: true, streakBonus };
}

// ─── Badge Checking ─────────────────────────────────────

async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const earned: string[] = [];

  // Fetch user stats
  const [
    user,
    completedConnGiver,
    completedConnRequester,
    totalRatingsGiven,
    fiveStarRatingsReceived,
    avgRating,
    totalTasks,
    totalDonations,
    currentStreak,
    existingBadges,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { impactScore: true, level: true, createdAt: true },
    }),
    prisma.connection.count({
      where: { giverId: userId, status: "COMPLETED" },
    }),
    prisma.connection.count({
      where: { requesterId: userId, status: "COMPLETED" },
    }),
    prisma.connection.count({
      where: {
        OR: [
          { giverId: userId, giverRating: { not: null } },
          { requesterId: userId, requesterRating: { not: null } },
        ],
      },
    }),
    prisma.connection.count({
      where: {
        OR: [
          { requesterId: userId, giverRating: 5 },
          { giverId: userId, requesterRating: 5 },
        ],
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { averageRating: true },
    }),
    prisma.taskApplication.count({
      where: { volunteerId: userId, status: "completed" },
    }),
    prisma.zakatDonation.count({
      where: { donorId: userId },
    }),
    prisma.streak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badge: { select: { key: true } } },
    }),
  ]);

  if (!user) return earned;

  const ownedKeys = new Set(existingBadges.map((ub) => ub.badge.key));
  const totalCompleted = completedConnGiver + completedConnRequester;

  // Define badge conditions
  const checks: { key: string; condition: boolean }[] = [
    // Helping
    { key: "first_connection", condition: totalCompleted >= 1 },
    { key: "active_volunteer", condition: totalTasks >= 5 },
    { key: "generosity_champion", condition: totalCompleted >= 25 },
    { key: "community_benefactor", condition: totalCompleted >= 100 },
    // Streak
    { key: "persistent_7", condition: (currentStreak?.currentStreak ?? 0) >= 7 },
    { key: "committed_30", condition: (currentStreak?.currentStreak ?? 0) >= 30 },
    { key: "legendary_100", condition: (currentStreak?.currentStreak ?? 0) >= 100 },
    // Social
    { key: "first_rating", condition: totalRatingsGiven >= 1 },
    { key: "gold_star", condition: (avgRating?.averageRating ?? 0) >= 4.5 && totalRatingsGiven >= 10 },
    { key: "trusted_20", condition: fiveStarRatingsReceived >= 20 },
    // Special
    { key: "first_donor", condition: totalDonations >= 1 },
    { key: "expert_level4", condition: user.level >= 4 },
    { key: "living_legend", condition: user.level >= 5 },
    { key: "task_master_10", condition: totalTasks >= 10 },
    { key: "helping_hand_5", condition: totalCompleted >= 5 },
    { key: "big_heart_50", condition: totalCompleted >= 50 },
    { key: "streak_3", condition: (currentStreak?.currentStreak ?? 0) >= 3 },
    { key: "streak_14", condition: (currentStreak?.currentStreak ?? 0) >= 14 },
    { key: "streak_60", condition: (currentStreak?.currentStreak ?? 0) >= 60 },
    { key: "generous_donor_5", condition: totalDonations >= 5 },
  ];

  for (const { key, condition } of checks) {
    if (condition && !ownedKeys.has(key)) {
      // Try to award
      const badge = await prisma.badge.findUnique({ where: { key } });
      if (badge) {
        try {
          await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          });
          earned.push(key);
        } catch {
          // Already exists (race condition) — ignore
        }
      }
    }
  }

  return earned;
}

// ─── Get Full Gamification Profile ──────────────────────

export async function getGamificationProfile(userId: string) {
  const [user, streak, badges, recentActivity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        impactScore: true,
        level: true,
        tasksCompleted: true,
        averageRating: true,
        createdAt: true,
      },
    }),
    prisma.streak.findUnique({
      where: { userId },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  if (!user) return null;

  const tierInfo = getTierProgress(user.impactScore);

  // Build streak calendar (last 30 days)
  const last30 = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    last30.push(day.toISOString().split("T")[0]);
  }

  // Check which days had activity
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dayActivity = await prisma.pointTransaction.groupBy({
    by: ["createdAt"],
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: true,
  });

  // Build active days set
  const activeDays = new Set<string>();
  for (const row of dayActivity) {
    activeDays.add(new Date(row.createdAt).toISOString().split("T")[0]);
  }

  // Find active days more accurately using raw dates from transactions
  const recentTransactions = await prisma.pointTransaction.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });
  for (const tx of recentTransactions) {
    activeDays.add(new Date(tx.createdAt).toISOString().split("T")[0]);
  }

  const streakCalendar = last30.map((date) => ({
    date,
    active: activeDays.has(date),
  }));

  // Next streak milestone
  const currentStreakDays = streak?.currentStreak ?? 0;
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > currentStreakDays) ?? null;

  return {
    user: {
      id: user.id,
      name: user.name,
      image: user.image,
      impactScore: user.impactScore,
      level: user.level,
      tasksCompleted: user.tasksCompleted,
      averageRating: user.averageRating,
      joinDate: user.createdAt,
    },
    tier: tierInfo,
    streak: {
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
      lastActionDate: streak?.lastActionDate,
      calendar: streakCalendar,
      nextMilestone,
    },
    badges: badges.map((ub) => ({
      key: ub.badge.key,
      nameEn: ub.badge.nameEn,
      nameAr: ub.badge.nameAr,
      descEn: ub.badge.descEn,
      descAr: ub.badge.descAr,
      category: ub.badge.category,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt,
    })),
    recentActivity: recentActivity.map((tx) => ({
      id: tx.id,
      action: tx.action,
      points: tx.points,
      metadata: tx.metadata,
      createdAt: tx.createdAt,
    })),
  };
}

// ─── Get Navbar Stats (lightweight) ─────────────────────

export async function getNavbarStats(userId: string) {
  const [user, streak] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { impactScore: true, level: true },
    }),
    prisma.streak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }),
  ]);

  return {
    points: user?.impactScore ?? 0,
    level: user?.level ?? 1,
    streak: streak?.currentStreak ?? 0,
  };
}

// ─── Get All Badge Definitions ──────────────────────────

export async function getAllBadges() {
  return prisma.badge.findMany({
    orderBy: [{ category: "asc" }, { threshold: "asc" }],
  });
}
