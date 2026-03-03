"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HandHeart, HelpCircle, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import type { TranslationKey } from "@/lib/i18n";

const NAV_ITEMS: { href: string; icon: typeof Home; labelKey: TranslationKey }[] = [
  { href: "/", icon: Home, labelKey: "navHome" },
  { href: "/offer", icon: HandHeart, labelKey: "navOffer" },
  { href: "/request", icon: HelpCircle, labelKey: "navRequest" },
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "navDashboard" },
  { href: "/profile", icon: User, labelKey: "navProfile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-100 bg-white/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                isActive
                  ? "text-emerald-700 font-semibold"
                  : "text-gray-500 hover:text-emerald-600"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-emerald-700")} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
