import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/daily-challenge
 *
 * CRON endpoint to generate today's daily challenge.
 * Called by external CRON service (Railway, Vercel, etc.) at midnight UTC+3.
 *
 * Requires CRON_SECRET env var for authentication.
 * Configure CRON service to send: x-cron-secret header or ?secret= query param.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // Validate CRON secret from header or query param
  const headerSecret = request.headers.get("x-cron-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const providedSecret = headerSecret || querySecret;

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Forward to the generate endpoint
  const baseUrl = request.nextUrl.origin;
  const res = await fetch(`${baseUrl}/api/challenges/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cronSecret ? { "x-cron-secret": cronSecret } : {}),
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
