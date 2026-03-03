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

  // Rating dialog
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

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
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setUpdating(false);
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
            <Badge
              variant="outline"
              className={cn("text-xs", statusConfig.color, statusConfig.bg)}
            >
              {statusConfig.label}
            </Badge>
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
