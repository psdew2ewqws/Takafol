"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageWithSender } from "@/types";

interface MessageBubbleProps {
  message: MessageWithSender;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString("ar-JO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "flex-row" : "flex-row-reverse",
      )}
    >
      {!isOwn && (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-gray-100 text-xs text-gray-600">
            {message.sender.name?.charAt(0) || "؟"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "rounded-bl-sm bg-emerald-700 text-white"
            : "rounded-br-sm bg-gray-100 text-gray-900",
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            isOwn ? "text-emerald-200" : "text-gray-400",
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
