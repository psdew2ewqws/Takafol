"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame, Star, Trophy, Lock, Sparkles,
  TrendingUp, Calendar, Award, Heart, Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────

interface BadgeDef {
  id: string;
  key: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  category: string;
  icon: string;
  threshold: number;
}

interface EarnedBadge {
  key: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  category: string;
  icon: string;
  earnedAt: string;
}

interface StreakCalendarDay {
  date: string;
  active: boolean;
}

interface TierInfo {
  current: { level: number; nameAr: string; nameEn: string; color: string; minPoints: number };
  next: { level: number; nameAr: string; nameEn: string; color: string; minPoints: number } | null;
  progress: number;
  pointsToNext: number;
}

interface ActivityEntry {
  id: string;
  action: string;
  points: number;
  metadata: string | null;
  createdAt: string;
}

interface GamificationProfile {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    impactScore: number;
    level: number;
    tasksCompleted: number;
    averageRating: number;
    joinDate: string;
  };
  tier: TierInfo;
  streak: {
    current: number;
    longest: number;
    lastActionDate: string | null;
    calendar: StreakCalendarDay[];
    nextMilestone: { days: number; bonus: number } | null;
  };
  badges: EarnedBadge[];
  recentActivity: ActivityEntry[];
  allBadges: BadgeDef[];
}

// ─── Badge Icon Map ─────────────────────────────────────

const BADGE_ICONS: Record<string, string> = {
  first_connection: "🤝",
  active_volunteer: "⚡",
  generosity_champion: "👑",
  community_benefactor: "🏛️",
  persistent_7: "🔥",
  committed_30: "💎",
  legendary_100: "🌟",
  first_rating: "⭐",
  gold_star: "🥇",
  trusted_20: "🛡️",
  first_donor: "💝",
  expert_level4: "🎓",
  living_legend: "🏆",
  task_master_10: "🎯",
  helping_hand_5: "✋",
  big_heart_50: "❤️‍🔥",
  streak_3: "✨",
  streak_14: "🌙",
  streak_60: "☀️",
  generous_donor_5: "💰",
};

// ─── Action Label Map ───────────────────────────────────

const ACTION_LABELS: Record<string, { ar: string; en: string }> = {
  CREATE_OFFER: { ar: "أنشأت عرض مساعدة", en: "Created help offer" },
  CREATE_REQUEST: { ar: "أنشأت طلب مساعدة", en: "Created help request" },
  ACCEPT_CONNECTION: { ar: "قبلت تواصل", en: "Accepted connection" },
  COMPLETE_CONNECTION_GIVER: { ar: "أكملت مساعدة", en: "Completed help" },
  COMPLETE_CONNECTION_REQUESTER: { ar: "تلقيت مساعدة", en: "Received help" },
  UPLOAD_PROOF: { ar: "رفعت إثبات", en: "Uploaded proof" },
  RATE_PARTNER: { ar: "قيّمت شريك", en: "Rated partner" },
  RECEIVE_FIVE_STAR: { ar: "حصلت على 5 نجوم ⭐", en: "Got 5 stars ⭐" },
  APPLY_VOLUNTEER_TASK: { ar: "انضممت لمهمة", en: "Joined task" },
  COMPLETE_TASK_WITH_PROOF: { ar: "أكملت مهمة بإثبات", en: "Task completed with proof" },
  APPLY_CHARITY_PROGRAM: { ar: "تقدمت لبرنامج تطوع", en: "Applied to program" },
  DONATE_ZAKAT: { ar: "تبرعت بالزكاة", en: "Donated Zakat" },
  COMPLETE_DAILY_CHALLENGE: { ar: "أكملت تحدي يومي", en: "Daily challenge" },
};

// ─── Tier Color Map ─────────────────────────────────────

const TIER_GRADIENTS: Record<string, string> = {
  emerald: "from-emerald-500 to-emerald-700",
  teal: "from-teal-400 to-emerald-600",
  amber: "from-amber-400 to-orange-500",
  orange: "from-orange-400 to-rose-500",
  rose: "from-rose-400 via-amber-400 to-emerald-400",
};

const TIER_BG: Record<string, string> = {
  emerald: "bg-emerald-50 border-emerald-200",
  teal: "bg-teal-50 border-teal-200",
  amber: "bg-amber-50 border-amber-200",
  orange: "bg-orange-50 border-orange-200",
  rose: "bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 border-rose-200",
};

const TIER_TEXT: Record<string, string> = {
  emerald: "text-emerald-700",
  teal: "text-teal-700",
  amber: "text-amber-700",
  orange: "text-orange-700",
  rose: "text-rose-700",
};

// ─── Main Component ─────────────────────────────────────

export function InlineAchievements() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/gamification?view=profile");
        if (res.ok) setProfile(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Trophy size={48} className="text-gray-300 mb-4" />
        <p className="text-sm text-gray-500">{t("loginRequired")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* ── Tier & Points Header ── */}
      <TierHeader profile={profile} lang={lang} t={t} />

      {/* ── Streak Section ── */}
      <StreakSection profile={profile} lang={lang} t={t} />

      {/* ── Badges Grid ── */}
      <BadgesSection profile={profile} lang={lang} t={t} />

      {/* ── Recent Activity ── */}
      <ActivitySection profile={profile} lang={lang} t={t} />
    </div>
  );
}

