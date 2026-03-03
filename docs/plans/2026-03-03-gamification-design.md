# Gamification System Design — Takafol

## Goal
Maximize helping actions through a points-based gamification system with tiers, streaks, and badges.

## Architecture: Event-Driven Points Engine
- Centralized `src/lib/gamification.ts` module
- Called from existing API routes on point-earning events
- New Prisma models: `Badge`, `UserBadge`, `Streak`, `PointTransaction`
- New API routes: `/api/gamification/profile`, `/api/gamification/badges`
- New page: `/achievements` (inline-view popup pattern)
- Toast notifications via Sonner on point earn + badge unlock

## Points Economy

| Action | Points |
|--------|--------|
| Create an offer | +5 |
| Create a request | +3 |
| Accept a connection | +5 |
| Complete connection (giver) | +20 |
| Complete connection (requester) | +10 |
| Upload proof | +10 |
| Rate partner | +3 |
| Receive 5-star rating | +5 |
| Apply for volunteer task | +5 |
| Complete task with proof | +15 |
| Apply to charity program | +5 |
| Donate (Zakat) | +10 |
| Complete daily challenge | +5-15 |
| 7-day streak bonus | +20 |
| 30-day streak bonus | +100 |
| 100-day streak bonus | +500 |

## Tier System (5 levels)

| Level | AR | EN | Points |
|-------|----|----|--------|
| 1 | مبتدئ | Newcomer | 0 |
| 2 | مساعد | Helper | 100 |
| 3 | بطل | Champion | 500 |
| 4 | ملهم | Inspirer | 2000 |
| 5 | أسطورة | Legend | 10000 |

## Streak System
- Daily: must perform 1+ helping action to maintain
- Milestones: 3, 7, 14, 30, 60, 100 days
- No freeze — miss a day, resets to 0
- Track current + longest ever

## Badge Categories (~20 badges)
- **Helping**: First connection, 5 tasks, 25 connections, 100 connections
- **Streak**: 7-day, 30-day, 100-day
- **Social**: First rating, 4.5+ avg over 10, 20 five-star ratings
- **Special**: Pioneer (first 100), First donation, Level 4, Level 5

## UI Design
- Navbar: compact pill indicator (points + streak)
- `/achievements` page via inline-view popup
- Sections: Header with tier ring, streak heat-wave, badge grid, activity log
- Level-up: confetti overlay with Framer Motion
- Point-earn: Sonner toast with "+X نقطة"
- Matches existing Takafol aesthetic (emerald/amber, rounded-2xl, spring animations, IBM Plex Arabic)

## Database Changes
- `PointTransaction`: userId, action, points, metadata, createdAt
- `Badge`: id, key, nameAr, nameEn, descAr, descEn, category, icon, threshold
- `UserBadge`: userId, badgeId, earnedAt
- `Streak`: userId, currentStreak, longestStreak, lastActionDate
- Extend `User`: add `level` field
