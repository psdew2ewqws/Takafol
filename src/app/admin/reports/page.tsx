"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Flag, Ban, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/providers/language-provider";
import { toast } from "sonner";

interface ReportUser {
  id: string;
  name: string | null;
  email: string | null;
  isBanned?: boolean;
}

interface Report {
  id: string;
  reason: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reporter: ReportUser;
  reportedUser: ReportUser;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-yellow-200 bg-yellow-50 text-yellow-700",
  REVIEWING: "border-blue-200 bg-blue-50 text-blue-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
  DISMISSED: "border-gray-200 bg-gray-50 text-gray-700",
};

export default function AdminReportsPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  const STATUS_LABELS: Record<string, string> = {
    PENDING: t("pending"),
    REVIEWING: t("reviewing"),
    RESOLVED: t("resolved"),
    DISMISSED: t("dismissed"),
  };

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") return;
    fetchReports();
  }, [session]);

  async function fetchReports() {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.data) setReports(data.data);
    } finally {
      setLoading(false);
    }
  }

  async function updateReport(reportId: string, status: string, banUser = false) {
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          adminNote: noteInputs[reportId] || null,
          banUser,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(t("updatedSuccess"));
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? data.data : r)),
        );
      } else {
        toast.error(t("errorOccurred"));
      }
    } catch {
      toast.error(t("errorOccurred"));
    } finally {
      setActionLoading(null);
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
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-emerald-900">{t("adminReports")}</h2>

      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Flag className="mb-2 h-8 w-8" />
            <p>{t("noReports")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="border-emerald-100">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={STATUS_COLORS[report.status] || ""}>
                        {STATUS_LABELS[report.status] || report.status}
                      </Badge>
                      {report.reportedUser.isBanned && (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-xs text-red-700">
                          <Ban className="mx-0.5 h-3 w-3" /> {t("bannedBadge")}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm">
                      <span className="text-muted-foreground">{t("reporter")}:</span>{" "}
                      {report.reporter.name} ({report.reporter.email})
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t("reportedUser")}:</span>{" "}
                      {report.reportedUser.name} ({report.reportedUser.email})
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <span className="font-medium text-muted-foreground">{t("reportReason")}:</span>{" "}
                  {report.reason}
                </div>

                {report.adminNote && (
                  <div className="rounded-lg bg-blue-50 p-3 text-sm">
                    <span className="font-medium text-blue-700">{t("adminNote")}:</span>{" "}
                    {report.adminNote}
                  </div>
                )}

                {report.status === "PENDING" || report.status === "REVIEWING" ? (
                  <div className="space-y-2">
                    <Input
                      placeholder={t("adminNote")}
                      value={noteInputs[report.id] || ""}
                      onChange={(e) =>
                        setNoteInputs({ ...noteInputs, [report.id]: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReport(report.id, "DISMISSED")}
                        disabled={actionLoading === report.id}
                        className="border-gray-200 text-gray-600"
                      >
                        {actionLoading === report.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <><XCircle className="mx-1 h-3 w-3" /> {t("dismiss")}</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReport(report.id, "RESOLVED")}
                        disabled={actionLoading === report.id}
                        className="border-green-200 text-green-600"
                      >
                        <CheckCircle2 className="mx-1 h-3 w-3" /> {t("resolve")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReport(report.id, "RESOLVED", true)}
                        disabled={actionLoading === report.id}
                        className="border-red-200 text-red-600"
                      >
                        <Ban className="mx-1 h-3 w-3" /> {t("ban")}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
