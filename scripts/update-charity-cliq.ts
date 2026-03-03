import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CLIQ_UPDATES: Record<string, { cliqAlias: string | null; iban: string | null }> = {
  tikyet_um_ali: {
    cliqAlias: "TUAZAKATJO",
    iban: null,
  },
  jordan_hashemite: {
    cliqAlias: "JHCOGAZA",
    iban: "JO32UBSI1030000040101659915106",
  },
  jordan_red_crescent: {
    cliqAlias: null,
    iban: null,
  },
  tkiyet_al_khair: {
    cliqAlias: null,
    iban: null,
  },
  noor_al_hussein: {
    cliqAlias: null,
    iban: "JO41EFBK0010000000000004008567",
  },
};

async function main() {
  for (const [id, data] of Object.entries(CLIQ_UPDATES)) {
    try {
      await prisma.charity.update({
        where: { id },
        data: {
          cliqAlias: data.cliqAlias,
          iban: data.iban,
        },
      });
      console.log(`Updated ${id}: cliqAlias=${data.cliqAlias}, iban=${data.iban ? "..." + data.iban.slice(-6) : "null"}`);
    } catch {
      console.log(`Skipped ${id} (not found)`);
    }
  }

  // Also match by name for any extra charities
  const allCharities = await prisma.charity.findMany();
  for (const charity of allCharities) {
    if (Object.keys(CLIQ_UPDATES).includes(charity.id)) continue;

    const nameAr = charity.nameAr;
    let cliqAlias: string | null = null;
    let iban: string | null = null;

    if (nameAr.includes("أم علي")) {
      cliqAlias = "TUAZAKATJO";
    } else if (nameAr.includes("هاشمية") || nameAr.includes("الهيئة الخيرية")) {
      cliqAlias = "JHCOGAZA";
      iban = "JO32UBSI1030000040101659915106";
    } else if (nameAr.includes("نور الحسين")) {
      iban = "JO41EFBK0010000000000004008567";
    }

    if (cliqAlias || iban) {
      await prisma.charity.update({
        where: { id: charity.id },
        data: { cliqAlias, iban },
      });
      console.log(`Updated ${charity.id} (${nameAr}): cliqAlias=${cliqAlias}, iban=${iban ? "..." + iban.slice(-6) : "null"}`);
    }
  }

  console.log("Done updating CliQ data.");
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
