"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  ThumbsUp,
  XCircle,
  Loader2,
  Star,
  Award,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatPanel } from "@/components/chat/chat-panel";
import { BlockchainProof } from "@/components/blockchain/BlockchainProof";
import { BlockchainBadge } from "@/components/blockchain/BlockchainBadge";
import { useLanguage } from "@/components/providers/language-provider";
import { formatRelativeTime, getUrgencyConfig, truncateText } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ConnectionWithRelations, ConnectionStatus } from "@/types";

export default function ConnectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { lang, t } = useLanguage();
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: t("pending"), color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
    ACCEPTED: { label: t("accepted"), color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    IN_PROGRESS: { label: t("inProgress"), color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    COMPLETED: { label: t("completed"), color: "text-green-700", bg: "bg-green-50 border-green-200" },
    CANCELLED: { label: t("cancelled"), color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
    DISPUTED: { label: t("disputed"), color: "text-red-700", bg: "bg-red-50 border-red-200" },
  };

  const [connection, setConnection] = useState<ConnectionWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [pollingForTx, setPollingForTx] = useState(false);

  // Rating dialog
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  // Certificate
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [generatingCert, setGeneratingCert] = useState(false);

  useEffect(() => {
    async function fetchConnection() {
      try {
        const res = await fetch(`/api/connections/${id}`);
        const data = await res.json();
        if (data.data) setConnection(data.data);
        else setError(t("connectionNotFound"));
      } catch {
        setError(t("unexpectedError"));
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchConnection();
  }, [id, t]);

  // Poll for blockchain TX updates after status changes (non-blocking TX takes time to mine)
  async function pollForBlockchainTx() {
    setPollingForTx(true);
    let attempts = 0;
    const maxAttempts = 6;
    const interval = 5000; // 5 seconds
    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/connections/${id}`);
        const data = await res.json();
        if (data.data) {
          setConnection(data.data);
          const conn = data.data as Record<string, unknown>;
          // Stop polling once we see a new TX or we've tried enough
          if (conn.blockchainTx || conn.completionTx || conn.ratingTx || attempts >= maxAttempts) {
            setPollingForTx(false);
            return;
          }
        }
      } catch { /* ignore */ }
      if (attempts < maxAttempts) {
        setTimeout(poll, interval);
      } else {
        setPollingForTx(false);
      }
    };
    setTimeout(poll, interval);
  }

  async function updateStatus(newStatus: ConnectionStatus) {
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("unexpectedError"));
        return;
      }
      setConnection(data.data);
      // Poll for blockchain TX if completing (non-blocking TX takes time)
      if (newStatus === "COMPLETED") {
        pollForBlockchainTx();
      }
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setUpdating(false);
    }
  }

  async function submitRating() {
    if (!connection || !session) return;
    setUpdating(true);
    setError("");

    const isGiver = session.user?.id === connection.giverId;
    const body = isGiver
      ? { requesterRating: rating, requesterReview: review }
      : { giverRating: rating, giverReview: review };

    try {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("unexpectedError"));
        return;
      }
      setConnection(data.data);
      setShowRating(false);
      // Poll for ratingTx (both ratings may trigger logTaskCompleted)
      pollForBlockchainTx();
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setUpdating(false);
    }
  }

  async function generateCertificate() {
    setGeneratingCert(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: id }),
      });
      const data = await res.json();
      if (data.data?.id) {
        setCertificateId(data.data.id);
      } else {
        setError(data.error || "Failed to generate certificate");
      }
    } catch {
      setError("Failed to generate certificate");
    } finally {
      setGeneratingCert(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-4 h-48 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-lg font-medium text-gray-500">{error || t("connectionNotFound")}</p>
        <Button variant="outline" onClick={() => router.push("/connections")} className="mt-4">
          {t("backToConnections")}
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[connection.status] ?? STATUS_CONFIG.PENDING;
  const postTx = (connection.post as Record<string, unknown>).blockchainTx as string | null;
  const connTx = (connection as unknown as Record<string, unknown>).blockchainTx as string | null;
  const completionTx = (connection as unknown as Record<string, unknown>).completionTx as string | null;
  const ratingTx = (connection as unknown as Record<string, unknown>).ratingTx as string | null;
  const isGiver = session?.user?.id === connection.giverId;
  const otherParty = isGiver ? connection.requester : connection.giver;
  const isPostAuthor = session?.user?.id === connection.post.userId;
  const isChatDisabled = connection.status === "CANCELLED" || connection.status === "COMPLETED";

  // Determine what actions are available
  const canAccept = connection.status === "PENDING" && isPostAuthor;
  const canStart = connection.status === "ACCEPTED";
  const canComplete = connection.status === "IN_PROGRESS";
  const canCancel = ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(connection.status);
  const canRate =
    connection.status === "COMPLETED" &&
    ((isGiver && !connection.requesterRating) ||
      (!isGiver && !connection.giverRating));

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/connections")}
        className="text-muted-foreground"
      >
        <BackArrow className="mx-1 h-4 w-4" />
        {t("back")}
      </Button>

      {/* Connection Info Card */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-emerald-900">
              {t("connectionDetail")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <BlockchainBadge txHash={connTx} size="sm" />
              <Badge
                variant="outline"
                className={cn("text-xs", statusConfig.color, statusConfig.bg)}
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Post snippet */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-700">
              {connection.post.category.icon}{" "}
              {truncateText(connection.post.description, 150)}
            </p>
          </div>

          {/* Other party */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                {otherParty.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{otherParty.name}</p>
              <p className="text-xs text-muted-foreground">
                {isGiver ? t("theRequester") : t("theGiver")}
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {canAccept && (
              <Button
                onClick={() => updateStatus("ACCEPTED")}
                disabled={updating}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><ThumbsUp className="mx-1 h-4 w-4" /> {t("accept")}</>
                )}
              </Button>
            )}
            {canStart && (
              <Button
                onClick={() => updateStatus("IN_PROGRESS")}
                disabled={updating}
                className="bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><Play className="mx-1 h-4 w-4" /> {t("startWork")}</>
                )}
              </Button>
            )}
            {canComplete && (
              <Button
                onClick={() => updateStatus("COMPLETED")}
                disabled={updating}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><CheckCircle2 className="mx-1 h-4 w-4" /> {t("complete")}</>
                )}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                onClick={() => updateStatus("CANCELLED")}
                disabled={updating}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mx-1 h-4 w-4" />
                {t("cancel")}
              </Button>
            )}
            {canRate && (
              <Button
                onClick={() => setShowRating(true)}
                className="bg-amber-500 text-white hover:bg-amber-600"
              >
                <Star className="mx-1 h-4 w-4" />
                {t("rate")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-emerald-900">{t("conversation")}</h2>
        <ChatPanel connectionId={connection.id} disabled={isChatDisabled} />
      </div>

      {/* Blockchain Proof — show whenever any tx exists */}
      {(postTx || connTx || completionTx || ratingTx || pollingForTx) && (
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            {pollingForTx && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <Loader2 className="h-3 w-3 animate-spin" />
                {lang === "ar" ? "جاري تسجيل العملية على البلوكتشين..." : "Recording transaction on blockchain..."}
              </div>
            )}
            <BlockchainProof
              steps={[
                {
                  label: lang === "ar" ? "تم إنشاء المنشور" : "Post Created",
                  txHash: postTx,
                  timestamp: new Date(connection.post.createdAt).toLocaleDateString(),
                },
                {
                  label: lang === "ar" ? "تم إنشاء التواصل" : "Connection Made",
                  txHash: connTx,
                  timestamp: new Date(connection.createdAt).toLocaleDateString(),
                },
                ...(connection.status === "COMPLETED"
                  ? [{
                      label: lang === "ar" ? "تم الإكمال" : "Completed",
                      txHash: completionTx,
                      timestamp: connection.completedAt
                        ? new Date(connection.completedAt).toLocaleDateString()
                        : undefined,
                    }]
                  : []),
                ...(ratingTx
                  ? [{
                      label: lang === "ar" ? "تم التقييم" : "Rated & Certified",
                      txHash: ratingTx,
                      timestamp: new Date(connection.updatedAt).toLocaleDateString(),
                    }]
                  : []),
              ]}
            />
          </CardContent>
        </Card>
      )}

      {/* Certificate Section — show for completed connections */}
      {connection.status === "COMPLETED" && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Award className="h-7 w-7 text-amber-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                {lang === "ar" ? "شهادة التطوع" : "Volunteer Certificate"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {lang === "ar"
                  ? "احصل على شهادة مُوثّقة على البلوكتشين لإثبات مساهمتك"
                  : "Get a blockchain-verified certificate for your contribution"}
              </p>
            </div>
            {certificateId ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => window.open(`/api/certificates/${certificateId}/pdf`, "_blank")}
                  className="bg-amber-600 text-white hover:bg-amber-700"
                >
                  <Download className="mr-1 h-4 w-4" />
                  {lang === "ar" ? "تحميل PDF" : "Download PDF"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/certificates/verify?id=${certificateId}`, "_blank")}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  {lang === "ar" ? "صفحة التحقق" : "Verify Page"}
                </Button>
              </div>
            ) : (
              <Button
                onClick={generateCertificate}
                disabled={generatingCert}
                className="bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {generatingCert ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Award className="mr-1 h-4 w-4" />
                )}
                {lang === "ar" ? "إصدار الشهادة" : "Generate Certificate"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rateExperience")}</DialogTitle>
            <DialogDescription>
              {t("rateWith")} {otherParty.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8",
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300",
                    )}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={t("writeReview")}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRating(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={submitRating}
              disabled={updating}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submitRating")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
