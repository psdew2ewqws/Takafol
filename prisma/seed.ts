import "dotenv/config";
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
  { id: "amman", nameEn: "Amman", nameAr: "عمّان" },
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
      website: "https://www.tua.jo",
      cliqAlias: "TUA",
      iban: null,
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
      cliqAlias: "JHCOGAZA",
      iban: "JO32UBSI1030000040101659",
      isVerified: true,
      isActive: true,
    },
    {
      id: "johud",
      name: "Jordanian Hashemite Fund for Human Development",
      nameAr: "الهيئة الخيرية الأردنية الهاشمية",
      description: "A leading Jordanian charity for relief and development since 1999.",
      descriptionAr: "مؤسسة خيرية رائدة في الإغاثة والتنمية.",
      logoUrl: "/charities/johud.png",
      website: "https://johud.org.jo",
      cliqAlias: "JOHUD",
      iban: "JO96JIBA0020000025000410400015",
      isVerified: true,
      isActive: true,
    },
    {
      id: "jordan_humanitarian",
      name: "Jordan Humanitarian Aid Society",
      nameAr: "المساعدات الإنسانية الأردنية",
      description: "Providing humanitarian aid across all regions of Jordan.",
      descriptionAr: "تقديم المساعدات الإنسانية في جميع أنحاء الأردن.",
      logoUrl: null,
      website: null,
      cliqAlias: null,
      iban: null,
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
      website: "https://jnrcs.org",
      cliqAlias: null,
      iban: null,
      isVerified: true,
      isActive: true,
    },
    {
      id: "tkiyet_al_khair",
      name: "Tkiyet Al Khair",
      nameAr: "تكية الخير",
      description: "Provides food parcels and hot meals to families in need during Ramadan and beyond.",
      descriptionAr: "تقدم الطرود الغذائية والوجبات الساخنة للعائلات المحتاجة في رمضان وغيره.",
      logoUrl: null,
      website: "https://www.tua.jo",
      cliqAlias: "TUA",
      iban: null,
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
      website: "https://kinghusseinfoundation.org",
      cliqAlias: null,
      iban: "JO41EFBK0010000000000004008567",
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
        cliqAlias: charity.cliqAlias,
        iban: charity.iban,
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

  // Seed gamification badges
  const BADGES = [
    // Helping badges
    { key: "first_connection", nameEn: "Helping Hand", nameAr: "يد العون", descEn: "Complete your first connection", descAr: "أكمل أول تواصل لك", category: "helping", icon: "🤝", threshold: 1 },
    { key: "helping_hand_5", nameEn: "Frequent Helper", nameAr: "مساعد دائم", descEn: "Complete 5 connections", descAr: "أكمل 5 تواصلات", category: "helping", icon: "✋", threshold: 5 },
    { key: "generosity_champion", nameEn: "Generosity Champion", nameAr: "بطل الكرم", descEn: "Complete 25 connections", descAr: "أكمل 25 تواصل", category: "helping", icon: "👑", threshold: 25 },
    { key: "big_heart_50", nameEn: "Big Heart", nameAr: "قلب كبير", descEn: "Complete 50 connections", descAr: "أكمل 50 تواصل", category: "helping", icon: "❤️‍🔥", threshold: 50 },
    { key: "community_benefactor", nameEn: "Community Benefactor", nameAr: "محسن المجتمع", descEn: "Complete 100 connections", descAr: "أكمل 100 تواصل", category: "helping", icon: "🏛️", threshold: 100 },
    { key: "active_volunteer", nameEn: "Active Volunteer", nameAr: "متطوع نشط", descEn: "Complete 5 volunteer tasks", descAr: "أكمل 5 مهام تطوعية", category: "helping", icon: "⚡", threshold: 5 },
    { key: "task_master_10", nameEn: "Task Master", nameAr: "سيد المهام", descEn: "Complete 10 volunteer tasks", descAr: "أكمل 10 مهام تطوعية", category: "helping", icon: "🎯", threshold: 10 },
    // Streak badges
    { key: "streak_3", nameEn: "Getting Started", nameAr: "بداية موفقة", descEn: "Maintain a 3-day streak", descAr: "حافظ على سلسلة 3 أيام", category: "streak", icon: "✨", threshold: 3 },
    { key: "persistent_7", nameEn: "Persistent", nameAr: "مثابر", descEn: "Maintain a 7-day streak", descAr: "حافظ على سلسلة 7 أيام", category: "streak", icon: "🔥", threshold: 7 },
    { key: "streak_14", nameEn: "Two Weeks Strong", nameAr: "أسبوعان متواصلان", descEn: "Maintain a 14-day streak", descAr: "حافظ على سلسلة 14 يوم", category: "streak", icon: "🌙", threshold: 14 },
    { key: "committed_30", nameEn: "Committed", nameAr: "ملتزم", descEn: "Maintain a 30-day streak", descAr: "حافظ على سلسلة 30 يوم", category: "streak", icon: "💎", threshold: 30 },
    { key: "streak_60", nameEn: "Unstoppable", nameAr: "لا يوقفه شيء", descEn: "Maintain a 60-day streak", descAr: "حافظ على سلسلة 60 يوم", category: "streak", icon: "☀️", threshold: 60 },
    { key: "legendary_100", nameEn: "Legendary Streak", nameAr: "سلسلة أسطورية", descEn: "Maintain a 100-day streak", descAr: "حافظ على سلسلة 100 يوم", category: "streak", icon: "🌟", threshold: 100 },
    // Social badges
    { key: "first_rating", nameEn: "First Rating", nameAr: "أول تقييم", descEn: "Rate someone for the first time", descAr: "قيّم شخصاً لأول مرة", category: "social", icon: "⭐", threshold: 1 },
    { key: "gold_star", nameEn: "Gold Star", nameAr: "نجمة ذهبية", descEn: "Maintain 4.5+ average rating over 10+ ratings", descAr: "حافظ على تقييم 4.5+ فوق 10 تقييمات", category: "social", icon: "🥇", threshold: 10 },
    { key: "trusted_20", nameEn: "Trusted", nameAr: "موثوق", descEn: "Receive 20 five-star ratings", descAr: "احصل على 20 تقييم 5 نجوم", category: "social", icon: "🛡️", threshold: 20 },
    // Special badges
    { key: "first_donor", nameEn: "Donor", nameAr: "متبرع", descEn: "Make your first Zakat donation", descAr: "قم بأول تبرع زكاة", category: "special", icon: "💝", threshold: 1 },
    { key: "generous_donor_5", nameEn: "Generous Donor", nameAr: "متبرع كريم", descEn: "Make 5 Zakat donations", descAr: "قم بـ 5 تبرعات زكاة", category: "special", icon: "💰", threshold: 5 },
    { key: "expert_level4", nameEn: "Expert", nameAr: "خبير", descEn: "Reach Inspirer tier (Level 4)", descAr: "اوصل لمستوى ملهم", category: "special", icon: "🎓", threshold: 4 },
    { key: "living_legend", nameEn: "Living Legend", nameAr: "أسطورة حية", descEn: "Reach Legend tier (Level 5)", descAr: "اوصل لمستوى أسطورة", category: "special", icon: "🏆", threshold: 5 },
  ];

  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        nameEn: badge.nameEn,
        nameAr: badge.nameAr,
        descEn: badge.descEn,
        descAr: badge.descAr,
        category: badge.category,
        icon: badge.icon,
        threshold: badge.threshold,
      },
      create: badge,
    });
  }

  console.info(`Seeded ${CATEGORIES.length} categories, ${DISTRICTS.length} districts, ${CHARITIES.length} charities, ${PROGRAMS.length} volunteer programs, ${BADGES.length} badges, and 1 admin user`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
