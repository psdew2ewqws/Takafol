"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, ArrowRight, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/posts/post-card";
import { useLanguage } from "@/components/providers/language-provider";
import type { PostWithRelations, Category } from "@/types";
import { cn } from "@/lib/utils";

export default function PersonalOfferPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [requests, setRequests] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "granted" | "denied" | "prompting">("loading");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  function fetchLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("granted");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("denied");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    // Directly request location — this forces the browser's native
    // permission prompt on all browsers including Firefox on localhost.
    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.data) setCategories(data.data);
    }
    fetchCategories();
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ type: "REQUEST" });
    if (selectedCategory !== "all") params.set("categoryId", selectedCategory);

    try {
      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.data) setRequests(data.data.posts);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/offer")}
        className="mb-4 text-muted-foreground"
      >
        <BackArrow className="mx-1 h-4 w-4" />
        {t("back")}
      </Button>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">{t("personalOfferTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("personalOfferSubtitle")}
          </p>
        </div>
        <Button
          onClick={() => router.push("/offer/personal/create")}
          className="bg-amber-600 text-white hover:bg-amber-700"
        >
          <Plus className="mx-1 h-4 w-4" />
          {t("createOffer")}
        </Button>
      </div>

      {/* Location permission / status banner */}
      {(locationStatus === "prompting" || locationStatus === "denied") && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <MapPin className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">{t("locationPermissionTitle")}</p>
            <p className="text-xs text-amber-700">
              {locationStatus === "denied" ? t("locationDeniedRetry") : t("locationPermissionDesc")}
            </p>
          </div>
          <Button
            size="sm"
            onClick={fetchLocation}
            className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
          >
            {t("allowLocation")}
          </Button>
        </div>
      )}
      {locationStatus === "loading" && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">{t("locationLoading")}</p>
        </div>
      )}
      {locationStatus === "granted" && userCoords && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <MapPin className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">{t("locationDetected")}</p>
        </div>
      )}

      {/* Category tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedCategory === "all"
              ? "bg-emerald-700 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          {t("all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === cat.id
                ? "bg-emerald-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {cat.icon} {lang === "ar" ? cat.nameAr : cat.nameEn}
          </button>
        ))}
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-gray-500">{t("noRequestsInCategory")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("canCreateOffer")}
          </p>
          <Button
            onClick={() => router.push("/offer/personal/create")}
            className="mt-4 bg-amber-600 text-white hover:bg-amber-700"
          >
            {t("createOffer")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((post) => (
            <PostCard key={post.id} post={post} userCoords={userCoords} />
          ))}
        </div>
      )}
    </div>
  );
}
