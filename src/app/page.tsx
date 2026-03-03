"use client";

import Link from "next/link";
import { HandHeart, HelpCircle, Star, Shield, Users, Heart } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export default function HomePage() {
  const { t } = useLanguage();

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
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <Heart className="h-8 w-8 fill-amber-400 text-amber-400" />
              </div>
            </div>

            <h1 className="mb-4 text-5xl font-bold tracking-tight text-white md:text-7xl">
              {t("appName")}
            </h1>

            <p className="mb-2 text-xl font-medium text-amber-300 md:text-2xl">
              {t("heroSubtitle")}
            </p>

            <p className="mb-10 text-base text-emerald-100/80 md:text-lg max-w-xl mx-auto whitespace-pre-line">
              {t("heroDescription")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/offer"
                className="flex h-36 w-36 flex-col items-center justify-center gap-3 rounded-2xl bg-white text-emerald-800 shadow-lg shadow-emerald-900/30 transition-colors hover:bg-emerald-50 font-bold"
              >
                <HandHeart className="h-8 w-8" />
                <span className="text-base">{t("offerHelp")}</span>
              </Link>

              <Link
                href="/request"
                className="flex h-36 w-36 flex-col items-center justify-center gap-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-900/30 transition-colors hover:bg-amber-600 font-bold"
              >
                <HelpCircle className="h-8 w-8" />
                <span className="text-base">{t("requestHelp")}</span>
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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="mb-12 text-center text-2xl font-bold text-emerald-800 md:text-3xl">
          {t("howItWorks")}
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Users className="h-7 w-7 text-emerald-600" />}
            title={t("featureDirectContact")}
            description={t("featureDirectContactDesc")}
          />
          <FeatureCard
            icon={<Shield className="h-7 w-7 text-emerald-600" />}
            title={t("featureBlockchain")}
            description={t("featureBlockchainDesc")}
          />
          <FeatureCard
            icon={<Star className="h-7 w-7 text-amber-500" />}
            title={t("featureImpact")}
            description={t("featureImpactDesc")}
          />
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
