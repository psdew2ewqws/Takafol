"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  Send,
  Clock,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { toast } from "sonner";

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

interface NotifLog {
  id: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  recipientCount: number;
  status: string;
  sentAt: string;
  sentBy?: { name: string | null };
}

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const { t, lang } = useLanguage();

  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<NotifLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"compose" | "history">("compose");

  // Form state
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch("/api/admin/notifications/stats"),
        fetch("/api/admin/notifications/history"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.notifications || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!titleEn && !titleAr) {
      toast.error("Please enter a title");
      return;
    }
    if (!bodyEn && !bodyAr) {
      toast.error("Please enter a message body");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: titleEn || titleAr,
          titleAr: titleAr || titleEn,
          bodyEn: bodyEn || bodyAr,
          bodyAr: bodyAr || bodyEn,
          linkUrl: linkUrl || undefined,
          targetType: "ALL",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Notification sent to ${data.recipientCount} subscribers`);
        setTitleEn("");
        setTitleAr("");
        setBodyEn("");
        setBodyAr("");
        setLinkUrl("");
        fetchData();
      } else {
        toast.error("Failed to send notification");
      }
    } catch {
      toast.error("Error sending notification");
    } finally {
      setSending(false);
    }
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Push Notifications</h1>
            <p className="text-sm text-gray-500">Send notifications to subscribers</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-gray-500">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-gray-500">Inactive</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={tab === "compose" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("compose")}
          >
            <Send className="w-4 h-4 mr-1" />
            Compose
          </Button>
          <Button
            variant={tab === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("history")}
          >
            <Clock className="w-4 h-4 mr-1" />
            History
          </Button>
        </div>

        {/* Compose Tab */}
        {tab === "compose" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compose Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Title (English)
                  </label>
                  <Input
                    placeholder="Notification title..."
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    العنوان (عربي)
                  </label>
                  <Input
                    dir="rtl"
                    placeholder="عنوان الإشعار..."
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Body (English)
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Notification body..."
                    value={bodyEn}
                    onChange={(e) => setBodyEn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    المحتوى (عربي)
                  </label>
                  <textarea
                    dir="rtl"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="محتوى الإشعار..."
                    value={bodyAr}
                    onChange={(e) => setBodyAr(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Link URL (optional)
                </label>
                <Input
                  placeholder="/challenges or https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  All Subscribers
                </Badge>
              </div>

              <Button
                className="w-full bg-emerald-700 hover:bg-emerald-800"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {sending ? "Sending..." : "Send Notification"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No notifications sent yet
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((notif) => (
                    <div
                      key={notif.id}
                      className="border rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {lang === "ar" ? notif.titleAr : notif.titleEn}
                        </p>
                        <Badge
                          variant={notif.status === "SENT" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {notif.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {lang === "ar" ? notif.bodyAr : notif.bodyEn}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {notif.recipientCount} recipients
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.sentAt).toLocaleDateString()}
                        </span>
                        {notif.sentBy?.name && (
                          <span>by {notif.sentBy.name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
