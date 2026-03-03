"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { PostCard } from "@/components/posts/post-card";
import { ConnectionCard } from "@/components/connections/connection-card";
import { useLanguage } from "@/components/providers/language-provider";
import type { PostWithRelations, ConnectionWithRelations } from "@/types";

interface DashboardStats {
  impactScore: number;
  tasksCompleted: number;
  activeConnections: number;
  unreadMessages: number;
  totalPosts: number;
  averageRating: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const MoreArrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<PostWithRelations[]>([]);
  const [recentConnections, setRecentConnections] = useState<ConnectionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/login");
  }, [sessionStatus, router]);

  useEffect(() => {
    if (!session) return;
    async function fetchDashboard() {
      try {
        const [statsRes, postsRes, connectionsRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/posts/my?limit=4"),
          fetch("/api/connections"),
        ]);
        const [statsData, postsData, connectionsData] = await Promise.all([
          statsRes.json(), postsRes.json(), connectionsRes.json(),
        ]);
        if (statsData.data) setStats(statsData.data);
        if (postsData.data) {
          const posts = Array.isArray(postsData.data) ? postsData.data : postsData.data.posts ?? [];
          setRecentPosts(posts.slice(0, 4));
        }
        if (connectionsData.data) setRecentConnections(connectionsData.data.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [session]);

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">
          {t("dashboardGreeting")} {session.user?.name || ""}! ☪
        </h1>
        <p className="text-sm text-muted-foreground">{t("dashboardSubtitle")}</p>
      </div>

      {loading ? (
        <div className="mb-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="mb-6">
          <StatsGrid
            impactScore={stats.impactScore}
            tasksCompleted={stats.tasksCompleted}
            activeConnections={stats.activeConnections}
            unreadMessages={stats.unreadMessages}
          />
        </div>
      ) : null}

      <Card className="mb-6 border-emerald-100">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-bold text-emerald-900">{t("recentPosts")}</CardTitle>
          <Link href="/posts">
            <Button variant="ghost" size="sm" className="text-emerald-700">
              {t("viewAll")} <MoreArrow className="mx-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : recentPosts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("noPostsYet")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-100">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-bold text-emerald-900">{t("recentConnections")}</CardTitle>
          <Link href="/connections">
            <Button variant="ghost" size="sm" className="text-emerald-700">
              {t("viewAll")} <MoreArrow className="mx-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
          ) : recentConnections.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("noConnectionsYet")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentConnections.map((conn) => <ConnectionCard key={conn.id} connection={conn} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
