"use client";

import Link from "next/link";
import { BadgeCheck, Users, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface CharityCardProps {
  charity: {
    id: string;
    name: string;
    nameAr: string;
    description: string | null;
    descriptionAr: string | null;
    logoUrl: string | null;
    isVerified: boolean;
    _count?: {
      volunteerPrograms: number;
      zakatDonations: number;
    };
  };
  lang?: Lang;
}

export function CharityCard({ charity, lang = "ar" }: CharityCardProps) {
  const charityName = lang === "ar" ? charity.nameAr : charity.name;
  const charityDesc = lang === "ar" ? (charity.descriptionAr || charity.description) : (charity.description || charity.descriptionAr);

  return (
    <Link href={`/offer/charities/${charity.id}`}>
      <Card className="group h-full border-emerald-100 transition-all hover:border-emerald-300 hover:shadow-lg">
        <CardContent className="flex flex-col items-center p-5 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl transition-transform group-hover:scale-105">
            <Heart className="h-8 w-8 text-emerald-600" />
          </div>

          <div className="mb-1 flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-emerald-900">{charityName}</h3>
            {charity.isVerified && <BadgeCheck className="h-4 w-4 text-emerald-600" />}
          </div>

          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {charityDesc}
          </p>

          <div className="flex gap-3">
            {charity._count && charity._count.volunteerPrograms > 0 && (
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                <Users className="mx-1 h-3 w-3" />
                {charity._count.volunteerPrograms} {t("programs", lang)}
              </Badge>
            )}
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-xs text-amber-700">
              {t("zakatDonate", lang)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
