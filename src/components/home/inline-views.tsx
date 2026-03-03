"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PostCard } from "@/components/posts/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import type { PostWithRelations, Category, District, UrgencyLevel } from "@/types";

const ALL_VALUE = "__all__";

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-emerald-900">{t("helpOffersFeed")}</h2>
        <p className="text-xs text-gray-500">{t("helpOffersFeedDesc")}</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder={t("searchOffers")} value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 h-9 text-sm" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn("h-9 w-9", showFilters && "border-emerald-300 bg-emerald-50")}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:grid-cols-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allCategories")}</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("district")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allDistricts")}</SelectItem>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("urgency")} /></SelectTrigger>
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
      <p className="text-xs text-gray-400">{total} {t("offersCount")}</p>
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center"><p className="text-sm text-gray-400">{t("noOffersNow")}</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      )}
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
      <div className="py-10 text-center space-y-3">
        <div className="text-4xl">✅</div>
        <p className="text-sm font-bold text-gray-900">{lang === "ar" ? "تم نشر طلبك بنجاح!" : "Your request was published!"}</p>
        <Button size="sm" variant="outline" onClick={() => router.push("/request/offers")}>
          {t("browseOffers")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-amber-900">{t("requestHelpFormTitle")}</h2>
        <p className="text-xs text-gray-500">{t("requestHelpFormSubtitle")}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inline-desc" className="text-xs">{t("explainRequest")}</Label>
        <Textarea id="inline-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("descriptionRequestPlaceholder")} rows={4} maxLength={2000} className="resize-none text-sm" />
        <p className="text-[10px] text-gray-400">{description.length}/2000</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{t("urgencyLevel")} *</Label>
          <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">{t("urgencyLow")}</SelectItem>
              <SelectItem value="MEDIUM">{t("urgencyMedium")}</SelectItem>
              <SelectItem value="HIGH">{t("urgencyHigh")}</SelectItem>
              <SelectItem value="CRITICAL">{t("urgencyCritical")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("district")} *</Label>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("selectDistrict")} /></SelectTrigger>
            <SelectContent>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">{t("categoryOptional")}</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
      <Button type="submit" disabled={loading} className="w-full bg-amber-600 text-white hover:bg-amber-700 h-10 text-sm">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("publishRequest")}
      </Button>
    </form>
  );
}

// ── Personal Contribution (offer flow) ──
export function InlinePersonalOffer() {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-900">{t("personalOfferTitle")}</h2>
          <p className="text-xs text-gray-500">{t("personalOfferSubtitle")}</p>
        </div>
        <Button size="sm" onClick={() => router.push("/offer/personal/create")} className="bg-amber-600 text-white hover:bg-amber-700 h-8 text-xs">
          <Plus className="h-3.5 w-3.5 me-1" />
          {t("createOffer")}
        </Button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setSelectedCategory("all")} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", selectedCategory === "all" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>{t("all")}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", selectedCategory === c.id ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {c.icon} {lang === "ar" ? c.nameAr : c.nameEn}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">{t("noRequestsInCategory")}</p>
          <Button size="sm" onClick={() => router.push("/offer/personal/create")} className="mt-3 bg-amber-600 text-white hover:bg-amber-700 text-xs">{t("createOffer")}</Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-emerald-900">{t("helpRequestsFeed")}</h2>
        <p className="text-xs text-gray-500">{t("helpRequestsFeedDesc")}</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder={t("searchRequests")} value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 h-9 text-sm" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn("h-9 w-9", showFilters && "border-emerald-300 bg-emerald-50")}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3 sm:grid-cols-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("category")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allCategories")}</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("district")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allDistricts")}</SelectItem>
              {districts.map((d) => <SelectItem key={d.id} value={d.id}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={t("urgency")} /></SelectTrigger>
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
      <p className="text-xs text-gray-400">{total} {t("requestsCount")}</p>
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center"><p className="text-sm text-gray-400">{t("noRequestsNow")}</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      )}
    </div>
  );
}
