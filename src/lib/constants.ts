export const APP_NAME = "تكافل";
export const APP_NAME_EN = "Takafol";
export const APP_DESCRIPTION = "منصة التأثير المجتمعي الموثق في رمضان";
export const APP_DESCRIPTION_EN = "Ramadan Verified Impact Platform";

export const COLORS = {
  primary: "#065F46",
  primaryLight: "#059669",
  primaryDark: "#064E3B",
  gold: "#D97706",
  goldLight: "#F59E0B",
  goldDark: "#B45309",
  background: "#FEFCE8",
  surface: "#FFFFFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
} as const;

export const IMPACT_POINTS = {
  POST_CREATED: 5,
  CONNECTION_COMPLETED_GIVER: 20,
  CONNECTION_COMPLETED_REQUESTER: 10,
  REVIEW_GIVEN: 3,
  VOLUNTEER_COMPLETED: 15,
  DONATION_MADE: 25,
  TASK_JOINED: 5,
  TASK_PROOF_SUBMITTED: 15,
  TASK_CREATED: 3,
} as const;

export const POST_EXPIRY_DAYS = 7;

export const ROUTES = {
  HOME: "/",
  OFFER: "/offer",
  OFFER_PERSONAL: "/offer/personal",
  OFFER_PERSONAL_CREATE: "/offer/personal/create",
  OFFER_REQUESTS: "/offer/requests",
  REQUEST: "/request",
  REQUEST_OFFERS: "/request/offers",
  REQUEST_CREATE: "/request/create",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  POSTS: "/posts",
  CONNECTIONS: "/connections",
  CHARITIES: "/charities",
  TASKS: "/tasks",
  TASKS_CREATE: "/tasks/create",
  LEADERBOARD: "/leaderboard",
} as const;
