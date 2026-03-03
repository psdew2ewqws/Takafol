import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface NahnoOpportunity {
  id: string;
  title: string;
  url: string;
  image: string;
  subcategory: string;
  description: string;
  applicantsCurrent: number;
  applicantsMax: number;
  applicantsText: string;
  location: string;
  orgName: string;
  orgUrl: string;
  orgLogo: string;
  progressPercent: number;
  scrapedAt: string;
}

interface ScrapeResult {
  opportunities: NahnoOpportunity[];
  scrapedAt: string;
  totalCount: number;
}

const DATA_FILE = path.join(process.cwd(), "data", "nahno-volunteers.json");
const STALE_MINUTES = 30; // Re-scrape if data is older than 30 minutes

function isStale(scrapedAt: string): boolean {
  const diff = Date.now() - new Date(scrapedAt).getTime();
  return diff > STALE_MINUTES * 60 * 1000;
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

async function triggerScrape(): Promise<void> {
  try {
    console.log("[nahno-api] Triggering background scrape...");
    execAsync("npx tsx scripts/scrape-nahno.ts", {
      cwd: process.cwd(),
      timeout: 60000,
    }).catch((err) => {
      console.error("[nahno-api] Background scrape failed:", err.message);
    });

    // Also sync charity volunteer programs in background
    execAsync("npx tsx scripts/sync-charity-programs.ts --scrape", {
      cwd: process.cwd(),
      timeout: 180000,
    }).catch((err) => {
      console.error("[nahno-api] Background charity sync failed:", err.message);
    });
  } catch (err) {
    console.error("[nahno-api] Failed to start scrape:", err);
  }
}

export async function GET() {
  const cached = getCachedData();

  // If no cache, trigger scrape and return empty
  if (!cached) {
    triggerScrape();
    return NextResponse.json({
      data: [],
      scrapedAt: null,
      totalCount: 0,
      status: "scraping",
      message: "First scrape triggered. Data will be available shortly.",
    });
  }

  // If stale, trigger background re-scrape but return existing data
  if (isStale(cached.scrapedAt)) {
    triggerScrape();
  }

  return NextResponse.json({
    data: cached.opportunities,
    scrapedAt: cached.scrapedAt,
    totalCount: cached.totalCount,
    status: "ok",
  });
}
