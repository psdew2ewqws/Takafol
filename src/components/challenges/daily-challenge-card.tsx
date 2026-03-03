"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/language-provider";
import { motion } from "motion/react";
import { Trophy, Flame, Clock, CheckCircle2, ChevronLeft, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

type ActionType =
  | "CREATE_OFFER"
  | "CREATE_REQUEST"
  | "APPLY_PROGRAM"
  | "ACCEPT_CONNECTION"
  | "COMPLETE_TASK"
  | "MAKE_DONATION"
  | "LEAVE_REVIEW"
  | "SHARE_PLATFORM"
  | "BROWSE_PROGRAMS";

interface DailyChallenge {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  points: number;
  actionType: ActionType;
  status: "PENDING" | "COMPLETED" | "EXPIRED";
  completedAt?: string | null;
}

interface StreakData {
  currentStreak: number;
  multiplier: number;
}

const ACTION_ROUTES: Record<ActionType, string> = {
  CREATE_OFFER: "/offer/personal",
  CREATE_REQUEST: "/request",
  APPLY_PROGRAM: "/offer/charities",
  ACCEPT_CONNECTION: "/connections",
  COMPLETE_TASK: "/tasks",
  MAKE_DONATION: "/offer/charities",
  LEAVE_REVIEW: "/connections",
  SHARE_PLATFORM: "__share__",
  BROWSE_PROGRAMS: "/offer/charities",
};

function getNextMidnightJordan(): Date {
  const now = new Date();
  const jordanNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const tomorrow = new Date(
    Date.UTC(
      jordanNow.getUTCFullYear(),
      jordanNow.getUTCMonth(),
      jordanNow.getUTCDate() + 1
    )
  );
  // Convert back from Jordan midnight to UTC
  return new Date(tomorrow.getTime() - 3 * 60 * 60 * 1000);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function ChallengeSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-emerald-900 border border-emerald-700/50 shadow-xl animate-pulse">
      {/* Header skeleton */}
      <div className="h-14 bg-gradient-to-r from-amber-500/30 to-amber-600/30" />
      {/* Body skeleton */}
      <div className="p-5 space-y-3">
        <div className="h-5 bg-emerald-800 rounded-lg w-3/4" />
        <div className="h-4 bg-emerald-800 rounded-lg w-full" />
        <div className="h-4 bg-emerald-800 rounded-lg w-2/3" />
        <div className="h-10 bg-emerald-800 rounded-xl mt-4" />
      </div>
    </div>
  );
}

export function DailyChallengeCard() {
  const { data: session } = useSession();
  const { t, lang } = useLanguage();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, multiplier: 1 });
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  // Fetch challenge and streak on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [challengeRes, streakRes] = await Promise.all([
          fetch("/api/challenges/today"),
          fetch("/api/challenges/streak"),
        ]);

        if (challengeRes.ok) {
          const data = await challengeRes.json();
          setChallenge(data.challenge ?? null);
        }

        if (streakRes.ok) {
          const data = await streakRes.json();
          setStreak({
            currentStreak: data.currentStreak ?? 0,
            multiplier: data.multiplier ?? 1,
          });
        }
      } catch {
        // silently fail — challenge card is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Countdown timer
  useEffect(() => {
    function tick() {
      const now = new Date();
      const next = getNextMidnightJordan();
      setCountdown(formatCountdown(next.getTime() - now.getTime()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleStartChallenge = useCallback(async () => {
    if (!challenge) return;
    const route = ACTION_ROUTES[challenge.actionType];
    if (route === "__share__") {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success(
          lang === "ar" ? "تم نسخ رابط المنصة!" : "Platform link copied!",
          { description: lang === "ar" ? "شاركه مع أصدقائك" : "Share it with your friends" }
        );
      } catch {
        toast.error(lang === "ar" ? "تعذّر النسخ" : "Copy failed");
      }
    }
  }, [challenge, lang]);

  if (loading) {
    return <ChallengeSkeleton />;
  }

  if (!challenge) {
    return (
      <div className="rounded-2xl overflow-hidden bg-emerald-900 border border-emerald-700/50 shadow-xl">
        {/* Gold header bar */}
        <div className="relative px-5 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-900" strokeWidth={2} />
            <span className="font-bold text-emerald-900 text-sm uppercase tracking-wider">
              {t("challengeToday")}
            </span>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-emerald-200 text-sm">{t("challengeNoChallenge")}</p>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-emerald-400 text-xs">
            <Clock className="h-3.5 w-3.5" />
            <span>{t("challengeNextIn")}: {countdown}</span>
          </div>
        </div>
      </div>
    );
  }

  const title = lang === "ar" ? challenge.titleAr : challenge.title;
  const description = lang === "ar" ? challenge.descriptionAr : challenge.description;
  const isCompleted = challenge.status === "COMPLETED";
  const actionRoute = ACTION_ROUTES[challenge.actionType];
  const isShareAction = actionRoute === "__share__";

  const bonusPoints = streak.multiplier > 1
    ? Math.round(challenge.points * streak.multiplier)
    : challenge.points;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden bg-emerald-900 border border-emerald-700/50 shadow-xl shadow-emerald-950/40"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {/* Gold gradient header */}
      <div className="relative px-5 py-3.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.4),_transparent_70%)]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-900 drop-shadow-sm" strokeWidth={2.2} />
            <span className="font-extrabold text-emerald-900 text-sm uppercase tracking-wider">
              {t("challengeToday")}
            </span>
          </div>

          {/* Streak badge */}
          {streak.currentStreak > 0 && (
            <div className="flex items-center gap-1 bg-emerald-900/25 backdrop-blur-sm rounded-full px-2.5 py-1">
              <Flame className="h-3.5 w-3.5 text-orange-300" strokeWidth={2.2} />
              <span className="text-xs font-extrabold text-emerald-900">
                {streak.currentStreak} {t("challengeStreak")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Points row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-amber-400 font-extrabold text-sm tabular-nums">
              +{bonusPoints} {t("challengePoints")}
            </span>
            {streak.multiplier > 1 && (
              <motion.span
                className="text-[10px] font-bold bg-amber-400/20 text-amber-300 rounded-full px-2 py-0.5 border border-amber-400/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                {streak.multiplier}x {t("challengeBonus")}
              </motion.span>
            )}
          </div>
        </div>

        <p className="text-sm text-emerald-200/80 leading-relaxed mb-5">{description}</p>

        {/* Action area */}
        {isCompleted ? (
          <motion.div
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800/60 border border-emerald-600/40 py-3"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={2.2} />
            <span className="font-bold text-emerald-300 text-sm">{t("challengeCompleted")}</span>
          </motion.div>
        ) : isShareAction ? (
          <Button
            onClick={handleStartChallenge}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-emerald-900 font-bold rounded-xl h-11 border-0 shadow-lg shadow-amber-900/30"
          >
            {t("challengeStart")}
          </Button>
        ) : (
          <Button
            asChild
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-emerald-900 font-bold rounded-xl h-11 border-0 shadow-lg shadow-amber-900/30"
          >
            <Link href={actionRoute}>
              {t("challengeStart")}
            </Link>
          </Button>
        )}

        {/* Countdown */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-emerald-500 text-xs">
          <Clock className="h-3 w-3" />
          <span>
            {t("challengeNextIn")}: <span className="tabular-nums font-mono font-semibold text-emerald-400">{countdown}</span>
          </span>
        </div>
      </div>

      {/* Subtle gold bottom accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </motion.div>
  );
}
