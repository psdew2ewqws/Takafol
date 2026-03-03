"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-800">
            <Heart className="h-8 w-8 fill-amber-400 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-800">تكافل</h1>
          <p className="text-sm text-gray-500">منصة التأثير المجتمعي الموثق</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-900">
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full gap-2 bg-emerald-700 text-white hover:bg-emerald-800 py-6 text-base font-semibold"
            >
              <LogIn className="h-5 w-5" />
              {loading ? "جاري الدخول..." : "دخول"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
