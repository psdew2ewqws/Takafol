"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, ArrowLeft, ArrowRight, ClipboardList, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { PostCard } from "@/components/posts/post-card";
import { ConnectionCard } from "@/components/connections/connection-card";
import { useLanguage } from "@/components/providers/language-provider";
import type { PostWithRelations, ConnectionWithRelations } from "@/types";

type MyTask = {
  id: string;
  title: string;
  category: string;
  status: string;
  currentVolunteers: number;
  maxVolunteers: number;
};

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
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/login");
  }, [sessionStatus, router]);

  useEffect(() => {
    if (!session) return;
    async function fetchDashboard() {
      try {
        const [statsRes, postsRes, connectionsRes, tasksRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/posts/my?limit=4"),
          fetch("/api/connections"),
          fetch("/api/tasks"),
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
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setMyTasks((tasksData as MyTask[]).slice(0, 4));
        }
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

      <Card className="mb-6 border-emerald-100">
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

      {/* Volunteer Tasks Section */}
      <Card className="border-emerald-100">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-bold text-emerald-900">{t("myVolunteering")}</CardTitle>
          <Link href="/tasks">
            <Button variant="ghost" size="sm" className="text-emerald-700">
              {t("viewTasks")} <MoreArrow className="mx-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : myTasks.length === 0 ? (
            <div className="py-6 text-center">
              <ClipboardList className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-muted-foreground">{t("noTasksFound")}</p>
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="mt-3 text-emerald-700 border-emerald-200">
                  {t("viewTasks")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="flex items-center justify-between rounded-xl border border-emerald-50 p-3 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] capitalize">{task.category}</Badge>
                        <span className="text-xs text-gray-500">{task.currentVolunteers}/{task.maxVolunteers}</span>
                      </div>
                    </div>
                    {task.status === "completed" && <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
