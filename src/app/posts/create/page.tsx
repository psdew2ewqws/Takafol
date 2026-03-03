"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { HandHeart, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import type { Category, District, PostType, UrgencyLevel } from "@/types";

export default function CreatePostPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <CreatePostForm />
    </Suspense>
  );
}

function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();

  const initialType = (searchParams.get("type") as PostType) || "OFFER";
  const [postType, setPostType] = useState<PostType>(initialType);
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("MEDIUM");
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    async function fetchData() {
      const [catRes, distRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/districts"),
      ]);
      const catData = await catRes.json();
      const distData = await distRes.json();
      if (catData.data) setCategories(catData.data);
      if (distData.data) setDistricts(distData.data);
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!categoryId || !districtId || !description.trim()) {
      setError(t("unexpectedError"));
      return;
    }

    if (description.length < 10) {
      setError(`${t("charsMin")}: 10`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: postType,
          categoryId,
          districtId,
          urgency,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("unexpectedError"));
        return;
      }

      router.push("/posts");
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) return null;

  const isOffer = postType === "OFFER";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="border-emerald-100">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            {isOffer ? (
              <HandHeart className="h-7 w-7 text-emerald-700" />
            ) : (
              <HelpCircle className="h-7 w-7 text-amber-600" />
            )}
          </div>
          <CardTitle className="text-xl font-bold text-emerald-900">
            {isOffer ? t("offerHelpLabel") : t("requestHelpLabel")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isOffer ? t("createOfferSubtitle") : t("requestHelpFormSubtitle")}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type Toggle */}
            <div className="flex gap-2 rounded-lg bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setPostType("OFFER")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
                  isOffer
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-gray-600 hover:text-emerald-700",
                )}
              >
                <HandHeart className="h-4 w-4" />
                {t("toggleOffer")}
              </button>
              <button
                type="button"
                onClick={() => setPostType("REQUEST")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
                  !isOffer
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-amber-600",
                )}
              >
                <HelpCircle className="h-4 w-4" />
                {t("toggleRequest")}
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">{t("category")} *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {lang === "ar" ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">{t("district")} *</Label>
              <Select value={districtId} onValueChange={setDistrictId}>
                <SelectTrigger id="district">
                  <SelectValue placeholder={t("selectDistrict")} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((dist) => (
                    <SelectItem key={dist.id} value={dist.id}>
                      {lang === "ar" ? dist.nameAr : dist.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label htmlFor="urgency">{t("priorityLevel")}</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                <SelectTrigger id="urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">{t("urgencyLow")}</SelectItem>
                  <SelectItem value="MEDIUM">{t("urgencyMedium")}</SelectItem>
                  <SelectItem value="HIGH">{t("urgencyHigh")}</SelectItem>
                  <SelectItem value="CRITICAL">{t("urgencyCritical")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("descriptionLabel")} *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isOffer ? t("descriptionOfferPlaceholder") : t("descriptionRequestPlaceholder")}
                rows={5}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/2000 ({t("charsMin")}: 10)
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full text-white",
                isOffer
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-amber-600 hover:bg-amber-700",
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isOffer ? (
                t("publishOffer")
              ) : (
                t("publishRequest")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
