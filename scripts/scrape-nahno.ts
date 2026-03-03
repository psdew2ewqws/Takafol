#!/usr/bin/env npx tsx
/**
 * Scrapes volunteer opportunities from multiple Jordanian platforms:
 * 1. nahno.org/volunteer - National volunteer platform (نَحْنُ)
 * 2. tua.jo - Tkiyet Um Ali volunteer programs
 *
 * Saves results to data/nahno-volunteers.json
 * Run: npx tsx scripts/scrape-nahno.ts
 */

import { chromium, type Browser } from "playwright";
import * as fs from "fs";
import * as path from "path";

// ─── Types ────────────────────────────────────────────

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
  source: "nahno" | "tua";
  scrapedAt: string;
}

interface ScrapeResult {
  opportunities: NahnoOpportunity[];
  scrapedAt: string;
  totalCount: number;
  sources: { nahno: number; tua: number };
}

// ─── Nahno Scraper ────────────────────────────────────

async function scrapeNahno(browser: Browser): Promise<NahnoOpportunity[]> {
  console.log("[nahno] Scraping nahno.org...");
  const page = await browser.newPage();

  try {
    await page.goto("https://www.nahno.org/volunteer/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector(".explore-projects .search-project", {
      timeout: 15000,
    });

    const opportunities = await page.evaluate(() => {
      const projects = document.querySelectorAll(".explore-projects .search-project");
      const data: Array<{
        id: string; title: string; url: string; image: string;
        subcategory: string; description: string; applicantsCurrent: number;
        applicantsMax: number; applicantsText: string; location: string;
        orgName: string; orgUrl: string; orgLogo: string; progressPercent: number;
      }> = [];

      projects.forEach((project) => {
        const titleLink = project.querySelector(".search-project-title a") as HTMLAnchorElement | null;
        const img = project.querySelector(".search-project-cover img") as HTMLImageElement | null;
        const subcategory = project.querySelector(".search-project-subcategory label");
        const descDiv = project.querySelector(".search-project-details > div:not([class])");
        const progressStat = project.querySelector(".search-project-progress-stat1");
        const location = project.querySelector(".search-project-location");
        const ngoName = project.querySelector(".search-project-ngo-name a") as HTMLAnchorElement | null;
        const ngoImg = project.querySelector(".search-project-ngo-pic") as HTMLImageElement | null;
        const progressBar = project.querySelector(".search-project-progress-done") as HTMLElement | null;

        const url = titleLink?.href || "";
        const idMatch = url.match(/-(\d+)$/);
        const applicantsText = progressStat?.textContent?.trim() || "";
        const applicantsMatch = applicantsText.match(/(\d+)\s+من\s+(\d+)/);

        data.push({
          id: idMatch ? idMatch[1] : "",
          title: titleLink?.textContent?.trim() || "",
          url,
          image: img?.src || "",
          subcategory: subcategory?.textContent?.trim() || "",
          description: descDiv?.textContent?.trim() || "",
          applicantsCurrent: applicantsMatch ? parseInt(applicantsMatch[1]) : 0,
          applicantsMax: applicantsMatch ? parseInt(applicantsMatch[2]) : 0,
          applicantsText,
          location: location?.textContent?.trim() || "",
          orgName: ngoName?.textContent?.trim() || "",
          orgUrl: ngoName?.href || "",
          orgLogo: ngoImg?.src || "",
          progressPercent: parseInt(progressBar?.style?.width || "0") || 0,
        });
      });

      return data;
    });

    console.log(`[nahno] Found ${opportunities.length} opportunities from nahno.org`);
    return opportunities.map((o) => ({ ...o, source: "nahno" as const, scrapedAt: "" }));
  } catch (err) {
    console.error("[nahno] Failed to scrape nahno.org:", err);
    return [];
  } finally {
    await page.close();
  }
}

// ─── TUA Scraper ──────────────────────────────────────

