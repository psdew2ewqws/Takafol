import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { id: "food_essentials", nameEn: "Food & Essentials", nameAr: "طعام ومستلزمات", icon: "🍽️" },
  { id: "clothing", nameEn: "Clothing", nameAr: "ملابس", icon: "👕" },
  { id: "education", nameEn: "Education & Tutoring", nameAr: "تعليم ودروس", icon: "📚" },
  { id: "medical", nameEn: "Medical & Health", nameAr: "صحة وطب", icon: "🏥" },
  { id: "financial", nameEn: "Financial Aid", nameAr: "مساعدة مالية", icon: "💰" },
  { id: "transportation", nameEn: "Transportation", nameAr: "مواصلات", icon: "🚗" },
  { id: "household", nameEn: "Household Items", nameAr: "مستلزمات منزلية", icon: "🏠" },
];

const DISTRICTS = [
  { id: "tla_ali", nameEn: "Tla' Al-Ali", nameAr: "تلاع العلي" },
  { id: "abdoun", nameEn: "Abdoun", nameAr: "عبدون" },
  { id: "jabal_amman", nameEn: "Jabal Amman", nameAr: "جبل عمان" },
  { id: "jabal_hussein", nameEn: "Jabal Al-Hussein", nameAr: "جبل الحسين" },
  { id: "shmeisani", nameEn: "Shmeisani", nameAr: "الشميساني" },
  { id: "sweifieh", nameEn: "Sweifieh", nameAr: "الصويفية" },
  { id: "dahiyat_rasheed", nameEn: "Dahiyat Al-Rasheed", nameAr: "ضاحية الرشيد" },
  { id: "marj_hamam", nameEn: "Marj Al-Hamam", nameAr: "مرج الحمام" },
  { id: "tabarbour", nameEn: "Tabarbour", nameAr: "طبربور" },
  { id: "abu_alanda", nameEn: "Abu Alanda", nameAr: "أبو علندا" },
  { id: "zarqa", nameEn: "Zarqa", nameAr: "الزرقاء" },
  { id: "irbid", nameEn: "Irbid", nameAr: "إربد" },
  { id: "aqaba", nameEn: "Aqaba", nameAr: "العقبة" },
  { id: "salt", nameEn: "Al-Salt", nameAr: "السلط" },
  { id: "madaba", nameEn: "Madaba", nameAr: "مادبا" },
];

