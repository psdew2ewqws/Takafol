# Takafol by Nexara
## Verified Impact Platform — Hackathon Project Document

---

## The Problem

- 68% of donors don't trust that their donations reach the intended cause
- Volunteers burn out because they never see the impact of their work
- Charities struggle to prove accountability and attract repeat donors
- No existing platform combines action-based volunteering, transparent tracking, and volunteer recognition
- Donors ask: "Where did my money go? Did I make an impact?" — and no one can answer
- **In a world full of technology, we're more connected than ever — yet more disconnected from each other and our communities**

## The Solution

**Takafol** (تكافل — mutual responsibility / empowering each other) is a verified impact platform with two sides:

1. **"I Want Help" Side** — Organizations, verified NGOs, or individuals in need create tasks
2. **"I Want to Help" Side** — Volunteers accept tasks, donate (food, clothes, money via NGOs), and complete real-world actions
3. **Blockchain tracks the full lifecycle** — what was donated, where it went, and proof it arrived
4. **Impact Dashboard** — every donor/volunteer can see exactly what their contribution became
5. **Points + Leaderboard** — volunteers earn Impact Score, compete, get recognized
6. **Human connection** — technology that brings people together, builds friendships, and strengthens communities

> "Have you ever donated and asked yourself — where did this donation go? Takafol answers that question. Every time."

## The Deeper Why

Technology was supposed to connect us. Instead, we scroll past each other. Takafol flips that — it uses technology to get people **off their screens and into their communities**. You accept a task, you deliver food to a real family, you meet real people. The volunteer delivering jackets in Irbid becomes friends with the family who needed them. The university student tutoring kids in Zarqa becomes a mentor.

**Takafol doesn't just track impact. It creates it.** Every task is a moment where two strangers become neighbors. The blockchain proves the donation arrived. But the real proof is the connection that stays.

> "In a world full of technology — we use it to bring people together, not apart."

---

## Two Platforms, One System

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│  "I WANT HELP"              │         │  "I WANT TO HELP"           │
│  (Provider Side)            │         │  (Helper Side)              │
│                             │         │                             │
│  - Verified NGOs            │         │  - Individual volunteers    │
│  - Organizations            │         │  - Donors                   │
│  - Individuals in need      │         │  - Community members        │
│                             │         │                             │
│  Creates tasks:             │         │  Gets notified              │
│  "50 families need food     │  ────►  │  Accepts task               │
│   baskets in Zarqa"         │         │  Donates / Delivers         │
│                             │         │  Submits proof              │
│  Verifies delivery          │  ◄────  │  Sees impact dashboard      │
│                             │         │  Earns points + rank        │
└─────────────────────────────┘         └─────────────────────────────┘
                    │                           │
                    └───────────┬───────────────┘
                                ▼
                   ┌──────────────────────┐
                   │      BLOCKCHAIN      │
                   │   (Tracking Only)    │
                   │                      │
                   │  - What was donated  │
                   │  - From whom         │
                   │  - To where          │
                   │  - Delivery proof    │
                   │  - Confirmation      │
                   │                      │
                   │  NO payments.        │
                   │  Just proof.         │
                   └──────────────────────┘
```

---

## Donation Types & Rules

| Type | Who Can Handle | Example | Tracked On-Chain |
|------|---------------|---------|-----------------|
| **Money (JDs)** | Verified NGOs ONLY | "10 JD donation" | Amount, donor, recipient org, confirmation |
| **Food** | Any org or user | "20 food baskets" | Type, quantity, delivery proof, destination |
| **Clothes** | Any org or user | "50 winter jackets" | Type, quantity, delivery proof, destination |
| **Time/Service** | Any user | "Tutoring for 2 hours" | Task type, duration, completion proof |

**Key rule**: Money donations flow ONLY through verified NGOs. Physical donations and volunteering time can come from anyone.

---

## The Core Loop

```
Step 1: Organization creates task
        "100 food baskets needed for Zarqa families"
        → Logged on-chain ✓
                ↓
Step 2: Volunteers get notified
        Task appears on the Helper side
                ↓
