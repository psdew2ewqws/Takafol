"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HelpCircle, Eye, PenSquare, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";

export default function RequestHelpPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const BackArrow = lang === "ar" ? ArrowLeft : ArrowRight;

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
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <HelpCircle className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-amber-900">{t("requestHubTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("requestHubSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/request/offers">
          <Card className="group h-full cursor-pointer border-emerald-200 bg-emerald-50/50 transition-all hover:border-emerald-300 hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 transition-transform group-hover:scale-105">
                <Eye className="h-7 w-7 text-emerald-700" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-emerald-900">{t("browseOffers")}</h3>
              <p className="text-sm text-emerald-700/80">{t("browseOffersDesc")}</p>
              <span className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
                {t("viewAllOffers")}
                <BackArrow className="h-3 w-3" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/request/create">
          <Card className="group h-full cursor-pointer border-amber-200 bg-amber-50/50 transition-all hover:border-amber-300 hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 transition-transform group-hover:scale-105">
                <PenSquare className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-amber-900">{t("createRequest")}</h3>
              <p className="text-sm text-amber-700/80">{t("createRequestDesc")}</p>
              <span className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600">
                {t("createNewRequest")}
                <BackArrow className="h-3 w-3" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
