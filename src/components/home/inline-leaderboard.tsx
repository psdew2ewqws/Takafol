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

export function InlineLeaderboard() {
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

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="border-emerald-100">
        <CardContent className="p-10 text-center">
          <Trophy size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-muted-foreground">{t("noParticipants")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6 pt-2">
          {[1, 0, 2].map((rank) => {
            const entry = leaderboard[rank];
            if (!entry) return null;
            const heights = ["h-24", "h-18", "h-14"];
            const sizes = ["w-14 h-14", "w-11 h-11", "w-11 h-11"];
            const textSizes = ["text-lg", "text-sm", "text-sm"];
            return (
              <div key={entry.id} className="flex flex-col items-center">
                <Avatar className={cn(sizes[rank], "mb-1.5")}>
                  <AvatarFallback className={cn(
                    "font-bold",
                    rank === 0 ? "bg-amber-100 text-amber-700" :
                    rank === 1 ? "bg-gray-100 text-gray-600" :
                    "bg-orange-100 text-orange-700",
                    textSizes[rank],
                  )}>
                    {entry.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-bold text-gray-900 truncate max-w-16 text-center">{entry.userName}</p>
                <p className="text-[10px] font-bold text-emerald-600">{entry.impactScore}</p>
                <div className={cn(
                  "w-16 rounded-t-lg mt-1.5 flex items-start justify-center pt-2",
                  rank === 0 ? "bg-amber-100 " + heights[0] :
                  rank === 1 ? "bg-gray-100 " + heights[1] :
                  "bg-orange-100 " + heights[2],
                )}>
                  <Medal size={18} className={MEDAL_COLORS[rank]} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
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
    </div>
  );
}
