"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Eye, PenSquare, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";

export default function RequestHelpPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-amber-900">{t("requestHubTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("requestHubSubtitle")}</p>
      </div>

      <div className="space-y-2">
        <Link href="/request/offers">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:bg-gray-50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Eye size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{t("browseOffers")}</p>
              <p className="text-xs text-gray-500">{t("browseOffersDesc")}</p>
            </div>
            <Arrow size={16} className="shrink-0 text-gray-400" />
          </div>
        </Link>

        <Link href="/request/create">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:bg-gray-50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <PenSquare size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{t("createRequest")}</p>
              <p className="text-xs text-gray-500">{t("createRequestDesc")}</p>
            </div>
            <Arrow size={16} className="shrink-0 text-gray-400" />
          </div>
        </Link>
      </div>
    </div>
  );
}
