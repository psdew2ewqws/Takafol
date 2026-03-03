"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ConnectionCard } from "@/components/connections/connection-card";
import { useLanguage } from "@/components/providers/language-provider";
import type { ConnectionWithRelations } from "@/types";

type TabValue = "all" | "PENDING" | "active" | "COMPLETED";

export default function ConnectionsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useLanguage();
  const [connections, setConnections] = useState<ConnectionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabValue>("all");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (!session) return;

    async function fetchConnections() {
      setLoading(true);
      try {
        const res = await fetch("/api/connections");
        const data = await res.json();
        if (data.data) setConnections(data.data);
      } finally {
        setLoading(false);
      }
    }
    fetchConnections();
  }, [session]);

  const filtered = connections.filter((c) => {
    if (tab === "all") return true;
    if (tab === "active") return c.status === "ACCEPTED" || c.status === "IN_PROGRESS";
    return c.status === tab;
  });

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">{t("myConnections")}</h1>
        <p className="text-sm text-muted-foreground">{t("connectionsSubtitle")}</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">{t("all")}</TabsTrigger>
          <TabsTrigger value="PENDING" className="flex-1">{t("pending")}</TabsTrigger>
          <TabsTrigger value="active" className="flex-1">{t("active")}</TabsTrigger>
          <TabsTrigger value="COMPLETED" className="flex-1">{t("completed")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-gray-500">{t("noConnections")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noConnectionsHint")}
          </p>
          <Button
            onClick={() => router.push("/posts")}
            className="mt-4 bg-emerald-700 text-white hover:bg-emerald-800"
          >
            {t("browsePosts")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((conn) => (
            <ConnectionCard key={conn.id} connection={conn} />
          ))}
        </div>
      )}
    </div>
  );
}
