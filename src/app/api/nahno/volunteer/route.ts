import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { auth } from "@/auth";

const execAsync = promisify(exec);

/**
 * POST /api/nahno/volunteer
 *
 * Automates volunteer application on nahno.org using Playwright.
 *
 * Body: {
 *   action: "apply" | "login" | "register",
 *   nahnoEmail: string,
 *   nahnoPassword: string,
 *   opportunityUrl?: string,     // Required for "apply"
 *   firstName?: string,          // Required for "register"
 *   lastName?: string,           // Required for "register"
 * }
 */
export async function POST(request: NextRequest) {
  // Require authenticated Takafol user
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, nahnoEmail, nahnoPassword, opportunityUrl, firstName, lastName } = body;

    if (!action || !nahnoEmail || !nahnoPassword) {
      return NextResponse.json(
        { error: "Missing required fields: action, nahnoEmail, nahnoPassword" },
        { status: 400 }
      );
    }

    let command: string;

    switch (action) {
      case "login":
        command = `npx tsx scripts/nahno-volunteer-bot.ts login "${nahnoEmail}" "${nahnoPassword}"`;
        break;

      case "apply":
        if (!opportunityUrl) {
          return NextResponse.json(
            { error: "opportunityUrl is required for apply action" },
            { status: 400 }
          );
        }
        command = `npx tsx scripts/nahno-volunteer-bot.ts apply "${nahnoEmail}" "${nahnoPassword}" "${opportunityUrl}"`;
        break;

      case "register":
        if (!firstName || !lastName) {
          return NextResponse.json(
            { error: "firstName and lastName required for register action" },
            { status: 400 }
          );
        }
        command = `npx tsx scripts/nahno-volunteer-bot.ts register "${firstName}" "${lastName}" "${nahnoEmail}" "${nahnoPassword}"`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: login, apply, or register" },
          { status: 400 }
        );
    }

    console.log(`[nahno-volunteer] Running: ${action} for ${nahnoEmail}`);

    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minute timeout for Playwright
    });

    // Parse the JSON result from stdout (last line)
    const lines = stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1];

    let result;
    try {
      result = JSON.parse(lastLine);
    } catch {
      result = { success: false, message: stdout || stderr };
    }

    return NextResponse.json({
      ...result,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[nahno-volunteer] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
