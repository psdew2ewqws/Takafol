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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  isVerified: boolean;
  volunteerPrograms: VolunteerProgram[];
  _count: { zakatDonations: number; volunteerPrograms: number };
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

  // Volunteering
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

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

  async function handleDonate() {
    if (!donationAmount || Number(donationAmount) <= 0) return;
    setDonating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDonated(true);
    setDonating(false);
  }

  async function handleApply(programId: string) {
    setApplyingTo(programId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setApplied((prev) => new Set(prev).add(programId));
    setApplyingTo(null);
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
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
            <Heart className="h-10 w-10 text-emerald-600" />
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
              {donated ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700">{t("donationSuccess")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("donationThanks")} {donationAmount} JOD {t("toCharity")} {charityName}
                  </p>
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-muted-foreground">
                    {t("receiptNumber")} TKF-{Date.now().toString(36).toUpperCase()}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => { setDonated(false); setDonationAmount(""); }}
                  >
                    {t("donateAgain")}
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
                    onClick={handleDonate}
                    disabled={donating || !donationAmount || Number(donationAmount) <= 0}
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
                  >
                    {donating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `${t("donate")} ${donationAmount ? donationAmount + " JOD" : ""}`
                    )}
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
                        onClick={() => handleApply(program.id)}
                        disabled={isFull || hasApplied || applyingTo === program.id || !session}
                        variant={hasApplied ? "outline" : "default"}
                        className={cn(
                          "w-full",
                          hasApplied
                            ? "border-green-200 text-green-700"
                            : "bg-emerald-700 text-white hover:bg-emerald-800",
                        )}
                      >
                        {applyingTo === program.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : hasApplied ? (
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
    </div>
  );
}
