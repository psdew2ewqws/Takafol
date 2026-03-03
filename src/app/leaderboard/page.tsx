"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type LeaderboardEntry = {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  impactScore: number;
  tasksCompleted: number;
  totalDonated: number;
};

const MEDAL_COLORS = ["text-amber-500", "text-gray-400", "text-amber-700"];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) setLeaderboard(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Trophy size={28} className="text-amber-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-emerald-900">{t("leaderboardTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("leaderboardSubtitle")}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="border-emerald-100">
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground">{t("noParticipants")}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-emerald-100">
          <CardContent className="p-0">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  i < leaderboard.length - 1 && "border-b border-gray-50",
                  i < 3 && "bg-amber-50/30"
                )}
              >
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <Medal size={20} className={MEDAL_COLORS[i]} />
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                  )}
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-emerald-100 text-sm font-bold text-emerald-700">
                    {entry.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{entry.userName}</p>
                  <p className="text-xs text-gray-500">
                    {entry.tasksCompleted} {t("tasks")}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-extrabold text-emerald-700 tabular-nums">{entry.impactScore}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{t("points")}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
