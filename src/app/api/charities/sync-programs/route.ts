import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const execAsync = promisify(exec);

interface ScrapedProgram {
  externalId: string;
  charityId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  capacity: number;
  enrolled: number;
}

interface ScrapeResult {
  programs: ScrapedProgram[];
  scrapedAt: string;
  totalCount: number;
}

const DATA_FILE = path.join(process.cwd(), "data", "charity-programs.json");
const STALE_MINUTES = 60; // Re-scrape if older than 1 hour

function isStale(scrapedAt: string): boolean {
  return Date.now() - new Date(scrapedAt).getTime() > STALE_MINUTES * 60 * 1000;
}

function getCachedData(): ScrapeResult | null {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ScrapeResult;
  } catch {
    return null;
  }
}

async function triggerScrapeAndSync(): Promise<void> {
  try {
    console.log("[sync-api] Triggering background scrape + sync...");
    execAsync("npx tsx scripts/sync-charity-programs.ts --scrape", {
      cwd: process.cwd(),
      timeout: 180000,
    }).catch((err) => {
      console.error("[sync-api] Background sync failed:", err.message);
    });
  } catch (err) {
    console.error("[sync-api] Failed to start sync:", err);
  }
}

/**
 * GET /api/charities/sync-programs
 *
 * Returns current program data. Auto-triggers re-scrape if data is stale.
 * Programs are also synced to the DB automatically.
 */
export async function GET() {
  const cached = getCachedData();

  // If no cache or stale, trigger background scrape+sync
  if (!cached || isStale(cached.scrapedAt)) {
    triggerScrapeAndSync();

    if (!cached) {
      return NextResponse.json({
        status: "scraping",
        message: "First scrape triggered. Data will be available shortly.",
        totalCount: 0,
      });
    }
  }

  // Return DB programs grouped by charity
  const programs = await prisma.volunteerProgram.findMany({
    where: { isActive: true },
    include: {
      charity: { select: { id: true, name: true, nameAr: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { charityId: "asc" },
  });

  return NextResponse.json({
    status: "ok",
    scrapedAt: cached?.scrapedAt,
    totalCount: programs.length,
    data: programs,
  });
}
