import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

interface SubscribeBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

interface UnsubscribeBody {
  endpoint: string;
}

/**
 * POST /api/notifications/subscribe
 * Save (upsert) a push subscription. Links to the current user if logged in.
 * Body: { endpoint, keys: { p256dh, auth }, userAgent? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    const body = (await request.json()) as SubscribeBody;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "endpoint and keys (p256dh, auth) are required" },
        { status: 400 },
      );
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      update: {
        p256dhKey: body.keys.p256dh,
        authKey: body.keys.auth,
        userAgent: body.userAgent ?? null,
        isActive: true,
        // Link to user if session present
        ...(session?.user?.id ? { userId: session.user.id } : {}),
      },
      create: {
        endpoint: body.endpoint,
        p256dhKey: body.keys.p256dh,
        authKey: body.keys.auth,
        userAgent: body.userAgent ?? null,
        isActive: true,
        userId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json<ApiResponse<{ id: string }>>(
      { data: { id: subscription.id }, message: "Subscription saved" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[notifications/subscribe] POST error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: "Failed to save push subscription" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Deactivate a push subscription by endpoint.
 * Body: { endpoint }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as UnsubscribeBody;

    if (!body.endpoint) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "endpoint is required" },
        { status: 400 },
      );
    }

    await prisma.pushSubscription.updateMany({
      where: { endpoint: body.endpoint },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse<null>>(
      { data: null, message: "Unsubscribed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[notifications/subscribe] DELETE error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}