// ─── Tier Header ────────────────────────────────────────

function TierHeader({ profile, lang, t }: { profile: GamificationProfile; lang: string; t: (k: any) => string }) {
  const { tier, user } = profile;
  const tierGrad = TIER_GRADIENTS[tier.current.color] || TIER_GRADIENTS.emerald;
  const tierName = lang === "ar" ? tier.current.nameAr : tier.current.nameEn;
  const nextTierName = tier.next ? (lang === "ar" ? tier.next.nameAr : tier.next.nameEn) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-2xl"
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", tierGrad)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />

      {/* Decorative elements */}
      <div className="absolute top-3 end-4 text-3xl opacity-20 gold-shimmer">✦</div>
      <div className="absolute bottom-4 start-6 text-2xl opacity-15 gold-shimmer" style={{ animationDelay: "1.5s" }}>✦</div>

      <div className="relative px-6 py-8">
        {/* Tier badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
            <span className="text-2xl">
              {tier.current.level === 1 && "🌱"}
              {tier.current.level === 2 && "🤝"}
              {tier.current.level === 3 && "⚔️"}
              {tier.current.level === 4 && "💫"}
              {tier.current.level === 5 && "👑"}
            </span>
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{t("currentTier")}</p>
            <p className="text-white text-xl font-bold">{tierName}</p>
          </div>
        </div>

        {/* Points counter */}
        <div className="mb-5">
          <div className="flex items-baseline gap-2">
            <motion.span
              className="text-4xl font-extrabold text-white tabular-nums"
              key={user.impactScore}
              initial={{ scale: 1.3, color: "#FDE68A" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              transition={{ duration: 0.5 }}
            >
              {user.impactScore.toLocaleString()}
            </motion.span>
            <span className="text-white/60 text-sm font-medium">{t("totalPoints")}</span>
          </div>
        </div>

        {/* Progress bar to next tier */}
        {tier.next ? (
          <div>
            <div className="flex items-center justify-between text-xs text-white/70 mb-2 font-medium">
              <span>{tierName}</span>
              <span>{nextTierName}</span>
            </div>
            <div className="h-2.5 rounded-full bg-black/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-white/80 to-white"
                initial={{ width: 0 }}
                animate={{ width: `${tier.progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1.5 font-medium">
              {tier.pointsToNext.toLocaleString()} {t("pointsToNext")}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles size={16} />
            <span className="text-sm font-bold">{t("maxTierReached")}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Streak Section ─────────────────────────────────────

function StreakSection({ profile, lang, t }: { profile: GamificationProfile; lang: string; t: (k: any) => string }) {
  const { streak } = profile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      className="rounded-2xl border border-emerald-100 bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
            <Flame size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{t("streakTitle")}</p>
            <p className="text-xs text-gray-500">
              {t("longestStreak")}: {streak.longest} {lang === "ar" ? "يوم" : "days"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ scale: streak.current > 0 ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame size={22} className={cn(
              streak.current > 0 ? "text-orange-500" : "text-gray-300",
            )} fill={streak.current > 0 ? "currentColor" : "none"} />
          </motion.div>
          <span className={cn(
            "text-xl font-extrabold tabular-nums",
            streak.current > 0 ? "text-orange-600" : "text-gray-400",
          )}>
            {streak.current}
          </span>
        </div>
      </div>

      {/* Streak Calendar — last 30 days */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-10 gap-1.5">
          {streak.calendar.map((day, i) => {
            const dayNum = new Date(day.date).getDate();
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.02 * i, type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                  day.active
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shadow-emerald-200"
                    : "bg-gray-100 text-gray-400",
                )}
              >
                {dayNum}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Next milestone */}
      {streak.nextMilestone && (
        <div className="px-5 pb-4 pt-1">
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3.5 py-2.5">
            <Zap size={16} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              <span className="font-bold">{t("streakNextMilestone")}:</span>{" "}
              {streak.nextMilestone.days} {lang === "ar" ? "يوم" : "days"}
              {streak.nextMilestone.bonus > 0 && (
                <span className="text-amber-600 font-extrabold"> (+{streak.nextMilestone.bonus} {t("pointsEarnedLabel")})</span>
              )}
              <span className="text-amber-500 ms-1">
                — {streak.nextMilestone.days - streak.current} {t("streakDaysLeft")}
              </span>
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Badges Section ─────────────────────────────────────

function BadgesSection({ profile, lang, t }: { profile: GamificationProfile; lang: string; t: (k: any) => string }) {
  const { badges, allBadges } = profile;
  const earnedKeys = useMemo(() => new Set(badges.map((b) => b.key)), [badges]);

  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);
  const isEarned = selectedBadge ? earnedKeys.has(selectedBadge.key) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
      className="rounded-2xl border border-emerald-100 bg-white overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
            <Award size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{t("badgesTitle")}</p>
            <p className="text-xs text-gray-500">
              {badges.length} / {allBadges.length} {t("badgesUnlocked")}
            </p>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-5 gap-2.5">
          {allBadges.map((badge, i) => {
            const unlocked = earnedKeys.has(badge.key);
            const icon = BADGE_ICONS[badge.key] || "🎖️";

            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.03 * i, type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all cursor-pointer",
                  unlocked
                    ? "bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-sm hover:shadow-md hover:scale-105"
                    : "bg-gray-50 border border-gray-100 opacity-50 hover:opacity-75",
                )}
                whileTap={{ scale: 0.92 }}
              >
                <span className={cn("text-xl", !unlocked && "grayscale")}>
                  {icon}
                </span>
                {!unlocked && (
                  <Lock size={10} className="absolute top-1.5 end-1.5 text-gray-400" />
                )}
                <span className={cn(
                  "text-[9px] font-bold text-center leading-tight px-0.5 line-clamp-1",
                  unlocked ? "text-gray-800" : "text-gray-400",
                )}>
                  {lang === "ar" ? badge.nameAr : badge.nameEn}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Popup */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className={cn("text-3xl", !isEarned && "grayscale opacity-50")}>
                  {BADGE_ICONS[selectedBadge.key] || "🎖️"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {lang === "ar" ? selectedBadge.nameAr : selectedBadge.nameEn}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {lang === "ar" ? selectedBadge.descAr : selectedBadge.descEn}
                  </p>
                  {isEarned && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <Star size={10} className="fill-emerald-500 text-emerald-500" />
                      {t("badgesUnlocked")}
                    </p>
                  )}
                  {!isEarned && (
                    <p className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-1">
                      <Lock size={10} />
                      {t("badgesLocked")}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="text-gray-300 hover:text-gray-500 p-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Activity Section ───────────────────────────────────

function ActivitySection({ profile, lang, t }: { profile: GamificationProfile; lang: string; t: (k: any) => string }) {
  const { recentActivity } = profile;

  if (recentActivity.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">{t("noActivityYet")}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
      className="rounded-2xl border border-emerald-100 bg-white overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
          <TrendingUp size={20} className="text-emerald-600" />
        </div>
        <p className="text-sm font-bold text-gray-900">{t("recentActivity")}</p>
      </div>

      <div className="px-5 pb-4 space-y-0.5 max-h-80 overflow-y-auto">
        {recentActivity.map((entry, i) => {
          const actionLabel = ACTION_LABELS[entry.action]?.[lang as "ar" | "en"] ??
            (entry.action.startsWith("STREAK_BONUS") ? (lang === "ar" ? "مكافأة سلسلة" : "Streak bonus") : entry.action);

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-3 py-2.5 px-1"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
                <Heart size={14} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 truncate">{actionLabel}</p>
                <p className="text-[10px] text-gray-400">
                  {new Date(entry.createdAt).toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="text-sm font-extrabold text-emerald-600 tabular-nums shrink-0">
                +{entry.points}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Navbar Points Pill ─────────────────────────────────

export function GamificationPill() {
  const [stats, setStats] = useState<{ points: number; level: number; streak: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/gamification?view=navbar");
        if (res.ok) setStats(await res.json());
      } catch {
        // Silently fail for unauthenticated users
      }
    }
    load();
  }, []);

  if (!stats || (stats.points === 0 && stats.streak === 0)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1"
    >
      <Star size={13} className="text-amber-500 fill-amber-400" />
      <span className="text-xs font-extrabold text-emerald-800 tabular-nums">{stats.points}</span>
      {stats.streak > 0 && (
        <>
          <span className="text-emerald-300">|</span>
          <Flame size={12} className="text-orange-500" fill="currentColor" />
          <span className="text-xs font-extrabold text-orange-600 tabular-nums">{stats.streak}</span>
        </>
      )}
    </motion.div>
  );
}

// ─── Level Up Celebration Overlay ───────────────────────

export function LevelUpCelebration({
  show,
  level,
  tierName,
  onClose,
}: {
  show: boolean;
  level: number;
  tierName: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();

  const tierEmoji = {
    1: "🌱",
    2: "🤝",
    3: "⚔️",
    4: "💫",
    5: "👑",
  }[level] ?? "🎉";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative rounded-3xl bg-white shadow-2xl px-8 py-10 text-center max-w-xs mx-4 overflow-hidden"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            {/* Confetti particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ["#065F46", "#D97706", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6"][i % 6],
                  left: `${10 + Math.random() * 80}%`,
                  top: "50%",
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: [0, -80 - Math.random() * 120],
                  x: [-30 + Math.random() * 60],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                  rotate: [0, 360 + Math.random() * 360],
                }}
                transition={{
                  duration: 1.2 + Math.random() * 0.5,
                  delay: 0.1 + i * 0.06,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.span
              className="text-6xl block mb-4"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            >
              {tierEmoji}
            </motion.span>

            <motion.p
              className="text-lg font-bold text-gray-900 mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t("levelUp")}
            </motion.p>

            <motion.p
              className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {tierName}
            </motion.p>

            <motion.button
              onClick={onClose}
              className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("challengeOk")}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
