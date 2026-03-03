"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  HandHeart, User, FileText, Loader2, ChevronLeft, ChevronRight,
  BadgeCheck, Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;

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
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-emerald-900">{t("offerHubTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("offerHubSubtitle")}</p>
      </div>

      {/* Quick Actions — From Me + Browse Requests */}
      <div className="mb-6 space-y-2">
        <Link href="/offer/personal">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:bg-gray-50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <User size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{t("personalContribution")}</p>
              <p className="text-xs text-gray-500">{t("personalContributionDesc")}</p>
            </div>
            <Arrow size={16} className="shrink-0 text-gray-400" />
          </div>
        </Link>

        <Link href="/offer/requests">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition-colors hover:bg-gray-50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <FileText size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{t("browseRequests")}</p>
              <p className="text-xs text-gray-500">{t("browseRequestsDesc")}</p>
            </div>
            <Arrow size={16} className="shrink-0 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Charities List */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-gray-500 uppercase tracking-wider">{t("charityPlatforms")}</h2>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : charities.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("noCharitiesYet")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200">
            <CardContent className="p-0">
              {charities.map((charity, i) => {
                const name = lang === "ar" ? charity.nameAr : charity.name;
                const desc = lang === "ar"
                  ? (charity.descriptionAr || charity.description)
                  : (charity.description || charity.descriptionAr);
                return (
                  <Link key={charity.id} href={`/offer/charities/${charity.id}`}>
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                      i < charities.length - 1 && "border-b border-gray-100"
                    )}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                        <HandHeart size={18} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                          {charity.isVerified && <BadgeCheck size={14} className="shrink-0 text-emerald-600" />}
                        </div>
                        {desc && (
                          <p className="text-xs text-gray-500 truncate">{desc}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {charity._count && charity._count.volunteerPrograms > 0 && (
                          <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700">
                            <Users size={10} className="me-0.5" />
                            {charity._count.volunteerPrograms}
                          </Badge>
                        )}
                        <Arrow size={16} className="text-gray-300" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
