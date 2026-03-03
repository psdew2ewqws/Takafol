"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HelpCircle, Loader2, ArrowRight, ArrowLeft, Sparkles, MapPin, X, Camera, Upload, ImageIcon } from "lucide-react";
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

export default function CreateRequestPage() {
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const userOverrode = useRef(false);
  const { aiSuggestion, classifying, classify } = useAiClassify(description, categories, setCategoryId, userOverrode);

  function requestLocation() {
    if (!navigator.geolocation) {
      toast.error(t("locationUnavailable"));
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationLoading(false);
        toast.success(t("locationDetected"));
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(t("locationDenied"));
        } else {
          toast.error(t("locationFailed"));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function clearLocation() {
    setLatitude(null);
    setLongitude(null);
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "takafol_unsigned");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        toast.success(t("imageUploaded"));
      } else {
        throw new Error("No URL returned");
      }
    } catch {
      toast.error(t("imageUploadFailed"));
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setImageUploading(false);
    }
  }

  function clearImage() {
    setImageUrl(null);
    setImagePreview(null);
  }

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

    if (!description.trim() || !districtId || !categoryId) {
      toast.error(t("unexpectedError"));
      return;
    }
    if (latitude === null || longitude === null) {
      toast.error(t("locationRequired"));
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
          type: "REQUEST",
          description: description.trim(),
          categoryId,
          districtId,
          urgency,
          ...(latitude !== null && longitude !== null ? { latitude, longitude } : {}),
          ...(imageUrl ? { imageUrl } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("unexpectedError"));
        return;
      }
      toast.success(t("postPublished"));
      router.push("/request/offers");
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
        onClick={() => router.push("/request")}
        className="mb-4 text-muted-foreground"
      >
        <BackArrow className="mx-1 h-4 w-4" />
        {t("back")}
      </Button>

      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-amber-900">
            {t("requestHelpFormTitle")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("requestHelpFormSubtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("explainRequest")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); classify(e.target.value); }}
                placeholder={t("descriptionRequestPlaceholder")}
                rows={5}
                maxLength={2000}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{description.length}/2000</p>
            </div>

            {/* Image Upload (optional) */}
            <div className="space-y-2">
              <Label>{t("addPhotoOptional")}</Label>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img src={imagePreview} alt="" className="h-48 w-full rounded-xl object-cover" />
                  {imageUploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                  {!imageUploading && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-sm font-bold text-white hover:bg-black/70"
                      aria-label={t("removeImage")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 px-4 py-5 transition-colors hover:bg-amber-100"
                  >
                    <Camera className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">{t("takePhoto")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 transition-colors hover:bg-gray-100"
                  >
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">{t("chooseFile")}</span>
                  </button>
                </div>
              )}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label htmlFor="urgency">{t("urgencyLevel")} *</Label>
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

            {/* Location (optional) */}
            <div className="space-y-2">
              <Label>{t("myLocation")} *</Label>
              {latitude !== null && longitude !== null ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="flex-1 text-sm text-emerald-800">
                    {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </span>
                  <button
                    type="button"
                    onClick={clearLocation}
                    className="rounded-full p-0.5 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700"
                    aria-label={t("removeLocation")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestLocation}
                  disabled={locationLoading}
                  className="w-full justify-center gap-2 border-dashed"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("locationLoading")}
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      {t("detectLocation")}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Category (optional) */}
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white hover:bg-amber-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("publishRequest")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
