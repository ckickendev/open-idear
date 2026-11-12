# OpenIdear — ISR Migration, On-Demand Revalidation & Infrastructure Guide

**Platform:** OpenIdear (1,200+ Technical Articles, 200+ Courses, Multi-lingual Community)  
**Framework:** Next.js 15 (App Router, React 19, Tailwind CSS v4)  
**Revision:** Production v1.0

---

## 1. Architectural Overview & Problem Statement

Historically, OpenIdear experienced significant latency coupling between the Next.js frontend and its backend API hosted on Render's Free Tier:
- **Render Sleep Inactivity**: The backend spun down after 15 minutes of inactivity.
- **Client-Side Data Fetching**: Critical pages like `courses/[slug]` and homepage widgets loaded via `axios.get` inside client `useEffect` hooks, exposing users to 50–70s spinners when Render was sleeping.
- **Missing Build-Time Pre-rendering**: Dynamic routes like `post/[slug]` lacked `generateStaticParams()`, causing initial visits to trigger unshielded server-side rendering (SSR) that frequently failed with 504 Gateway Timeouts.

### The Refactored Solution:
1. **Frontend**: Public routes migrated to **Next.js 15 async Server Components** with Incremental Static Regeneration (ISR).
2. **Interactive Islands**: Dynamic capabilities (enrollment buttons, video playback, cart actions) are isolated into Client Components.
3. **On-Demand Purging**: Cache invalidation is triggered instantly via an HMAC-SHA256 authenticated webhook (`/api/revalidate`).
4. **Backend Cold-Start Elimination**: Pinging via Cloudflare Worker keep-alive (or Homelab Cloudflare Tunnel migration).

---

## 2. Route Configuration Matrix

| Route | Rendering Strategy | Pre-render Count | Cache Tags | Fallback Mode | Revalidate Interval |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` & `/vi` | **ISR Server Component** | Full page | `feed-home`, `posts`, `courses`, `series` | Static Shell | 1,800s (30m) |
| `/post/[slug]` | **ISR Server Component** | Top 100 via `generateStaticParams` | `posts`, `post-${slug}`, `feed-home` | `dynamicParams = true` | 3,600s (1h) |
| `/vi/post/[slug]` | **ISR Server Component** | Top 100 via `generateStaticParams` | `posts`, `post-${slug}`, `feed-home` | `dynamicParams = true` | 3,600s (1h) |
| `/courses/[slug]` | **ISR Server Component** | Top 50 via `generateStaticParams` | `courses`, `course-${slug}`, `feed-home`| `dynamicParams = true` | 3,600s (1h) |
| `/category/[slug]`| **ISR Server Component** | All active categories | `categories`, `category-${slug}`, `posts` | `dynamicParams = true` | 3,600s (1h) |

---

## 3. Data Fetching Invariant (`serverFetch`)

All Server Components must fetch content using the centralized helper at `src/lib/api/serverFetch.ts`:
- **Default Timeout**: 12s on page fetches; 5s inside `generateStaticParams()`.
- **Cache Tags**: Always pass domain tags (`posts`, `post-${slug}`) so webhooks can target them.
- **Error Handling**: Graceful fallback returning `{ data: null, ok: false }` rather than throwing uncaught errors that trigger 500 pages.

```tsx
import { serverFetch } from "@/lib/api/serverFetch";

const { data } = await serverFetch<PostPayload>(`/post/getPostBySlug/${slug}?locale=en`, {
  tags: ["posts", `post-${slug}`],
  revalidate: 3600,
  timeoutMs: 8000,
});
```

---

## 4. Secure On-Demand Revalidation Webhook (`/api/revalidate`)

### Endpoint Details
- **Method**: `POST`
- **URL**: `https://openidear.com/api/revalidate`
- **Headers**:
  - `Content-Type: application/json`
  - `x-webhook-signature: sha256=<HMAC_SHA256_HEX>` *(or `Authorization: Bearer <WEBHOOK_SECRET>`)*

### Sample Payload
```json
{
  "model": "post",
  "action": "update",
  "slug": "mastering-nextjs-15-isr",
  "tag": "post-mastering-nextjs-15-isr"
}
```

### Backend Dispatcher (Node.js / Express)
```ts
import crypto from "crypto";

export async function dispatchRevalidation(payload: object) {
  const secret = process.env.WEBHOOK_SECRET!;
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  await fetch("https://openidear.com/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-signature": `sha256=${signature}`,
    },
    body,
    signal: AbortSignal.timeout(5000),
  });
}
```

---

## 5. Backend Infrastructure Options

### Option 1: Cloud Keep-Alive (Render Free Tier)
Deploy the Cloudflare Worker located in `infrastructure/keepalive/`:
```bash
cd infrastructure/keepalive
npx wrangler deploy
```
*Triggers every 9 minutes to reset Render's 15-minute sleep timer.*

### Option 2: Homelab Migration (Mini PC + Cloudflare Tunnel)
Deploy the Docker Compose stack located in `infrastructure/homelab/`:
```bash
cd infrastructure/homelab
docker compose up -d
```
*Runs backend locally with zero open router ports and CGNAT immunity via Cloudflare Zero Trust.*

---

## 6. Verification & Operational Commands

```bash
# Type check verification
npx tsc --noEmit --skipLibCheck

# Automated Webhook Security Tests
node --experimental-strip-types src/features/article/__tests__/revalidationWebhook.test.ts

# Feature test suites
npm run test:bilingual && npm run test:editor && npm run test:sprint3 && npm run test:sprint5

# Live TTFB & Cache HIT Benchmark
node scripts/verify-cache-ttfb.mjs http://localhost:3000
```