Step 3: Volunteer accepts task
        → Logged on-chain ✓
                ↓
Step 4: Volunteer contributes
        Donates: 10 JDs / 20 food baskets / 50 jackets
        → Donation type + amount logged on-chain ✓
                ↓
Step 5: Volunteer delivers + submits proof
        Photo + GPS/location
        → Proof hash logged on-chain ✓
                ↓
Step 6: Organization confirms receipt
        → Confirmation logged on-chain ✓
                ↓
Step 7: Impact recorded
        Volunteer sees: "Your 10 JDs → 5 food baskets →
        delivered to Family Center Zarqa → confirmed March 3"
        Points awarded, leaderboard updated
                ↓
        ═══════ FLYWHEEL ═══════
```

### The Impact Answer

The donor asks: *"Where did my 10 JDs go?"*

Takafol answers:
```
Your 10 JDs
  → Received by: Jordan Humanitarian Aid (Verified NGO)
  → Became: 5 food baskets
  → Delivered to: Family Center, Zarqa
  → Delivered by: Volunteer Ahmad (Impact Score: 847)
  → Confirmed: March 3, 2026
  → Blockchain TX: 0x7a3f... [View on Sepolia]
```

That's the product. That answer.

---

## Pitch Script (2.5 minutes)

### [10 sec] THE QUESTION
"Have you ever donated and asked yourself — where did this donation go? Did I actually make an impact?"

### [20 sec] THE PROBLEM
"Billions go to charity every year. But donors can't track impact. Volunteers burn out without recognition. And in a world full of technology — we're more connected than ever, yet more disconnected from each other and our communities."

### [20 sec] THE SOLUTION
"Introducing Takafol by Nexara. This is not a demo — this is a production platform. Organizations post real tasks. Real people accept and complete them. Every action — verified, tracked, and permanent on the blockchain. Not just donations — food, clothes, money, time. All on the books. And along the way — strangers become neighbors."

### [60 sec] THE DEMO
- Show an organization creating a task: "Deliver Ramadan food baskets to 10 families"
- Show a volunteer getting notified and accepting the task
- Show the volunteer donating and submitting proof (photo + location)
- Show the organization confirming delivery
- Show the Impact Dashboard: "Your 10 JDs became 5 food baskets, delivered to Zarqa, confirmed"
- Show the blockchain transaction hash + Sepolia link
- Show the Leaderboard: top volunteers in the community

### [20 sec] THE VISION
"This isn't a Ramadan project. This is ongoing Takafol — empowering each other. Imagine radio shows reading out top volunteers. Companies competing on the leaderboard. Cities challenging each other. New friendships formed through every task. Technology that brings people together, not apart."

### [10 sec] CLOSE
"Takafol by Nexara. Not just charity. Verified impact. Real connections. As a user, you help and connect. As an organization, you create impact. Together — that's Takafol."

---

## Technical Architecture

### Stack

| Layer | Tool | Why |
|-------|------|-----|
| **Frontend** | Next.js 14+ (App Router) | Pages + API in one project |
| **Styling** | Tailwind CSS | Fast, clean, no design system needed |
| **Database** | Supabase (PostgreSQL) | Instant setup, auto API, real-time |
| **Auth** | Supabase Auth | Google/email login (or skip for hackathon) |
| **File Storage** | Supabase Storage | Proof photo uploads |
| **Blockchain** | Solidity → Sepolia testnet | Tracking/audit only, no payments |
| **Contract Tool** | Remix IDE (browser) | Zero setup, beginner-friendly |
| **Contract Integration** | ethers.js in Next.js API routes | Server-side wallet, users don't need MetaMask |
| **Deploy** | Vercel | Git push → live in 30 seconds |

### Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                    Vercel                          │
│  ┌─────────────────────────────────────────────┐  │
│  │              Next.js (App Router)            │  │
│  │                                              │  │
│  │  HELPER SIDE:                                │  │
│  │   /app/tasks/page          → Task Board      │  │
│  │   /app/tasks/[id]/page     → Task Detail     │  │
│  │   /app/dashboard/page      → Impact Dashboard│  │
│  │   /app/leaderboard/page    → Leaderboard     │  │
│  │                                              │  │
│  │  PROVIDER SIDE:                              │  │
│  │   /app/org/tasks/page      → Manage Tasks    │  │
│  │   /app/org/create/page     → Create Task     │  │
│  │   /app/org/verify/page     → Verify Tasks    │  │
│  │                                              │  │
│  │  API ROUTES:                                 │  │
│  │   /app/api/tasks/...       → Task CRUD       │  │
│  │   /app/api/blockchain/...  → Contract calls  │  │
│  │   /app/api/leaderboard/... → Rankings        │  │
│  └──────────┬──────────────────────┬────────────┘  │
│             │                      │                │
│             ▼                      ▼                │
│     ┌──────────────┐    ┌───────────────────┐      │
│     │   Supabase    │    │  Smart Contract   │      │
│     │  - PostgreSQL  │    │  (Sepolia)        │      │
│     │  - Auth       │    │  Tracking only    │      │
│     │  - Storage    │    │  via ethers.js    │      │
│     └──────────────┘    └───────────────────┘      │
└──────────────────────────────────────────────────┘
```

