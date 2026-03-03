"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function LoginButton() {
  return (
    <Button
      asChild
      variant="outline"
      className="gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
    >
      <Link href="/login">
        <LogIn className="h-4 w-4" />
        <span>تسجيل الدخول</span>
      </Link>
    </Button>
  );
}
