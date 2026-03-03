"use client";

import Link from "next/link";
import { MapPin, Clock, Users, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime, getUrgencyConfig, truncateText, getDistanceKm, formatDistance } from "@/lib/format";
import { useLanguage } from "@/components/providers/language-provider";
import { BlockchainBadge } from "@/components/blockchain/BlockchainBadge";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/types";

interface PostCardProps {
  post: PostWithRelations;
  userCoords?: { lat: number; lng: number } | null;
}

export function PostCard({ post, userCoords }: PostCardProps) {
  const { lang, t } = useLanguage();
  const urgency = getUrgencyConfig(post.urgency);
  const isOffer = post.type === "OFFER";

  const postWithLocation = post as PostWithRelations & { latitude?: number | null; longitude?: number | null };
  const distance =
    userCoords && postWithLocation.latitude && postWithLocation.longitude
      ? getDistanceKm(userCoords.lat, userCoords.lng, postWithLocation.latitude, postWithLocation.longitude)
      : null;

  const urgencyLabel: Record<string, string> = {
    LOW: t("urgencyLow"),
    MEDIUM: t("urgencyMedium"),
    HIGH: t("urgencyHigh"),
    CRITICAL: t("urgencyCritical"),
  };

  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="group overflow-hidden border-emerald-100 transition-all hover:border-emerald-200 hover:shadow-md">
        {/* Image thumbnail */}
        {(post as PostWithRelations & { imageUrl?: string | null }).imageUrl && (
          <div className="h-40 w-full overflow-hidden">
            <img
              src={(post as PostWithRelations & { imageUrl?: string | null }).imageUrl!}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-4">
          {/* Header: type badge + urgency */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <Badge
              className={cn(
                "text-xs font-medium",
                isOffer
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              )}
              variant="outline"
            >
              {isOffer ? t("offer") : t("request")}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs", urgency.color, urgency.bgColor, urgency.borderColor)}
            >
              {urgencyLabel[post.urgency] || urgency.label}
            </Badge>
          </div>

          {/* Category + District */}
          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {post.category.icon} {lang === "ar" ? post.category.nameAr : post.category.nameEn}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {lang === "ar" ? post.district.nameAr : post.district.nameEn}
            </span>
            {distance !== null && (
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <Navigation className="h-3 w-3" />
                {formatDistance(distance)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mb-3 text-sm leading-relaxed text-gray-700">
            {truncateText(post.description)}
          </p>

          {/* Blockchain verification */}
          {post.blockchainTx && (
            <div className="mb-3">
              <BlockchainBadge txHash={post.blockchainTx} size="sm" />
            </div>
          )}

          {/* Footer: user + time + connections */}
          <div className="flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                  {post.user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{post.user.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post._count && post._count.connections > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {post._count.connections}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