### Key Decision: No MetaMask Required

The blockchain is a **server-side transparency layer**:
- Backend holds ONE server wallet (private key in env vars)
- When a task lifecycle event happens, the SERVER writes to chain
- Users never interact with crypto directly
- Users just see TX hash + "View on Blockchain" link
- **Zero crypto friction for users and judges**

### What Goes On-Chain vs Off-Chain

| On-Chain (Smart Contract — Tracking Only) | Off-Chain (Supabase + API) |
|------------------------------------------|---------------------------|
| Task created event (ID, org, type, timestamp) | Task details, descriptions, images |
| Volunteer accepted event | User profiles, auth |
| Donation recorded (type, amount, description) | Actual proof photos/files |
| Proof hash (hash of photo/GPS data) | Points calculation logic |
| Completion confirmation | Leaderboard ranking |
| Full immutable audit trail | Notifications |
| | API endpoints for frontend |

**Blockchain = NO payments, NO tokens, NO wallets for users. Just immutable proof.**

---

## Smart Contract Design

### Overview
- **Purpose**: Immutable audit log for donation/task lifecycle
- **Language**: Solidity
- **Network**: Sepolia Testnet (Ethereum)
- **Tool**: Remix IDE (browser-based, zero setup)
- **Size**: ~30-40 lines
- **Integration**: ethers.js from Next.js API routes via server wallet

### How Data Gets On-Chain (The Full Flow)

```
User action in the app (e.g., "Accept Task")
        │
        ▼
Next.js API Route receives request
        │
        ├──► Writes details to Supabase (task info, user info, photos)
        │
        ├──► Calls smart contract via ethers.js
        │         │
        │         ├── Creates a transaction
        │         ├── Signs it with server wallet (private key in .env)
        │         └── Sends to Sepolia network
        │                    │
        │                    ▼
        │         Contract function executes
        │                    │
        │                    ▼
        │         Event emitted → permanent log on blockchain
        │                    │
        │                    ▼
        │         TX hash returned (e.g., 0xabc123...)
        │
        ├──► Stores TX hash in Supabase (tasks.tx_hash_accepted)
        │
        ▼
Frontend shows TX hash + "View on Blockchain" link
        │
        ▼
Anyone can verify on Sepolia Etherscan
```

**Key points:**
- The **server wallet** (1 wallet, held by the backend) pays all gas fees
- Sepolia testnet = **free gas** (get test ETH from a faucet)
- Users **never** interact with crypto — no MetaMask, no wallets, no gas
- Each lifecycle step = 1 transaction = 1 TX hash = 1 permanent record
- Blockchain is used for **events (logs)**, not storage — cheap and permanent

### Task Lifecycle — What Happens at Each Step

