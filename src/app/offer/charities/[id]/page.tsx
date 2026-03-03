"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  ArrowLeft,
  BadgeCheck,
  Heart,
  Users,
  Loader2,
  DollarSign,
  Calendar,
  Copy,
  Check,
  CreditCard,
  Building2,
  X,
  Phone,
  UserCircle,
  FileText,
  ImagePlus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

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

interface Charity {
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

function CharityLogo({ src, alt, size = 20 }: { src: string; alt: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <Heart className="text-emerald-600" style={{ width: size, height: size }} />;
  return (
    <img
      src={src}
      alt={alt}
      className="object-contain p-2"
      style={{ width: size * 2, height: size * 2 }}
      onError={() => setBroken(true)}
    />
  );
}

export default function CharityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { lang, t } = useLanguage();
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);

  // Zakat form
  const [donationAmount, setDonationAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);
  const [donationStep, setDonationStep] = useState<"amount" | "payment" | "success">("amount");
  const [pointsEarned, setPointsEarned] = useState(0);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Volunteering
  const [applied, setApplied] = useState<Set<string>>(new Set());

  // Volunteer application form
  const [formOpen, setFormOpen] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    async function fetchCharity() {
      try {
        const res = await fetch(`/api/charities/${id}`);
        const data = await res.json();
        if (data.data) setCharity(data.data);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCharity();
  }, [id]);

