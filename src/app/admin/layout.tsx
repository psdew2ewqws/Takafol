"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Heart,
  BookOpen,
  Flag,
  Users,
  BarChart3,
  Shield,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "adminDashboard" as const, href: "/admin", icon: LayoutDashboard },
  { key: "adminCharities" as const, href: "/admin/charities", icon: Heart },
  { key: "adminPrograms" as const, href: "/admin/programs", icon: BookOpen },
  { key: "adminReports" as const, href: "/admin/reports", icon: Flag },
  { key: "adminUsers" as const, href: "/admin/users", icon: Users },
  { key: "adminAnalytics" as const, href: "/admin/analytics", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") return null;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <Shield className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">{t("adminPanel")}</h1>
          <p className="text-sm text-muted-foreground">{t("adminSubtitle")}</p>
        </div>
      </div>

      {/* Mobile: horizontal scroll tabs */}
      <div className="mb-6 overflow-x-auto md:hidden">
        <div className="flex gap-1 rounded-lg bg-gray-50 p-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-gray-600 hover:text-emerald-700",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-700",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