**Step 1: Task Created**
```
App:        NGO clicks "Create Task: Deliver 50 food baskets to Zarqa"
API route:  Saves task to Supabase
            Calls contract → createTask("task-001", "org-001", "food", "50 food baskets")
Contract:   Emits TaskCreated("task-001", "org-001", "food", "50 food baskets", timestamp)
Result:     TX hash → saved to tasks.tx_hash_created
On-chain:   ✓ Task "task-001" created by "org-001", type: food, at exact time
```

**Step 2: Volunteers Accept (multiple!)**
```
App:        Ahmad clicks "Accept Task" → takes 3 of 50 baskets
API route:  Creates contribution "c-001" in Supabase
            Updates task slots_filled += 1
            Calls contract → acceptTask("task-001", "vol-001", "c-001")
Contract:   Emits VolunteerAccepted("task-001", "c-001", "vol-001", timestamp)
Result:     TX hash → saved to task_contributions.tx_hash_accepted
On-chain:   ✓ Volunteer "vol-001" accepted slot on task "task-001"

App:        Sara also clicks "Accept Task" → takes 3 baskets
API route:  Creates contribution "c-002"
            Calls contract → acceptTask("task-001", "vol-002", "c-002")
            ... same flow, her own TX hash, her own record

20 volunteers can each accept a slot. Each gets their own contribution.
```

**Step 3: Donation Recorded (per volunteer)**
```
App:        Ahmad donates 10 JDs through the verified NGO
API route:  Calls contract → recordDonation("task-001", "c-001", "money", "10", "10 JDs via Jordan Aid")
Contract:   Emits DonationRecorded("task-001", "c-001", "money", "10", "10 JDs via Jordan Aid", timestamp)
Result:     TX hash → saved to task_contributions.tx_hash_donation
On-chain:   ✓ Ahmad donated 10 JDs for his contribution to task "task-001"

Sara's donation is a separate TX with her own contribution ID.
```

**Step 4: Proof Submitted (per volunteer)**
```
App:        Ahmad uploads photo of his 3 delivered baskets
API route:  Photo → Supabase Storage (gets URL)
            Hashes the photo → proofHash = keccak256(photoData)
            Calls contract → submitProof("task-001", "c-001", proofHash)
Contract:   Emits ProofSubmitted("task-001", "c-001", proofHash, timestamp)
Result:     TX hash → saved to task_contributions.tx_hash_proof
On-chain:   ✓ Proof submitted for Ahmad's contribution, hash matches his photo

Each volunteer submits their OWN proof, gets their OWN TX hash.
```

**Step 5: Organization Confirms (per volunteer)**
```
App:        NGO reviews Ahmad's photo, clicks "Confirm Delivery"
API route:  Updates contribution → status = "confirmed"
            Calls contract → confirmContribution("task-001", "c-001")
Contract:   Emits ContributionConfirmed("task-001", "c-001", timestamp)
Result:     TX hash → saved to task_contributions.tx_hash_confirmed
            Points awarded to Ahmad
On-chain:   ✓ Ahmad's contribution to task "task-001" CONFIRMED
            ✓ His full chain: Accepted → Donated → Proof → Confirmed

When ALL 20 volunteers are confirmed:
            Calls contract → taskCompleted("task-001")
            Emits TaskCompleted("task-001", timestamp)
            ✓ Entire task is done. 50 baskets delivered by 20 volunteers.
```

### What the User Sees (Impact Dashboard)

```
┌─────────────────────────────────────────────────────┐
│  Task: Deliver food baskets to Zarqa                │
│  Status: CONFIRMED ✓                                │
│                                                     │
│  Your donation: 10 JDs                              │
│  Became: 5 food baskets                             │
│  Delivered to: Family Center, Zarqa                 │
│                                                     │
│  Blockchain Proof:                                  │
│  ├─ Created:   0xabc123... [View on Etherscan]     │
│  ├─ Accepted:  0xdef456... [View on Etherscan]     │
│  ├─ Donated:   0xghi789... [View on Etherscan]     │
│  ├─ Delivered: 0xjkl012... [View on Etherscan]     │
│  └─ Confirmed: 0xmno345... [View on Etherscan]     │
│                                                     │
│  +20 Impact Points                                  │
└─────────────────────────────────────────────────────┘
```

