"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HandHeart, HelpCircle, Star, Shield, Users, Heart,
  ClipboardList, Trophy, Telescope, Feather, Gift, Compass,
  ChevronLeft, ChevronRight, X, Eye, BadgeCheck, HeartHandshake,
  Megaphone, ArrowLeft, ArrowRight,
} from "lucide-react";
// NOTE: CTA grid uses original icons: HelpCircle, HandHeart, Trophy, ClipboardList — DO NOT change
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PopoverFormSeparator } from "@/components/ui/popover-form";
import {
  InlineBrowseOffers,
  InlineCreateRequest,
  InlinePersonalOffer,
  InlineBrowseRequests,
  InlineCreateOffer,
  InlineCharityDetail,
} from "@/components/home/inline-views";

type PopupType = "offer" | "request" | null;
type ActiveView = "browse-offers" | "create-request" | "personal" | "browse-requests" | "create-offer" | "charity-detail" | null;

interface Charity {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  _count?: { volunteerPrograms: number; zakatDonations: number };
}

export default function HomePage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [activePopup, setActivePopup] = useState<PopupType>(null);
  const [activeView, setActiveView] = useState<ActiveView>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [charitiesLoading, setCharitiesLoading] = useState(false);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [selectedCharityName, setSelectedCharityName] = useState("");
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;
  const BackArrow = lang === "ar" ? ArrowRight : ArrowLeft;

  const closePopup = useCallback(() => {
    setActiveView(null);
    setActivePopup(null);
  }, []);

  const fetchCharities = useCallback(async () => {
    if (charities.length > 0) return;
    setCharitiesLoading(true);
    try {
      const res = await fetch("/api/charities");
      const data = await res.json();
      if (data.data) setCharities(data.data);
    } finally {
      setCharitiesLoading(false);
    }
  }, [charities.length]);

  useEffect(() => {
    if (activePopup === "offer") {
      fetchCharities();
    }
  }, [activePopup, fetchCharities]);

  return (
    <div className="ramadan-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-6xl text-amber-300 gold-shimmer">☪</div>
          <div className="absolute top-20 left-20 text-4xl text-amber-300 gold-shimmer" style={{ animationDelay: "1s" }}>✦</div>
          <div className="absolute bottom-20 right-1/4 text-3xl text-amber-300 gold-shimmer" style={{ animationDelay: "2s" }}>✦</div>
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-block">
              <Heart className="h-10 w-10 fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
            </div>

            <h1 className="mb-4 text-5xl font-bold tracking-tight text-white md:text-7xl">
              {t("appName")}
            </h1>

            <p className="mb-2 text-xl font-medium text-amber-300 md:text-2xl">
              {t("heroSubtitle")}
            </p>

            <p className="mb-12 text-base text-emerald-100/80 md:text-lg max-w-xl mx-auto whitespace-pre-line">
              {t("heroDescription")}
            </p>

            {/* CTA Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <motion.button
                onClick={() => setActivePopup("request")}
                className="group relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-xl shadow-amber-900/30 cursor-pointer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="relative flex h-full flex-col items-center justify-center gap-2">
                  <HelpCircle className="h-9 w-9 text-white drop-shadow-md" strokeWidth={1.8} />
                  <span className="text-sm font-bold text-white">{t("requestHelp")}</span>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setActivePopup("offer")}
                className="group relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-emerald-50 shadow-xl shadow-emerald-950/20 cursor-pointer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex h-full flex-col items-center justify-center gap-2">
                  <HandHeart className="h-9 w-9 text-emerald-600 drop-shadow-sm" strokeWidth={1.8} />
                  <span className="text-sm font-bold text-emerald-900">{t("offerHelp")}</span>
                </div>
              </motion.button>

              <Link href="/leaderboard" className="block">
                <motion.div
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md text-white/90 hover:bg-white/[0.12] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trophy className="h-4.5 w-4.5 text-amber-300" strokeWidth={1.8} />
                  <span className="text-sm font-semibold">{t("navLeaderboard")}</span>
                </motion.div>
              </Link>

              <Link href="/tasks" className="block">
                <motion.div
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md text-white/90 hover:bg-white/[0.12] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ClipboardList className="h-4.5 w-4.5 text-amber-300" strokeWidth={1.8} />
                  <span className="text-sm font-semibold">{t("navTasks")}</span>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V80H0V40Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Popup Overlay */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center pb-6 sm:pb-0 ${activeView ? "px-2 sm:px-4" : "px-4"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
              onClick={closePopup}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Popup Card — expands when a view is active */}
            <motion.div
              className="relative w-full overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl flex flex-col"
              initial={{ opacity: 0, scale: 0.92, y: 60 }}
              animate={{
                opacity: 1, scale: 1, y: 0,
                maxWidth: activeView ? 1100 : 440,
                height: activeView ? "92vh" : "auto",
                maxHeight: activeView ? "92vh" : "85vh",
              }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                {activeView ? (
                  /* ── Inline View Content ── */
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex flex-col h-full"
                  >
                    {/* Inline View Header */}
                    <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0 border-b border-gray-100">
                      <motion.button
                        onClick={() => setActiveView(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                        whileTap={{ scale: 0.9 }}
                      >
                        <BackArrow size={20} strokeWidth={2} />
                      </motion.button>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {activeView === "browse-offers" && t("browseOffers")}
                          {activeView === "create-request" && t("createRequest")}
                          {activeView === "personal" && t("personalContribution")}
                          {activeView === "browse-requests" && t("browseRequests")}
                          {activeView === "create-offer" && t("createOffer")}
                          {activeView === "charity-detail" && selectedCharityName}
                        </p>
                      </div>
                      <button
                        onClick={closePopup}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <X size={18} strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Inline View Body */}
                    <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                      {activeView === "browse-offers" && <InlineBrowseOffers />}
                      {activeView === "create-request" && <InlineCreateRequest onSuccess={() => setActiveView(null)} />}
                      {activeView === "personal" && <InlinePersonalOffer onCreateOffer={() => setActiveView("create-offer")} />}
                      {activeView === "browse-requests" && <InlineBrowseRequests />}
                      {activeView === "create-offer" && <InlineCreateOffer onSuccess={() => setActiveView("personal")} />}
                      {activeView === "charity-detail" && selectedCharityId && <InlineCharityDetail charityId={selectedCharityId} />}
                    </div>

                    {/* Bottom accent bar */}
                    <div className="h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 shrink-0" />
                  </motion.div>
                ) : activePopup === "offer" ? (
                  /* ── Offer Menu ── */
                  <motion.div
                    key="offer-menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex flex-col max-h-[85vh]"
                  >
                    {/* Header */}
                    <div className="relative px-6 pt-6 pb-4 shrink-0">
                      <button
                        onClick={closePopup}
                        className="absolute top-4 start-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>

                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                        >
                          <HeartHandshake className="mx-auto h-9 w-9 text-emerald-600 mb-2" strokeWidth={1.6} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {t("offerHubTitle")}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{t("offerHubSubtitle")}</p>
                      </div>
                    </div>

                    <div className="mx-6 h-px bg-gray-100" />

                    <div className="overflow-y-auto flex-1 overscroll-contain">
                      <div className="p-3 space-y-1">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <PopupOption
                            icon={<Gift className="h-7 w-7 text-amber-500" strokeWidth={1.7} />}
                            title={t("personalContribution")}
                            description={t("personalContributionDesc")}
                            arrow={<Arrow size={18} className="text-gray-400" />}
                            onClick={() => setActiveView("personal")}
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <PopupOption
                            icon={<Compass className="h-7 w-7 text-emerald-600" strokeWidth={1.7} />}
                            title={t("browseRequests")}
                            description={t("browseRequestsDesc")}
                            arrow={<Arrow size={18} className="text-gray-400" />}
                            onClick={() => setActiveView("browse-requests")}
                          />
                        </motion.div>
                      </div>

                      <div className="relative px-4 py-1">
                        <div className="relative">
                          <PopoverFormSeparator width="100%" />
                        </div>
                      </div>

                      {/* Charities Section */}
                      <div className="px-4 pt-2 pb-4">
                        <motion.p
                          className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {t("charityPlatforms")}
                        </motion.p>

                        {charitiesLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-14 rounded-xl" />
                            ))}
                          </div>
                        ) : charities.length === 0 ? (
                          <motion.p
                            className="text-center text-sm text-gray-400 py-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                          >
                            {t("noCharitiesYet")}
                          </motion.p>
                        ) : (
                          <div className="rounded-2xl border border-gray-100 overflow-hidden">
                            {charities.map((charity, i) => {
                              const name = lang === "ar" ? charity.nameAr : charity.name;
                              const desc = lang === "ar"
                                ? (charity.descriptionAr || charity.description)
                                : (charity.description || charity.descriptionAr);
                              return (
                                <motion.button
                                  key={charity.id}
                                  className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-start transition-colors hover:bg-gray-50/80 cursor-pointer ${
                                    i < charities.length - 1 ? "border-b border-gray-100" : ""
                                  }`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    delay: 0.2 + i * 0.05,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    const name = lang === "ar" ? charity.nameAr : charity.name;
                                    setSelectedCharityId(charity.id);
                                    setSelectedCharityName(name);
                                    setActiveView("charity-detail");
                                  }}
                                >
                                  {charity.logoUrl ? (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100 overflow-hidden">
                                      <img
                                        src={charity.logoUrl}
                                        alt={name}
                                        className="h-9 w-9 object-contain p-0.5"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                      <HandHeart size={16} className="text-emerald-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                                      {charity.isVerified && (
                                        <BadgeCheck size={14} className="shrink-0 text-emerald-600" />
                                      )}
                                    </div>
                                    {desc && (
                                      <p className="text-xs text-gray-500 truncate mt-0.5">{desc}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {charity._count && charity._count.volunteerPrograms > 0 && (
                                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 border-emerald-200 text-emerald-700">
                                        <Users size={10} className="me-0.5" />
                                        {charity._count.volunteerPrograms}
                                      </Badge>
                                    )}
                                    <Arrow size={16} className="text-gray-400" />
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 shrink-0" />
                  </motion.div>
                ) : (
                  /* ── Request Menu ── */
                  <motion.div
                    key="request-menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="relative px-6 pt-6 pb-4">
                      <button
                        onClick={closePopup}
                        className="absolute top-4 start-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>

                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                        >
                          <Megaphone className="mx-auto h-9 w-9 text-amber-500 mb-2" strokeWidth={1.6} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {t("requestHelp")}
                        </h3>
                      </div>
                    </div>

                    <div className="mx-6 h-px bg-gray-100" />

                    <div className="p-3 space-y-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <PopupOption
                          icon={<Telescope className="h-7 w-7 text-emerald-600" strokeWidth={1.7} />}
                          title={t("browseOffers")}
                          description={t("browseOffersDesc")}
                          arrow={<Arrow size={18} className="text-gray-400" />}
                          onClick={() => setActiveView("browse-offers")}
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <PopupOption
                          icon={<Feather className="h-7 w-7 text-amber-500" strokeWidth={1.7} />}
                          title={t("createRequest")}
                          description={t("createRequestDesc")}
                          arrow={<Arrow size={18} className="text-gray-400" />}
                          onClick={() => setActiveView("create-request")}
                        />
                      </motion.div>
                    </div>

                    <div className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="mb-12 text-center text-2xl font-bold text-emerald-800 md:text-3xl">
          {t("howItWorks")}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Users className="h-7 w-7 text-emerald-600" strokeWidth={1.7} />}
            title={t("featureDirectContact")}
            description={t("featureDirectContactDesc")}
          />
          <FeatureCard
            icon={<Shield className="h-7 w-7 text-emerald-600" strokeWidth={1.7} />}
            title={t("featureBlockchain")}
            description={t("featureBlockchainDesc")}
          />
          <FeatureCard
            icon={<Star className="h-7 w-7 text-amber-500" strokeWidth={1.7} />}
            title={t("featureImpact")}
            description={t("featureImpactDesc")}
          />
        </div>
      </section>

      {/* Why Us Section */}
      <section className="border-t border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="mb-4 text-center text-2xl font-bold text-emerald-800 md:text-3xl">
            {lang === "ar" ? "لماذا تكافل؟" : "Why Takafol?"}
          </h2>
          <p className="mb-12 text-center text-sm text-gray-600 max-w-lg mx-auto">
            {lang === "ar"
              ? "هل تبرعت يوماً وسألت نفسك: هل وصل تبرعي؟ هل أحدثت فرقاً؟ مع تكافل، كل عمل خير موثق ومُثبت."
              : "Have you ever donated and asked yourself: Where did this donation go? Did I make an impact? With Takafol, every good deed is documented and proven."}
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
              <Eye className="mx-auto mb-4 h-8 w-8 text-emerald-600" strokeWidth={1.6} />
              <h3 className="mb-2 text-base font-bold text-gray-900">
                {lang === "ar" ? "شفافية كاملة" : "Full Transparency"}
              </h3>
              <p className="text-xs leading-relaxed text-gray-500">
                {lang === "ar"
                  ? "كل تبرع وكل عمل تطوعي مسجل على البلوكتشين — لا يمكن تعديله أو حذفه أو تزييفه."
                  : "Every donation and every volunteer action is recorded on blockchain — it can't be edited, deleted, or faked."}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-sm">
              <Star className="mx-auto mb-4 h-8 w-8 text-amber-500" strokeWidth={1.6} />
              <h3 className="mb-2 text-base font-bold text-gray-900">
                {lang === "ar" ? "تجربة ممتعة" : "Gamified Impact"}
              </h3>
              <p className="text-xs leading-relaxed text-gray-500">
                {lang === "ar"
                  ? "اكسب نقاط تأثير، اصعد في لوحة المتصدرين، واحصل على شهادات بلوكتشين مع كل مهمة تكملها."
                  : "Earn impact points, climb the leaderboard, and get blockchain certificates with every task you complete."}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
              <Heart className="mx-auto mb-4 h-8 w-8 text-emerald-600" strokeWidth={1.6} />
              <h3 className="mb-2 text-base font-bold text-gray-900">
                {lang === "ar" ? "صداقات حقيقية" : "Real Connections"}
              </h3>
              <p className="text-xs leading-relaxed text-gray-500">
                {lang === "ar"
                  ? "كل مهمة فرصة لتكوين صداقة جديدة وخلق ذكرى دائمة. تكافل ليس مشروع رمضان — إنه تكافل مستمر."
                  : "Every task is a chance to make a new friend and create a lasting memory. Takafol isn't a Ramadan project — it's ongoing solidarity."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-emerald-100 bg-emerald-50/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-800 md:text-3xl">☪</div>
              <div className="mt-1 text-sm text-gray-600">{t("ramadanKareem")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-800 md:text-3xl">🇯🇴</div>
              <div className="mt-1 text-sm text-gray-600">{t("districtsInJordan")}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-800 md:text-3xl">7</div>
              <div className="mt-1 text-sm text-gray-600">{t("helpCategories")}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PopupOption({
  icon,
  title,
  description,
  arrow,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  arrow: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-start transition-colors hover:bg-gray-50/80 cursor-pointer"
      whileTap={{ scale: 0.98 }}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-gray-900">{title}</p>
        <p className="text-[13px] leading-relaxed text-gray-500 line-clamp-2 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{arrow}</div>
    </motion.button>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
