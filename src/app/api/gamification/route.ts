import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGamificationProfile, getAllBadges, getNavbarStats } from "@/lib/gamification";

// GET /api/gamification?view=profile|badges|navbar
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "profile";

    if (view === "navbar") {
      const stats = await getNavbarStats(session.user.id);
      return NextResponse.json(stats);
    }

    if (view === "badges") {
      const allBadges = await getAllBadges();
      return NextResponse.json(allBadges);
    }

    // Full profile
    const profile = await getGamificationProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Also fetch all badge definitions for unlocked/locked display
    const allBadges = await getAllBadges();

    return NextResponse.json({ ...profile, allBadges });
  } catch (error) {
    console.error("Gamification API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
