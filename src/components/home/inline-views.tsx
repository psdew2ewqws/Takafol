"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Loader2, Plus, Sparkles, Heart, BadgeCheck, Users, DollarSign, Calendar, Copy, Check, CreditCard, Building2, MapPin, ExternalLink, Radio, HandHeart } from "lucide-react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PostCard } from "@/components/posts/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import type { PostWithRelations, Category, District, UrgencyLevel } from "@/types";

const ALL_VALUE = "__all__";

// ── Nahno Opportunity Interface ──
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
  source?: "nahno" | "tua";
}

const SOURCE_STYLES = {
  nahno: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", label: "نَحْنُ" },
  tua: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", label: "تكية أم علي" },
} as const;

// ── Browse Offers (for request flow) ──
export function InlineBrowseOffers() {
  const { lang, t } = useLanguage();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryId, setCategoryId] = useState(ALL_VALUE);
  const [districtId, setDistrictId] = useState(ALL_VALUE);
  const [urgency, setUrgency] = useState(ALL_VALUE);
  const [search, setSearch] = useState("");

  // Nahno opportunities
  const [nahnoOpportunities, setNahnoOpportunities] = useState<NahnoOpportunity[]>([]);
  const [nahnoLoading, setNahnoLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/districts")])
      .then(([catRes, distRes]) => Promise.all([catRes.json(), distRes.json()]))
      .then(([catData, distData]) => {
        if (catData.data) setCategories(catData.data);
        if (distData.data) setDistricts(distData.data);
      });
  }, []);

  // Fetch Nahno opportunities
  useEffect(() => {
    async function fetchNahno() {
      try {
        const res = await fetch("/api/nahno");
        const data = await res.json();
        if (data.data) setNahnoOpportunities(data.data);
      } finally { setNahnoLoading(false); }
    }
    fetchNahno();
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: "OFFER" });
    if (categoryId !== ALL_VALUE) params.set("categoryId", categoryId);
    if (districtId !== ALL_VALUE) params.set("districtId", districtId);
    if (urgency !== ALL_VALUE) params.set("urgency", urgency);
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.data) { setPosts(data.data.posts); setTotal(data.data.total); }
    } finally { setLoading(false); }
  }, [categoryId, districtId, urgency, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Filter nahno opportunities by search
  const filteredNahno = search.trim()
    ? nahnoOpportunities.filter((o) =>
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.orgName.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase())
      )
    : nahnoOpportunities;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-emerald-900">{t("helpOffersFeed")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("helpOffersFeedDesc")}</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input placeholder={t("searchOffers")} value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 h-11 text-base" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn("h-11 w-11", showFilters && "border-emerald-300 bg-emerald-50")}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:grid-cols-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allCategories")}</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("district")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allDistricts")}</SelectItem>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("urgency")} /></SelectTrigger>
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

      {/* Nahno Live Opportunities */}
      {!nahnoLoading && filteredNahno.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("nahnoTitle")}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
              <Radio size={8} className="animate-pulse" />
              {t("nahnoLive")}
            </span>
          </div>
          <div className="space-y-2">
            {filteredNahno.map((opp) => {
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
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
          <a
            href="https://www.nahno.org/volunteer/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            <ExternalLink size={14} />
            {t("nahnoViewOnNahno")}
          </a>
        </div>
      )}

      {nahnoLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={`nahno-${i}`} className="h-24 rounded-xl" />)}
        </div>
      )}

      {/* Takafol User Offers */}
      <div className="space-y-3">
        {(total > 0 || filteredNahno.length > 0) && (
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {lang === "ar" ? "عروض من مستخدمي تكافل" : "Offers from Takafol Users"}
          </p>
        )}
        <p className="text-sm text-gray-400">{total} {t("offersCount")}</p>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        ) : posts.length === 0 ? (
          <div className="py-10 text-center"><p className="text-base text-gray-400">{t("noOffersNow")}</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
        )}
      </div>
    </div>
  );
}