async function scrapeTUA(browser: Browser): Promise<NahnoOpportunity[]> {
  console.log("[tua] Scraping tua.jo...");
  const page = await browser.newPage();

  try {
    await page.goto("https://www.tua.jo/en/volunteer-programs", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector("h4", { timeout: 15000 });

    const programs = await page.evaluate(() => {
      const results: Array<{
        title: string; description: string; url: string; image: string;
      }> = [];

      document.querySelectorAll("h4").forEach((h4) => {
        const title = h4.textContent?.trim();
        if (!title) return;

        let container: HTMLElement | null = h4.parentElement;
        while (container && !container.querySelector('a[href*="volunteer-programs"]')) {
          container = container.parentElement;
          if (!container || container.tagName === "BODY") { container = null; break; }
        }
        if (!container) return;

        const desc = container.querySelector("p");
        const link = container.querySelector('a[href*="volunteer-programs"]');
        const imgEl = container.parentElement?.querySelector("img");

        results.push({
          title,
          description: desc?.textContent?.trim() || "",
          url: link?.getAttribute("href") || "",
          image: (imgEl as HTMLImageElement)?.src || "",
        });
      });

      return results;
    });

    console.log(`[tua] Found ${programs.length} programs from tua.jo`);

    // Also get Arabic versions
    const pageAr = await browser.newPage();
    let arabicTitles: Record<string, string> = {};
    try {
      await pageAr.goto("https://www.tua.jo/ar/volunteer-programs", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await pageAr.waitForSelector("h4", { timeout: 10000 });

      const arData = await pageAr.evaluate(() => {
        const titles: string[] = [];
        document.querySelectorAll("h4").forEach((h4) => {
          const t = h4.textContent?.trim();
          if (t) titles.push(t);
        });
        return titles;
      });

      // Map by index
      programs.forEach((p, i) => {
        if (arData[i]) arabicTitles[p.title] = arData[i];
      });
    } catch {
      console.log("[tua] Could not fetch Arabic titles, using English only");
    } finally {
      await pageAr.close();
    }

    return programs.map((p, i) => ({
      id: `tua-${i + 1}`,
      title: arabicTitles[p.title] || p.title,
      url: p.url.startsWith("http") ? p.url : `https://www.tua.jo${p.url}`,
      image: p.image,
      subcategory: "تكية أم علي",
      description: p.description,
      applicantsCurrent: 0,
      applicantsMax: 0,
      applicantsText: "",
      location: "عمان",
      orgName: "تكية أم علي - Tkiyet Um Ali",
      orgUrl: "https://www.tua.jo",
      orgLogo: "https://www.tua.jo/uploads/2025/03/group-20178.png",
      progressPercent: 0,
      source: "tua" as const,
      scrapedAt: "",
    }));
  } catch (err) {
    console.error("[tua] Failed to scrape tua.jo:", err);
    return [];
  } finally {
    await page.close();
  }
}

// ─── Main ─────────────────────────────────────────────

async function main() {
  console.log("[scraper] Starting multi-source scrape...");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // Scrape both sources in parallel
    const [nahnoData, tuaData] = await Promise.all([
      scrapeNahno(browser),
      scrapeTUA(browser),
    ]);

    const now = new Date().toISOString();
    const allOpportunities = [...nahnoData, ...tuaData].map((o) => ({
      ...o,
      scrapedAt: now,
    }));

    const result: ScrapeResult = {
      opportunities: allOpportunities,
      scrapedAt: now,
      totalCount: allOpportunities.length,
      sources: {
        nahno: nahnoData.length,
        tua: tuaData.length,
      },
    };

    // Save to file
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outPath = path.join(dataDir, "nahno-volunteers.json");
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");

    console.log(`[scraper] Total: ${result.totalCount} opportunities`);
    console.log(`[scraper]   nahno.org: ${result.sources.nahno}`);
    console.log(`[scraper]   tua.jo: ${result.sources.tua}`);
    console.log(`[scraper] Saved to ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[scraper] Failed:", err);
  process.exit(1);
});
