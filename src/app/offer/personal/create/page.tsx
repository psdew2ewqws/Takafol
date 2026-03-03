"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HandHeart, Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
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
import { toast } from "sonner";
import type { Category, District, UrgencyLevel } from "@/types";

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

export default function CreatePersonalOfferPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { lang, t } = useLanguage();
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("MEDIUM");
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
      const [catData, distData] = await Promise.all([catRes.json(), distRes.json()]);
      if (catData.data) setCategories(catData.data);
      if (distData.data) setDistricts(distData.data);
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!description.trim() || !districtId) {
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
          type: "OFFER",
          description: description.trim(),
          categoryId: categoryId || categories[0]?.id,
          districtId,
          urgency,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("unexpectedError"));
        return;
      }
      toast.success(t("postPublished"));
      router.push("/offer/personal");
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

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/offer/personal")}
        className="mb-4 text-muted-foreground"
      >
        <BackArrow className="mx-1 h-4 w-4" />
        {t("back")}
      </Button>

      <Card className="border-amber-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <HandHeart className="h-7 w-7 text-amber-600" />
          </div>
          <CardTitle className="text-xl font-bold text-amber-900">
            {t("createOfferTitle")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("createOfferSubtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("explainOffer")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); classify(e.target.value); }}
                placeholder={t("descriptionOfferPlaceholder")}
                rows={5}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{description.length}/2000</p>
            </div>

            {/* Category (optional) */}
            <div className="space-y-2">
              <Label htmlFor="category">{t("categoryOptional")}</Label>
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white hover:bg-amber-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("publishOffer")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
