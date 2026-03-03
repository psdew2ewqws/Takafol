"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, MapPin, Users, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockchainProof } from "@/components/blockchain/BlockchainProof";
import { ProofUpload } from "@/components/tasks/ProofUpload";
import { ProofDisplay } from "@/components/tasks/ProofDisplay";
import { ImpactCertificate } from "@/components/tasks/ImpactCertificate";
import { useLanguage } from "@/components/providers/language-provider";
import { formatDateShort } from "@/lib/format-utils";
import { cn } from "@/lib/utils";

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

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
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
        const res = await fetch(`/api/tasks/${id}`);
        if (res.ok) setTask(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );

  if (!task) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">{t("taskNotFound")}</p>
    </div>
  );

  const myApplication = userId ? task.applications?.find((a) => a.volunteerId === userId) : null;
  const hasJoined = !!myApplication;
  const hasCompleted = myApplication?.status === "completed";
  const spotsLeft = task.maxVolunteers - task.currentVolunteers;
  const progress = task.maxVolunteers > 0 ? (task.currentVolunteers / task.maxVolunteers) * 100 : 0;
  const isCreator = userId && task.creatorId === userId;

  async function handleJoin() {
    if (!userId) { router.push("/login"); return; }
    setJoining(true);
    try {
      const res = await fetch(`/api/tasks/${id}/apply`, { method: "POST" });
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
      const res = await fetch(`/api/tasks/${id}/approve`, { method: "POST" });
      if (res.ok) setTask((prev) => prev ? { ...prev, status: "approved" } : prev);
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-medium">
        <ArrowRight size={16} className="rtl:rotate-180" />
        {t("back")}
      </button>

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
          <h1 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h1>
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
        <Button onClick={() => router.push("/login")} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
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
          <CertificateWithDownload
            taskId={task.id}
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
