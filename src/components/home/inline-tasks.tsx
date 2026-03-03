"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search, MapPin, Users, Plus, Loader2, Clock, CheckCircle2,
  ArrowRight, ArrowLeft, Check,
  UtensilsCrossed, Shirt, GraduationCap, Paintbrush, Sparkles, Truck, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockchainProof } from "@/components/blockchain/BlockchainProof";
import { ProofUpload } from "@/components/tasks/ProofUpload";
import { ProofDisplay } from "@/components/tasks/ProofDisplay";
import { ImpactCertificate } from "@/components/tasks/ImpactCertificate";
import { useLanguage } from "@/components/providers/language-provider";
import { formatDateShort } from "@/lib/format-utils";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

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

type Application = {
  id: string; taskId: string; volunteerId: string; volunteerName: string;
  status: string; proofPhotoBase64?: string | null; proofHash?: string | null;
  proofTxHash?: string | null; proofExplorerUrl?: string | null;
  completedAt?: string | null; appliedAt: string;
};

type TaskDetail = {
  id: string; creatorId: string; creatorName: string; title: string;
  description: string; category: string; impactLetter?: string | null;
  maxVolunteers: number; currentVolunteers: number; status: string;
  location?: string | null; district?: string | null;
  txHash?: string | null; explorerUrl?: string | null;
  createdAt: string; applications: Application[];
};

/* ─── Constants ─── */

const LIST_CATEGORIES = [
  { key: "all", labelKey: "all" as const },
  { key: "food", labelKey: "categoryFood" as const },
  { key: "clothes", labelKey: "categoryClothes" as const },
  { key: "education", labelKey: "categoryEducation" as const },
  { key: "painting", labelKey: "categoryPainting" as const },
  { key: "cleaning", labelKey: "categoryCleaning" as const },
  { key: "delivery", labelKey: "categoryDelivery" as const },
  { key: "other", labelKey: "categoryOther" as const },
];

