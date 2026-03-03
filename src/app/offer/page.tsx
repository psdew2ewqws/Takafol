"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  HandHeart, User, FileText, Loader2, ChevronLeft, ChevronRight,
  BadgeCheck, Users, MapPin, ExternalLink, Radio, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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

interface NahnoOpportunity {
  id: string;
  title: string;
  url: string;
  image: string;
  subcategory: string;
  description: string;
  applicantsCurrent: number;
  applicantsMax: number;
  location: string;
  orgName: string;
  orgUrl: string;
  orgLogo: string;
  progressPercent: number;
  source?: "nahno" | "tua" | "volunteerworld" | "goabroad";
}

const SOURCE_STYLES = {
  nahno: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", label: "نَحْنُ" },
  tua: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "تكية أم علي" },
  volunteerworld: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Volunteer World" },
  goabroad: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", label: "GoAbroad" },
} as const;

export default function OfferHelpPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [nahnoOpportunities, setNahnoOpportunities] = useState<NahnoOpportunity[]>([]);
  const [nahnoLoading, setNahnoLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<Record<string, { success: boolean; message: string }>>({});
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;

  async function handleQuickApply(e: React.MouseEvent, opp: NahnoOpportunity) {
    e.preventDefault();
    e.stopPropagation();
    const key = `${opp.source}-${opp.id}`;
    setApplyingId(key);
    try {
      const res = await fetch("/api/nahno/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          nahnoEmail: "takafol.test@gmail.com",
          nahnoPassword: "Takafol@2026!",
          opportunityUrl: opp.url,
        }),
      });
      const data = await res.json();
      setApplyResult((prev) => ({ ...prev, [key]: { success: data.success, message: data.message } }));
    } catch {
      setApplyResult((prev) => ({ ...prev, [key]: { success: false, message: "Connection error" } }));
    } finally {
      setApplyingId(null);
    }
  }

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

  useEffect(() => {
    async function fetchNahno() {
      try {
        const res = await fetch("/api/nahno");
        const data = await res.json();
        if (data.data) setNahnoOpportunities(data.data);
      } finally {
        setNahnoLoading(false);
      }
    }
    fetchNahno();
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

      {/* Quick Actions */}
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

      {/* Live Volunteer Opportunities */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            {t("nahnoTitle")}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
            <Radio size={8} className="animate-pulse" />
            {t("nahnoLive")}
          </span>
        </div>
        <p className="mb-3 text-xs text-gray-400">{t("nahnoSubtitle")}</p>

        {nahnoLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : nahnoOpportunities.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("nahnoNoOpportunities")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {nahnoOpportunities.map((opp) => {
              const isFull = opp.applicantsMax > 0 && opp.applicantsCurrent >= opp.applicantsMax;
              const fillPercent = opp.applicantsMax > 0
                ? Math.min(100, Math.round((opp.applicantsCurrent / opp.applicantsMax) * 100))
                : 0;
              const hasProgress = opp.applicantsMax > 0;
              const src = opp.source ? SOURCE_STYLES[opp.source] : null;

              return (
                <a
                  key={`${opp.source || "x"}-${opp.id}`}
                  href={opp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className={cn(
                    "border-gray-200 transition-all hover:shadow-md hover:border-emerald-200",
                    isFull && "opacity-60"
                  )}>
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {opp.image ? (
                            <img src={opp.image} alt={opp.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <HandHeart size={24} className="text-gray-300" />
                            </div>
                          )}
                          {src && (
                            <span className={cn("absolute bottom-1 left-1 rounded px-1 py-0.5 text-[8px] font-bold", src.bg, src.text)}>
                              {src.label}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{opp.title}</h3>
                            <ExternalLink size={12} className="shrink-0 mt-0.5 text-gray-300" />
                          </div>

                          {opp.subcategory && (
                            <Badge variant="outline" className={cn(
                              "mt-1 text-[10px] px-1.5 py-0",
                              src ? `${src.border} ${src.text}` : "border-blue-200 text-blue-600"
                            )}>
                              {opp.subcategory}
                            </Badge>
                          )}

                          <div className="mt-1.5 flex items-center gap-1.5">
                            {opp.orgLogo ? (
                              <img src={opp.orgLogo} alt={opp.orgName} className="h-4 w-4 rounded-full object-cover" />
                            ) : (
                              <div className="h-4 w-4 rounded-full bg-gray-200" />
                            )}
                            <span className="text-[11px] text-gray-500 truncate">{opp.orgName}</span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                              <MapPin size={9} />
                              {opp.location || t("nahnoOnline")}
                            </span>

                            {hasProgress && (
                              <div className="flex-1 flex items-center gap-1.5">
                                <Progress value={fillPercent} className="h-1.5 flex-1" />
                                <span className={cn(
                                  "text-[10px] font-medium whitespace-nowrap",
                                  isFull ? "text-red-500" : "text-emerald-600"
                                )}>
                                  {opp.applicantsCurrent}/{opp.applicantsMax}
                                </span>
                              </div>
                            )}

                            {!isFull && opp.source === "nahno" && (
                              (() => {
                                const key = `${opp.source}-${opp.id}`;
                                const result = applyResult[key];
                                if (result?.success) {
                                  return (
                                    <span className="text-[10px] font-bold text-emerald-600">
                                      {t("nahnoApplied") || "Applied!"}
                                    </span>
                                  );
                                }
                                return (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-5 px-1.5 text-[10px] font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    disabled={applyingId === key}
                                    onClick={(e) => handleQuickApply(e, opp)}
                                  >
                                    {applyingId === key ? (
                                      <Loader2 size={10} className="animate-spin" />
                                    ) : (
                                      <>
                                        <Zap size={8} className="me-0.5" />
                                        {t("nahnoQuickApply") || "تطوع"}
                                      </>
                                    )}
                                  </Button>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}

            {/* Source links */}
            <div className="flex gap-2">
              <a
                href="https://www.nahno.org/volunteer/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/50 p-2.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-50"
              >
                <ExternalLink size={12} />
                nahno.org
              </a>
              <a
                href="https://www.tua.jo/en/volunteer-programs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 p-2.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-50"
              >
                <ExternalLink size={12} />
                tua.jo
              </a>
            </div>
          </div>
        )}
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
                      {charity.logoUrl ? (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100 overflow-hidden">
                          <img
                            src={charity.logoUrl}
                            alt={name}
                            className="h-10 w-10 object-contain p-0.5"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <HandHeart size={18} className="text-emerald-600" />
                        </div>
                      )}
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
