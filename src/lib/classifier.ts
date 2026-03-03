interface ClassifyResult {
  categoryId: string;
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<string, { en: string[]; ar: string[] }> = {
  food_essentials: {
    en: ["food", "meal", "iftar", "suhoor", "grocery", "bread", "rice", "cooking", "kitchen", "eat", "hungry", "feeding", "water", "drink"],
    ar: ["طعام", "وجبة", "إفطار", "سحور", "بقالة", "خبز", "أرز", "طبخ", "مطبخ", "أكل", "جوع", "إطعام", "ماء", "شرب", "غذاء", "وجبات"],
  },
  clothing: {
    en: ["clothes", "clothing", "shirt", "pants", "shoes", "jacket", "dress", "wear", "fabric", "sewing", "blanket"],
    ar: ["ملابس", "قميص", "بنطلون", "حذاء", "جاكيت", "فستان", "لبس", "قماش", "خياطة", "بطانية", "ثوب"],
  },
  education: {
    en: ["education", "school", "tutor", "teach", "learn", "student", "book", "study", "math", "science", "university", "homework", "exam"],
    ar: ["تعليم", "مدرسة", "معلم", "دروس", "طالب", "كتاب", "دراسة", "رياضيات", "علوم", "جامعة", "واجب", "امتحان", "تدريس", "تقوية"],
  },
  medical: {
    en: ["medical", "health", "doctor", "medicine", "hospital", "clinic", "treatment", "surgery", "pharmacy", "sick", "illness", "dental"],
    ar: ["طبي", "صحة", "طبيب", "دواء", "مستشفى", "عيادة", "علاج", "جراحة", "صيدلية", "مريض", "مرض", "أسنان", "دكتور"],
  },
  financial: {
    en: ["money", "financial", "rent", "bill", "debt", "loan", "cash", "payment", "salary", "zakat", "donation", "fund"],
    ar: ["مال", "مالي", "إيجار", "فاتورة", "دين", "قرض", "نقد", "دفع", "راتب", "زكاة", "تبرع", "تمويل", "مصاريف", "فلوس"],
  },
  transportation: {
    en: ["transport", "ride", "car", "bus", "taxi", "drive", "travel", "delivery", "moving", "truck", "fuel", "gas"],
    ar: ["مواصلات", "توصيل", "سيارة", "باص", "تاكسي", "قيادة", "سفر", "نقل", "شاحنة", "بنزين", "وقود", "رحلة"],
  },
  household: {
    en: ["household", "furniture", "appliance", "repair", "plumbing", "electric", "paint", "clean", "fix", "house", "home", "fridge", "washing"],
    ar: ["منزل", "أثاث", "أجهزة", "إصلاح", "سباكة", "كهرباء", "دهان", "تنظيف", "تصليح", "بيت", "ثلاجة", "غسالة", "مستلزمات منزلية"],
  },
};

export function classifyText(text: string): ClassifyResult {
  const normalizedText = text.toLowerCase();
  const scores: Record<string, number> = {};
  let maxScore = 0;
  let bestCategoryId = "food_essentials";

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let hits = 0;
    const allKeywords = [...keywords.en, ...keywords.ar];

    for (const keyword of allKeywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        hits++;
      }
    }

    scores[categoryId] = hits;
    if (hits > maxScore) {
      maxScore = hits;
      bestCategoryId = categoryId;
    }
  }

  if (maxScore === 0) {
    return { categoryId: "food_essentials", confidence: 0 };
  }

  const totalKeywords = CATEGORY_KEYWORDS[bestCategoryId]
    ? CATEGORY_KEYWORDS[bestCategoryId].en.length + CATEGORY_KEYWORDS[bestCategoryId].ar.length
    : 1;
  const confidence = Math.min(Math.round((maxScore / Math.max(totalKeywords * 0.3, 1)) * 100), 99);

  return { categoryId: bestCategoryId, confidence };
}
