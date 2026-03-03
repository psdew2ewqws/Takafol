"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LoginButton } from "@/components/auth/login-button";
import { UserMenu } from "@/components/auth/user-menu";
import { useLanguage } from "@/components/providers/language-provider";
import { Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white">
            <Heart className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-xl font-bold text-emerald-800">{t("appName")}</span>
        </Link>

        {/* Language Toggle + Auth */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="flex items-center gap-1.5 border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            <Globe className="h-4 w-4" />
            {lang === "ar" ? "EN" : "عربي"}
          </Button>
          {session ? <UserMenu /> : <LoginButton />}
        </div>
      </div>
    </header>
  );
}