Each "View on Etherscan" link → Sepolia explorer → anyone in the world can verify.

### Gas Fees & Costs

| Environment | Cost per TX | Who Pays |
|-------------|-----------|----------|
| **Sepolia testnet (hackathon)** | Free | Server wallet (test ETH from faucet) |
| **Production (future)** | ~$0.001 | Server wallet (Polygon/Base chain) |

Users never pay. Users never know crypto is involved.

### Getting Started with the Contract

```
1. Install MetaMask browser extension
2. Create a wallet → save private key securely
3. Get free Sepolia ETH → Google "Sepolia faucet"
4. Open Remix IDE → remix.ethereum.org
5. Paste the Takafol contract code
6. Compile → Deploy to Sepolia (connect MetaMask)
7. Copy contract address + ABI
8. Add to .env: CONTRACT_ADDRESS=0x...
9. Add to .env: SERVER_WALLET_PRIVATE_KEY=0x...
10. Use ethers.js in Next.js API routes to call the contract
```

### Donation Types (Enum)
```
Money       → JDs, only via verified NGOs
Food        → Food baskets, meals, supplies
Clothes     → Jackets, shoes, clothing
Service     → Volunteering time, tutoring, delivery
```

### Task Lifecycle (Enum)
```
Created     → Task posted by organization
Accepted    → Volunteer claimed the task
InProgress  → Donation/work being done
Delivered   → Proof submitted by volunteer
Confirmed   → Organization verified completion
```

### Contract Functions
```
createTask(taskId, orgId, donationType, description, slotsNeeded)
  → Org creates task, logged on-chain
  → Now includes how many volunteers are needed

acceptTask(taskId, volunteerId, contributionId)
  → A volunteer claims a slot, logged on-chain
  → Multiple volunteers can accept the SAME task
  → contributionId = unique ID per volunteer participation

recordDonation(taskId, contributionId, donationType, value, description)
  → What THIS volunteer contributed: "3 food baskets" / "10 JDs"
  → Tied to a specific contribution, not the whole task

submitProof(taskId, contributionId, proofHash)
  → THIS volunteer's proof hash (their photo/GPS)

confirmContribution(taskId, contributionId)
  → Org confirms THIS volunteer's delivery
  → Each volunteer is confirmed individually
```

### Contract Events (Searchable, Permanent)
```
TaskCreated(taskId, orgId, donationType, description, slotsNeeded, timestamp)
VolunteerAccepted(taskId, contributionId, volunteerId, timestamp)
DonationRecorded(taskId, contributionId, donationType, value, description, timestamp)
ProofSubmitted(taskId, contributionId, proofHash, timestamp)
ContributionConfirmed(taskId, contributionId, timestamp)
TaskCompleted(taskId, timestamp)  → emitted when ALL contributions are confirmed
```

### Multi-Volunteer Blockchain Flow Example
```
Task "task-001": Deliver 50 food baskets (20 drivers needed)
  │
  ├─ TX 0xaa1: TaskCreated("task-001", "org-001", "food", "50 baskets", 20)
  │
  ├─ Ahmad (contribution "c-001"):
  │   ├─ TX 0xbb1: VolunteerAccepted("task-001", "c-001", "vol-001")
  │   ├─ TX 0xbb2: DonationRecorded("task-001", "c-001", "food", "3", "3 baskets")
  │   ├─ TX 0xbb3: ProofSubmitted("task-001", "c-001", 0xhash...)
  │   └─ TX 0xbb4: ContributionConfirmed("task-001", "c-001")
  │
  ├─ Sara (contribution "c-002"):
  │   ├─ TX 0xcc1: VolunteerAccepted("task-001", "c-002", "vol-002")
  │   ├─ TX 0xcc2: DonationRecorded("task-001", "c-002", "food", "3", "3 baskets")
  │   ├─ TX 0xcc3: ProofSubmitted("task-001", "c-002", 0xhash...)
  │   └─ TX 0xcc4: ContributionConfirmed("task-001", "c-002")
  │
  ├─ ... 18 more volunteers, each with their own TX chain
  │
  └─ TX 0xzz1: TaskCompleted("task-001")  ← all 20 confirmed
```

