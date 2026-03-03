"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/language-provider";
import { Trophy, Flame, Star, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyChallengeCard } from "@/components/challenges/daily-challenge-card";
import type { TranslationKey } from "@/lib/i18n";

interface ChallengeHistoryItem {
  id: string;
  date: string;
  title: string;
  titleAr: string;
  points: number;
  pointsAwarded: number;
  status: "COMPLETED" | "PENDING" | "EXPIRED";
}

interface UserStats {
  currentStreak: number;
  totalPoints: number;
  daysCompleted: number;
}

function StatCard({
  icon,
  value,
  label,
  accentColor,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  accentColor: string;
}) {
  return (
    <Card className={`border-0 bg-gradient-to-br ${accentColor} shadow-sm`}>
      <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
        <div className="mb-0.5">{icon}</div>
        <span className="text-2xl font-extrabold text-white tabular-nums">{value}</span>
        <span className="text-xs font-medium text-white/75 leading-tight">{label}</span>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, t }: { status: ChallengeHistoryItem["status"]; t: (key: TranslationKey) => string }) {
  if (status === "COMPLETED") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs px-2 py-0.5 h-5">
        {t("completed")}
      </Badge>
    );
  }
  if (status === "PENDING") {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-2 py-0.5 h-5">
        {t("pending")}
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs px-2 py-0.5 h-5">
      {t("challengeExpired")}
    </Badge>
  );
}

function formatDate(dateStr: string, lang: "ar" | "en"): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "ar" ? "ar-JO" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ChallengesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<UserStats>({ currentStreak: 0, totalPoints: 0, daysCompleted: 0 });
  const [history, setHistory] = useState<ChallengeHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    async function fetchData() {
      try {
        const [streakRes, historyRes] = await Promise.all([
          fetch("/api/challenges/streak"),
          fetch("/api/challenges/history"),
        ]);

        if (streakRes.ok) {
          const d = await streakRes.json();
          setStats({
            currentStreak: d.streak ?? d.currentStreak ?? 0,
            totalPoints: d.totalPoints ?? 0,
            daysCompleted: d.totalCompleted ?? d.daysCompleted ?? 0,
          });
        }

        if (historyRes.ok) {
          const d = await historyRes.json();
          const items = Array.isArray(d.challenges) ? d.challenges : (Array.isArray(d.history) ? d.history : []);
          // Map nested challenge data to flat format
          setHistory(items.map((item: any) => ({
            id: item.id,
            date: item.challenge?.date ?? item.date,
            title: item.challenge?.titleEn ?? item.title ?? "",
            titleAr: item.challenge?.titleAr ?? item.titleAr ?? "",
            points: item.challenge?.points ?? item.points ?? 0,
            pointsAwarded: item.pointsAwarded ?? 0,
            status: item.status ?? "PENDING",
          })));
        }
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchData();
  }, [sessionStatus]);

  // Not logged-in state
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <Trophy className="h-14 w-14 text-amber-400 mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-emerald-900 mb-2">{t("challenges")}</h2>
        <p className="text-sm text-gray-500 max-w-xs">{t("loginRequired")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 pb-24">
      {/* Page header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 end-8 text-4xl text-amber-300 gold-shimmer">☪</div>
          <div className="absolute bottom-4 start-8 text-2xl text-amber-300 gold-shimmer" style={{ animationDelay: "1.2s" }}>✦</div>
        </div>
        <div className="relative px-4 pt-12 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-900/40 mb-4">
            <Trophy className="h-7 w-7 text-emerald-900" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">{t("challenges")}</h1>
          <p className="text-sm text-emerald-300/80">{t("challengePromptDesc")}</p>
        </div>
      </div>

      <div className="px-4 space-y-6 max-w-lg mx-auto">
        {/* Stats row */}
        {sessionStatus === "authenticated" && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Flame className="h-6 w-6 text-orange-200" strokeWidth={2} />}
              value={stats.currentStreak}
              label={t("challengeStreak")}
              accentColor="from-orange-500 to-red-500"
            />
            <StatCard
              icon={<Star className="h-6 w-6 text-amber-200" strokeWidth={2} />}
              value={stats.totalPoints}
              label={t("challengeTotalPoints")}
              accentColor="from-amber-500 to-amber-600"
            />
            <StatCard
              icon={<Calendar className="h-6 w-6 text-emerald-200" strokeWidth={2} />}
              value={stats.daysCompleted}
              label={t("challengeDaysCompleted")}
              accentColor="from-emerald-600 to-emerald-700"
            />
          </div>
        )}

        {/* Today's challenge */}
        <DailyChallengeCard />

        {/* History */}
        <section>
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-amber-400" strokeWidth={2} />
            {t("challengeHistory")}
          </h2>

          {historyLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            </div>
          ) : history.length === 0 ? (
            <Card className="border-emerald-800 bg-emerald-900/60">
              <CardContent className="py-10 text-center">
                <Trophy className="h-9 w-9 text-emerald-700 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-emerald-400">{t("noResults")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {history.map((item, i) => {
                const title = lang === "ar" ? item.titleAr : item.title;
                return (
                  <Card
                    key={item.id}
                    className="border-emerald-800/60 bg-emerald-900/50 py-0 overflow-hidden shadow-sm"
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      {/* Date column */}
                      <div className="shrink-0 text-center min-w-10">
                        <span className="text-[11px] font-bold text-emerald-500 leading-none">
                          {formatDate(item.date, lang)}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-8 bg-emerald-700/50 shrink-0" />

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{title}</p>
                        {item.status === "COMPLETED" && (
                          <p className="text-xs text-amber-400 font-bold mt-0.5 tabular-nums">
                            +{item.pointsAwarded} {t("challengePoints")}
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        <StatusBadge status={item.status} t={t} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
