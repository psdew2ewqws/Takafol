"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, MapPin, Users, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type TaskData = {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  category: string;
  impactLetter?: string | null;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
  location?: string | null;
  applications?: Array<{ volunteerId: string; status: string }>;
};

const CATEGORIES = [
  { key: "all", labelKey: "all" as const },
  { key: "food", labelKey: "categoryFood" as const },
  { key: "clothes", labelKey: "categoryClothes" as const },
  { key: "education", labelKey: "categoryEducation" as const },
  { key: "painting", labelKey: "categoryPainting" as const },
  { key: "cleaning", labelKey: "categoryCleaning" as const },
  { key: "delivery", labelKey: "categoryDelivery" as const },
  { key: "other", labelKey: "categoryOther" as const },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function TasksPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [approving, setApproving] = useState<string | null>(null);

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) setTasks(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleApprove(taskId: string) {
    setApproving(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, { method: "POST" });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: "approved" } : t));
      }
    } finally {
      setApproving(null);
    }
  }

  const browsable = tasks.filter((t) =>
    t.status === "approved" || t.status === "in_progress" || t.status === "completed"
  );

  const filtered = browsable.filter((t) => {
    const matchCategory = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const pendingTasks = isAdmin ? tasks.filter((t) => t.status === "pending") : [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">{t("volunteerTasks")}</h1>
        <p className="text-sm text-muted-foreground">{t("volunteerTasksSubtitle")}</p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={t("searchTasks")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
              activeCategory === cat.key
                ? "bg-emerald-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {t(cat.labelKey)}
          </button>
        ))}
      </div>

      {/* Pending tasks (admin only) */}
      {pendingTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-amber-800 mb-3">
            {t("pendingApproval")} ({pendingTasks.length})
          </h2>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <Card key={task.id} className="border-amber-200 bg-amber-50/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{task.creatorName} · {task.category}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(task.id)}
                    disabled={approving === task.id}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white ms-3"
                  >
                    {approving === task.id ? <Loader2 size={14} className="animate-spin" /> : t("approve")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {session && (
        <Link href="/tasks/create" className="mb-6 block">
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            <Plus size={16} className="me-2" />
            {t("createNewTask")}
          </Button>
        </Link>
      )}

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      )}

      {!loading && (
        <>
          {filtered.length === 0 ? (
            <Card className="border-emerald-100">
              <CardContent className="p-10 text-center">
                <p className="text-sm font-bold text-gray-900">{t("noTasksFound")}</p>
                <p className="text-xs text-gray-500 mt-1">{t("tryDifferentSearch")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((task) => {
                const spotsLeft = task.maxVolunteers - task.currentVolunteers;
                const progress = task.maxVolunteers > 0 ? (task.currentVolunteers / task.maxVolunteers) * 100 : 0;
                return (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <Card className="border-emerald-100 hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{task.category}</Badge>
                          <Badge variant="outline" className={cn("text-[10px] uppercase", STATUS_COLORS[task.status])}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{task.title}</h3>
                        {task.location && (
                          <div className="flex items-center gap-1 mb-2">
                            <MapPin size={11} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{task.location}</span>
                          </div>
                        )}
                        {task.impactLetter && (
                          <p className="text-xs text-gray-500 line-clamp-2 italic mb-2">&ldquo;{task.impactLetter}&rdquo;</p>
                        )}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1">
                            <Users size={12} className="text-emerald-600" />
                            <span className="text-xs font-bold text-gray-700">{task.currentVolunteers}/{task.maxVolunteers}</span>
                          </div>
                          {spotsLeft > 0 && task.status === "approved" && (
                            <span className="text-[10px] font-bold text-emerald-600">{spotsLeft} {t("left")}</span>
                          )}
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", progress >= 100 ? "bg-emerald-500" : "bg-emerald-600")}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-400 text-center mt-6 font-medium">
            {filtered.length} {t("tasksAvailable")}
          </p>
        </>
      )}
    </div>
  );
}
