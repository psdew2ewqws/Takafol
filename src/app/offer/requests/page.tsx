"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Loader2, ArrowRight, ArrowLeft, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostCard } from "@/components/posts/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import type { PostWithRelations, Category, District } from "@/types";

const ALL_VALUE = "__all__";

interface CharityProgram {
  id: string;
  title: string;
  titleAr: string;
  description: string | null;
  descriptionAr: string | null;
  capacity: number;
  enrolled: number;
  charity: { id: string; name: string; nameAr: string; logoUrl: string | null };
}

function SafeImage({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback?: React.ReactNode }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <>{fallback || null}</>;
  return <img src={src} alt={alt} className={className} onError={() => setBroken(true)} />;
}

export default function OfferRequestsFeedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <RequestsFeedContent />
    </Suspense>
  );
}

function RequestsFeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, t } = useLanguage();
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || ALL_VALUE);
  const [districtId, setDistrictId] = useState(searchParams.get("districtId") || ALL_VALUE);
  const [urgency, setUrgency] = useState(searchParams.get("urgency") || ALL_VALUE);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Charity programs
  const [charityPrograms, setCharityPrograms] = useState<CharityProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    async function fetchLookups() {
      const [catRes, distRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/districts"),
      ]);
      const catData = await catRes.json();
      const distData = await distRes.json();
      if (catData.data) setCategories(catData.data);
      if (distData.data) setDistricts(distData.data);
    }
    fetchLookups();
  }, []);

  useEffect(() => {
    fetch("/api/programs").then((r) => r.json()).then((d) => { if (d.data) setCharityPrograms(d.data); }).finally(() => setProgramsLoading(false));
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: "REQUEST" });
    if (categoryId !== ALL_VALUE) params.set("categoryId", categoryId);
    if (districtId !== ALL_VALUE) params.set("districtId", districtId);
    if (urgency !== ALL_VALUE) params.set("urgency", urgency);
    if (search.trim()) params.set("search", search.trim());

    try {
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setPosts(data.data.posts);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [categoryId, districtId, urgency, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPrograms = search.trim()
    ? charityPrograms.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.titleAr.includes(search) ||
        p.charity.name.toLowerCase().includes(search.toLowerCase()) ||
        p.charity.nameAr.includes(search)
      )
    : charityPrograms;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/offer")}
        className="mb-4 text-muted-foreground"
      >
        <BackArrow className="mx-1 h-4 w-4" />
        {t("back")}
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">{t("helpRequestsFeed")}</h1>
        <p className="text-sm text-muted-foreground">{t("helpRequestsFeedDesc")}</p>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchRequests")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-emerald-300 bg-emerald-50" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 sm:grid-cols-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.icon} {lang === "ar" ? cat.nameAr : cat.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger><SelectValue placeholder={t("district")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allDistricts")}</SelectItem>
              {districts.map((dist) => (
                <SelectItem key={dist.id} value={dist.id}>{lang === "ar" ? dist.nameAr : dist.nameEn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger><SelectValue placeholder={t("urgency")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allLevels")}</SelectItem>
              <SelectItem value="LOW">{t("urgencyLow")}</SelectItem>
              <SelectItem value="MEDIUM">{t("urgencyMedium")}</SelectItem>
              <SelectItem value="HIGH">{t("urgencyHigh")}</SelectItem>
              <SelectItem value="CRITICAL">{t("urgencyCritical")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Charity Volunteer Programs */}
      {!programsLoading && filteredPrograms.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("charityPrograms")}</p>
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 text-[10px] px-1.5 py-0">
              <Building2 size={8} className="mr-0.5" />{filteredPrograms.length}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPrograms.map((prog) => {
              const spotsLeft = Math.max(0, prog.capacity - prog.enrolled);
              const fillPct = prog.capacity > 0 ? Math.min(100, Math.round((prog.enrolled / prog.capacity) * 100)) : 0;
              const isFull = prog.capacity > 0 && spotsLeft === 0;
              return (
                <a key={prog.id} href={`/offer/charities/${prog.charity.id}`} className="block">
                  <Card className={`border-gray-200 transition-all hover:shadow-md hover:border-emerald-200 ${isFull ? "opacity-60" : ""}`}>
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                          {prog.charity.logoUrl ? (
                            <SafeImage src={prog.charity.logoUrl} alt={prog.charity.name} className="h-full w-full object-cover" fallback={<Building2 size={20} className="text-gray-300" />} />
                          ) : (
                            <Building2 size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{lang === "ar" ? prog.titleAr : prog.title}</h3>
                          <span className="text-[11px] text-gray-500 truncate block mt-0.5">{lang === "ar" ? prog.charity.nameAr : prog.charity.name}</span>
                          {prog.capacity > 0 && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <Progress value={fillPct} className="h-1.5 flex-1" />
                              <span className={`text-[10px] font-medium whitespace-nowrap ${isFull ? "text-red-500" : "text-emerald-600"}`}>
                                {isFull ? (lang === "ar" ? "مكتمل" : "Full") : `${spotsLeft} ${t("spotsLeft")}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      )}
      {programsLoading && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      )}

      <p className="mb-4 text-sm text-muted-foreground">{total} {t("requestsCount")}</p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-gray-500">{t("noRequestsNow")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
