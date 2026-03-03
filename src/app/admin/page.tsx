"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  FileText,
  Link2,
  CheckCircle2,
  Ban,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/components/providers/language-provider";

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalConnections: number;
  completedConnections: number;
  activePosts: number;
  bannedUsers: number;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isBanned: boolean;
  impactScore: number;
  tasksCompleted: number;
  createdAt: string;
  _count: { posts: number };
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const STAT_ITEMS = [
    { key: "totalUsers" as const, label: t("totalUsers"), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { key: "totalPosts" as const, label: t("totalPosts"), icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "totalConnections" as const, label: t("totalConnections"), icon: Link2, color: "text-purple-600", bg: "bg-purple-50" },
    { key: "completedConnections" as const, label: t("completedLabel"), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { key: "activePosts" as const, label: t("activeLabel"), icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { key: "bannedUsers" as const, label: t("banned"), icon: Ban, color: "text-red-600", bg: "bg-red-50" },
  ];

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingBan, setTogglingBan] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.user?.role !== "ADMIN") return;

    async function fetchData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
        ]);
        const [statsData, usersData] = await Promise.all([
          statsRes.json(),
          usersRes.json(),
        ]);
        if (statsData.data) setStats(statsData.data);
        if (usersData.data) setUsers(usersData.data.users);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  async function toggleBan(userId: string, currentlyBanned: boolean) {
    setTogglingBan(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBanned: !currentlyBanned }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentlyBanned } : u)),
        );
      }
    } finally {
      setTogglingBan(null);
    }
  }

  async function searchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.data) setUsers(data.data.users);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {STAT_ITEMS.map((item) => (
            <Card key={item.key} className="border-emerald-100">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stats[item.key]}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Users Management */}
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-emerald-900">
            {t("userManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchUsers")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                className="pr-10"
              />
            </div>
            <Button
              onClick={searchUsers}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {t("search")}
            </Button>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                      {user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user.name}</span>
                      {user.role === "ADMIN" && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                          {t("admin")}
                        </Badge>
                      )}
                      {user.isBanned && (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-xs text-red-700">
                          {t("bannedBadge")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {user._count.posts} {t("post")}
                  </span>
                  {user.role !== "ADMIN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBan(user.id, user.isBanned)}
                      disabled={togglingBan === user.id}
                      className={
                        user.isBanned
                          ? "border-green-200 text-green-600 hover:bg-green-50"
                          : "border-red-200 text-red-600 hover:bg-red-50"
                      }
                    >
                      {togglingBan === user.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : user.isBanned ? (
                        t("unban")
                      ) : (
                        t("ban")
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
