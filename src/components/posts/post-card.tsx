"use client";

import Link from "next/link";
import { MapPin, Clock, Users, Navigation, ImageIcon } from "lucide-react";
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
  const imageUrl = (post as PostWithRelations & { imageUrl?: string | null }).imageUrl;

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
      <div className="group flex overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-[0.99]">
        {/* Image thumbnail */}
        {imageUrl ? (
          <div className="relative w-28 shrink-0 overflow-hidden bg-gray-100 sm:w-32">
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex w-16 shrink-0 items-center justify-center bg-gray-50/80 sm:w-20">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              isOffer ? "bg-emerald-100" : "bg-amber-100",
            )}>
              {post.category.icon ? (
                <span className="text-lg">{post.category.icon}</span>
              ) : (
                <ImageIcon className={cn("h-4 w-4", isOffer ? "text-emerald-500" : "text-amber-500")} />
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          {/* Top row: badges */}
          <div className="mb-2 flex items-center gap-2">
            <Badge
              className={cn(
                "text-[10px] font-semibold px-2 py-0",
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
              className={cn("text-[10px] px-2 py-0", urgency.color, urgency.bgColor, urgency.borderColor)}
            >
              {urgencyLabel[post.urgency] || urgency.label}
            </Badge>
            {distance !== null && (
              <span className="ms-auto flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <Navigation className="h-3 w-3" />
                {formatDistance(distance)}
              </span>
            )}
          </div>

          {/* Meta: category + district */}
          <div className="mb-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{post.category.icon} {lang === "ar" ? post.category.nameAr : post.category.nameEn}</span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {lang === "ar" ? post.district.nameAr : post.district.nameEn}
            </span>
          </div>

          {/* Description */}
          <p className="mb-2 line-clamp-2 text-sm leading-snug text-gray-700 group-hover:text-gray-900">
            {post.description}
          </p>

          {/* Blockchain */}
          {post.blockchainTx && (
            <div className="mb-2">
              <BlockchainBadge txHash={post.blockchainTx} size="sm" />
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center gap-2 text-[11px] text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-emerald-100 text-[10px] text-emerald-700">
                {post.user.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium text-gray-600">{post.user.name}</span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-0.5 shrink-0">
              <Clock className="h-2.5 w-2.5" />
              {formatRelativeTime(post.createdAt)}
            </span>
            {post._count && post._count.connections > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <Users className="h-2.5 w-2.5" />
                  {post._count.connections}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
