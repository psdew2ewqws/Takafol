import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LOGO_UPDATES: Record<string, { logoUrl: string | null; website: string | null }> = {
  tikyet_um_ali: {
    logoUrl: "/charities/tikyet-um-ali.png",
    website: "https://www.tua.jo",
  },
  jordan_hashemite: {
    logoUrl: "/charities/jhco.png",
    website: "https://www.jhco.org.jo",
  },
  jordan_red_crescent: {
    logoUrl: "/charities/jrc.png",
    website: "https://jnrcs.org",
  },
  tkiyet_al_khair: {
    logoUrl: null,
    website: null,
  },
  noor_al_hussein: {
    logoUrl: "/charities/nhf.png",
    website: "https://kinghusseinfoundation.org",
  },
};

async function main() {
  for (const [id, data] of Object.entries(LOGO_UPDATES)) {
    try {
      await prisma.charity.update({
        where: { id },
        data: {
          logoUrl: data.logoUrl,
          website: data.website,
        },
      });
      console.log(`Updated ${id}: logoUrl=${data.logoUrl}`);
    } catch {
      console.log(`Skipped ${id} (not found in DB)`);
    }
  }

  // Also try matching by name pattern for any extra charities in DB
  const allCharities = await prisma.charity.findMany();
  for (const charity of allCharities) {
    if (Object.keys(LOGO_UPDATES).includes(charity.id)) continue;

    // Match by Arabic name
    const nameAr = charity.nameAr;
    let logoUrl: string | null = null;

    if (nameAr.includes("أم علي")) {
      logoUrl = "/charities/tikyet-um-ali.png";
    } else if (nameAr.includes("هاشمية") || nameAr.includes("الهيئة الخيرية")) {
      logoUrl = "/charities/jhco.png";
    } else if (nameAr.includes("الهلال الأحمر")) {
      logoUrl = "/charities/jrc.png";
    } else if (nameAr.includes("نور الحسين")) {
      logoUrl = "/charities/nhf.png";
    }

    if (logoUrl) {
      await prisma.charity.update({
        where: { id: charity.id },
        data: { logoUrl },
      });
      console.log(`Updated ${charity.id} (${nameAr}): logoUrl=${logoUrl}`);
    } else {
      // No logo found — set to null to remove generic placeholder
      if (charity.logoUrl) {
        await prisma.charity.update({
          where: { id: charity.id },
          data: { logoUrl: null },
        });
        console.log(`Cleared logo for ${charity.id} (${nameAr}) — no real logo found`);
      }
    }
  }

  console.log("Done updating charity logos.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
