"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, BarChart3, Users, FileText, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";

interface BreakdownItem {
  id: string;
  nameEn: string;
  nameAr: string;
  icon?: string;
  count: number;
}

interface AnalyticsData {
  categoryBreakdown: BreakdownItem[];
  districtBreakdown: BreakdownItem[];
  completionRate: { total: number; completed: number; rate: number };
  totalPosts: number;
  totalConnections: number;
  totalUsers: number;
}

function BarItem({
  label,
  count,
  maxCount,
  icon,
  color,
}: {
  label: string;
  count: number;
  maxCount: number;
  icon?: string;
  color: string;
}) {
  const width = maxCount > 0 ? Math.max((count / maxCount) * 100, 2) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="font-medium text-gray-700">{count}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const { lang, t } = useLanguage();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") return;

    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        if (json.data) setData(json.data);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [session]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!data) return null;

  const maxCategoryCount = Math.max(...data.categoryBreakdown.map((c) => c.count), 1);
  const maxDistrictCount = Math.max(...data.districtBreakdown.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-emerald-900">{t("analyticsTitle")}</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-emerald-100">
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xl font-bold">{data.totalPosts}</p>
              <p className="text-xs text-muted-foreground">{t("totalPosts")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="flex items-center gap-3 p-4">
            <Link2 className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-xl font-bold">{data.totalConnections}</p>
              <p className="text-xs text-muted-foreground">{t("totalConnections")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold">{data.totalUsers}</p>
              <p className="text-xs text-muted-foreground">{t("totalUsers")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base font-bold text-emerald-900">
            {t("completionRate")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeDasharray={`${data.completionRate.rate}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-emerald-700">{data.completionRate.rate}%</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{data.completionRate.completed} {t("completedLabel")} / {data.completionRate.total} {t("totalLabel")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base font-bold text-emerald-900">
            {t("categoryBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.categoryBreakdown.map((item) => (
            <BarItem
              key={item.id}
              label={lang === "ar" ? item.nameAr : item.nameEn}
              count={item.count}
              maxCount={maxCategoryCount}
              icon={item.icon}
              color="bg-emerald-500"
            />
          ))}
        </CardContent>
      </Card>

      {/* District Breakdown */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-base font-bold text-emerald-900">
            {t("districtBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.districtBreakdown.map((item) => (
            <BarItem
              key={item.id}
              label={lang === "ar" ? item.nameAr : item.nameEn}
              count={item.count}
              maxCount={maxDistrictCount}
              color="bg-blue-500"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