// ── Create Request (inline form) ──
export function InlineCreateRequest({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/districts")])
      .then(([catRes, distRes]) => Promise.all([catRes.json(), distRes.json()]))
      .then(([catData, distData]) => {
        if (catData.data) setCategories(catData.data);
        if (distData.data) setDistricts(distData.data);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!description.trim() || !districtId) { setError(t("unexpectedError")); return; }
    if (description.length < 10) { setError(`${t("charsMin")}: 10`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "REQUEST",
          description: description.trim(),
          categoryId: categoryId || categories[0]?.id,
          districtId, urgency,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("unexpectedError")); return; }
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch { setError(t("unexpectedError")); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="py-14 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <p className="text-lg font-bold text-gray-900">{lang === "ar" ? "تم نشر طلبك بنجاح!" : "Your request was published!"}</p>
        <Button size="default" variant="outline" onClick={() => router.push("/request/offers")} className="text-sm">
          {t("browseOffers")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-amber-900">{t("requestHelpFormTitle")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("requestHelpFormSubtitle")}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inline-desc" className="text-sm font-medium">{t("explainRequest")}</Label>
        <Textarea id="inline-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("descriptionRequestPlaceholder")} rows={5} maxLength={2000} className="resize-none text-base" />
        <p className="text-xs text-gray-400">{description.length}/2000</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("urgencyLevel")} *</Label>
          <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
            <SelectTrigger className="h-11 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{t("urgencyLow")}</SelectItem>
              <SelectItem value="MEDIUM">{t("urgencyMedium")}</SelectItem>
              <SelectItem value="HIGH">{t("urgencyHigh")}</SelectItem>
              <SelectItem value="CRITICAL">{t("urgencyCritical")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("district")} *</Label>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("selectDistrict")} /></SelectTrigger>
            <SelectContent>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("categoryOptional")}</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Button type="submit" disabled={loading} className="w-full bg-amber-600 text-white hover:bg-amber-700 h-12 text-base font-medium">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("publishRequest")}
      </Button>
    </form>
  );
}

// ── Personal Contribution (offer flow) ──
export function InlinePersonalOffer({ onCreateOffer }: { onCreateOffer?: () => void }) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => { if (d.data) setCategories(d.data); });
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: "REQUEST" });
    if (selectedCategory !== "all") params.set("categoryId", selectedCategory);
    try {
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.data) setPosts(data.data.posts);
    } finally { setLoading(false); }
  }, [selectedCategory]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-900">{t("personalOfferTitle")}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("personalOfferSubtitle")}</p>
        </div>
        <Button size="default" onClick={() => onCreateOffer ? onCreateOffer() : router.push("/offer/personal/create")} className="bg-amber-600 text-white hover:bg-amber-700 h-10 text-sm">
          <Plus className="h-4 w-4 me-1" />
          {t("createOffer")}
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setSelectedCategory("all")} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors", selectedCategory === "all" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{t("all")}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors", selectedCategory === c.id ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {c.icon} {lang === "ar" ? c.nameAr : c.nameEn}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-base text-gray-400">{t("noRequestsInCategory")}</p>
          <Button size="default" onClick={() => onCreateOffer ? onCreateOffer() : router.push("/offer/personal/create")} className="mt-4 bg-amber-600 text-white hover:bg-amber-700 text-sm">{t("createOffer")}</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      )}
    </div>
  );
}