async function main() {
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { nameEn: cat.nameEn, nameAr: cat.nameAr, icon: cat.icon },
      create: cat,
    });
  }

  for (const dist of DISTRICTS) {
    await prisma.district.upsert({
      where: { id: dist.id },
      update: { nameEn: dist.nameEn, nameAr: dist.nameAr },
      create: dist,
    });
  }

  // Seed Jordanian charities
  const CHARITIES = [
    {
      id: "tikyet_um_ali",
      name: "Tikyet Um Ali",
      nameAr: "تكية أم علي",
      description: "Jordan's largest food aid organization, fighting hunger since 2003.",
      descriptionAr: "أكبر مؤسسة إغاثة غذائية في الأردن، تكافح الجوع منذ 2003.",
      logoUrl: "/charities/tikyet-um-ali.png",
      website: "https://www.tikkeyetumali.jo",
      isVerified: true,
      isActive: true,
    },
    {
      id: "jordan_hashemite",
      name: "Jordan Hashemite Charity Organization",
      nameAr: "الجمعية الخيرية الهاشمية الأردنية",
      description: "One of Jordan's leading humanitarian and charitable organizations.",
      descriptionAr: "من أبرز المنظمات الإنسانية والخيرية في الأردن.",
      logoUrl: "/charities/jhco.png",
      website: "https://www.jhco.org.jo",
      isVerified: true,
      isActive: true,
    },
    {
      id: "jordan_red_crescent",
      name: "Jordan Red Crescent",
      nameAr: "الهلال الأحمر الأردني",
      description: "Provides emergency relief, health services, and social welfare across Jordan.",
      descriptionAr: "يقدم الإغاثة الطارئة والخدمات الصحية والرعاية الاجتماعية في جميع أنحاء الأردن.",
      logoUrl: "/charities/jrc.png",
      website: "https://www.jordanredcrescent.org",
      isVerified: true,
      isActive: true,
    },
    {
      id: "tkiyet_al_khair",
      name: "Tkiyet Al Khair",
      nameAr: "تكية الخير",
      description: "Provides food parcels and hot meals to families in need during Ramadan and beyond.",
      descriptionAr: "تقدم الطرود الغذائية والوجبات الساخنة للعائلات المحتاجة في رمضان وغيره.",
      logoUrl: "/charities/tkiyet-al-khair.png",
      website: "https://www.tkiyetalkhair.jo",
      isVerified: true,
      isActive: true,
    },
    {
      id: "noor_al_hussein",
      name: "Noor Al Hussein Foundation",
      nameAr: "مؤسسة نور الحسين",
      description: "Empowers communities through education, microfinance, culture, and health programs.",
      descriptionAr: "تمكين المجتمعات من خلال التعليم والتمويل الأصغر والثقافة والبرامج الصحية.",
      logoUrl: "/charities/nhf.png",
      website: "https://www.nfrjo.com",
      isVerified: true,
      isActive: true,
    },
  ];

  for (const charity of CHARITIES) {
    await prisma.charity.upsert({
      where: { id: charity.id },
      update: {
        name: charity.name,
        nameAr: charity.nameAr,
        description: charity.description,
        descriptionAr: charity.descriptionAr,
        logoUrl: charity.logoUrl,
        website: charity.website,
        isVerified: charity.isVerified,
        isActive: charity.isActive,
      },
      create: charity,
    });
  }

  // Seed volunteer programs for charities
  const PROGRAMS = [
    {
      id: "tikyet_ramadan_meals",
      charityId: "tikyet_um_ali",
      title: "Ramadan Meal Distribution",
      titleAr: "توزيع وجبات رمضان",
      description: "Help distribute iftar meals to families in need across Amman.",
      descriptionAr: "ساعد في توزيع وجبات الإفطار على العائلات المحتاجة في عمان.",
      capacity: 50,
      enrolled: 12,
      isActive: true,
    },
    {
      id: "jhco_food_parcels",
      charityId: "jordan_hashemite",
      title: "Food Parcel Packing",
      titleAr: "تعبئة الطرود الغذائية",
      description: "Pack food parcels for distribution to refugee communities.",
      descriptionAr: "تعبئة الطرود الغذائية لتوزيعها على مجتمعات اللاجئين.",
      capacity: 30,
      enrolled: 8,
      isActive: true,
    },
    {
      id: "jrc_medical_aid",
      charityId: "jordan_red_crescent",
      title: "Medical Aid Volunteers",
      titleAr: "متطوعي المساعدة الطبية",
      description: "Assist in mobile health clinics serving underserved areas.",
      descriptionAr: "المساعدة في العيادات الصحية المتنقلة التي تخدم المناطق المحرومة.",
      capacity: 20,
      enrolled: 5,
      isActive: true,
    },
  ];

  for (const program of PROGRAMS) {
    await prisma.volunteerProgram.upsert({
      where: { id: program.id },
      update: {
        title: program.title,
        titleAr: program.titleAr,
        description: program.description,
        descriptionAr: program.descriptionAr,
        capacity: program.capacity,
        enrolled: program.enrolled,
        isActive: program.isActive,
      },
      create: program,
    });
  }

  // Seed admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@takafol.com" },
    update: { password: adminPassword, role: "ADMIN" },
    create: {
      name: "مدير النظام",
      email: "admin@takafol.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.info(`Seeded ${CATEGORIES.length} categories, ${DISTRICTS.length} districts, ${CHARITIES.length} charities, ${PROGRAMS.length} volunteer programs, and 1 admin user`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
