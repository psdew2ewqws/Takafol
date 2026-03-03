"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HandHeart, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
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
import type { Category, District, UrgencyLevel } from "@/types";

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
      const [catData, distData] = await Promise.all([catRes.json(), distRes.json()]);
      if (catData.data) setCategories(catData.data);
      if (distData.data) setDistricts(distData.data);
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!description.trim() || !districtId) {
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
          type: "OFFER",
          description: description.trim(),
          categoryId: categoryId || categories[0]?.id,
          districtId,
          urgency,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("unexpectedError"));
        return;
      }
      router.push("/offer/personal");
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
                onChange={(e) => setDescription(e.target.value)}
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

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

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