// ── Browse Requests (offer flow) ──
export function InlineBrowseRequests() {
  const { lang, t } = useLanguage();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryId, setCategoryId] = useState(ALL_VALUE);
  const [districtId, setDistrictId] = useState(ALL_VALUE);
  const [urgency, setUrgency] = useState(ALL_VALUE);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/districts")])
      .then(([catRes, distRes]) => Promise.all([catRes.json(), distRes.json()]))
      .then(([catData, distData]) => {
        if (catData.data) setCategories(catData.data);
        if (distData.data) setDistricts(distData.data);
      });
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
      if (data.data) { setPosts(data.data.posts); setTotal(data.data.total); }
    } finally { setLoading(false); }
  }, [categoryId, districtId, urgency, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-emerald-900">{t("helpRequestsFeed")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("helpRequestsFeedDesc")}</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input placeholder={t("searchRequests")} value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 h-11 text-base" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn("h-11 w-11", showFilters && "border-emerald-300 bg-emerald-50")}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4 sm:grid-cols-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allCategories")}</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("district")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allDistricts")}</SelectItem>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("urgency")} /></SelectTrigger>
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
      <p className="text-sm text-gray-400">{total} {t("requestsCount")}</p>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="py-14 text-center"><p className="text-base text-gray-400">{t("noRequestsNow")}</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      )}
    </div>
  );
}

// ── AI Classify Hook (for create offer) ──
function useAiClassify(
  description: string,
  categories: Category[],
  setCategoryId: (id: string) => void,
  userOverrode: React.MutableRefObject<boolean>,
) {
  const [aiSuggestion, setAiSuggestion] = useState<{ categoryId: string; confidence: number } | null>(null);
  const [classifying, setClassifying] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const classify = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (text.trim().length < 10) { setAiSuggestion(null); return; }
      setClassifying(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/ai/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          const data = await res.json();
          if (data.data?.categoryId && data.data.confidence > 0) {
            setAiSuggestion(data.data);
            if (!userOverrode.current) setCategoryId(data.data.categoryId);
          }
        } catch { /* silently fail */ }
        finally { setClassifying(false); }
      }, 500);
    },
    [categories, setCategoryId, userOverrode],
  );

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return { aiSuggestion, classifying, classify };
}

// ── Create Offer (inline form) ──
export function InlineCreateOffer({ onSuccess }: { onSuccess?: () => void }) {
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const userOverrode = useRef(false);
  const { aiSuggestion, classifying, classify } = useAiClassify(description, categories, setCategoryId, userOverrode);

  useEffect(() => {
    Promise.all([fetch("/api/categories"), fetch("/api/districts")])
      .then(([catRes, distRes]) => Promise.all([catRes.json(), distRes.json()]))
      .then(([catData, distData]) => {
        if (catData.data) setCategories(catData.data);
        if (distData.data) setDistricts(distData.data);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!description.trim() || !districtId) { setError(t("unexpectedError")); return; }
    if (description.length < 10) { setError(`${t("charsMin")}: 10`); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "OFFER",
          description: description.trim(),
          categoryId: categoryId || categories[0]?.id,
          districtId, urgency,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || t("unexpectedError")); return; }
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch { setError(t("unexpectedError")); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="py-14 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <p className="text-lg font-bold text-gray-900">{lang === "ar" ? "تم نشر عرضك بنجاح!" : "Your offer was published!"}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-emerald-900">{t("createOfferTitle")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("createOfferSubtitle")}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inline-offer-desc" className="text-sm font-medium">{t("explainOffer")}</Label>
        <Textarea id="inline-offer-desc" value={description} onChange={(e) => { setDescription(e.target.value); classify(e.target.value); }} placeholder={t("descriptionOfferPlaceholder")} rows={5} maxLength={2000} className="resize-none text-base" />
        <p className="text-xs text-gray-400">{description.length}/2000</p>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("categoryOptional")}</Label>
        {(classifying || aiSuggestion) && (
          <div className="flex items-center gap-2 text-sm">
            {classifying ? (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("classifying")}
              </span>
            ) : aiSuggestion && aiSuggestion.confidence > 0 ? (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                {t("aiSuggests")}: {categories.find((c) => c.id === aiSuggestion.categoryId)?.icon}{" "}
                {lang === "ar"
                  ? categories.find((c) => c.id === aiSuggestion.categoryId)?.nameAr
                  : categories.find((c) => c.id === aiSuggestion.categoryId)?.nameEn}{" "}
                ({aiSuggestion.confidence}%)
              </Badge>
            ) : null}
          </div>
        )}
        <Select value={categoryId} onValueChange={(v) => { userOverrode.current = true; setCategoryId(v); }}>
          <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("district")} *</Label>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger className="h-11 text-sm"><SelectValue placeholder={t("selectDistrict")} /></SelectTrigger>
            <SelectContent>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("priorityLevel")}</Label>
          <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
            <SelectTrigger className="h-11 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{t("urgencyLow")}</SelectItem>
              <SelectItem value="MEDIUM">{t("urgencyMedium")}</SelectItem>
              <SelectItem value="HIGH">{t("urgencyHigh")}</SelectItem>
              <SelectItem value="CRITICAL">{t("urgencyCritical")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <Button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white hover:bg-emerald-800 h-12 text-base font-medium">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("publishOffer")}
      </Button>
    </form>
  );
}

