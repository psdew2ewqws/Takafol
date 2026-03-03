"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeTime, truncateText } from "@/lib/format";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import type { ConnectionWithRelations } from "@/types";

interface ConnectionCardProps {
  connection: ConnectionWithRelations;
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: t("pending"), color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
    ACCEPTED: { label: t("accepted"), color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    IN_PROGRESS: { label: t("inProgress"), color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    COMPLETED: { label: t("completed"), color: "text-green-700", bg: "bg-green-50 border-green-200" },
    CANCELLED: { label: t("cancelled"), color: "text-gray-500", bg: "bg-gray-50 border-gray-200" },
    DISPUTED: { label: t("disputed"), color: "text-red-700", bg: "bg-red-50 border-red-200" },
  };

  const statusConfig = STATUS_CONFIG[connection.status] ?? STATUS_CONFIG.PENDING;

  const isGiver = session?.user?.id === connection.giverId;
  const otherParty = isGiver ? connection.requester : connection.giver;
  const roleLabel = isGiver ? t("youAreGiver") : t("youAreRequester");

  return (
    <Link href={`/connections/${connection.id}`}>
      <Card className="group border-emerald-100 transition-all hover:border-emerald-200 hover:shadow-md">
        <CardContent className="p-4">
          {/* Header: status + role */}
          <div className="mb-3 flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn("text-xs", statusConfig.color, statusConfig.bg)}
            >
              {statusConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
          </div>

          {/* Post snippet */}
          <p className="mb-3 text-sm text-gray-700">
            {connection.post.category.icon}{" "}
            {truncateText(connection.post.description, 80)}
          </p>

          {/* Other party + meta */}
          <div className="flex items-center justify-between border-t border-gray-50 pt-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                  {otherParty.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{otherParty.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {connection._count && connection._count.messages > 0 && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {connection._count.messages}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(connection.updatedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
