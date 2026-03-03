import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "البريد الإلكتروني مسجل مسبقاً" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    logger.info("User registered", "Register", { userId: user.id, email });

    return NextResponse.json<ApiResponse<{ id: string }>>(
      { data: { id: user.id }, message: "تم إنشاء الحساب بنجاح" },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Registration failed", "Register", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشل في إنشاء الحساب" },
      { status: 500 },
    );
  }
}