// ── Copyable Field (for charity payment info) ──
function CopyableField({ icon, label, value, copyValue }: { icon: React.ReactNode; label: string; value: string; copyValue?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue || value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may not be available */ }
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-mono font-bold text-gray-900 truncate">{value}</p>
      </div>
      <button onClick={handleCopy} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all cursor-pointer">
        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

// ── Charity Detail (inline view) ──
interface InlineCharityDetailProps {
  charityId: string;
}

interface VolunteerProgram {
  id: string;
  title: string;
  titleAr: string;
  description: string | null;
  descriptionAr: string | null;
  capacity: number;
  enrolled: number;
  isActive: boolean;
}

interface CharityDetail {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  logoUrl: string | null;
  website: string | null;
  cliqAlias: string | null;
  iban: string | null;
  isVerified: boolean;
  volunteerPrograms: VolunteerProgram[];
  _count: { zakatDonations: number; volunteerPrograms: number };
}

export function InlineCharityDetail({ charityId }: InlineCharityDetailProps) {
  const { data: session } = useSession();
  const { lang, t } = useLanguage();
  const [charity, setCharity] = useState<CharityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Zakat form
  const [donationAmount, setDonationAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);

  // Volunteering
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCharity() {
      try {
        const res = await fetch(`/api/charities/${charityId}`);
        const data = await res.json();
        if (data.data) setCharity(data.data);
      } finally { setLoading(false); }
    }
    if (charityId) fetchCharity();
  }, [charityId]);

  async function handleDonate() {
    if (!donationAmount || Number(donationAmount) <= 0) return;
    setDonating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDonated(true);
    setDonating(false);
  }

  async function handleApply(programId: string) {
    setApplyingTo(programId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setApplied((prev) => new Set(prev).add(programId));
    setApplyingTo(null);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="py-14 text-center">
        <p className="text-base text-gray-500">{t("charityNotFound")}</p>
      </div>
    );
  }

  const charityName = lang === "ar" ? charity.nameAr : charity.name;
  const charityDesc = lang === "ar"
    ? (charity.descriptionAr || charity.description)
    : (charity.description || charity.descriptionAr);

  return (
    <div className="space-y-5">
      {/* Charity Header */}
      <Card className="border-emerald-100">
        <CardContent className="flex flex-col items-center p-6 text-center">
          {charity.logoUrl ? (
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <img src={charity.logoUrl} alt={charityName} className="h-20 w-20 object-contain p-2" />
            </div>
          ) : (
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
              <Heart className="h-10 w-10 text-emerald-600" />
            </div>
          )}
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-xl font-bold text-emerald-900">{charityName}</h1>
            {charity.isVerified && <BadgeCheck className="h-5 w-5 text-emerald-600" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? charity.name : charity.nameAr}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{charityDesc}</p>
          <div className="mt-3 flex gap-3">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
              {charity._count.zakatDonations} {t("donations")}
            </Badge>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
              <Users className="mx-1 h-3 w-3" />
              {charity._count.volunteerPrograms} {t("programs")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* CliQ & IBAN Payment Info */}
      {(charity.cliqAlias || charity.iban) && (
        <Card className="border-emerald-100">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {lang === "ar" ? "طرق التبرع المباشر" : "Direct Donation Methods"}
            </p>
            {charity.cliqAlias && (
              <CopyableField
                icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
                label={lang === "ar" ? "كليك (CliQ)" : "CliQ Alias"}
                value={charity.cliqAlias}
              />
            )}
            {charity.iban && (
              <CopyableField
                icon={<Building2 className="h-4 w-4 text-blue-600" />}
                label={lang === "ar" ? "رقم الحساب (IBAN)" : "IBAN"}
                value={charity.iban.replace(/(.{4})/g, "$1 ").trim()}
                copyValue={charity.iban}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs: Zakat + Volunteering */}
      <Tabs defaultValue="zakat">
        <TabsList className="w-full">
          <TabsTrigger value="zakat" className="flex-1">
            <DollarSign className="mx-1 h-4 w-4" />
            {t("zakatDonate")}
          </TabsTrigger>
          <TabsTrigger value="volunteer" className="flex-1">
            <Calendar className="mx-1 h-4 w-4" />
            {t("volunteerPrograms")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zakat">
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-900">{t("zakatDonation")}</CardTitle>
            </CardHeader>
            <CardContent>
              {donated ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700">{t("donationSuccess")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("donationThanks")} {donationAmount} JOD {t("toCharity")} {charityName}
                  </p>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-muted-foreground">
                    {t("receiptNumber")} TKF-{Date.now().toString(36).toUpperCase()}
                  </div>
                  <Button variant="outline" onClick={() => { setDonated(false); setDonationAmount(""); }}>
                    {t("donateAgain")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {["5", "10", "25", "50"].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setDonationAmount(amount)}
                        className={cn("text-sm", donationAmount === amount && "border-emerald-300 bg-emerald-50 text-emerald-700")}
                      >
                        {amount} JOD
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inline-amount">{t("customAmount")}</Label>
                    <Input id="inline-amount" type="number" min="1" placeholder={t("enterAmount")} value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} dir="ltr" />
                  </div>
                  <Button
                    onClick={handleDonate}
                    disabled={donating || !donationAmount || Number(donationAmount) <= 0}
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
                  >
                    {donating ? <Loader2 className="h-4 w-4 animate-spin" /> : `${t("donate")} ${donationAmount ? donationAmount + " JOD" : ""}`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteer">
          {charity.volunteerPrograms.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">{t("noPrograms")}</div>
          ) : (
            <div className="space-y-3">
              {charity.volunteerPrograms.map((program) => {
                const fillPercent = program.capacity > 0 ? Math.round((program.enrolled / program.capacity) * 100) : 0;
                const isFull = program.enrolled >= program.capacity && program.capacity > 0;
                const hasApplied = applied.has(program.id);
                const programTitle = lang === "ar" ? program.titleAr : program.title;
                const programDesc = lang === "ar" ? (program.descriptionAr || program.description) : (program.description || program.descriptionAr);
                return (
                  <Card key={program.id} className="border-emerald-100">
                    <CardContent className="p-4">
                      <h3 className="mb-1 font-bold text-emerald-900">{programTitle}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">{programDesc}</p>
                      <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{program.enrolled} {t("volunteer")}</span>
                          <span>{t("of")} {program.capacity}</span>
                        </div>
                        <Progress value={fillPercent} className="h-2" />
                      </div>
                      <Button
                        onClick={() => handleApply(program.id)}
                        disabled={isFull || hasApplied || applyingTo === program.id || !session}
                        variant={hasApplied ? "outline" : "default"}
                        className={cn("w-full", hasApplied ? "border-green-200 text-green-700" : "bg-emerald-700 text-white hover:bg-emerald-800")}
                      >
                        {applyingTo === program.id ? <Loader2 className="h-4 w-4 animate-spin" /> : hasApplied ? t("applied") : isFull ? t("full") : t("applyVolunteer")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
