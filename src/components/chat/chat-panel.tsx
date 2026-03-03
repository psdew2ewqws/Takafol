"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/message-bubble";
import { useLanguage } from "@/components/providers/language-provider";
import { getPusherClient } from "@/lib/pusher-client";
import type { MessageWithSender } from "@/types";

interface ChatPanelProps {
  connectionId: string;
  disabled?: boolean;
}

const POLL_INTERVAL = 5000;

export function ChatPanel({ connectionId, disabled }: ChatPanelProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/connections/${connectionId}/messages`);
      const data = await res.json();
      if (data.data) {
        setMessages(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to Pusher or fall back to polling
  useEffect(() => {
    const pusher = getPusherClient();

    if (pusher) {
      const channel = pusher.subscribe(`connection-${connectionId}`);
      channel.bind("new-message", (message: MessageWithSender) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`connection-${connectionId}`);
      };
    }

    // Fallback to polling
    pollingRef.current = setInterval(fetchMessages, POLL_INTERVAL);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [connectionId, fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending || disabled) return;

    setSending(true);
    setInput("");

    try {
      const res = await fetch(`/api/connections/${connectionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (data.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
      }
    } catch {
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-emerald-100">
      {/* Messages area */}
      <ScrollArea className="h-80 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">
              {t("startConversation")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === session?.user?.id}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      {!disabled && (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-emerald-100 p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("typeMessage")}
            maxLength={2000}
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sending}
            className="bg-emerald-700 text-white hover:bg-emerald-800"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
