export interface ChallengeTemplate {
  category: string;
  actionType: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  points: number;
  iconEmoji: string;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    category: "HELP",
    actionType: "CREATE_OFFER",
    titleEn: "Help Someone Today",
    titleAr: "ساعد شخصاً اليوم",
    descriptionEn: "Create an offer to help someone in your community",
    descriptionAr: "أنشئ عرضاً لمساعدة شخص في مجتمعك",
    points: 10,
    iconEmoji: "handshake",
  },
  {
    category: "ASK",
    actionType: "CREATE_REQUEST",
    titleEn: "Ask for Help",
    titleAr: "اطلب المساعدة",
    descriptionEn: "It's okay to ask! Create a request for something you need",
    descriptionAr: "لا بأس بالطلب! أنشئ طلباً لشيء تحتاجه",
    points: 5,
    iconEmoji: "hand-raised",
  },
  {
    category: "VOLUNTEER",
    actionType: "APPLY_PROGRAM",
    titleEn: "Volunteer Today",
    titleAr: "تطوع اليوم",
    descriptionEn: "Apply to a volunteer program and make a difference",
    descriptionAr: "تقدم لبرنامج تطوعي وأحدث فرقاً",
    points: 15,
    iconEmoji: "heart",
  },
  {
    category: "CONNECT",
    actionType: "ACCEPT_CONNECTION",
    titleEn: "Accept a Connection",
    titleAr: "اقبل تواصلاً",
    descriptionEn: "Accept a pending help connection and start helping",
    descriptionAr: "اقبل طلب تواصل معلّق وابدأ المساعدة",
    points: 10,
    iconEmoji: "link",
  },
  {
    category: "TASK",
    actionType: "COMPLETE_TASK",
    titleEn: "Complete a Task",
    titleAr: "أكمل مهمة",
    descriptionEn: "Join a community task and submit proof of completion",
    descriptionAr: "انضم لمهمة مجتمعية وقدم إثبات الإنجاز",
    points: 20,
    iconEmoji: "check-circle",
  },
  {
    category: "DONATE",
    actionType: "MAKE_DONATION",
    titleEn: "Give Zakat",
    titleAr: "تبرع بالزكاة",
    descriptionEn: "Make a donation to a verified charity",
    descriptionAr: "تبرع لجمعية خيرية موثقة",
    points: 25,
    iconEmoji: "gift",
  },
  {
    category: "REVIEW",
    actionType: "LEAVE_REVIEW",
    titleEn: "Leave a Review",
    titleAr: "اترك تقييماً",
    descriptionEn: "Rate and review a completed connection",
    descriptionAr: "قيّم واكتب مراجعة لتواصل مكتمل",
    points: 5,
    iconEmoji: "star",
  },
  {
    category: "SHARE",
    actionType: "SHARE_PLATFORM",
    titleEn: "Spread Kindness",
    titleAr: "انشر الخير",
    descriptionEn: "Share Takafol with someone who could benefit",
    descriptionAr: "شارك تكافل مع شخص قد يستفيد",
    points: 5,
    iconEmoji: "share",
  },
  {
    category: "EXPLORE",
    actionType: "BROWSE_PROGRAMS",
    titleEn: "Explore Programs",
    titleAr: "استكشف البرامج",
    descriptionEn: "Browse and explore 3 different charity programs",
    descriptionAr: "تصفح واستكشف 3 برامج خيرية مختلفة",
    points: 5,
    iconEmoji: "compass",
  },
];

/**
 * Returns today's challenge template by rotating through all templates
 * based on the day of the year. Each day of the year maps deterministically
 * to one template, cycling back when the day count exceeds the template count.
 */
export function getTodayTemplate(date: Date): ChallengeTemplate {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % CHALLENGE_TEMPLATES.length;
  return CHALLENGE_TEMPLATES[index];
}