---

## Supabase Database Schema

### Multi-Volunteer Model

A single task can have **multiple volunteers**. Example:
```
Task: "Deliver 50 food baskets to Zarqa"
Slots: 20 drivers needed

├── Ahmad:      3 baskets → proof ✓ → confirmed ✓  (+20 pts)
├── Sara:       3 baskets → proof ✓ → confirmed ✓  (+20 pts)
├── Omar:       2 baskets → proof ✓ → confirmed ✓  (+20 pts)
├── Team Nexara: 10 baskets → proof ✓ → confirmed ✓ (+20 pts each)
└── ... 16 more volunteers

Each volunteer has their OWN blockchain proof chain.
Task completes when all slots filled + confirmed.
```

### Tables

```sql
-- Organizations / "I Want Help" side
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'ngo',           -- 'ngo', 'individual', 'company'
  is_verified BOOLEAN DEFAULT false, -- only verified NGOs can handle money
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Volunteers / "I Want to Help" side
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  impact_score INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks (the main task — created by org)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  donation_type TEXT NOT NULL,       -- 'money', 'food', 'clothes', 'service'
  total_needed TEXT,                 -- '50 food baskets', '100 jackets'
  slots INTEGER DEFAULT 1,          -- how many volunteers needed
  slots_filled INTEGER DEFAULT 0,   -- how many have accepted so far
  status TEXT DEFAULT 'open',        -- 'open', 'in_progress', 'completed'
                                     -- open: accepting volunteers
                                     -- in_progress: slots filling up
                                     -- completed: all contributions confirmed
  tx_hash_created TEXT,              -- blockchain TX: task created
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Task Contributions (each volunteer's participation)
-- This is the core table: one row per volunteer per task
CREATE TABLE task_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  volunteer_id UUID REFERENCES volunteers(id),
  contribution TEXT,                 -- '3 food baskets', '10 JDs', '2 hours tutoring'
  donation_type TEXT,                -- 'money', 'food', 'clothes', 'service'
  status TEXT DEFAULT 'accepted',    -- 'accepted', 'in_progress', 'delivered', 'confirmed'
  proof_url TEXT,                    -- photo proof URL (Supabase Storage)
  proof_hash TEXT,                   -- hash stored on-chain
  team_name TEXT,                    -- optional: "Team Nexara" for group contributions
  tx_hash_accepted TEXT,             -- blockchain TX: volunteer accepted
  tx_hash_donation TEXT,             -- blockchain TX: donation recorded
  tx_hash_proof TEXT,                -- blockchain TX: proof submitted
  tx_hash_confirmed TEXT,            -- blockchain TX: org confirmed delivery
  points_awarded INTEGER DEFAULT 0,
  accepted_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ
);
```

### How It Works

```
tasks (1) ──────── (many) task_contributions
  │                         │
  │ Task: "50 baskets"      │ Ahmad: 3 baskets, proof, TX hashes
  │ Slots: 20               │ Sara: 3 baskets, proof, TX hashes
  │ Status: in_progress     │ Omar: 2 baskets, proof, TX hashes
  │                         │ Team Nexara: 10 baskets, proof, TX hashes
  │                         │ ...
  └─────────────────────────┘

Each contribution has its OWN:
  - Proof photo
  - Blockchain TX hashes (accepted, donated, proof, confirmed)
  - Points awarded
  - Status lifecycle
```

---

## API Endpoints

### Task Management
```
POST   /api/tasks                       → Create task (org side, includes slots needed)
GET    /api/tasks                        → List available tasks (helper side)
GET    /api/tasks/[id]                   → Task details + all contributions + TX links
```

