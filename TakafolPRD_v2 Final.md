# Takafol by Nexara — Product Requirements Document
## Verified Impact Platform | Claude Code Implementation Guide

**Version:** 2.0
**Date:** March 2026
**Author:** LUNA / Nexara
**Target:** 48-Hour Hackathon (Ramadan Theme)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Complete User Flows](#4-complete-user-flows)
5. [AI Tagging Engine](#5-ai-tagging-engine)
6. [Blockchain Donation Tracking](#6-blockchain-donation-tracking)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [Frontend Pages & Components](#10-frontend-pages--components)
11. [Gamification System](#11-gamification-system)
12. [Admin Panel](#12-admin-panel)
13. [Implementation Phases](#13-implementation-phases)
14. [Environment Variables](#14-environment-variables)
15. [Deployment](#15-deployment)
16. [Post-Hackathon Roadmap](#16-post-hackathon-roadmap)

---

## 1. Problem Statement

- 68% of donors don't trust that their donations reach the intended cause
- Volunteers burn out because they never see the impact of their work
- Charities struggle to prove accountability and attract repeat donors
- No existing platform combines action-based volunteering, transparent tracking, and volunteer recognition
- Donors ask: "Where did my money go? Did I make an impact?" — and no one can answer
- **In a world full of technology, we're more connected than ever — yet more disconnected from each other and our communities**

---

## 2. Solution Overview

**Takafol** (تكافل — mutual responsibility / empowering each other) is a verified impact platform with two core user actions:

### "Offer Help" Side
- **Charity Platforms** — Admin-registered NGOs with Zakat donation and volunteering programs
- **"من عندي" (Personal Contribution)** — Individual users offering food, services, items, or skills directly to those in need

### "Request Help" Side
- Users post requests describing what they need (food, home repair, vehicle help, etc.)
- AI auto-categorizes the request
- Requests become visible to "Offer Help" users who browse by category

### Key Differentiators
- **Blockchain tracks the full lifecycle** — what was donated, where it went, and proof it arrived
- **AI Tagging Engine** — auto-categorizes free-text posts into structured categories
- **Impact Dashboard** — every donor/volunteer can see exactly what their contribution became
- **Points + Leaderboard** — volunteers earn Impact Score, compete, get recognized
- **Cross-visibility** — personal offers visible ONLY in Request mode; requests visible ONLY in Offer mode
- **Human connection** — technology that brings people together, builds real relationships

> "Have you ever donated and asked yourself — where did this donation go? Takafol answers that question. Every time."

---

## 3. User Roles & Permissions

### 3.1 Regular User (Helper / Requester)
- Can toggle between "Offer Help" and "Request Help" modes
- Can create personal offers ("من عندي")
- Can create help requests
- Can donate to charity platforms (Zakat)
- Can apply to volunteering programs
- Can chat with matched users
- Can rate completed interactions
- Has an Impact Dashboard and Impact Score

### 3.2 Charity Organization (Admin-Registered)
- Created/managed by the platform admin
- Has a profile page with logo, description, verification status
- Can have Zakat donation campaigns
- Can post volunteering programs
- Only verified NGOs can handle money donations

### 3.3 Platform Admin
- Add/remove charity organizations
- Add volunteering programs to charities
- Moderate user reports
- Ban users
- View platform analytics (total donations, active users, completion rates)
- Manage categories

---

## 4. Complete User Flows

### 4.1 Authentication Flow
```
User Opens App
    → Login / Sign Up (Supabase Auth: email + Google OAuth)
    → Home Screen
```

### 4.2 Home Screen
Two primary buttons:
- **"Offer Help" (أريد المساعدة)**
- **"Request Help" (أحتاج مساعدة)**

### 4.3 "Offer Help" Flow

#### Path A: Charity Platform
```
User clicks "Offer Help"
    → Sees list of admin-registered charity platforms
    → Also sees "من عندي" (Personal Contribution) option
    → User selects a charity platform
    → Sees two sections:
        ├── "Zakat Donation" (تبرع زكاة)
        │     → Enter donation amount
        │     → Mock payment confirmation
        │     → Generate receipt
        │     → Logged on blockchain ✓
        │
        └── "Volunteering Programs" (برامج تطوع)
              → View available programs for this charity
              → Apply to program
              → Status tracked
```

#### Path B: Personal Contribution ("من عندي")
```
User clicks "من عندي"
    → Sees 7 category tabs/filters:
        1. Food & Essentials (طعام ومستلزمات)
        2. Home Maintenance (صيانة منزلية)
        3. Vehicle Assistance (مساعدة مركبات)
        4. Household Support (دعم منزلي)
        5. Skills & Professional Help (مهارات ومساعدة مهنية)
        6. Health & Care Support (صحة ورعاية)
        7. Items & Donations (أغراض وتبرعات)

    → Under each category: shows REQUESTS from users who clicked "Request Help"
    → User can filter by: Category / District / Urgency
    → User can click "Offer to Help" on any request → Opens Chat → Status = In Progress
    
    → User can also CREATE a personal offer:
        → Writes description (e.g., "Im willing to fix a car near Tla Al-ali")
        → AI Tagging Engine auto-categorizes the text
        → Selects urgency level (optional)
        → Selects district (منطقة)
        → Selects availability time
        → Offer stored with AI-assigned category
        → Offer Status = Active
        → Offer visible ONLY in "Request Help" mode (to takers)
```

#### Path C: Browse Requests Feed (from Offer Help)
```
User clicks "View Requests Feed" (directly from Offer Help)
    → Sees all active requests from users who need help
    → Filter by Category / District / Urgency
    → Select a request → Click "Offer to Help"
    → Opens Chat with the requester
    → Status = In Progress
    → Both users confirm completion
    → Rate each other
    → Status = Completed
    → Logged on blockchain ✓
```

### 4.4 "Request Help" Flow
```
User clicks "Request Help"
    → Sees two sub-sections:
        ├── "View Offers Feed" — browse personal offers from givers
        │     → Filter by Category / District / Urgency
        │     → Select an offer → Click "Request This Help"
        │     → Opens Chat with the giver
        │     → Status = In Progress
        │     → Both users confirm completion
        │     → Rate each other
        │     → Status = Completed
        │
        └── "Create Request" — post what you need
              → User writes description (e.g., "I need someone to fix my shower in Marj Al-Hamam")
              → User selects urgency level
              → User selects district (منطقة)
              → User selects preferred time
              → AI Tagging Engine categorizes the text → assigns category
              → Request stored with category
              → Request Status = Active
              → Request visible ONLY in "Offer Help" mode (to givers)
```

### 4.5 Connection & Completion Flow
```
User A (giver) and User B (requester) connect via chat
    → Status changes to "In Progress"
    → Giver completes the help (delivers food, fixes car, etc.)
    → Giver submits proof (optional: photo + description)
    → Proof hash logged on blockchain ✓
    → Both users confirm completion
    → Both users rate each other (1-5 stars)
    → Status = Completed
    → Completion logged on blockchain ✓
    → Impact Points awarded to both users
```

---

## 5. AI Tagging Engine

### Purpose
Auto-categorize free-text descriptions from user offers and requests into one of 7 predefined categories. This removes friction (users don't need to manually pick categories) and ensures consistent categorization.

### Categories (with Arabic)
| # | Category (EN) | Category (AR) | Example Triggers |
|---|--------------|---------------|------------------|
| 1 | Food & Essentials | طعام ومستلزمات | food, meals, groceries, iftar, cooking, water, milk |
| 2 | Home Maintenance | صيانة منزلية | plumbing, electrical, painting, fix sink, shower, AC repair |
| 3 | Vehicle Assistance | مساعدة مركبات | car repair, tire, battery, oil change, mechanic, tow |
| 4 | Household Support | دعم منزلي | cleaning, moving, furniture, organizing, appliance setup |
| 5 | Skills & Professional Help | مهارات ومساعدة مهنية | tutoring, translation, legal advice, CV writing, IT help |
| 6 | Health & Care Support | صحة ورعاية | medication, elderly care, physiotherapy, medical transport |
| 7 | Items & Donations | أغراض وتبرعات | clothes, shoes, blankets, toys, electronics, books |

### Implementation Approach

**Option A: LLM-Based Classification (Recommended for Hackathon)**

Use Claude API or OpenAI API to classify text via a structured prompt:

```typescript
// /app/api/ai/classify/route.ts
const systemPrompt = `You are a text classifier for a charity platform.
Given a user's description of help they want to offer or request,
classify it into EXACTLY ONE of these categories:

1. food_essentials
2. home_maintenance
3. vehicle_assistance
4. household_support
5. skills_professional
6. health_care
7. items_donations

Respond with ONLY a JSON object: {"category": "category_id", "confidence": 0.0-1.0}

The text may be in Arabic or English. Handle both.`;

const userMessage = `Classify this: "${userDescription}"`;
```

**Option B: Keyword-Based Fallback (Simpler, No API Cost)**

```typescript
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food_essentials: ['food', 'طعام', 'meal', 'وجبة', 'iftar', 'إفطار', 'grocery', 'cooking', 'طبخ', 'water', 'ماء'],
  home_maintenance: ['plumbing', 'سباكة', 'electrical', 'كهرباء', 'fix', 'إصلاح', 'repair', 'تصليح', 'paint', 'دهان', 'shower', 'دش', 'AC', 'تكييف'],
  vehicle_assistance: ['car', 'سيارة', 'tire', 'إطار', 'battery', 'بطارية', 'mechanic', 'ميكانيكي', 'oil', 'زيت'],
  household_support: ['cleaning', 'تنظيف', 'moving', 'نقل', 'furniture', 'أثاث', 'organize', 'ترتيب'],
  skills_professional: ['tutoring', 'تدريس', 'translation', 'ترجمة', 'legal', 'قانوني', 'CV', 'سيرة ذاتية', 'IT'],
  health_care: ['medication', 'دواء', 'elderly', 'مسن', 'medical', 'طبي', 'therapy', 'علاج'],
  items_donations: ['clothes', 'ملابس', 'shoes', 'أحذية', 'blanket', 'بطانية', 'toys', 'ألعاب', 'books', 'كتب'],
};
```

**Recommendation:** Use Option A (LLM) as primary, Option B (keywords) as fallback if API is down. Both should be implemented.

### AI Tagging Flow
```
User submits description text
    → POST /api/ai/classify { text: "..." }
    → Try LLM classification first
    → If fails or low confidence → fall back to keyword matching
    → Return { category, confidence, subcategory? }
    → Frontend auto-selects category (user can override)
    → Store post with assigned category
```

---

## 6. Blockchain Donation Tracking

### Overview
Blockchain is used as a **server-side transparency layer** for immutable audit logging. Users never interact with crypto directly — no MetaMask, no wallets, no gas fees for users.

### Key Design Decision: No MetaMask Required
- Backend holds ONE server wallet (private key in env vars)
- When a lifecycle event happens, the SERVER writes to chain
- Users just see TX hash + "View on Blockchain" link
- Sepolia testnet = free gas (test ETH from faucet)
- **Zero crypto friction for users and judges**

### What Gets Logged On-Chain

| Event | Data Logged | When |
|-------|------------|------|
| Zakat Donation | donor_id, charity_id, amount, timestamp | User donates to charity |
| Personal Offer Created | offer_id, giver_id, category, district, timestamp | Giver creates offer |
| Help Request Created | request_id, requester_id, category, district, timestamp | Requester posts need |
| Connection Made | offer_id/request_id, giver_id, requester_id, timestamp | Chat initiated |
| Proof Submitted | connection_id, proof_hash, timestamp | Giver submits proof photo |
| Completion Confirmed | connection_id, confirmed_by, timestamp | Both users confirm |
| Task Completed | connection_id, final_rating, timestamp | Full cycle done |

### What Stays Off-Chain (Supabase)

| Data | Reason |
|------|--------|
| User profiles, auth, photos | Privacy + size |
| Chat messages | Volume + real-time needs |
| Actual proof photos | Storage (only hash goes on-chain) |
| Points and leaderboard logic | Computed data |
| Admin panel data | Operational |

### Smart Contract Design

**Contract:** `TakafolTracker.sol`
**Network:** Sepolia Testnet (Ethereum)
**Size:** ~60-80 lines
**Tool:** Remix IDE or Hardhat

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TakafolTracker {
    address public owner;

    // Events — the core of our tracking
    event ZakatDonation(
        string donationId,
        string donorId,
        string charityId,
        string amount,
        string currency,
        uint256 timestamp
    );

    event OfferCreated(
        string offerId,
        string giverId,
        string category,
        string district,
        string description,
        uint256 timestamp
    );

    event RequestCreated(
        string requestId,
        string requesterId,
        string category,
        string district,
        string description,
        uint256 timestamp
    );

    event ConnectionMade(
        string connectionId,
        string offerId,
        string requestId,
        string giverId,
        string requesterId,
        uint256 timestamp
    );

    event ProofSubmitted(
        string connectionId,
        bytes32 proofHash,
        uint256 timestamp
    );

    event CompletionConfirmed(
        string connectionId,
        string confirmedBy,
        uint256 timestamp
    );

    event TaskCompleted(
        string connectionId,
        uint8 giverRating,
        uint8 requesterRating,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function logZakatDonation(
        string memory donationId,
        string memory donorId,
        string memory charityId,
        string memory amount,
        string memory currency
    ) external onlyOwner {
        emit ZakatDonation(donationId, donorId, charityId, amount, currency, block.timestamp);
    }

    function logOffer(
        string memory offerId,
        string memory giverId,
        string memory category,
        string memory district,
        string memory description
    ) external onlyOwner {
        emit OfferCreated(offerId, giverId, category, district, description, block.timestamp);
    }

    function logRequest(
        string memory requestId,
        string memory requesterId,
        string memory category,
        string memory district,
        string memory description
    ) external onlyOwner {
        emit RequestCreated(requestId, requesterId, category, district, description, block.timestamp);
    }

    function logConnection(
        string memory connectionId,
        string memory offerId,
        string memory requestId,
        string memory giverId,
        string memory requesterId
    ) external onlyOwner {
        emit ConnectionMade(connectionId, offerId, requestId, giverId, requesterId, block.timestamp);
    }

    function logProof(
        string memory connectionId,
        bytes32 proofHash
    ) external onlyOwner {
        emit ProofSubmitted(connectionId, proofHash, block.timestamp);
    }

    function logCompletion(
        string memory connectionId,
        string memory confirmedBy
    ) external onlyOwner {
        emit CompletionConfirmed(connectionId, confirmedBy, block.timestamp);
    }

    function logTaskCompleted(
        string memory connectionId,
        uint8 giverRating,
        uint8 requesterRating
    ) external onlyOwner {
        emit TaskCompleted(connectionId, giverRating, requesterRating, block.timestamp);
    }
}
```

### Blockchain Integration in Next.js

```typescript
// /lib/blockchain.ts
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.SERVER_WALLET_PRIVATE_KEY!, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  contractABI,
  wallet
);

export async function logToBlockchain(method: string, ...args: any[]) {
  try {
    const tx = await contract[method](...args);
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`
    };
  } catch (error) {
    console.error('Blockchain logging failed:', error);
    // Non-blocking: app continues even if blockchain logging fails
    return null;
  }
}
```

### Impact Dashboard — What the User Sees
```
┌─────────────────────────────────────────────────────┐
│  Your Donation to Jordan Humanitarian Aid            │
│  Status: CONFIRMED ✓                                │
│                                                     │
│  Your donation: 10 JD (Zakat)                       │
│  Charity: Jordan Humanitarian Aid (Verified NGO)    │
│  Date: March 3, 2026                                │
│                                                     │
│  Blockchain Proof:                                  │
│  └─ Donated:   0xabc123... [View on Etherscan]     │
│                                                     │
│  +10 Impact Points                                  │
├─────────────────────────────────────────────────────┤
│  Your Service: Fixed shower in Marj Al-Hamam         │
│  Status: COMPLETED ✓                                │
│                                                     │
│  Helped: User Sara                                  │
│  Category: Home Maintenance                         │
│  Rating received: ⭐⭐⭐⭐⭐                          │
│                                                     │
│  Blockchain Proof:                                  │
│  ├─ Offer Created: 0xdef456... [View on Etherscan] │
│  ├─ Connected:     0xghi789... [View on Etherscan] │
│  ├─ Proof:         0xjkl012... [View on Etherscan] │
│  └─ Completed:     0xmno345... [View on Etherscan] │
│                                                     │
│  +25 Impact Points                                  │
└─────────────────────────────────────────────────────┘
```

---

## 7. Technical Architecture

### Stack

| Layer | Tool | Why |
|-------|------|-----|
| **Frontend** | Next.js 14+ (App Router) | SSR + API routes in one project, fast |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid, consistent UI, accessible components |
| **Database** | Supabase (PostgreSQL) | Instant setup, real-time subscriptions, Row Level Security |
| **Auth** | Supabase Auth | Google + email login, session management |
| **File Storage** | Supabase Storage | Proof photo uploads with public URLs |
| **Real-time Chat** | Supabase Realtime | Built-in pub/sub for chat messages |
| **Blockchain** | Solidity on Sepolia testnet | Tracking/audit only, no payments |
| **Contract Tool** | Remix IDE (browser) | Zero setup, deploy in minutes |
| **Contract Integration** | ethers.js v6 | Server-side wallet in Next.js API routes |
| **AI Classification** | Anthropic Claude API | Arabic + English text classification |
| **Deploy** | Vercel | Git push → live in 30 seconds |

### Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                        Vercel                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Next.js 14 (App Router)                 │  │
│  │                                                      │  │
│  │  PAGES:                                              │  │
│  │   /                        → Landing / Home          │  │
│  │   /offer                   → Offer Help Hub          │  │
│  │   /offer/charity/[id]      → Charity Detail          │  │
│  │   /offer/personal          → من عندي Browse/Create   │  │
│  │   /offer/requests          → Browse Requests Feed    │  │
│  │   /request                 → Request Help Hub        │  │
│  │   /request/offers          → Browse Offers Feed      │  │
│  │   /request/create          → Create New Request      │  │
│  │   /chat/[connectionId]     → Chat Room               │  │
│  │   /dashboard               → Impact Dashboard        │  │
│  │   /leaderboard             → Top Volunteers          │  │
│  │   /profile                 → User Profile            │  │
│  │   /admin                   → Admin Panel             │  │
│  │                                                      │  │
│  │  API ROUTES:                                         │  │
│  │   /api/auth/...            → Supabase Auth           │  │
│  │   /api/offers/...          → Offer CRUD              │  │
│  │   /api/requests/...        → Request CRUD            │  │
│  │   /api/connections/...     → Connection lifecycle     │  │
│  │   /api/chat/...            → Chat messages           │  │
│  │   /api/ai/classify         → AI Tagging Engine       │  │
│  │   /api/blockchain/...      → Contract calls          │  │
│  │   /api/charities/...       → Charity CRUD (admin)    │  │
│  │   /api/leaderboard         → Rankings                │  │
│  │   /api/admin/...           → Admin operations        │  │
│  └──────────┬──────────────────────┬────────────────────┘  │
│             │                      │                        │
│             ▼                      ▼                        │
│     ┌──────────────┐    ┌───────────────────┐              │
│     │   Supabase    │    │  Smart Contract    │             │
│     │  - PostgreSQL  │    │  (Sepolia)         │             │
│     │  - Auth       │    │  Tracking only     │             │
│     │  - Storage    │    │  via ethers.js     │             │
│     │  - Realtime   │    │  Server wallet     │             │
│     └──────────────┘    └───────────────────┘              │
│             │                                               │
│             ▼                                               │
│     ┌──────────────┐                                       │
│     │ Claude API    │                                       │
│     │ AI Classify   │                                       │
│     └──────────────┘                                       │
└───────────────────────────────────────────────────────────┘
```

---

## 8. Database Schema

### Supabase Tables (SQL)

```sql
-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  district TEXT,                          -- user's district in Amman
  bio TEXT,
  impact_score INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  average_rating NUMERIC(2,1) DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user',               -- 'user' | 'admin'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CHARITY ORGANIZATIONS (admin-managed)
-- ============================================
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,                           -- Arabic name
  description TEXT,
  description_ar TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,      -- only verified NGOs handle money
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VOLUNTEERING PROGRAMS (under charities)
-- ============================================
CREATE TABLE volunteer_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  location TEXT,
  district TEXT,
  max_volunteers INTEGER,
  current_volunteers INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'open',             -- 'open' | 'full' | 'completed' | 'cancelled'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VOLUNTEER APPLICATIONS
-- ============================================
CREATE TABLE volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES volunteer_programs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',          -- 'pending' | 'accepted' | 'rejected' | 'completed'
  applied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, user_id)
);

-- ============================================
-- ZAKAT DONATIONS (through charities only)
-- ============================================
CREATE TABLE zakat_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id),
  charity_id UUID REFERENCES charities(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'JOD',
  receipt_number TEXT,
  tx_hash TEXT,                           -- blockchain TX hash
  explorer_url TEXT,                      -- etherscan link
  status TEXT DEFAULT 'confirmed',        -- 'pending' | 'confirmed' | 'failed'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CATEGORIES (predefined, admin can extend)
-- ============================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,                    -- 'food_essentials', 'home_maintenance', etc.
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,                              -- emoji or icon name
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Seed categories
INSERT INTO categories (id, name_en, name_ar, icon, sort_order) VALUES
  ('food_essentials', 'Food & Essentials', 'طعام ومستلزمات', '🍽️', 1),
  ('home_maintenance', 'Home Maintenance', 'صيانة منزلية', '🔧', 2),
  ('vehicle_assistance', 'Vehicle Assistance', 'مساعدة مركبات', '🚗', 3),
  ('household_support', 'Household Support', 'دعم منزلي', '🏠', 4),
  ('skills_professional', 'Skills & Professional Help', 'مهارات ومساعدة مهنية', '💼', 5),
  ('health_care', 'Health & Care Support', 'صحة ورعاية', '🏥', 6),
  ('items_donations', 'Items & Donations', 'أغراض وتبرعات', '📦', 7);

-- ============================================
-- DISTRICTS (areas in Jordan)
-- ============================================
CREATE TABLE districts (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  city TEXT DEFAULT 'Amman'
);

-- Seed some districts
INSERT INTO districts (id, name_en, name_ar) VALUES
  ('tla_ali', 'Tla Al-Ali', 'تلاع العلي'),
  ('marj_hamam', 'Marj Al-Hamam', 'مرج الحمام'),
  ('abdoun', 'Abdoun', 'عبدون'),
  ('jabal_amman', 'Jabal Amman', 'جبل عمان'),
  ('zarqa', 'Zarqa', 'الزرقاء'),
  ('irbid', 'Irbid', 'إربد'),
  ('sweileh', 'Sweileh', 'صويلح'),
  ('tabarbour', 'Tabarbour', 'طبربور'),
  ('abu_nsair', 'Abu Nsair', 'أبو نصير'),
  ('jubeiha', 'Jubeiha', 'الجبيهة'),
  ('shmeisani', 'Shmeisani', 'الشميساني'),
  ('wehdat', 'Wehdat', 'الوحدات'),
  ('hashmi', 'Hashmi Shamali', 'الهاشمي الشمالي'),
  ('khalda', 'Khalda', 'خلدا'),
  ('sahab', 'Sahab', 'سحاب');

-- ============================================
-- POSTS (offers and requests)
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                     -- 'offer' | 'request'
  title TEXT,
  description TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id),
  ai_category_id TEXT,                    -- AI-suggested category (before user confirms)
  ai_confidence NUMERIC(3,2),             -- AI confidence score 0.00-1.00
  district_id TEXT REFERENCES districts(id),
  urgency TEXT DEFAULT 'normal',          -- 'low' | 'normal' | 'high' | 'urgent'
  availability_time TEXT,                 -- e.g., "Weekdays after 5pm"
  preferred_time TEXT,                    -- for requests
  status TEXT DEFAULT 'active',           -- 'active' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
  tx_hash_created TEXT,                   -- blockchain TX for post creation
  explorer_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days')
);

-- Index for efficient filtering
CREATE INDEX idx_posts_type_status ON posts(type, status);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_district ON posts(district_id);
CREATE INDEX idx_posts_urgency ON posts(urgency);

-- ============================================
-- CONNECTIONS (giver <-> requester match)
-- ============================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_post_id UUID REFERENCES posts(id),      -- can be null if giver responds to a request directly
  request_post_id UUID REFERENCES posts(id),     -- can be null if requester responds to an offer
  giver_id UUID REFERENCES profiles(id),
  requester_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',                  -- 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  proof_url TEXT,                                 -- photo proof URL (Supabase Storage)
  proof_hash TEXT,                                -- hash stored on-chain
  giver_confirmed BOOLEAN DEFAULT false,
  requester_confirmed BOOLEAN DEFAULT false,
  giver_rating INTEGER,                           -- 1-5 stars
  requester_rating INTEGER,                       -- 1-5 stars
  giver_review TEXT,
  requester_review TEXT,
  -- Blockchain TX hashes for each lifecycle step
  tx_hash_connected TEXT,
  tx_hash_proof TEXT,
  tx_hash_completed TEXT,
  points_awarded_giver INTEGER DEFAULT 0,
  points_awarded_requester INTEGER DEFAULT 0,
  connected_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_connection ON messages(connection_id, created_at);

-- ============================================
-- USER REPORTS (moderation)
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  connection_id UUID REFERENCES connections(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',          -- 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ENABLE REALTIME for chat
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE connections;
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles but only update their own
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Anyone can read active posts
CREATE POLICY "Read active posts" ON posts FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Users create own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

-- Users can read connections they're part of
CREATE POLICY "Read own connections" ON connections FOR SELECT
  USING (auth.uid() = giver_id OR auth.uid() = requester_id);

-- Users can read messages in their connections
CREATE POLICY "Read own messages" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = messages.connection_id
      AND (c.giver_id = auth.uid() OR c.requester_id = auth.uid())
    )
  );
```

---

## 9. API Endpoints

### Authentication
```
POST   /api/auth/signup           → Create account (Supabase Auth)
POST   /api/auth/login            → Login (email/Google)
POST   /api/auth/logout           → Logout
GET    /api/auth/session          → Get current session
```

### Posts (Offers & Requests)
```
GET    /api/posts                 → List posts (filters: type, category, district, urgency, status)
POST   /api/posts                 → Create new post (offer or request)
GET    /api/posts/[id]            → Get single post detail
PATCH  /api/posts/[id]            → Update post (owner only)
DELETE /api/posts/[id]            → Cancel/delete post (owner only)
GET    /api/posts/my              → Get current user's posts
```

### AI Classification
```
POST   /api/ai/classify           → Classify text → returns { category, confidence }
  Body: { text: string, language?: 'ar' | 'en' | 'auto' }
```

### Connections
```
POST   /api/connections           → Create connection (giver responds to request, or requester responds to offer)
GET    /api/connections           → List user's connections
GET    /api/connections/[id]      → Get connection detail with TX hashes
PATCH  /api/connections/[id]      → Update status (accept, confirm, rate)
POST   /api/connections/[id]/proof → Upload proof photo + hash to blockchain
```

### Chat
```
GET    /api/chat/[connectionId]          → Get chat messages for a connection
POST   /api/chat/[connectionId]          → Send a message
  (Real-time via Supabase Realtime subscriptions on client)
```

### Charities (Admin-managed)
```
GET    /api/charities                    → List active charities
GET    /api/charities/[id]               → Charity detail + programs
POST   /api/charities                    → Create charity (admin only)
PATCH  /api/charities/[id]               → Update charity (admin only)
DELETE /api/charities/[id]               → Deactivate charity (admin only)
```

### Volunteering Programs
```
GET    /api/charities/[id]/programs      → List programs for a charity
POST   /api/charities/[id]/programs      → Create program (admin only)
POST   /api/programs/[id]/apply          → Apply to volunteer
GET    /api/programs/my                  → Get user's program applications
```

### Zakat Donations
```
POST   /api/donations/zakat              → Create zakat donation (mock payment)
GET    /api/donations/my                 → Get user's donation history
GET    /api/donations/[id]/receipt       → Generate donation receipt
```

### Blockchain
```
POST   /api/blockchain/log               → Internal: write event to smart contract
GET    /api/blockchain/tx/[hash]         → Get TX details + explorer link
GET    /api/blockchain/user/[id]         → Get all TX hashes for a user
```

### Leaderboard & Impact
```
GET    /api/leaderboard                  → Top users by Impact Score
GET    /api/impact/[userId]              → User's impact summary + all TX links
GET    /api/impact/stats                 → Platform-wide stats
```

### Admin
```
GET    /api/admin/stats                  → Platform analytics
GET    /api/admin/reports                → Pending reports
PATCH  /api/admin/reports/[id]           → Resolve report
POST   /api/admin/users/[id]/ban         → Ban user
GET    /api/admin/users                  → List all users
```

---

## 10. Frontend Pages & Components

### Page Structure

```
/                           → Landing page: "Offer Help" / "Request Help" CTAs
/auth/login                 → Login page
/auth/signup                → Signup page

/offer                      → Offer Help hub
/offer/charities            → List of registered charity platforms
/offer/charities/[id]       → Charity detail: Zakat + Volunteering sections
/offer/personal             → "من عندي" — browse requests by category + create offers
/offer/personal/create      → Create personal offer form
/offer/requests             → Browse all active requests feed

/request                    → Request Help hub
/request/offers             → Browse all active offers feed
/request/create             → Create new request form

/chat/[connectionId]        → Real-time chat room

/dashboard                  → Impact Dashboard (user's history + blockchain proof)
/leaderboard                → Top Impact Scores
/profile                    → User profile + settings
/profile/[userId]           → Public profile view

/admin                      → Admin dashboard
/admin/charities            → Manage charities
/admin/programs             → Manage volunteering programs
/admin/reports              → Moderate reports
/admin/users                → User management
/admin/analytics            → Platform analytics
```

### Key Components

```
components/
├── layout/
│   ├── Navbar.tsx              → Top nav with role toggle
│   ├── BottomNav.tsx           → Mobile bottom navigation
│   ├── Sidebar.tsx             → Admin sidebar
│   └── Footer.tsx
├── auth/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── posts/
│   ├── PostCard.tsx            → Card showing offer/request preview
│   ├── PostFeed.tsx            → Scrollable feed with filters
│   ├── PostFilters.tsx         → Category / District / Urgency filters
│   ├── PostDetail.tsx          → Full post view with action buttons
│   ├── CreatePostForm.tsx      → Form for creating offer/request
│   └── CategoryPicker.tsx      → Category selection with icons
├── charity/
│   ├── CharityCard.tsx         → Charity platform card
│   ├── CharityList.tsx         → Grid of charities
│   ├── ZakatDonationForm.tsx   → Donation amount + mock payment
│   ├── DonationReceipt.tsx     → Receipt with blockchain TX
│   └── ProgramCard.tsx         → Volunteering program card
├── chat/
│   ├── ChatRoom.tsx            → Real-time messaging
│   ├── MessageBubble.tsx       → Individual message
│   └── ChatInput.tsx           → Text input + send
├── connections/
│   ├── ConnectionCard.tsx      → Connection status card
│   ├── ProofUpload.tsx         → Photo upload for proof
│   ├── RatingForm.tsx          → Star rating + review
│   └── CompletionFlow.tsx      → Both-confirm flow
├── dashboard/
│   ├── ImpactSummary.tsx       → Total stats overview
│   ├── ImpactCard.tsx          → Single completed task with TX links
│   ├── BlockchainProof.tsx     → TX hash display with Etherscan link
│   └── ImpactChart.tsx         → Visual impact over time
├── leaderboard/
│   ├── LeaderboardTable.tsx    → Ranked users
│   └── UserRank.tsx            → User's current rank badge
├── admin/
│   ├── AdminStats.tsx          → Key metrics cards
│   ├── CharityManager.tsx      → CRUD charities
│   ├── ReportsList.tsx         → Pending reports
│   └── UserManager.tsx         → Ban/manage users
└── ui/
    ├── Badge.tsx               → Urgency/status badges
    ├── ArabicText.tsx          → RTL text wrapper
    ├── DistrictSelect.tsx      → District dropdown
    └── LoadingSpinner.tsx
```

### Design System Notes
- **Direction:** Support RTL (Arabic) layout throughout
- **Colors:** Ramadan-themed: deep green (#065F46), gold (#D97706), white, dark
- **Typography:** Arabic-friendly font stack: `"IBM Plex Sans Arabic", "Noto Sans Arabic", sans-serif`
- **Mobile-first:** Bottom navigation on mobile, sidebar on desktop
- **Accessibility:** All interactive elements have aria labels, proper focus management

---

## 11. Gamification System

### Impact Score Points

| Action | Points | Notes |
|--------|--------|-------|
| Create a personal offer | +5 | Encourages participation |
| Create a help request | +3 | Lower to avoid gaming |
| Connect with someone | +5 | Both parties get points |
| Submit proof of completion | +10 | Giver only |
| Complete a task (both confirm) | +20 | Both parties |
| Complete 5 tasks in a week | +15 bonus | Streak reward |
| First task ever | +10 bonus | Onboarding incentive |
| 3-week active streak | +25 bonus | Retention |
| Donate Zakat | +10 | Per donation |
| Apply to volunteering program | +5 | Engagement |
| Receive 5-star rating | +5 bonus | Quality incentive |

### Leaderboard
- Ranked by total Impact Score
- Show: Name, Score, Tasks Completed, Top Category, District
- Filters: This week / This month / All time / By district
- Future: corporate teams, university groups, city challenges

---

## 12. Admin Panel

### Admin Dashboard (/ admin)
- Total registered users
- Total active offers / requests
- Total connections made
- Total completed tasks
- Total Zakat donations (amount)
- Completion rate (%)
- Pending reports count

### Admin Capabilities
1. **Add/Remove Charities** — Create charity profiles with logos, descriptions, verification status
2. **Add Volunteering Programs** — Create programs under specific charities
3. **Moderate Reports** — Review user reports, take action (warn, ban)
4. **Ban Users** — Toggle ban status, banned users can't create posts or connect
5. **View Analytics** — Charts: daily signups, donations over time, top categories, top districts

---

## 13. Implementation Phases — Developer Role Split

### Team Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLOWCHART OWNERSHIP SPLIT                        │
│                                                                         │
│  ┌─────────────────────────────────────────┐                            │
│  │          DEV 1 (LUNA)                   │                            │
│  │                                         │                            │
│  │  User Opens App                         │                            │
│  │    → Login / Sign Up                    │                            │
│  │    → Home Screen                        │                            │
│  │    → "Offer Help" hub                   │                            │
│  │       ├── Charity Platforms (listing)   │                            │
│  │       ├── "من عندي" (create offer)      │                            │
│  │       └── View Requests Feed            │                            │
│  │    → "Request Help" hub                 │                            │
│  │       ├── View Offers Feed              │                            │
│  │       └── Create Request                │                            │
│  │    → AI Tagging Engine                  │                            │
│  │    → Admin Panel                        │                            │
│  │    → Filtering (category/district/urgency) │                         │
│  │                                         │                            │
│  │  STOPS AT: "Select Charity" decision    │                            │
│  └──────────────────────┬──────────────────┘                            │
│                         │ handoff                                       │
│  ┌──────────────────────▼──────────────────┐                            │
│  │          DEV 2                          │                            │
│  │                                         │                            │
│  │  After "Select Charity":                │                            │
│  │    ├── Zakat Donation flow              │                            │
│  │    │     (enter amount → mock payment   │                            │
│  │    │      → receipt → blockchain log)   │                            │
│  │    ├── Volunteering Programs            │                            │
│  │    │     (view programs → apply)        │                            │
│  │    ├── Connection system                │                            │
│  │    │     (click Offer to Help / Request │                            │
│  │    │      This Help → Open Chat)        │                            │
│  │    ├── Real-time Chat                   │                            │
│  │    ├── Status lifecycle                 │                            │
│  │    │     (In Progress → Both Confirm    │                            │
│  │    │      → Rate → Completed)           │                            │
│  │    ├── Proof submission + photo upload   │                            │
│  │    ├── Rating system (1-5 stars)        │                            │
│  │    ├── Blockchain (smart contract,      │                            │
│  │    │     ethers.js, all TX logging)     │                            │
│  │    ├── Impact Dashboard + TX display    │                            │
│  │    └── Leaderboard + Gamification       │                            │
│  └─────────────────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Summary: Who Builds What

| Area | Dev 1 (LUNA) | Dev 2 |
|------|:---:|:---:|
| Project setup, Next.js scaffold, Supabase config | ✅ | — |
| Database schema (all tables) | ✅ | — |
| Auth (login, signup, session) | ✅ | — |
| Landing page / Home Screen | ✅ | — |
| "Offer Help" hub page | ✅ | — |
| Charity Platforms listing page | ✅ | — |
| "من عندي" personal offers (create + browse) | ✅ | — |
| "Request Help" hub page | ✅ | — |
| Create Request form | ✅ | — |
| View Requests Feed + View Offers Feed | ✅ | — |
| PostCard, PostFeed, PostFilters components | ✅ | — |
| Filtering (category / district / urgency) | ✅ | — |
| AI Tagging Engine (classify API + keyword fallback) | ✅ | — |
| Categories + Districts seed data | ✅ | — |
| Admin Panel (charities CRUD, reports, ban, analytics) | ✅ | — |
| Layout (Navbar, BottomNav, RTL, Ramadan theme) | ✅ | — |
| Zakat Donation flow (amount → mock payment → receipt) | — | ✅ |
| Volunteering Programs (list + apply) | — | ✅ |
| Connection system (connect giver ↔ requester) | — | ✅ |
| Real-time Chat (Supabase Realtime) | — | ✅ |
| Proof submission (photo upload + hashing) | — | ✅ |
| Completion flow (both confirm + status transitions) | — | ✅ |
| Rating system (stars + reviews) | — | ✅ |
| Smart Contract (TakafolTracker.sol + deploy) | — | ✅ |
| Blockchain integration (ethers.js, TX logging) | — | ✅ |
| BlockchainProof component + Etherscan links | — | ✅ |
| Impact Dashboard | — | ✅ |
| Leaderboard + Gamification (points system) | — | ✅ |
| Demo seed data | SHARED | SHARED |
| Demo prep + testing | SHARED | SHARED |

---

### DEV 1 (LUNA) — Platform Foundation, Feeds, AI, and Admin

> **Scope:** Everything from "User Opens App" through to the point where a user selects a charity or clicks on a specific request/offer. All the infrastructure, navigation, post creation, AI classification, feeds, filters, and admin panel.

---

#### DEV 1 — Phase 1: Project Foundation + Auth (Hours 0-6)

**Goal:** Working Next.js project with Supabase database, auth, and base layout

**Tasks:**
1. Initialize Next.js 14 project with TypeScript
   ```bash
   npx create-next-app@latest takafol --typescript --tailwind --eslint --app --src-dir
   ```
2. Install core dependencies
   ```bash
   npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk lucide-react class-variance-authority clsx tailwind-merge
   ```
3. Set up shadcn/ui
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card input textarea select badge dialog sheet tabs avatar dropdown-menu toast
   ```
4. Create Supabase project + run FULL database schema (Section 8) in SQL Editor
   - All 12 tables: profiles, charities, volunteer_programs, volunteer_applications, zakat_donations, categories, districts, posts, connections, messages, reports
   - All RLS policies
   - Seed categories and districts data
   - Enable Realtime on messages and connections tables
5. Create Supabase auth trigger: auto-create profile row on user signup
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, full_name, avatar_url)
     VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```
6. Configure Supabase Auth providers: Email + Google OAuth
7. Set up Supabase client utilities
   - `/lib/supabase/client.ts` — browser client
   - `/lib/supabase/server.ts` — server-side client
   - `/lib/supabase/middleware.ts` — session refresh middleware
8. Create `.env.local` with all environment variables (Section 14)
9. Build layout components:
   - `Navbar.tsx` — top nav with logo, user menu, role indicator
   - `BottomNav.tsx` — mobile bottom nav (Home, Offer, Request, Dashboard, Profile)
   - `Footer.tsx`
   - RTL-aware layout wrapper with Arabic font stack
10. Build auth pages:
    - `/auth/login/page.tsx` — email + Google login
    - `/auth/signup/page.tsx` — registration with full_name, district
    - `/auth/callback/route.ts` — OAuth callback handler
11. Build the Landing / Home page (`/page.tsx`):
    - Two large CTA buttons: "Offer Help" (أريد المساعدة) and "Request Help" (أحتاج مساعدة)
    - Ramadan-themed design: deep green (#065F46), gold (#D97706)
    - Arabic typography: "IBM Plex Sans Arabic" or "Noto Sans Arabic"
12. Set up middleware.ts for session management

**File Structure After Phase 1:**
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    (Landing page)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   └── api/
│       └── auth/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx
│   │   └── Footer.tsx
│   └── ui/                         (shadcn components)
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
└── middleware.ts
```

**Deliverables:**
- ✅ Next.js app running locally with Tailwind + shadcn/ui
- ✅ Supabase database with all 12 tables created + RLS active
- ✅ Auth working (signup → auto profile → login → session)
- ✅ Landing page with "Offer Help" / "Request Help" buttons
- ✅ Mobile-responsive layout with Navbar + BottomNav
- ✅ RTL + Arabic font configured

**Handoff to Dev 2:** After this phase, Dev 2 can clone the repo and start working on their branch. Dev 2 depends on this foundation being complete.

---

#### DEV 1 — Phase 2: Core Posts System + Feeds (Hours 6-14)

**Goal:** Users can create offers/requests, browse feeds, filter by category/district/urgency

**Tasks:**
1. Build shared types
   ```typescript
   // /types/index.ts
   type PostType = 'offer' | 'request';
   type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';
   type PostStatus = 'active' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
   interface Post { id, user_id, type, title, description, category_id, district_id, urgency, status, ... }
   interface Category { id, name_en, name_ar, icon, sort_order }
   interface District { id, name_en, name_ar, city }
   ```
2. Implement API routes for posts:
   - `POST /api/posts` — create new offer or request
   - `GET /api/posts` — list posts with query params: `?type=offer&category=food_essentials&district=tla_ali&urgency=high&status=active`
   - `GET /api/posts/[id]` — single post detail
   - `PATCH /api/posts/[id]` — update post (owner only)
   - `DELETE /api/posts/[id]` — cancel post (owner only)
   - `GET /api/posts/my` — current user's posts
3. Build reusable components:
   - `CategoryPicker.tsx` — horizontal scrollable tabs with emoji icons for all 7 categories
   - `DistrictSelect.tsx` — searchable dropdown of Amman districts (Arabic + English)
   - `UrgencyBadge.tsx` — color-coded badge (low=gray, normal=blue, high=orange, urgent=red)
   - `PostFilters.tsx` — combines CategoryPicker + DistrictSelect + UrgencySelect
   - `PostCard.tsx` — card showing: title, description preview, category badge, district, urgency, time ago
   - `PostFeed.tsx` — infinite scroll list of PostCards with PostFilters at the top
   - `PostDetail.tsx` — full post view with action buttons (placeholder for Dev 2's "Offer to Help" / "Request This Help" buttons)
   - `CreatePostForm.tsx` — unified form for creating both offers and requests:
     - Text description input (textarea)
     - Category selector (auto-filled by AI, user can override)
     - District dropdown
     - Urgency selector
     - Availability time (for offers) / Preferred time (for requests)
     - Submit button
4. Build "Offer Help" hub page (`/offer/page.tsx`):
   - Shows registered charity platforms (CharityCard grid) → links to `/offer/charities/[id]`
   - Shows "من عندي" (Personal Contribution) card → links to `/offer/personal`
   - Shows "View Requests Feed" link → links to `/offer/requests`
5. Build Charity Platforms listing (`/offer/charities/page.tsx`):
   - `CharityCard.tsx` — card with logo, name, description, verified badge
   - `CharityList.tsx` — grid of CharityCards
   - Each card links to `/offer/charities/[id]` (charity detail page — **the shell only**, inner content built by Dev 2)
6. Build Charity detail page shell (`/offer/charities/[id]/page.tsx`):
   - Shows charity info header (logo, name, verified status, description)
   - Two section tabs: "Zakat Donation" and "Volunteering Programs"
   - **Tab contents are placeholder slots for Dev 2 to fill in**
7. Build "من عندي" page (`/offer/personal/page.tsx`):
   - CategoryPicker at top (7 categories as tabs)
   - When a category is selected: shows all REQUESTS from takers in that category
   - "Create Offer" FAB button → opens `/offer/personal/create`
   - PostFeed component filtered by type='request' and selected category
8. Build "Create Personal Offer" page (`/offer/personal/create/page.tsx`):
   - Uses CreatePostForm with type='offer'
   - AI tagging auto-fills category (Phase 3 will wire this up)
9. Build "View Requests Feed" page (`/offer/requests/page.tsx`):
   - PostFeed showing all active requests
   - PostFilters: category, district, urgency
   - Each card has a placeholder "Offer to Help" button (Dev 2 wires the connection logic)
10. Build "Request Help" hub page (`/request/page.tsx`):
    - Shows "View Offers Feed" link → `/request/offers`
    - Shows "Create Request" button → `/request/create`
11. Build "View Offers Feed" page (`/request/offers/page.tsx`):
    - PostFeed showing all active offers
    - PostFilters: category, district, urgency
    - Each card has a placeholder "Request This Help" button (Dev 2 wires connection logic)
12. Build "Create Request" page (`/request/create/page.tsx`):
    - Uses CreatePostForm with type='request'
    - Fields: description, urgency, district, preferred time
    - AI tagging auto-fills category
13. Implement visibility rules:
    - Offers (type='offer') are visible ONLY on the Request Help side (`/request/offers`)
    - Requests (type='request') are visible ONLY on the Offer Help side (`/offer/personal`, `/offer/requests`)
14. Seed demo data: 6+ offers + 6+ requests across all 7 categories and multiple districts

**File Structure After Phase 2:**
```
src/app/
├── offer/
│   ├── page.tsx                     (Offer Help hub)
│   ├── charities/
│   │   ├── page.tsx                 (Charity list)
│   │   └── [id]/page.tsx            (Charity detail shell)
│   ├── personal/
│   │   ├── page.tsx                 (من عندي — browse requests by category)
│   │   └── create/page.tsx          (Create personal offer)
│   └── requests/
│       └── page.tsx                 (Browse all requests feed)
├── request/
│   ├── page.tsx                     (Request Help hub)
│   ├── offers/
│   │   └── page.tsx                 (Browse all offers feed)
│   └── create/
│       └── page.tsx                 (Create new request)
src/components/
├── posts/
│   ├── PostCard.tsx
│   ├── PostFeed.tsx
│   ├── PostFilters.tsx
│   ├── PostDetail.tsx
│   ├── CreatePostForm.tsx
│   └── CategoryPicker.tsx
├── charity/
│   ├── CharityCard.tsx
│   └── CharityList.tsx
src/types/
└── index.ts
```

**Deliverables:**
- ✅ "Offer Help" hub with 3 paths: Charities, من عندي, Requests Feed
- ✅ "Request Help" hub with 2 paths: Offers Feed, Create Request
- ✅ Create offer + create request forms working
- ✅ PostFeed with filtering by category/district/urgency
- ✅ Cross-visibility: offers only on request side, requests only on offer side
- ✅ Charity listing page + detail page shell (ready for Dev 2)
- ✅ Placeholder buttons for "Offer to Help" / "Request This Help" (Dev 2 wires these)

---

#### DEV 1 — Phase 3: AI Tagging Engine (Hours 14-18)

**Goal:** Free-text descriptions are auto-classified into categories in Arabic and English

**Tasks:**
1. Implement Claude API classification endpoint:
   ```
   POST /api/ai/classify
   Body: { text: string }
   Response: { category: string, confidence: number }
   ```
   - System prompt instructs Claude to classify into one of 7 categories
   - Returns JSON: `{ "category": "home_maintenance", "confidence": 0.95 }`
   - Handle both Arabic and English text
2. Implement keyword-based fallback classifier (`/lib/classifier.ts`):
   - Map of category_id → keyword arrays (Arabic + English)
   - Scores each category by keyword match count
   - Returns highest scoring category
   - Used when: Claude API fails, slow response, or for offline testing
3. Wire AI classification into CreatePostForm:
   - On text input blur (or after 500ms debounce): call `/api/ai/classify`
   - Auto-select the suggested category in CategoryPicker
   - Show small confidence indicator: "AI suggests: 🔧 Home Maintenance (95%)"
   - User can override by selecting a different category
4. Store AI metadata in posts table:
   - `ai_category_id` — what AI suggested
   - `ai_confidence` — confidence score
   - `category_id` — final category (user-confirmed or AI default)
5. Test with sample inputs:
   - Arabic: "أريد شخص يصلح الدش في مرج الحمام" → home_maintenance
   - Arabic: "عندي أكل زيادة من الإفطار" → food_essentials
   - English: "I can fix cars near Tla Al-Ali" → vehicle_assistance
   - English: "Need someone to tutor my kids in math" → skills_professional
   - Mixed: "محتاج help with AC repair" → home_maintenance
6. Add loading spinner while AI classifies
7. Handle edge cases: empty text, gibberish, very short input

**Deliverables:**
- ✅ `/api/ai/classify` endpoint working with Claude API
- ✅ Keyword fallback working when API unavailable
- ✅ CreatePostForm auto-suggests category on text input
- ✅ User can override AI suggestion
- ✅ Works with Arabic, English, and mixed text

---

#### DEV 1 — Phase 4: Admin Panel (Hours 18-24)

**Goal:** Full admin panel for managing charities, programs, reports, and users

**Tasks:**
1. Build admin layout with sidebar (`/admin/layout.tsx`):
   - Sidebar links: Dashboard, Charities, Programs, Reports, Users, Analytics
   - Access control: only users with role='admin' in profiles table
   - Redirect non-admins to home
2. Build Admin Dashboard (`/admin/page.tsx`):
   - Stats cards: Total Users, Active Offers, Active Requests, Connections Made, Completed Tasks, Total Zakat Donated, Pending Reports
   - Query aggregates from Supabase
3. Build Charity Management (`/admin/charities/page.tsx`):
   - Table listing all charities with: name, verified status, active status
   - "Add Charity" button → modal/dialog form:
     - Name (EN + AR), description (EN + AR), logo upload, contact email, phone, website
     - Verified checkbox (only admin can set)
   - Edit charity → same form pre-filled
   - Deactivate charity (soft delete via is_active=false)
   - API routes:
     - `POST /api/charities` — create (admin only)
     - `PATCH /api/charities/[id]` — update (admin only)
     - `DELETE /api/charities/[id]` — deactivate (admin only)
4. Build Volunteering Program Management (`/admin/programs/page.tsx`):
   - Table of all programs across all charities
   - "Add Program" button → form:
     - Select parent charity, title (EN + AR), description, location, district, max volunteers, start/end dates
   - Edit / cancel programs
   - API routes:
     - `POST /api/charities/[id]/programs` — create program (admin only)
     - `PATCH /api/programs/[id]` — update (admin only)
5. Build Reports Moderation (`/admin/reports/page.tsx`):
   - Table of pending reports with: reporter, reported user, reason, date
   - Click to expand: full details, connection context
   - Actions: Dismiss, Warn User, Ban User
   - API routes:
     - `GET /api/admin/reports` — list pending reports
     - `PATCH /api/admin/reports/[id]` — resolve report (dismiss / action_taken)
6. Build User Management (`/admin/users/page.tsx`):
   - Table of all users: name, district, impact score, status, joined date
   - Search by name
   - Ban/unban toggle
   - API route:
     - `POST /api/admin/users/[id]/ban` — toggle ban
7. Build Analytics page (`/admin/analytics/page.tsx`):
   - Charts (use recharts or simple counters for hackathon):
     - Signups over time
     - Posts created per day
     - Top categories breakdown
     - Top districts
     - Completion rate percentage
8. Set up admin seed data: create 1 admin user account

**File Structure After Phase 4:**
```
src/app/admin/
├── layout.tsx                  (Admin sidebar layout)
├── page.tsx                    (Dashboard with stats)
├── charities/
│   └── page.tsx                (Charity CRUD)
├── programs/
│   └── page.tsx                (Program CRUD)
├── reports/
│   └── page.tsx                (Reports moderation)
├── users/
│   └── page.tsx                (User management)
└── analytics/
    └── page.tsx                (Charts + metrics)
```

**Deliverables:**
- ✅ Admin dashboard with live stats
- ✅ Full charity CRUD (create, edit, deactivate)
- ✅ Volunteering program CRUD under charities
- ✅ Reports moderation with ban/dismiss actions
- ✅ User management with search + ban toggle
- ✅ Analytics page with category/district breakdowns

---

#### DEV 1 — Phase 5: Polish + Integration Prep (Hours 24-28)

**Goal:** UI polish, RTL, theming, and prepare integration points for Dev 2

**Tasks:**
1. Add RTL (Arabic) support:
   - `dir="rtl"` on html element when Arabic is active
   - Tailwind RTL utilities: `rtl:` prefix where needed
   - Test all pages in RTL mode
2. Ramadan theme polish:
   - Color palette: deep green (#065F46), gold (#D97706), warm white (#FFFBEB), dark (#1C1917)
   - Islamic geometric pattern SVG as subtle background on landing page
   - Crescent moon icon in navbar
3. Mobile responsiveness pass on ALL Dev 1 pages:
   - Test on 375px (iPhone SE) through 1440px (desktop)
   - BottomNav visible only on mobile, Navbar on desktop
4. Add loading states (skeleton loaders) to: PostFeed, CharityList, Admin tables
5. Add empty states: "No offers yet", "No requests in this category", etc.
6. Add error handling: toast notifications for API failures
7. Add user profile page (`/profile/page.tsx`):
   - Edit name, avatar, district, bio
   - Show Impact Score (read-only, calculated by Dev 2's system)
   - Show "My Posts" tab (offers + requests)
   - Show "My Connections" tab (placeholder for Dev 2)
8. **Prepare integration points for Dev 2:**
   - Ensure `PostDetail.tsx` has a clear `actionButton` prop slot where Dev 2 adds "Offer to Help" / "Request This Help"
   - Ensure charity detail page has clear slots for Zakat form + Programs list
   - Ensure PostCard has an `onConnect` callback prop
   - Document all integration points in a `DEV2_INTEGRATION.md` file
9. Git: ensure clean branch, push to shared repo

**Deliverables:**
- ✅ Full RTL Arabic support working
- ✅ Ramadan theme applied across all pages
- ✅ Mobile responsive on all screen sizes
- ✅ Loading, empty, and error states everywhere
- ✅ User profile page
- ✅ Integration points documented for Dev 2

---

### DEV 2 — Post-Charity Flows, Connections, Blockchain, and Gamification

> **Scope:** Everything that happens after a user selects a specific charity, clicks "Offer to Help", or clicks "Request This Help". All the transactional flows: donations, volunteering, connections, chat, proof, ratings, blockchain, impact dashboard, and leaderboard.

> **Prerequisite:** Dev 2 starts working after Dev 1 completes Phase 1 (foundation). Dev 2 can work in parallel from their Phase 1 onward, but depends on the database schema and auth being set up.

---

#### DEV 2 — Phase 1: Zakat Donation + Volunteering Flows (Hours 6-14)

**Goal:** Complete the charity detail page with Zakat donations and volunteering programs

**Tasks:**
1. Build Zakat Donation flow inside charity detail page (`/offer/charities/[id]`):
   - `ZakatDonationForm.tsx`:
     - Amount input with preset buttons (5 JD, 10 JD, 25 JD, 50 JD, custom)
     - Currency display (JOD)
     - "Donate" button
   - Mock payment confirmation:
     - Simulate a 2-second processing delay
     - Show success screen with checkmark animation
     - Generate receipt_number (format: `ZKT-2026-XXXXX`)
   - `DonationReceipt.tsx`:
     - Shows: amount, charity name, receipt number, date
     - "View on Blockchain" link (placeholder — wired in Phase 3)
     - "Download Receipt" option (optional, nice-to-have)
   - API routes:
     - `POST /api/donations/zakat` — create donation record in zakat_donations table
     - `GET /api/donations/my` — list user's donation history
     - `GET /api/donations/[id]/receipt` — get receipt details
2. Build Volunteering Programs flow:
   - `ProgramCard.tsx` — shows: title, description, location, spots remaining, dates
   - `ProgramList.tsx` — list of programs for a charity
   - "Apply" button on each program card
   - `ProgramApplicationStatus.tsx` — shows pending/accepted/rejected
   - API routes:
     - `GET /api/charities/[id]/programs` — list programs for a charity
     - `POST /api/programs/[id]/apply` — submit application
     - `GET /api/programs/my` — user's applications
   - Update current_volunteers count on application accept
3. Fill in the charity detail page tabs (Dev 1 built the shell):
   - "Zakat Donation" tab → renders ZakatDonationForm
   - "Volunteering Programs" tab → renders ProgramList

**Deliverables:**
- ✅ Zakat donation: enter amount → mock payment → receipt generated
- ✅ Volunteering: browse programs → apply → see status
- ✅ Charity detail page fully functional with both tabs

---

#### DEV 2 — Phase 2: Connections + Real-Time Chat (Hours 14-24)

**Goal:** Users can connect, chat in real-time, and manage connection status

**Tasks:**
1. Build the Connection system:
   - `POST /api/connections` — create a connection between giver and requester
     - Request body: `{ offer_post_id?, request_post_id?, giver_id, requester_id }`
     - On creation: update both posts' status to 'in_progress'
     - Return connection ID
   - `GET /api/connections` — list user's connections (as giver or requester)
   - `GET /api/connections/[id]` — connection detail with full info
   - `PATCH /api/connections/[id]` — update status, submit rating
2. Wire the action buttons into Dev 1's components:
   - On PostDetail for requests: "Offer to Help" button → creates connection where current user is giver
   - On PostDetail for offers: "Request This Help" button → creates connection where current user is requester
   - Both buttons → redirect to `/chat/[connectionId]`
3. Build real-time Chat:
   - `ChatRoom.tsx` — main chat container
     - Load message history from `GET /api/chat/[connectionId]`
     - Subscribe to Supabase Realtime on `messages` table filtered by connection_id
     - Auto-scroll to bottom on new messages
   - `MessageBubble.tsx` — individual message (sender name, content, timestamp, sent/received styling)
   - `ChatInput.tsx` — text input + send button
   - `ConnectionStatusBar.tsx` — shows current status at top of chat (In Progress, Awaiting Confirmation, etc.)
   - API routes:
     - `GET /api/chat/[connectionId]` — get messages
     - `POST /api/chat/[connectionId]` — send message (also inserts via Supabase client)
   - Supabase Realtime setup:
     ```typescript
     const channel = supabase
       .channel(`chat-${connectionId}`)
       .on('postgres_changes', {
         event: 'INSERT',
         schema: 'public',
         table: 'messages',
         filter: `connection_id=eq.${connectionId}`
       }, (payload) => {
         setMessages(prev => [...prev, payload.new]);
       })
       .subscribe();
     ```
4. Build Connection lifecycle management:
   - Status flow: `pending` → `accepted` → `in_progress` → `completed`
   - `ConnectionCard.tsx` — shows connection summary with status badge, used in user's connections list
5. Build Proof submission:
   - `ProofUpload.tsx`:
     - Photo upload to Supabase Storage bucket "proofs"
     - Description text input
     - Hash the photo data (SHA-256 in browser: `crypto.subtle.digest`)
     - Submit proof: store URL + hash in connections table
   - Button appears in chat when status is 'in_progress'
   - API: `POST /api/connections/[id]/proof` — upload proof, store URL and hash
6. Build Completion flow:
   - `CompletionFlow.tsx`:
     - After proof submitted, both users see "Confirm Completion" button
     - When giver confirms: set `giver_confirmed = true`
     - When requester confirms: set `requester_confirmed = true`
     - When BOTH confirmed: status → 'completed', trigger point awards
   - Show status indicators: "Waiting for other party to confirm" / "Both confirmed ✓"
7. Build Rating system:
   - `RatingForm.tsx`:
     - Star rating (1-5) using clickable stars
     - Optional review text
     - Both users rate each other after completion
   - Store ratings in connections table (giver_rating, requester_rating, giver_review, requester_review)
   - Update profiles.average_rating on new rating
8. Build connections list page (`/connections/page.tsx` or within profile):
   - Show all user's active and past connections
   - Filter: Active / Completed / All
   - Each ConnectionCard links to the chat

**Deliverables:**
- ✅ "Offer to Help" / "Request This Help" buttons create connections
- ✅ Real-time chat working between connected users
- ✅ Proof photo upload with SHA-256 hashing
- ✅ Both-confirm completion flow
- ✅ Star rating + review system
- ✅ Full lifecycle: connect → chat → proof → confirm → rate → complete

---

#### DEV 2 — Phase 3: Blockchain Integration (Hours 24-34)

**Goal:** Smart contract deployed, all key events logged on-chain, TX hashes displayed

**Tasks:**
1. Write `TakafolTracker.sol` smart contract (use code from Section 6 of this PRD)
2. Deploy to Sepolia testnet:
   - Option A: Remix IDE (remix.ethereum.org) — browser, zero setup
   - Option B: Hardhat locally
   - Connect MetaMask wallet to Sepolia
   - Get free Sepolia ETH from faucet (Google "Sepolia faucet")
   - Deploy contract, copy address + ABI
3. Set up server wallet:
   - Generate a wallet (MetaMask or ethers.js)
   - Fund it with Sepolia test ETH
   - Store private key in `.env.local` as `SERVER_WALLET_PRIVATE_KEY`
4. Create blockchain utility (`/lib/blockchain.ts`):
   - ethers.js v6 provider + wallet + contract instance
   - `logToBlockchain(method, ...args)` — generic function that calls any contract method, returns TX hash
   - Non-blocking: if blockchain fails, app continues (log error, don't crash)
   - Store ABI in `/lib/contractABI.json`
5. Integrate blockchain logging into ALL existing flows:
   - **Zakat Donation** (Phase 1 flow):
     - After mock payment succeeds → call `logZakatDonation()`
     - Store `tx_hash` and `explorer_url` in `zakat_donations` table
   - **Post Creation** (Dev 1's API):
     - After offer created → call `logOffer()`
     - After request created → call `logRequest()`
     - Store `tx_hash_created` and `explorer_url` in `posts` table
   - **Connection Created** (Phase 2 flow):
     - After connection created → call `logConnection()`
     - Store `tx_hash_connected` in `connections` table
   - **Proof Submitted** (Phase 2 flow):
     - After proof uploaded → call `logProof()` with the SHA-256 hash as bytes32
     - Store `tx_hash_proof` in `connections` table
   - **Task Completed** (Phase 2 flow):
     - After both confirm → call `logTaskCompleted()` with ratings
     - Store `tx_hash_completed` in `connections` table
6. Build `BlockchainProof.tsx` component:
   - Shows: TX hash (truncated with copy button), "View on Etherscan" link
   - Link format: `https://sepolia.etherscan.io/tx/${txHash}`
   - Loading state while TX is being mined
   - Graceful fallback if TX hash is null (blockchain was unavailable)
7. Add BlockchainProof to:
   - DonationReceipt (Zakat donations)
   - CompletionFlow (completed connections)
   - PostDetail (created posts)
8. Build Impact Dashboard (`/dashboard/page.tsx`):
   - `ImpactSummary.tsx` — user's total stats: tasks completed, total donated, impact score, average rating
   - `ImpactCard.tsx` — individual completed task/donation with full blockchain TX trail:
     - Shows the chain: Created → Connected → Proof → Completed with TX links for each step
   - `ImpactTimeline.tsx` — chronological list of all user's contributions
   - Query all connections + donations for the current user, join with TX hashes
9. Test full blockchain flow end-to-end:
   - Create an offer → verify TX on Sepolia Etherscan
   - Create a donation → verify TX
   - Complete a connection → verify all TX hashes in the chain

**Deliverables:**
- ✅ Smart contract deployed on Sepolia
- ✅ Server wallet signing all TXs (users never touch crypto)
- ✅ All 7 event types logging to blockchain
- ✅ TX hashes stored in database alongside each record
- ✅ BlockchainProof component showing Etherscan links
- ✅ Impact Dashboard with full TX trail per contribution

---

#### DEV 2 — Phase 4: Gamification + Leaderboard (Hours 34-40)

**Goal:** Impact Score system working, leaderboard live

**Tasks:**
1. Implement Impact Score calculation (`/lib/points.ts`):
   ```typescript
   const POINTS = {
     create_offer: 5,
     create_request: 3,
     connect: 5,           // both giver + requester get this
     submit_proof: 10,     // giver only
     complete_task: 20,    // both parties
     five_tasks_week: 15,  // bonus
     first_task_ever: 10,  // bonus
     three_week_streak: 25,// bonus
     zakat_donation: 10,   // per donation
     volunteer_apply: 5,
     five_star_rating: 5,  // bonus
   };
   ```
2. Add point triggers to all completed flows:
   - On post creation → award create_offer/create_request points
   - On connection → award connect points to both
   - On proof submission → award submit_proof points to giver
   - On task completion (both confirm) → award complete_task to both
   - On Zakat donation → award zakat_donation points
   - On 5-star rating received → award five_star_rating bonus
   - Check and award streak bonuses
3. Update `profiles.impact_score` atomically:
   ```sql
   UPDATE profiles SET impact_score = impact_score + $points WHERE id = $userId;
   ```
4. Build Leaderboard page (`/leaderboard/page.tsx`):
   - `LeaderboardTable.tsx` — ranked list: position, avatar, name, impact score, tasks completed, top category
   - Filter tabs: This Week / This Month / All Time
   - District filter: show leaderboard for a specific area
   - Highlight current user's position
5. Build `UserRank.tsx` — small badge showing user's current rank (shown in Navbar/profile)
6. API routes:
   - `GET /api/leaderboard?period=week&district=tla_ali` — ranked users
   - `GET /api/impact/[userId]` — user's full impact summary
   - `GET /api/impact/stats` — platform-wide stats

**Deliverables:**
- ✅ Points awarded automatically on every action
- ✅ Leaderboard page with time + district filters
- ✅ User rank visible in navbar/profile
- ✅ Impact Score updating in real-time

---

### SHARED — Phase 5: Integration, Demo Prep, and Testing (Hours 40-48)

> **Both developers work together for final integration, testing, and demo preparation.**

**Goal:** Merge all work, seed demo data, test end-to-end, prepare pitch

**Tasks:**
1. **Git merge** Dev 1 and Dev 2 branches → resolve conflicts
2. **Integration testing** — test every flow end-to-end:
   - Full Offer flow: Login → Offer Help → من عندي → Create offer → AI tags it → Offer appears on Request side
   - Full Request flow: Login → Request Help → Create request → AI tags it → Request appears on Offer side
   - Full Connection flow: Giver clicks "Offer to Help" on a request → Chat opens → send messages → submit proof → both confirm → rate → completed → blockchain TX visible
   - Zakat flow: Select charity → Zakat tab → enter 10 JD → mock payment → receipt with blockchain TX
   - Volunteering: Browse programs → apply → see status
   - Admin: Add charity → add program → moderate report → ban user
   - Leaderboard: verify points calculated correctly, ranking displays
3. **Seed demo data** (create a seed script `scripts/seed.ts`):
   - 3 charity organizations (1 verified NGO: "Jordan Humanitarian Aid", 2 others)
   - 2 volunteering programs under the verified NGO
   - 3 demo users: "Ahmad" (giver), "Sara" (requester), "Admin" (admin role)
   - 10+ offers across all 7 categories with realistic Arabic descriptions
   - 8+ requests across categories with realistic Arabic descriptions
   - 5+ completed connections with blockchain TX hashes already stored
   - Zakat donations with receipts
   - Leaderboard with varied scores
4. **Bug fixes:** Fix all broken flows, edge cases, UI glitches found during testing
5. **Final polish:**
   - Loading states everywhere
   - Error messages in Arabic
   - Empty state illustrations
   - Consistent spacing and typography
6. **Deploy to Vercel:**
   - Push to GitHub
   - Connect repo to Vercel
   - Set all environment variables in Vercel dashboard
   - Test on production URL
7. **Prepare demo script** (2.5 minutes):
   - Screen 1: Landing page → explain the problem
   - Screen 2: Offer Help → show charities + من عندي
   - Screen 3: AI tagging a description in Arabic
   - Screen 4: Request Help → create request
   - Screen 5: Connection → chat → proof → confirm
   - Screen 6: Blockchain proof on Etherscan
   - Screen 7: Impact Dashboard
   - Screen 8: Leaderboard
   - Screen 9: Admin panel
8. **Rehearse demo 3-5 times**
9. **Backup:** Take screenshots of every key screen in case of live demo failure

**Deliverables:**
- ✅ Both branches merged, all features integrated
- ✅ Full end-to-end flows tested and working
- ✅ Realistic demo data seeded
- ✅ Deployed to Vercel (production URL)
- ✅ 2.5-minute demo script rehearsed
- ✅ Backup screenshots ready

---

### Timeline Summary

```
HOUR  0    6    14   18   24   28   34   40   44   48
      |    |    |    |    |    |    |    |    |    |
DEV1  [=P1=][====P2====][=P3=][===P4===][=P5=]
      Found  Posts+Feeds  AI    Admin    Polish
      ation                     Panel

DEV2       [====P1====][==========P2==========][====P3=====][==P4==]
           Zakat+Vol    Connections + Chat      Blockchain   Gamify
           Programs     Proof + Rating          Integration  Leader

BOTH                                                        [==P5==]
                                                            Merge
                                                            Test
                                                            Demo
```

| Phase | Dev | Hours | Duration | Focus |
|-------|-----|-------|----------|-------|
| D1-P1 | Dev 1 | 0-6 | 6h | Foundation, DB, auth, landing page, layout |
| D1-P2 | Dev 1 | 6-14 | 8h | Posts, feeds, filters, Offer/Request hubs, charity listing |
| D2-P1 | Dev 2 | 6-14 | 8h | Zakat donations, volunteering programs, charity detail |
| D1-P3 | Dev 1 | 14-18 | 4h | AI Tagging Engine (Claude API + keyword fallback) |
| D2-P2 | Dev 2 | 14-24 | 10h | Connections, real-time chat, proof, completion, rating |
| D1-P4 | Dev 1 | 18-24 | 6h | Admin panel (charities CRUD, reports, users, analytics) |
| D1-P5 | Dev 1 | 24-28 | 4h | RTL, Ramadan theme, mobile polish, integration prep |
| D2-P3 | Dev 2 | 24-34 | 10h | Blockchain (contract, deploy, ethers.js, all TX logging, Impact Dashboard) |
| D2-P4 | Dev 2 | 34-40 | 6h | Gamification (points system, leaderboard) |
| SHARED | Both | 40-48 | 8h | Merge, integration test, seed data, deploy, demo prep |

---

## 14. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Server-side only, for admin operations

# Blockchain (Sepolia)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
# Alternative: https://rpc.sepolia.org (free, no API key)
SERVER_WALLET_PRIVATE_KEY=0x...          # Server wallet for signing TXs
CONTRACT_ADDRESS=0x...                   # Deployed TakafolTracker address

# AI Classification
ANTHROPIC_API_KEY=sk-ant-...             # Claude API for text classification
# Alternative: OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Takafol
```

---

## 15. Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or via CLI: vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Smart Contract Deployment
1. Open Remix IDE (remix.ethereum.org)
2. Paste TakafolTracker.sol
3. Compile with Solidity ^0.8.19
4. Connect MetaMask to Sepolia
5. Deploy contract
6. Copy contract address → set CONTRACT_ADDRESS in .env
7. Copy ABI → save as /lib/contractABI.json

### Supabase Setup
1. Create project at supabase.com
2. Run the SQL schema from Section 8 in SQL Editor
3. Enable Realtime for messages and connections tables
4. Set up Storage bucket "proofs" for photo uploads
5. Configure Auth providers (email + Google)
6. Copy project URL and keys to .env

---

## 16. Post-Hackathon Roadmap

### Phase 2: Growth (Month 1-2)
- Full authentication with phone verification (Twilio)
- Push notifications (Firebase Cloud Messaging)
- Organization self-registration with verification process
- Advanced search with full-text search
- Map view showing nearby offers/requests
- WhatsApp Business integration for notifications

### Phase 3: Mobile App (Month 2-4)
- React Native or Flutter mobile app
- Camera integration for proof photos
- GPS location for proximity matching
- Offline support for areas with poor connectivity

### Phase 4: Ecosystem (Month 4-6)
- IPFS storage for proof photos (decentralized)
- NFT impact certificates for top volunteers
- Corporate sponsorship dashboard (CSR integration)
- API for third-party integration
- Multi-city deployment (Zarqa, Irbid, Aqaba)

### Phase 5: Scale (Month 6-12)
- Multi-chain deployment (Polygon for cheaper production TXs)
- AI-powered matching (skills → tasks, proximity + availability)
- Government partnership integration
- Impact analytics + reporting for NGOs
- Radio/media partnership for volunteer recognition campaigns
- University and school competition programs

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.5",
    "ethers": "^6",
    "tailwindcss": "^3",
    "@anthropic-ai/sdk": "^0.30",
    "lucide-react": "^0.400",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2"
  }
}
```

Core packages kept minimal for hackathon speed. shadcn/ui components are copy-pasted, not installed as a dependency.

---

## Pitch Script (2.5 minutes)

### [10 sec] THE QUESTION
"Have you ever donated and asked yourself — where did this donation go? Did I actually make an impact?"

### [20 sec] THE PROBLEM
"Billions go to charity every year. But donors can't track impact. Volunteers burn out without recognition. And in a world full of technology — we're more connected than ever, yet more disconnected from each other and our communities."

### [20 sec] THE SOLUTION
"Introducing Takafol by Nexara. A platform where you can offer help or request help. Donate to verified charities, volunteer your time, or simply offer to fix someone's car near Tla Al-Ali. Every action — verified, tracked, and permanent on the blockchain."

### [60 sec] THE DEMO
- Show the landing page: "Offer Help" / "Request Help"
- Show charity platform → Zakat donation → blockchain receipt
- Show "من عندي" → AI auto-categorizes "I can fix plumbing in Marj Al-Hamam"
- Show a requester browsing offers → clicking "Request This Help"
- Show the real-time chat between giver and requester
- Show proof submission → both confirm → rating
- Show the Impact Dashboard with blockchain TX links
- Show the Leaderboard

### [20 sec] THE VISION
"This isn't just a Ramadan project. This is Takafol — empowering each other. Imagine radio shows reading out top volunteers. Companies competing on the leaderboard. New friendships formed through every task."

### [10 sec] CLOSE
"Takafol by Nexara. Not just charity. Verified impact. Real connections."

---

*Takafol by Nexara — Empowering Each Other, With Proof.*
*PRD Version 2.0 | March 2026*