  // Pre-fill form from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setFormName(session.user.name);
    }
  }, [session]);

  function handleShowPayment() {
    if (!donationAmount || Number(donationAmount) <= 0) return;
    setDonationStep("payment");
  }

  function handleReceiptSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleConfirmDonation() {
    if (!donationAmount || Number(donationAmount) <= 0 || !charity || !receiptImage) return;
    setDonating(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId: charity.id, amount: Number(donationAmount), receiptImage }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setPointsEarned(data.data.pointsEarned);
      } else {
        // Even if API fails (not logged in), still show success for the transfer confirmation
        setPointsEarned(Math.floor(Number(donationAmount) * 10));
      }
    } catch {
      setPointsEarned(Math.floor(Number(donationAmount) * 10));
    }
    setDonationStep("success");
    setDonated(true);
    setDonating(false);
  }

  function openApplicationForm(programId: string) {
    setFormOpen(programId);
    setFormSuccess(false);
  }

  async function handleSubmitApplication() {
    if (!formOpen || !formName.trim() || !formPhone.trim()) return;
    setFormSubmitting(true);
    try {
      const res = await fetch(`/api/programs/${formOpen}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formName.trim(),
          phone: formPhone.trim(),
          note: formNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplied((prev) => new Set(prev).add(formOpen));
        setFormSuccess(true);
        // Update enrolled count locally
        if (charity) {
          setCharity({
            ...charity,
            volunteerPrograms: charity.volunteerPrograms.map((p) =>
              p.id === formOpen ? { ...p, enrolled: p.enrolled + 1 } : p
            ),
          });
        }
      } else {
        if (data.error?.includes("مسبقاً")) {
          setApplied((prev) => new Set(prev).add(formOpen));
          setFormSuccess(true);
        }
      }
    } catch {
      // Handle error silently
    } finally {
      setFormSubmitting(false);
    }
  }

  function closeForm() {
    setFormOpen(null);
    setFormSuccess(false);
    setFormNote("");
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-4 h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-lg font-medium text-gray-500">{t("charityNotFound")}</p>
        <Button variant="outline" onClick={() => router.push("/offer")} className="mt-4">
          {t("back")}
        </Button>
      </div>
    );
  }

  const charityName = lang === "ar" ? charity.nameAr : charity.name;
  const charityDesc = lang === "ar"
    ? (charity.descriptionAr || charity.description)
    : (charity.description || charity.descriptionAr);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
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

      {/* Charity Header */}
      <Card className="mb-6 border-emerald-100">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 border border-gray-100 overflow-hidden">
            {charity.logoUrl ? (
              <CharityLogo src={charity.logoUrl} alt={charityName} size={20} />
            ) : (
              <Heart className="h-10 w-10 text-emerald-600" />
            )}
          </div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-xl font-bold text-emerald-900">{charityName}</h1>
            {charity.isVerified && <BadgeCheck className="h-5 w-5 text-emerald-600" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? charity.name : charity.nameAr}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {charityDesc}
          </p>
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
        <Card className="mb-6 border-emerald-100">
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

        {/* Zakat Donation Tab */}
        <TabsContent value="zakat">
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-900">{t("zakatDonation")}</CardTitle>
            </CardHeader>
            <CardContent>
              {donationStep === "success" ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700">{t("donationRecorded")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("donationThanks")} {donationAmount} JOD {t("toCharity")} {charityName}
                  </p>
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-1">
                    <p className="text-2xl font-bold text-emerald-700">+{pointsEarned}</p>
                    <p className="text-xs font-medium text-emerald-600">{t("pointsEarned")}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => { setDonated(false); setDonationAmount(""); setDonationStep("amount"); setPointsEarned(0); setReceiptImage(null); }}
                  >
                    {t("donateAgain")}
                  </Button>
                </div>
              ) : donationStep === "payment" ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setDonationStep("amount")}
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <ArrowRight className="h-3 w-3 rotate-180" />
                    {t("backToAmount")}
                  </button>

                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-1">
                    <p className="text-xs text-emerald-600 font-medium">{t("amountToTransfer")}</p>
                    <p className="text-3xl font-bold text-emerald-800">{donationAmount} JOD</p>
                    <p className="text-xs text-emerald-500">= {Math.floor(Number(donationAmount) * 10)} {t("pointsEarned")}</p>
                  </div>

                  <p className="text-sm text-center text-gray-600">{t("transferInstructions")}</p>

                  {charity.cliqAlias || charity.iban ? (
                    <div className="space-y-3">
                      {charity.cliqAlias && (
                        <CopyableField
                          icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
                          label={lang === "ar" ? "كليك (CliQ)" : "CliQ Alias"}
                          value={charity.cliqAlias}
                        />
                      )}
                      {charity.iban && (
                        <>
                          {charity.cliqAlias && (
                            <p className="text-center text-xs text-gray-400">{t("orUseIban")}</p>
                          )}
                          <CopyableField
                            icon={<Building2 className="h-4 w-4 text-blue-600" />}
                            label={lang === "ar" ? "رقم الحساب (IBAN)" : "IBAN"}
                            value={charity.iban.replace(/(.{4})/g, "$1 ").trim()}
                            copyValue={charity.iban}
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center space-y-2">
                      <p className="text-sm text-amber-700">{t("noPaymentInfo")}</p>
                      {charity.website && (
                        <a
                          href={charity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
                        >
                          {t("visitWebsite")} ↗
                        </a>
                      )}
                    </div>
                  )}

                  {/* Receipt upload section */}
                  <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                      <ImagePlus className="h-4 w-4" />
                      {t("uploadTransferProof")}
                    </div>
                    <p className="text-xs text-gray-500">{t("uploadTransferProofDesc")}</p>

                    {receiptImage ? (
                      <div className="space-y-2">
                        <div className="relative rounded-lg overflow-hidden border border-emerald-200">
                          <img
                            src={receiptImage}
                            alt="Transfer receipt"
                            className="w-full max-h-48 object-contain bg-white"
                          />
                        </div>
                        <label className="flex items-center justify-center gap-2 text-xs text-emerald-700 cursor-pointer hover:underline">
                          <Upload className="h-3 w-3" />
                          {t("changeImage")}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleReceiptSelect}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white p-6 cursor-pointer hover:bg-emerald-50 transition-colors">
                        <Upload className="h-8 w-8 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700">{t("chooseImage")}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleReceiptSelect}
                        />
                      </label>
                    )}
                  </div>

                  <Button
                    onClick={handleConfirmDonation}
                    disabled={donating || !receiptImage}
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800 h-12 text-base"
                  >
                    {donating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="mx-1 h-4 w-4" />
                        {t("confirmAndSend")}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick amounts */}
                  <div className="grid grid-cols-4 gap-2">
                    {["5", "10", "25", "50"].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setDonationAmount(amount)}
                        className={cn(
                          "text-sm",
                          donationAmount === amount &&
                            "border-emerald-300 bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {amount} JOD
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">{t("customAmount")}</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      placeholder={t("enterAmount")}
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      dir="ltr"
                    />
                  </div>

                  <Button
                    onClick={handleShowPayment}
                    disabled={!donationAmount || Number(donationAmount) <= 0}
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
                  >
                    {`${t("donate")} ${donationAmount ? donationAmount + " JOD" : ""}`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volunteering Tab */}
        <TabsContent value="volunteer">
          {charity.volunteerPrograms.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t("noPrograms")}
            </div>
          ) : (
            <div className="space-y-3">
              {charity.volunteerPrograms.map((program) => {
                const fillPercent = program.capacity > 0
                  ? Math.round((program.enrolled / program.capacity) * 100)
                  : 0;
                const isFull = program.enrolled >= program.capacity && program.capacity > 0;
                const hasApplied = applied.has(program.id);

                const programTitle = lang === "ar" ? program.titleAr : program.title;
                const programDesc = lang === "ar"
                  ? (program.descriptionAr || program.description)
                  : (program.description || program.descriptionAr);

                return (
                  <Card key={program.id} className="border-emerald-100">
                    <CardContent className="p-4">
                      <h3 className="mb-1 font-bold text-emerald-900">{programTitle}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {programDesc}
                      </p>

                      {/* Capacity bar */}
                      <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{program.enrolled} {t("volunteer")}</span>
                          <span>{t("of")} {program.capacity}</span>
                        </div>
                        <Progress value={fillPercent} className="h-2" />
                      </div>

                      <Button
                        onClick={() => openApplicationForm(program.id)}
                        disabled={isFull || hasApplied}
                        variant={hasApplied ? "outline" : "default"}
                        className={cn(
                          "w-full",
                          hasApplied
                            ? "border-green-200 text-green-700"
                            : "bg-emerald-700 text-white hover:bg-emerald-800",
                        )}
                      >
                        {hasApplied ? (
                          t("applied")
                        ) : isFull ? (
                          t("full")
                        ) : (
                          t("applyVolunteer")
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Volunteer Application Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-5 shadow-xl animate-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">
            {formSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-700">{t("applicationSuccess")}</h3>
                <p className="text-sm text-muted-foreground">{t("applicationSuccessDesc")}</p>
                <Button variant="outline" onClick={closeForm} className="mt-2">
                  {t("back")}
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">{t("volunteerFormTitle")}</h3>
                    <p className="text-xs text-muted-foreground">{t("volunteerFormSubtitle")}</p>
                  </div>
                  <button
                    onClick={closeForm}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vol-name" className="flex items-center gap-1.5 text-sm">
                      <UserCircle className="h-3.5 w-3.5 text-emerald-600" />
                      {t("fullName")} *
                    </Label>
                    <Input
                      id="vol-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t("fullNamePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vol-phone" className="flex items-center gap-1.5 text-sm">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      {t("phoneNumber")} *
                    </Label>
                    <Input
                      id="vol-phone"
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder={t("phonePlaceholder")}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vol-note" className="flex items-center gap-1.5 text-sm">
                      <FileText className="h-3.5 w-3.5 text-emerald-600" />
                      {t("volunteerNote")}
                    </Label>
                    <textarea
                      id="vol-note"
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder={t("volunteerNotePlaceholder")}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitApplication}
                    disabled={formSubmitting || !formName.trim() || !formPhone.trim()}
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
                  >
                    {formSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("submitApplication")
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyableField({
  icon,
  label,
  value,
  copyValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyValue?: string;
}) {
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
      <button
        onClick={handleCopy}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all cursor-pointer"
      >
        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
