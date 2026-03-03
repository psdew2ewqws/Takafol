const ARABIC_UNITS: Record<string, string> = {
  second: "ثانية",
  seconds: "ثوانٍ",
  minute: "دقيقة",
  minutes: "دقائق",
  hour: "ساعة",
  hours: "ساعات",
  day: "يوم",
  days: "أيام",
  week: "أسبوع",
  weeks: "أسابيع",
  month: "شهر",
  months: "أشهر",
};

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return "الآن";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? ARABIC_UNITS.minute : ARABIC_UNITS.minutes;
    return `منذ ${diffMinutes} ${unit}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const unit = diffHours === 1 ? ARABIC_UNITS.hour : ARABIC_UNITS.hours;
    return `منذ ${diffHours} ${unit}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    const unit = diffDays === 1 ? ARABIC_UNITS.day : ARABIC_UNITS.days;
    return `منذ ${diffDays} ${unit}`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    const unit = diffWeeks === 1 ? ARABIC_UNITS.week : ARABIC_UNITS.weeks;
    return `منذ ${diffWeeks} ${unit}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  const unit = diffMonths === 1 ? ARABIC_UNITS.month : ARABIC_UNITS.months;
  return `منذ ${diffMonths} ${unit}`;
}

export interface UrgencyConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const URGENCY_CONFIGS: Record<string, UrgencyConfig> = {
  LOW: {
    label: "منخفض",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  MEDIUM: {
    label: "متوسط",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  HIGH: {
    label: "مرتفع",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  CRITICAL: {
    label: "عاجل",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

export function getUrgencyConfig(urgency: string): UrgencyConfig {
  return URGENCY_CONFIGS[urgency] ?? URGENCY_CONFIGS.MEDIUM;
}

export function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/** Haversine distance between two lat/lng points in kilometers */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Format distance for display */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
