"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HandHeart, User, FileText, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CharityCard } from "@/components/charity/charity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";

interface Charity {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  _count?: { volunteerPrograms: number; zakatDonations: number };
}

export default function OfferHelpPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const BackArrow = lang === "ar" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    async function fetchCharities() {
      try {
        const res = await fetch("/api/charities");
        const data = await res.json();
        if (data.data) setCharities(data.data);
      } finally {
        setLoading(false);
      }
    }
    fetchCharities();
  }, []);

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
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
          <HandHeart className="h-7 w-7 text-emerald-700" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-900">{t("offerHubTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("offerHubSubtitle")}</p>
      </div>

      {/* Charity Platforms */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-bold text-emerald-900">{t("charityPlatforms")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("charityPlatformsDesc")}</p>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {charities.map((charity) => (
              <CharityCard key={charity.id} charity={charity} lang={lang} />
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* من عندي + Requests Feed */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/offer/personal">
          <Card className="group h-full cursor-pointer border-amber-200 bg-amber-50/50 transition-all hover:border-amber-300 hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 transition-transform group-hover:scale-105">
                <User className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-amber-900">{t("personalContribution")}</h3>
              <p className="text-sm text-amber-700/80">{t("personalContributionDesc")}</p>
              <span className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600">
                {t("browseOrCreateOffer")}
                <BackArrow className="h-3 w-3" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/offer/requests">
          <Card className="group h-full cursor-pointer border-emerald-200 bg-emerald-50/50 transition-all hover:border-emerald-300 hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 transition-transform group-hover:scale-105">
                <FileText className="h-7 w-7 text-emerald-700" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-emerald-900">{t("browseRequests")}</h3>
              <p className="text-sm text-emerald-700/80">{t("browseRequestsDesc")}</p>
              <span className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
                {t("viewAllRequests")}
                <BackArrow className="h-3 w-3" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