### Contributions (per-volunteer actions)
```
POST   /api/tasks/[id]/accept            → Volunteer accepts a slot (creates contribution)
POST   /api/contributions/[id]/donate    → Record this volunteer's donation
POST   /api/contributions/[id]/proof     → Submit this volunteer's proof
POST   /api/contributions/[id]/confirm   → Org confirms this volunteer's delivery
GET    /api/contributions/[id]           → Single contribution details + TX hashes
```

### Blockchain
```
POST   /api/blockchain/log               → Write event to smart contract
GET    /api/blockchain/task/[id]         → Get all TX hashes for a task
GET    /api/blockchain/contribution/[id] → Get TX hashes for a contribution
```

### Users & Impact
```
GET    /api/leaderboard                  → Top volunteers by Impact Score
GET    /api/volunteers/[id]              → Volunteer profile + impact summary
GET    /api/volunteers/[id]/contributions → All this volunteer's contributions + TX links
GET    /api/orgs/[id]                    → Organization profile
GET    /api/orgs/[id]/tasks              → Organization's tasks + progress
```

---

## Frontend Screens

### Helper Side ("I Want to Help")

1. **Task Board** — Grid of available tasks, filterable by type (food/clothes/money/service), location
2. **Task Detail** — Full task info, accept button, donation form, proof submission
3. **Impact Dashboard** — "Your 10 JDs → 5 food baskets → Zarqa → confirmed" with blockchain TX links
4. **Leaderboard** — Top volunteers ranked by Impact Score

### Provider Side ("I Want Help")

5. **Create Task** — Form: title, description, donation type, location, quantity needed
6. **My Tasks** — List of created tasks with status tracking
7. **Verify Task** — Review submitted proof, confirm completion

### Shared

8. **Landing Page** — "I Want to Help" / "I Want Help" — choose your side

---

## Gamification: Impact Score System (Dev 2 Builds)

### Points Structure

| Action | Points |
|--------|--------|
| Accept a task | +5 |
| Complete a task (verified) | +20 |
| Complete 5 tasks in a week | +15 bonus |
| First task ever | +10 bonus |
| Streak: 3 weeks active | +25 bonus |

### Leaderboard

- Ranked by total Impact Score
- Show: Name, Score, Tasks Completed, Top Donation Type
- Future: filter by city, category, time period

### The Bigger Vision

- Radio shows read out top volunteers weekly
- Companies compete on the leaderboard (CSR)
- Cities challenge each other
- Ramadan campaigns with special tasks, but platform runs year-round
- Schools, universities, communities all participate

---

## Naming & Branding

- **Product**: Takafol (تكافل)
- **Company**: Nexara
- **Meaning**: Takafol = mutual responsibility / empowering each other
- **Tagline**: "Not just charity. Verified impact."
- **Alt taglines**:
  - "Every action on the books."
  - "See your impact. Be the impact."
  - "Empowering each other — with proof."
- **Points currency**: Impact Score

---

## What Makes Takafol Different

| Factor | Traditional Charity | Volunteer Platforms | Takafol |
|--------|-------------------|-------------------|---------|
| Money donations | Yes | No | Yes, via verified NGOs only |
| Physical donations | Rarely tracked | No | Tracked: food, clothes, supplies |
| Action-based help | No | Yes | Yes + blockchain verified |
| Transparency | Low (annual reports) | None | Real-time, per-task, on-chain |
| Volunteer recognition | Maybe a certificate | Basic | Impact Score + Leaderboard |
| Impact answer | "We helped people" | None | "Your 10 JDs → 5 baskets → Zarqa → confirmed" |
| Org task management | No | Basic | Built-in with verification |
| Cultural identity | Generic | Generic | Rooted in Takafol (تكافل) |
| Two-sided platform | No | No | Helpers + Providers |

**Category**: Verified Impact Platform (new category)

---

## 48-Hour Hackathon Execution Plan

### Team: 2 Developers

