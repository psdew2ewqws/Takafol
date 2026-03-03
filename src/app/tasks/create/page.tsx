"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight, ArrowLeft, Check, Loader2,
  UtensilsCrossed, Shirt, GraduationCap, Paintbrush, Sparkles, Truck, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "food", labelEn: "Food", labelAr: "طعام", icon: UtensilsCrossed, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "clothes", labelEn: "Clothes", labelAr: "ملابس", icon: Shirt, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "education", labelEn: "Education", labelAr: "تعليم", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "painting", labelEn: "Painting", labelAr: "دهان", icon: Paintbrush, color: "text-pink-600", bg: "bg-pink-50" },
  { key: "cleaning", labelEn: "Cleaning", labelAr: "تنظيف", icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "delivery", labelEn: "Delivery", labelAr: "توصيل", icon: Truck, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "other", labelEn: "Other", labelAr: "أخرى", icon: HelpCircle, color: "text-gray-600", bg: "bg-gray-100" },
];

const STEPS_EN = ["Category", "Details", "Impact", "Review"];
const STEPS_AR = ["الفئة", "التفاصيل", "الأثر", "المراجعة"];

export default function CreateTaskPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "", title: "", description: "", location: "", maxVolunteers: "5", impactLetter: "",
  });

  const STEPS = lang === "ar" ? STEPS_AR : STEPS_EN;
  const userId = session?.user?.id || "demo-user-001";
  const userName = session?.user?.name || "Demo User";

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed() {
    if (step === 0) return form.category !== "";
    if (step === 1) return form.title.trim() !== "" && form.description.trim() !== "" && parseInt(form.maxVolunteers) > 0;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: userId,
          creatorName: userName,
          ...form,
          maxVolunteers: parseInt(form.maxVolunteers),
        }),
      });
      if (res.ok) router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCat = CATEGORIES.find((c) => c.key === form.category);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* Back */}
      <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-medium mb-4">
        <ArrowRight size={16} className="rtl:rotate-180" />
        {lang === "ar" ? "العودة" : "Back"}
      </button>

      <h1 className="text-xl font-bold text-emerald-900 mb-1">
        {lang === "ar" ? "إنشاء مهمة" : "Create Task"}
      </h1>
      <p className="text-lg font-bold text-gray-900 mb-4">{STEPS[step]}</p>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {STEPS.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= step ? "bg-emerald-600" : "bg-gray-200")} />
        ))}
      </div>

      {/* Step 0: Category */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = form.category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => update("category", cat.key)}
                className={cn(
                  "flex flex-col items-center gap-2.5 py-6 rounded-xl border-2 transition-all",
                  selected ? `${cat.bg} border-current ${cat.color} ring-2 ring-emerald-100` : "bg-white border-gray-200 hover:border-gray-300"
                )}
              >
                <Icon size={28} className={selected ? cat.color : "text-gray-400"} strokeWidth={1.8} />
                <span className={cn("text-sm font-bold", selected ? cat.color : "text-gray-600")}>
                  {lang === "ar" ? cat.labelAr : cat.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{lang === "ar" ? "عنوان المهمة" : "Task Title"}</Label>
            <Input placeholder={lang === "ar" ? "مثال: توزيع وجبات إفطار" : "e.g., Distribute Iftar Meals"} value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "الوصف" : "Description"}</Label>
            <Textarea placeholder={lang === "ar" ? "ماذا سيفعل المتطوعون؟" : "What will volunteers be doing?"} value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "الموقع" : "Location"}</Label>
            <Input placeholder={lang === "ar" ? "مثال: وسط عمان" : "e.g., Downtown Amman"} value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{lang === "ar" ? "أقصى عدد متطوعين" : "Max Volunteers"}</Label>
            <Input type="number" min="1" max="100" value={form.maxVolunteers} onChange={(e) => update("maxVolunteers", e.target.value)} dir="ltr" />
          </div>
        </div>
      )}

      {/* Step 2: Impact Letter */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-emerald-800 mb-1">
                {lang === "ar" ? "اكتب رسالة الأثر" : "Write an Impact Letter"}
              </h3>
              <p className="text-xs text-gray-500">
                {lang === "ar" ? "أخبر المتطوعين لماذا هذه المهمة مهمة" : "Tell volunteers why this task matters"}
              </p>
            </CardContent>
          </Card>
          <Textarea
            placeholder={lang === "ar" ? "لماذا هذه المهمة مهمة؟ ما الأثر الذي ستحدثه؟" : "Why does this task matter? What impact will it create?"}
            value={form.impactLetter}
            onChange={(e) => update("impactLetter", e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-400 text-end">{form.impactLetter.length}</p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-3">
          <Card className="border-emerald-100">
            <CardContent className="p-4 space-y-3">
              {selectedCat && (
                <Badge variant="outline" className={cn("capitalize", selectedCat.color, selectedCat.bg)}>
                  {lang === "ar" ? selectedCat.labelAr : selectedCat.labelEn}
                </Badge>
              )}
              <h3 className="text-base font-bold text-gray-900">{form.title}</h3>
              <p className="text-sm text-gray-600">{form.description}</p>
              {form.location && <p className="text-xs text-gray-500">{lang === "ar" ? "الموقع:" : "Location:"} {form.location}</p>}
              <p className="text-xs text-gray-500">{lang === "ar" ? "أقصى عدد متطوعين:" : "Max Volunteers:"} {form.maxVolunteers}</p>
            </CardContent>
          </Card>

          {form.impactLetter && (
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                  {lang === "ar" ? "رسالة الأثر" : "Impact Letter"}
                </p>
                <p className="text-sm text-gray-600 italic">&ldquo;{form.impactLetter}&rdquo;</p>
              </CardContent>
            </Card>
          )}

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <p className="text-xs text-amber-700 font-medium">
              {lang === "ar"
                ? "سيتم إرسال مهمتك للموافقة. بعد الموافقة يمكن للمتطوعين الانضمام."
                : "Your task will be submitted for approval. Once approved, volunteers can join."}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6">
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
            {lang === "ar" ? "متابعة" : "Continue"} <ArrowLeft size={16} className="ms-2 rtl:rotate-180" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
            {submitting ? <><Loader2 size={16} className="animate-spin me-2" /> {lang === "ar" ? "جاري الإرسال..." : "Submitting..."}</> : (
              <><Check size={16} className="me-2" /> {lang === "ar" ? "إرسال المهمة" : "Submit Task"}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
