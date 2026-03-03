"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) ?? "؟";

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="h-9 w-9 border-2 border-emerald-600">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
          {session.user.name}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="gap-2">
            <User className="h-4 w-4" />
            الملف الشخصي
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            لوحة التحكم
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
