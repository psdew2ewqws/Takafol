"use client";

import { Trophy, CheckCircle2, Users, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";
import type { TranslationKey } from "@/lib/i18n";

interface StatsGridProps {
  impactScore: number;
  tasksCompleted: number;
  activeConnections: number;
  unreadMessages: number;
}

const STAT_ITEMS: {
  key: keyof StatsGridProps;
  labelKey: TranslationKey;
  icon: typeof Trophy;
  color: string;
  bg: string;
}[] = [
  { key: "impactScore", labelKey: "impactScore", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "tasksCompleted", labelKey: "tasksCompleted", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "activeConnections", labelKey: "activeConnections", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "unreadMessages", labelKey: "newMessages", icon: MessageCircle, color: "text-purple-600", bg: "bg-purple-50" },
];

export function StatsGrid(stats: StatsGridProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-3">
      {STAT_ITEMS.map((item) => (
        <Card key={item.key} className="border-emerald-100">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats[item.key]}</p>
              <p className="text-xs text-muted-foreground">{t(item.labelKey)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
