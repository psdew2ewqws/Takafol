"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { HandHeart, HelpCircle, Loader2, Sparkles } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Category, District, PostType, UrgencyLevel } from "@/types";

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
      if (text.trim().length < 10) {
        setAiSuggestion(null);
        return;
      }
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
            if (!userOverrode.current) {
              setCategoryId(data.data.categoryId);
            }
          }
        } catch {
          // silently fail
        } finally {
          setClassifying(false);
        }
      }, 500);
    },
    [categories, setCategoryId, userOverrode],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { aiSuggestion, classifying, classify };
}

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
  const userOverrode = useRef(false);
  const { aiSuggestion, classifying, classify } = useAiClassify(description, categories, setCategoryId, userOverrode);

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

    if (!categoryId || !districtId || !description.trim()) {
      toast.error(t("unexpectedError"));
      return;
    }

    if (description.length < 10) {
      toast.error(`${t("charsMin")}: 10`);
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
        toast.error(data.error || t("unexpectedError"));
        return;
      }

      toast.success(t("postPublished"));
      router.push("/posts");
    } catch {
      toast.error(t("unexpectedError"));
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
              {(classifying || aiSuggestion) && (
                <div className="flex items-center gap-2 text-xs">
                  {classifying ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> {t("classifying")}
                    </span>
                  ) : aiSuggestion && aiSuggestion.confidence > 0 ? (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1">
                      <Sparkles className="h-3 w-3" />
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
                onChange={(e) => { setDescription(e.target.value); classify(e.target.value); }}
                placeholder={isOffer ? t("descriptionOfferPlaceholder") : t("descriptionRequestPlaceholder")}
                rows={5}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/2000 ({t("charsMin")}: 10)
              </p>
            </div>

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
