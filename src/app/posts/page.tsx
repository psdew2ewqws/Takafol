"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { PostWithRelations, Category, District, PostType, UrgencyLevel } from "@/types";

const ALL_VALUE = "__all__";

export default function PostsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <PostsContent />
    </Suspense>
  );
}

function PostsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, t } = useLanguage();

  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [tab, setTab] = useState(searchParams.get("type") || "all");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || ALL_VALUE);
  const [districtId, setDistrictId] = useState(searchParams.get("districtId") || ALL_VALUE);
  const [urgency, setUrgency] = useState(searchParams.get("urgency") || ALL_VALUE);
  const [search, setSearch] = useState(searchParams.get("search") || "");

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

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== "all") params.set("type", tab);
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
  }, [tab, categoryId, districtId, urgency, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">{t("posts")}</h1>
        <p className="text-sm text-muted-foreground">{t("postsSubtitle")}</p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">{t("all")}</TabsTrigger>
          <TabsTrigger value="OFFER" className="flex-1">{t("offers")}</TabsTrigger>
          <TabsTrigger value="REQUEST" className="flex-1">{t("requests")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search + Filter Toggle */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPosts")}
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

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-emerald-100 bg-emerald-50/30 p-4 sm:grid-cols-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder={t("category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {lang === "ar" ? cat.nameAr : cat.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={districtId} onValueChange={setDistrictId}>
            <SelectTrigger>
              <SelectValue placeholder={t("district")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("allDistricts")}</SelectItem>
              {districts.map((dist) => (
                <SelectItem key={dist.id} value={dist.id}>
                  {lang === "ar" ? dist.nameAr : dist.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger>
              <SelectValue placeholder={t("urgency")} />
            </SelectTrigger>
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

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {total} {t("post")}
      </p>

      {/* Post Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-gray-500">{t("noPosts")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noPostsHint")}
          </p>
          <Button
            onClick={() => router.push("/posts/create?type=OFFER")}
            className="mt-4 bg-emerald-700 text-white hover:bg-emerald-800"
          >
            {t("createPost")}
          </Button>
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