const CREATE_CATEGORIES = [
  { key: "food", labelKey: "categoryFood" as const, icon: UtensilsCrossed, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "clothes", labelKey: "categoryClothes" as const, icon: Shirt, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "education", labelKey: "categoryEducation" as const, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "painting", labelKey: "categoryPainting" as const, icon: Paintbrush, color: "text-pink-600", bg: "bg-pink-50" },
  { key: "cleaning", labelKey: "categoryCleaning" as const, icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "delivery", labelKey: "categoryDelivery" as const, icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "other", labelKey: "categoryOther" as const, icon: HelpCircle, color: "text-gray-600", bg: "bg-gray-100" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

/* ════════════════════════════════════════════════
   1. InlineTasksList — browse & filter tasks
   ════════════════════════════════════════════════ */

export function InlineTasksList({
  onSelectTask,
  onCreateTask,
}: {
  onSelectTask: (taskId: string) => void;
  onCreateTask: () => void;
}) {
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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={t("searchTasks")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {LIST_CATEGORIES.map((cat) => (
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
        <div>
          <h2 className="text-sm font-bold text-amber-800 mb-2">
            {t("pendingApproval")} ({pendingTasks.length})
          </h2>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <Card key={task.id} className="border-amber-200 bg-amber-50/50">
                <CardContent className="flex items-center justify-between p-3">
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

      {/* Create task button */}
      {session && (
        <Button
          onClick={onCreateTask}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Plus size={16} className="me-2" />
          {t("createNewTask")}
        </Button>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      )}

      {/* Task Cards */}
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
                  <button
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="text-start w-full"
                  >
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
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-xs text-gray-400 text-center font-medium">
            {filtered.length} {t("tasksAvailable")}
          </p>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   2. InlineTaskDetail — full task detail view
   ════════════════════════════════════════════════ */

export function InlineTaskDetail({ taskId }: { taskId: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [approving, setApproving] = useState(false);

  const userId = session?.user?.id;
  const userName = session?.user?.name || "";
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (res.ok) setTask(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [taskId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">{t("taskNotFound")}</p>
      </div>
    );
  }

  const myApplication = userId ? task.applications?.find((a) => a.volunteerId === userId) : null;
  const hasJoined = !!myApplication;
  const hasCompleted = myApplication?.status === "completed";
  const spotsLeft = task.maxVolunteers - task.currentVolunteers;
  const progress = task.maxVolunteers > 0 ? (task.currentVolunteers / task.maxVolunteers) * 100 : 0;
  const isCreator = userId && task.creatorId === userId;

  async function handleJoin() {
    if (!userId) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/apply`, { method: "POST" });
      if (res.ok) {
        const application = await res.json();
        setTask((prev) => prev ? {
          ...prev,
          currentVolunteers: prev.currentVolunteers + 1,
          applications: [...(prev.applications || []), application],
        } : prev);
      }
    } finally {
      setJoining(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, { method: "POST" });
      if (res.ok) setTask((prev) => prev ? { ...prev, status: "approved" } : prev);
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-emerald-100">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="capitalize">{task.category}</Badge>
            <Badge variant="outline" className={cn(
              task.status === "approved" ? "bg-emerald-50 text-emerald-700" :
              task.status === "in_progress" ? "bg-blue-50 text-blue-700" :
              task.status === "completed" ? "bg-gray-100 text-gray-600" :
              "bg-amber-50 text-amber-700"
            )}>{task.status.replace("_", " ")}</Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {task.location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} /> {task.location}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock size={12} /> {formatDateShort(task.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-xl p-3 border border-emerald-100 text-center">
        <p className="text-xs text-emerald-800 font-medium">{t("taskConnectionBanner")}</p>
      </div>

      {/* Description */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-emerald-900">{t("aboutThisTask")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
        </CardContent>
      </Card>

      {/* Impact Letter */}
      {task.impactLetter && (
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-800">{t("whyThisMatters")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 italic">&ldquo;{task.impactLetter}&rdquo;</p>
            <p className="text-xs text-gray-400 mt-2">&mdash; {task.creatorName}</p>
          </CardContent>
        </Card>
      )}

      {/* Volunteer Progress */}
      <Card className="border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900">{t("volunteers")}</h3>
            </div>
            <span className="text-xs font-bold text-gray-500">{task.currentVolunteers}/{task.maxVolunteers}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className={cn("h-full rounded-full transition-all", progress >= 100 ? "bg-emerald-500" : "bg-emerald-600")} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          {task.applications?.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
              {task.applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-700">{app.volunteerName.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{app.volunteerName}</span>
                  </div>
                  {app.status === "completed" && <CheckCircle2 size={14} className="text-emerald-500" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve button (admin only, pending tasks) */}
      {task.status === "pending" && isAdmin && (
        <Button onClick={handleApprove} disabled={approving} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
          {approving ? <Loader2 size={16} className="animate-spin me-2" /> : <CheckCircle2 size={16} className="me-2" />}
          {t("approveTask")}
        </Button>
      )}

      {/* Join button */}
      {!hasJoined && !isCreator && spotsLeft > 0 && (task.status === "approved" || task.status === "in_progress") && (
        <Button onClick={handleJoin} disabled={joining} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
          {joining ? <><Loader2 size={16} className="animate-spin me-2" /> {t("joining")}</> : (
            <><Users size={16} className="me-2" /> {t("joinTask")} ({spotsLeft} {t("left")})</>
          )}
        </Button>
      )}

      {/* Not logged in prompt */}
      {!userId && sessionStatus !== "loading" && (task.status === "approved" || task.status === "in_progress") && (
        <Button onClick={() => window.location.href = "/login"} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
          {t("loginRequired")}
        </Button>
      )}

      {/* Joined badge + proof upload */}
      {hasJoined && !hasCompleted && !proofSubmitted && userId && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">{t("joinedTask")}</span>
            </div>
            <p className="text-xs text-gray-600 mb-4">{t("uploadProofHint")}</p>
            <ProofUpload taskId={task.id} volunteerId={userId} onProofSubmitted={() => setProofSubmitted(true)} />
          </CardContent>
        </Card>
      )}

      {/* Proof display + certificate */}
      {(hasCompleted || proofSubmitted) && myApplication && (
        <>
          {myApplication.proofHash && (
            <ProofDisplay
              proofHash={myApplication.proofHash}
              proofTxHash={myApplication.proofTxHash}
              proofExplorerUrl={myApplication.proofExplorerUrl}
              proofPhotoBase64={myApplication.proofPhotoBase64}
              volunteerName={myApplication.volunteerName}
              completedAt={myApplication.completedAt}
            />
          )}
          <ImpactCertificate
            volunteerName={userName}
            taskTitle={task.title}
            category={task.category}
            impactLetter={task.impactLetter}
            completedAt={myApplication.completedAt || new Date().toISOString()}
          />
        </>
      )}

      {/* Blockchain proof (completed tasks) */}
      {task.status === "completed" && task.txHash && (
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <BlockchainProof steps={[{ label: t("taskCompleted"), txHash: task.txHash, timestamp: formatDateShort(task.createdAt) }]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   3. InlineCreateTask — multi-step task creation
   ════════════════════════════════════════════════ */

export function InlineCreateTask({ onSuccess }: { onSuccess: () => void }) {
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "", title: "", description: "", location: "", maxVolunteers: "5", impactLetter: "",
  });

  const STEPS = [t("stepCategory"), t("stepDetails"), t("stepImpact"), t("stepReview")];

  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-muted-foreground">{t("loginRequired")}</p>
        <Button onClick={() => window.location.href = "/login"} className="bg-emerald-700 text-white">
          {t("loginRequired")}
        </Button>
      </div>
    );
  }

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed() {
    if (step === 0) return form.category !== "";
    if (step === 1) return form.title.trim() !== "" && form.description.trim() !== "" && parseInt(form.maxVolunteers) > 0;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxVolunteers: parseInt(form.maxVolunteers),
        }),
      });
      if (res.ok) onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCat = CREATE_CATEGORIES.find((c) => c.key === form.category);

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div>
        <p className="text-lg font-bold text-gray-900 mb-3">{STEPS[step]}</p>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= step ? "bg-emerald-600" : "bg-gray-200")} />
          ))}
        </div>
      </div>

      {/* Step 0: Category */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-3">
          {CREATE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = form.category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => update("category", cat.key)}
                className={cn(
                  "flex flex-col items-center gap-2.5 py-6 rounded-xl border-2 transition-all",
                  selected ? `${cat.bg} border-current ${cat.color} ring-2 ring-emerald-100` : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <Icon size={28} className={selected ? cat.color : "text-gray-400"} strokeWidth={1.8} />
                <span className={cn("text-sm font-bold", selected ? cat.color : "text-gray-600")}>
                  {t(cat.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("taskTitle")}</Label>
            <Input placeholder={t("taskTitlePlaceholder")} value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <Textarea placeholder={t("taskDescPlaceholder")} value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>{t("location")}</Label>
            <Input placeholder={t("locationPlaceholder")} value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("maxVolunteers")}</Label>
            <Input type="number" min="1" max="100" value={form.maxVolunteers} onChange={(e) => update("maxVolunteers", e.target.value)} dir="ltr" />
          </div>
        </div>
      )}

      {/* Step 2: Impact Letter */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-emerald-800 mb-1">{t("writeImpactLetter")}</h3>
              <p className="text-xs text-gray-500">{t("impactLetterHint")}</p>
            </CardContent>
          </Card>
          <Textarea
            placeholder={t("impactLetterPlaceholder")}
            value={form.impactLetter}
            onChange={(e) => update("impactLetter", e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-400 text-end">{form.impactLetter.length}</p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-3">
          <Card className="border-emerald-100">
            <CardContent className="p-4 space-y-3">
              {selectedCat && (
                <Badge variant="outline" className={cn("capitalize", selectedCat.color, selectedCat.bg)}>
                  {t(selectedCat.labelKey)}
                </Badge>
              )}
              <h3 className="text-base font-bold text-gray-900">{form.title}</h3>
              <p className="text-sm text-gray-600">{form.description}</p>
              {form.location && <p className="text-xs text-gray-500">{t("location")}: {form.location}</p>}
              <p className="text-xs text-gray-500">{t("maxVolunteers")}: {form.maxVolunteers}</p>
            </CardContent>
          </Card>

          {form.impactLetter && (
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                  {t("impactLetter")}
                </p>
                <p className="text-sm text-gray-600 italic">&ldquo;{form.impactLetter}&rdquo;</p>
              </CardContent>
            </Card>
          )}

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-xs text-amber-700 font-medium">{t("taskSubmitNotice")}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            {t("back")}
          </Button>
        )}
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={cn("bg-emerald-700 hover:bg-emerald-800 text-white", step === 0 && "w-full", step > 0 && "flex-1")}
          >
            {t("continueBtn")} <ArrowLeft size={16} className="ms-2 rtl:rotate-180" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn("bg-emerald-700 hover:bg-emerald-800 text-white", "flex-1")}
          >
            {submitting ? <><Loader2 size={16} className="animate-spin me-2" /> {t("submitting")}</> : (
              <><Check size={16} className="me-2" /> {t("submitTask")}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Certificate wrapper that auto-creates & provides download ──
function CertificateWithDownload({
  taskId, volunteerName, taskTitle, category, impactLetter, completedAt,
}: {
  taskId: string; volunteerName: string; taskTitle: string;
  category: string; impactLetter?: string | null; completedAt: string;
}) {
  const [certificateId, setCertificateId] = useState<string | null>(null);

  useEffect(() => {
    async function ensureCertificate() {
      try {
        const res = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId }),
        });
        const data = await res.json();
        if (data.data?.id) {
          setCertificateId(data.data.id);
        }
      } catch {
        try {
          const res = await fetch("/api/certificates");
          const data = await res.json();
          if (data.data) {
            const cert = data.data.find((c: { taskId: string }) => c.taskId === taskId);
            if (cert) setCertificateId(cert.id);
          }
        } catch { /* silent */ }
      }
    }
    ensureCertificate();
  }, [taskId]);

  return (
    <ImpactCertificate
      volunteerName={volunteerName}
      taskTitle={taskTitle}
      category={category}
      impactLetter={impactLetter}
      completedAt={completedAt}
      certificateId={certificateId}
    />
  );
}
