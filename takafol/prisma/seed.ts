import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed charities
  const charity1 = await prisma.charity.upsert({
    where: { id: 'charity-001' },
    update: {},
    create: {
      id: 'charity-001',
      name: 'Jordan Humanitarian Aid',
      nameAr: 'المساعدات الإنسانية الأردنية',
      description: 'Providing humanitarian aid across Jordan, focusing on food security, emergency relief, and community development.',
      descriptionAr: 'تقديم المساعدات الإنسانية في جميع أنحاء الأردن',
      isVerified: true,
      contactEmail: 'info@jordanaid.org',
      isActive: true,
    },
  });

  const charity2 = await prisma.charity.upsert({
    where: { id: 'charity-002' },
    update: {},
    create: {
      id: 'charity-002',
      name: 'Tkiyet Um Ali',
      nameAr: 'تكية أم علي',
      description: 'The first and largest food aid organization in Jordan, serving underprivileged families with daily meals.',
      descriptionAr: 'أكبر مؤسسة للمساعدات الغذائية في الأردن',
      isVerified: true,
      contactEmail: 'info@tua.jo',
      website: 'https://www.tua.jo',
      isActive: true,
    },
  });

  const charity3 = await prisma.charity.upsert({
    where: { id: 'charity-003' },
    update: {},
    create: {
      id: 'charity-003',
      name: 'Jordan Hashemite Charity Organization',
      nameAr: 'الهيئة الخيرية الأردنية الهاشمية',
      description: 'Leading charity providing relief and development programs in health, education, and emergency response.',
      descriptionAr: 'مؤسسة خيرية رائدة في الإغاثة والتنمية',
      isVerified: true,
      isActive: true,
    },
  });

  // Seed volunteer programs
  await prisma.volunteerProgram.upsert({
    where: { id: 'prog-001' },
    update: {},
    create: {
      id: 'prog-001',
      charityId: charity1.id,
      title: 'Ramadan Food Basket Distribution',
      titleAr: 'توزيع سلال غذائية رمضانية',
      description: 'Help distribute food baskets to 500 families across Zarqa and East Amman during Ramadan.',
      location: 'Zarqa & East Amman',
      district: 'zarqa',
      maxVolunteers: 50,
      currentVolunteers: 23,
      startDate: new Date('2026-03-10'),
      endDate: new Date('2026-04-08'),
      status: 'open',
    },
  });

  await prisma.volunteerProgram.upsert({
    where: { id: 'prog-002' },
    update: {},
    create: {
      id: 'prog-002',
      charityId: charity1.id,
      title: 'Winter Clothing Drive Volunteers',
      titleAr: 'متطوعون لحملة الملابس الشتوية',
      description: 'Collect, sort, and distribute winter clothing to families in need across northern Jordan.',
      location: 'Irbid',
      district: 'irbid',
      maxVolunteers: 30,
      currentVolunteers: 12,
      startDate: new Date('2026-03-15'),
      status: 'open',
    },
  });

  await prisma.volunteerProgram.upsert({
    where: { id: 'prog-003' },
    update: {},
    create: {
      id: 'prog-003',
      charityId: charity2.id,
      title: 'Daily Iftar Meal Preparation',
      titleAr: 'تحضير وجبات إفطار يومية',
      description: 'Join our kitchen team to prepare and serve daily Iftar meals for 200+ people.',
      location: 'Amman Central Kitchen',
      district: 'jabal_amman',
      maxVolunteers: 20,
      currentVolunteers: 18,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-30'),
      status: 'open',
    },
  });

  await prisma.volunteerProgram.upsert({
    where: { id: 'prog-004' },
    update: {},
    create: {
      id: 'prog-004',
      charityId: charity3.id,
      title: 'Educational Tutoring for Refugee Children',
      titleAr: 'دروس تعليمية لأطفال اللاجئين',
      description: 'Provide after-school tutoring in Math, English, and Arabic for refugee children in Zaatari.',
      location: 'Zaatari Camp',
      maxVolunteers: 15,
      currentVolunteers: 7,
      status: 'open',
    },
  });

  // Seed leaderboard entries
  const users = [
    { id: 'user-001', name: 'Ahmad Khalil', score: 847, tasks: 42, donated: 350 },
    { id: 'user-002', name: 'Sara Nasser', score: 720, tasks: 35, donated: 200 },
    { id: 'user-003', name: 'Omar Rizeq', score: 685, tasks: 31, donated: 150 },
    { id: 'user-004', name: 'Layla Hassan', score: 590, tasks: 28, donated: 180 },
    { id: 'user-005', name: 'Mohammad Ali', score: 520, tasks: 24, donated: 120 },
    { id: 'user-006', name: 'Noor Amin', score: 480, tasks: 22, donated: 90 },
    { id: 'user-007', name: 'Khaled Sami', score: 410, tasks: 18, donated: 250 },
    { id: 'user-008', name: 'Rania Yousef', score: 380, tasks: 16, donated: 80 },
    { id: 'user-009', name: 'Tariq Mahmoud', score: 350, tasks: 15, donated: 60 },
    { id: 'user-010', name: 'Dina Faris', score: 290, tasks: 12, donated: 100 },
    { id: 'demo-user-001', name: 'Demo User', score: 45, tasks: 2, donated: 25 },
  ];

  for (const user of users) {
    await prisma.userImpact.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        userName: user.name,
        impactScore: user.score,
        tasksCompleted: user.tasks,
        totalDonated: user.donated,
      },
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
