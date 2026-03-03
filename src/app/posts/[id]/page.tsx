"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Clock,
  Users,
  HandHeart,
  HelpCircle,
  Pencil,
  Trash2,
  Loader2,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/providers/language-provider";
import { BlockchainBadge } from "@/components/blockchain/BlockchainBadge";
import { formatRelativeTime, getUrgencyConfig } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/types";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { lang, t } = useLanguage();
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const [post, setPost] = useState<PostWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState("");

  const urgencyLabel: Record<string, string> = {
    LOW: t("urgencyLow"),
    MEDIUM: t("urgencyMedium"),
    HIGH: t("urgencyHigh"),
    CRITICAL: t("urgencyCritical"),
  };

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (data.data) setPost(data.data);
        else setError(t("postNotFound"));
      } catch {
        setError(t("unexpectedError"));
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPost();
  }, [id, t]);

  async function handleConnect() {
    if (!session) {
      router.push("/login");
      return;
    }

    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post?.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("unexpectedError"));
        return;
      }
      router.push(`/connections/${data.data.id}`);
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setConnecting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/posts");
      } else {
        const data = await res.json();
        setError(data.error || t("unexpectedError"));
      }
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-6 h-64 rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-lg font-medium text-gray-500">{error || t("postNotFound")}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/posts")}
          className="mt-4"
        >
          {t("backToPosts")}
        </Button>
      </div>
    );
  }

  const isOffer = post.type === "OFFER";
  const isAuthor = session?.user?.id === post.userId;
  const urgencyConfig = getUrgencyConfig(post.urgency);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/posts")}
        className="mb-4 text-muted-foreground"
      >
        <BackArrow className="mx-1 h-4 w-4" />
        {t("back")}
      </Button>

      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                "text-sm font-medium",
                isOffer
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              )}
              variant="outline"
            >
              {isOffer ? (
                <><HandHeart className="mx-1 h-3.5 w-3.5" /> {t("offerHelpLabel")}</>
              ) : (
                <><HelpCircle className="mx-1 h-3.5 w-3.5" /> {t("requestHelpLabel")}</>
              )}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                urgencyConfig.color,
                urgencyConfig.bgColor,
                urgencyConfig.borderColor,
              )}
            >
              {urgencyLabel[post.urgency] || urgencyConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              {post.category.icon} {lang === "ar" ? post.category.nameAr : post.category.nameEn}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {lang === "ar" ? post.district.nameAr : post.district.nameEn}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatRelativeTime(post.createdAt)}
            </span>
            {post._count && post._count.connections > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {post._count.connections} {t("connection")}
              </span>
            )}
          </div>

          <Separator />

          {/* Description */}
          <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
            {post.description}
          </p>

          {/* Blockchain Verification */}
          {post.blockchainTx && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
              <BlockchainBadge txHash={post.blockchainTx} size="md" />
              <span className="text-xs text-emerald-700 font-medium">
                {lang === "ar" ? "مُوثّق على البلوكتشين" : "Verified on Blockchain"}
              </span>
            </div>
          )}

          <Separator />

          {/* Author info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                {post.user.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.user.name}</p>
              {post.user.averageRating > 0 && (
                <p className="text-xs text-muted-foreground">
                  {post.user.averageRating.toFixed(1)}
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isAuthor ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mx-1 h-4 w-4" />
                  {t("delete")}
                </Button>
              </>
            ) : session ? (
              <Button
                onClick={handleConnect}
                disabled={connecting || post.status !== "ACTIVE"}
                className={cn(
                  "flex-1 text-white",
                  isOffer
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-amber-600 hover:bg-amber-700",
                )}
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="mx-1 h-4 w-4" />
                    {t("connect")}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/login")}
                className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {t("loginToConnect")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deletePost")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
