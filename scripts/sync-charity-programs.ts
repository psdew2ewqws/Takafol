#!/usr/bin/env npx tsx
/**
 * Syncs scraped charity volunteer programs into the database.
 * Reads from data/charity-programs.json and upserts into VolunteerProgram table.
 *
 * Run: npx tsx scripts/sync-charity-programs.ts
 * Or:  npx tsx scripts/sync-charity-programs.ts --scrape (scrape first, then sync)
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ScrapedProgram {
  externalId: string;
  charityId: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  capacity: number;
  enrolled: number;
  url: string;
  image: string;
  location: string;
  source: string;
}

interface ScrapeResult {
  programs: ScrapedProgram[];
  scrapedAt: string;
  totalCount: number;
}

const DATA_FILE = path.join(process.cwd(), "data", "charity-programs.json");

async function syncPrograms() {
  // Check if data file exists
  if (!fs.existsSync(DATA_FILE)) {
    console.log("[sync] No data file found. Run scraper first.");
    console.log("[sync] Running scraper...");
    await execAsync("npx tsx scripts/scrape-charity-programs.ts", {
      cwd: process.cwd(),
      timeout: 120000,
    });
  }

  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  const data: ScrapeResult = JSON.parse(raw);

  console.log(`[sync] Found ${data.programs.length} programs to sync`);

  // Verify charities exist
  const charities = await prisma.charity.findMany({
    where: { isActive: true },
    select: { id: true, name: true, nameAr: true },
  });
  const charityIds = new Set(charities.map((c) => c.id));
  console.log(`[sync] Active charities: ${charities.map((c) => c.id).join(", ")}`);

  let synced = 0;
  let skipped = 0;

  for (const program of data.programs) {
    if (!charityIds.has(program.charityId)) {
      console.log(`[sync] Skipping ${program.externalId}: charity ${program.charityId} not found`);
      skipped++;
      continue;
    }

    const programId = `scraped_${program.externalId}`;

    try {
      await prisma.volunteerProgram.upsert({
        where: { id: programId },
        update: {
          title: program.title,
          titleAr: program.titleAr,
          description: program.description || null,
          descriptionAr: program.descriptionAr || null,
          capacity: program.capacity,
          enrolled: program.enrolled,
          isActive: true,
        },
        create: {
          id: programId,
          charityId: program.charityId,
          title: program.title,
          titleAr: program.titleAr,
          description: program.description || null,
          descriptionAr: program.descriptionAr || null,
          capacity: program.capacity,
          enrolled: program.enrolled,
          isActive: true,
        },
      });
      synced++;
      console.log(`[sync] ✓ ${programId} → ${program.charityId}: ${program.titleAr}`);
    } catch (err) {
      console.error(`[sync] ✗ ${programId}: ${err instanceof Error ? err.message : err}`);
      skipped++;
    }
  }

  console.log(`\n[sync] Done: ${synced} synced, ${skipped} skipped`);

  // Show final state
  const allPrograms = await prisma.volunteerProgram.findMany({
    where: { isActive: true },
    include: { charity: { select: { nameAr: true } } },
    orderBy: { charityId: "asc" },
  });

  console.log(`\n[sync] All active programs (${allPrograms.length}):`);
  let currentCharity = "";
  for (const p of allPrograms) {
    if (p.charity.nameAr !== currentCharity) {
      currentCharity = p.charity.nameAr;
      console.log(`\n  ${currentCharity}:`);
    }
    console.log(`    - ${p.titleAr} (${p.enrolled}/${p.capacity})`);
  }
}

async function main() {
  const shouldScrape = process.argv.includes("--scrape");

  if (shouldScrape) {
    console.log("[sync] Running scraper first...");
    try {
      const { stdout } = await execAsync("npx tsx scripts/scrape-charity-programs.ts", {
        cwd: process.cwd(),
        timeout: 120000,
      });
      console.log(stdout);
    } catch (err) {
      console.error("[sync] Scrape failed:", err instanceof Error ? err.message : err);
    }
  }

  await syncPrograms();
}

main()
  .catch((err) => {
    console.error("[sync] Fatal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