#### Dev 1 (Blockchain + Backend)
```
Hours 0-1:    Supabase project setup, create 3 tables
Hours 1-3:    Write smart contract in Remix IDE
Hours 3-4:    Test + deploy to Sepolia testnet
Hours 4-10:   Next.js API routes:
              - Tasks CRUD
              - Accept, donate, proof, confirm endpoints
              - Connect to Supabase
Hours 10-16:  ethers.js integration:
              - Server wallet setup
              - Log events to contract on each lifecycle step
              - Store TX hashes in Supabase
Hours 16-22:  Proof upload (Supabase Storage)
              Impact dashboard data endpoint
              Blockchain task history endpoint
Hours 22-30:  Integration with frontend (Dev 2)
Hours 30-38:  Bug fixes, seed demo data, edge cases
Hours 38-44:  Polish, final fixes
Hours 44-48:  Support demo
```

#### Dev 2 (Frontend + Gamification + Pitch)
```
Hours 0-4:    Next.js + Tailwind setup, page shells, landing page
Hours 4-12:   Helper side: Task Board + Task Detail
Hours 12-18:  Provider side: Create Task + Verify Task
Hours 18-24:  Impact Dashboard + blockchain TX display
Hours 24-30:  Points system + Leaderboard
Hours 30-36:  UI polish, animations, responsive design
Hours 36-42:  Pitch deck (5-7 slides)
Hours 42-46:  Rehearse demo 5+ times
Hours 46-48:  Final prep
```

### What to Build vs Skip

| BUILD (MVP) | SKIP (Post-Hackathon) |
|-------------|-----------------------|
| Landing page: "I Want to Help" / "I Want Help" | Full auth (hardcode 2-3 users + 1-2 orgs) |
| Task board + task detail | Notifications (mention in pitch) |
| Accept + donate + proof flow | Real-time updates |
| Org create task + verify flow | Multi-city filter |
| Impact Dashboard with TX links | Mobile app |
| Leaderboard | Admin panel |
| Blockchain lifecycle logging | Search/advanced filters |
| Seed demo data | Payment processing |

---

## Competitive Advantages

1. **Two-sided platform** — serves helpers AND providers, creating a marketplace
2. **Action-based, not just money** — volunteers do real work, not just click "donate"
3. **Blockchain-verified impact** — immutable proof of every task lifecycle step
4. **The Impact Answer** — "Your 10 JDs → 5 baskets → Zarqa → confirmed"
5. **Gamification drives retention** — Impact Score + leaderboard keep volunteers returning
6. **Money via NGOs only** — builds institutional trust for financial donations
7. **Cultural identity** — Takafol (تكافل) = empowering each other, universal appeal
8. **The volunteer IS the oracle** — task model solves blockchain verification elegantly
9. **Movement potential** — radio shows, corporate competition, city challenges
10. **Human connection** — in a world of screens, Takafol gets people into their communities, forming real friendships through shared purpose

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Fake task completions | Photo proof + org verification required |
| Leaderboard gaming | Only verified orgs can create tasks |
| Unauthorized money handling | Money donations ONLY via verified NGOs |
| Scope creep (48 hrs) | Strict MVP: core loop + 2 sides + demo data |
| Solidity bugs | Minimal contract (~30 lines), tracking only, no funds |
| Demo failure | Seed data, rehearse 5x, have backup screenshots |
| "Another blockchain charity" pitch | Lead with the Impact Answer, not the tech |

---

## Post-Hackathon Roadmap

### Phase 2: Growth
- Full authentication (Supabase Auth)
- Organization verification process
- Real notification system
- Mobile app (React Native)
- Multi-city deployment

### Phase 3: Ecosystem
- IPFS storage for proof photos
- NFT impact certificates
- Corporate sponsorship dashboard
- API for third-party integration
- Radio/media partnership dashboard

### Phase 4: Scale
- Multi-chain deployment
- Cross-border volunteering
- Government partnership integration
- AI-powered task matching (skills → tasks)
- Impact analytics + reporting for NGOs

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "@supabase/supabase-js": "^2",
    "ethers": "^6",
    "tailwindcss": "^3"
  }
}
```

Four packages. That's it.

---

*Takafol by Nexara — Empowering Each Other, With Proof.*
*Document created during hackathon planning session. Last updated: March 2026.*
