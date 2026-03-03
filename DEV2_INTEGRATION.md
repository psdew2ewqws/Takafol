# Dev 2 Integration Guide — Takafol

This document explains how to work with the existing codebase patterns so you can build connections, chat, blockchain verification, and donations features.

---

## Getting Session (Auth)

### In Server Components / API Routes
```ts
import { auth } from "@/auth";

const session = await auth();
if (!session?.user?.id) {
  // Not authenticated
}

// Available on session.user:
// - id: string
// - name: string | null
// - email: string | null
// - image: string | null
// - role: "USER" | "ADMIN"
// - isBanned: boolean
```

### In Client Components
```tsx
"use client";
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();
  // status: "loading" | "authenticated" | "unauthenticated"
}
```

### Sign In / Sign Out
```tsx
import { signIn, signOut } from "next-auth/react";

signIn("google");  // Triggers Google OAuth
signOut();          // Signs user out
```

---

## Using Prisma

### Import
```ts
import { prisma } from "@/lib/prisma";
```

### Key Models You'll Use
- `prisma.connection` — Giver ↔ Requester matching
- `prisma.message` — Chat messages within connections
- `prisma.zakatDonation` — Zakat donations to charities
- `prisma.charity` — Verified charities
- `prisma.volunteerProgram` — Volunteer opportunities
- `prisma.volunteerApplication` — User applications to programs
- `prisma.report` — User reports for moderation

### Prisma Enums (import from generated client)
```ts
import { ConnectionStatus, PostType, UrgencyLevel } from "@/generated/prisma";
```

---

## API Route Pattern

Every API route follows this structure:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    // 2. Parse & validate input
    const body = await request.json();
    if (!body.requiredField) {
      return NextResponse.json<ApiResponse<null>>(
        { error: "الحقل مطلوب" },
        { status: 400 },
      );
    }

    // 3. Business logic + Prisma query
    const result = await prisma.someModel.create({ data: { ... } });

    // 4. Log the action
    logger.info("Action completed", "ContextName", { id: result.id });

    // 5. Return structured response
    return NextResponse.json<ApiResponse<typeof result>>(
      { data: result, message: "تمت العملية بنجاح" },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Action failed", "ContextName", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json<ApiResponse<null>>(
      { error: "فشلت العملية" },
      { status: 500 },
    );
  }
}
```

### Response shape: `ApiResponse<T>`
```ts
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
```

---

## Available shadcn/ui Components

Already installed and ready to use:
- `Button` — `@/components/ui/button`
- `Card`, `CardHeader`, `CardContent`, `CardFooter` — `@/components/ui/card`
- `Avatar`, `AvatarImage`, `AvatarFallback` — `@/components/ui/avatar`
- `Badge` — `@/components/ui/badge`
- `DropdownMenu` — `@/components/ui/dropdown-menu`
- `Sheet` — `@/components/ui/sheet`
- `Sonner` (toast notifications) — `@/components/ui/sonner`

To add more:
```bash
npx shadcn@latest add dialog input textarea select tabs
```

---

## Tailwind Theme Classes

### Primary colors (Emerald green)
- `bg-emerald-800`, `text-emerald-800` — Dark green (primary brand)
- `bg-emerald-600`, `text-emerald-600` — Medium green
- `bg-emerald-50` — Light green background

### Accent colors (Amber/Gold)
- `bg-amber-500`, `text-amber-500` — Gold accent
- `bg-amber-100` — Light gold background

### Custom CSS classes
- `.ramadan-pattern` — Subtle decorative dot pattern
- `.gold-shimmer` — Pulsing gold animation for accents

### Custom Tailwind colors (via CSS variables)
- `bg-ramadan-green`, `text-ramadan-green`
- `bg-ramadan-gold`, `text-ramadan-gold`
- `bg-ramadan-cream`

---

## Pusher Setup (Real-time Chat)

### Server-side
```ts
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Trigger event when message is sent
await pusher.trigger(`connection-${connectionId}`, "new-message", messageData);
```

### Client-side
```tsx
import PusherClient from "pusher-js";

const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

const channel = pusherClient.subscribe(`connection-${connectionId}`);
channel.bind("new-message", (data) => { /* handle new message */ });
```

---

## Cloudinary Setup (Image Uploads)

For proof-of-completion images, use Cloudinary's unsigned upload:

```tsx
const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", "takafol_unsigned"); // Create this in Cloudinary dashboard

const res = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  { method: "POST", body: formData }
);
const data = await res.json();
// data.secure_url — the uploaded image URL
```

---

## Blockchain Verification (Ethers.js)

```ts
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY!, provider);

// Record impact on-chain (simplified)
const tx = await wallet.sendTransaction({
  to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  data: ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({
    type: "connection_completed",
    connectionId,
    timestamp: Date.now(),
  }))),
});

// Save tx.hash to the connection record
await prisma.connection.update({
  where: { id: connectionId },
  data: { blockchainTx: tx.hash, blockchainVerified: true },
});
```

---

## Environment Variables Needed

Make sure these are set in `.env.local`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth session encryption |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher app key (client) |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster (client) |
| `PUSHER_APP_ID` | Pusher app ID (server) |
| `PUSHER_SECRET` | Pusher secret (server) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_BLOCKCHAIN_RPC_URL` | Ethereum/Polygon RPC URL |
| `BLOCKCHAIN_PRIVATE_KEY` | Wallet private key for signing |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Smart contract address |
| `ANTHROPIC_API_KEY` | Anthropic API for AI moderation |

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/auth.ts` | NextAuth configuration |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/logger.ts` | Structured logger |
| `src/lib/constants.ts` | App constants, routes, impact points |
| `src/types/index.ts` | Shared TypeScript types |
| `prisma/schema.prisma` | Full database schema |

---

## Routes to Build (Dev 2)

### Connections
- `POST /api/connections` — Create connection (offer to help / request help)
- `GET /api/connections` — List user's connections
- `PATCH /api/connections/[id]` — Update status (accept, complete, cancel)
- `POST /api/connections/[id]/proof` — Upload proof of completion

### Chat
- `GET /api/connections/[id]/messages` — Get chat messages
- `POST /api/connections/[id]/messages` — Send message + Pusher trigger

### Donations
- `POST /api/donations` — Create zakat donation
- `GET /api/donations/my` — User's donation history

### Blockchain
- `POST /api/blockchain/verify` — Record completion on-chain
- `GET /api/blockchain/verify/[txHash]` — Check verification status
