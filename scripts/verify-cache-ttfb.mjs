#!/usr/bin/env node

/**
 * OpenIdear Cache & TTFB Benchmark Script
 *
 * Measures Time to First Byte (TTFB), evaluates Next.js Cache Headers (HIT / MISS / STALE),
 * and verifies cold-start resilience across refactored ISR routes.
 *
 * Usage:
 *   node scripts/verify-cache-ttfb.mjs [baseUrl]
 * Example:
 *   node scripts/verify-cache-ttfb.mjs http://localhost:3000
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";

const TEST_ROUTES = [
  { name: "Homepage (EN)", path: "/" },
  { name: "Homepage (VI)", path: "/vi" },
  { name: "Post Detail (Pre-rendered)", path: "/post/getHotPostsWeek" },
  { name: "Course Detail", path: "/courses" },
  { name: "Category Detail", path: "/category/technology" },
  { name: "Revalidate Health Check", path: "/api/revalidate" },
];

async function measureRoute(name, url) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "OpenIdear-Benchmark/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    const duration = Math.round(performance.now() - start);
    const cacheHeader = res.headers.get("x-nextjs-cache") || "N/A";
    const status = res.status;

    return { name, url, status, duration, cacheHeader, success: true };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { name, url, status: "ERR", duration, cacheHeader: "N/A", success: false, error: err.message };
  }
}

async function run() {
  console.log("==================================================================");
  console.log(`  OPENIDEAR CACHE & TTFB PERFORMANCE AUDIT`);
  console.log(`  Target: ${BASE_URL}`);
  console.log("==================================================================\n");

  console.log("1. Running Warm-Up / Initial Pass (Priming Cache)...");
  for (const route of TEST_ROUTES) {
    const url = `${BASE_URL.replace(/\/$/, "")}${route.path}`;
    const result = await measureRoute(route.name, url);
    console.log(`   [${result.status}] ${route.name.padEnd(28)} TTFB: ${String(result.duration).padStart(4)}ms | Cache: ${result.cacheHeader}`);
  }

  console.log("\n2. Running Verification Pass (Verifying Cache HIT & Low TTFB)...");
  let totalTtfb = 0;
  let hitCount = 0;

  for (const route of TEST_ROUTES) {
    const url = `${BASE_URL.replace(/\/$/, "")}${route.path}`;
    const result = await measureRoute(route.name, url);
    totalTtfb += typeof result.duration === "number" ? result.duration : 0;
    if (result.cacheHeader === "HIT") hitCount++;

    const indicator = result.duration < 100 ? "⚡ FAST" : result.duration < 300 ? "✓ OK" : "⚠ SLOW";
    console.log(`   [${result.status}] ${route.name.padEnd(28)} TTFB: ${String(result.duration).padStart(4)}ms | Cache: ${result.cacheHeader.padEnd(5)} | ${indicator}`);
  }

  const avgTtfb = Math.round(totalTtfb / TEST_ROUTES.length);
  console.log("\n------------------------------------------------------------------");
  console.log(`  Average Verified TTFB: ${avgTtfb}ms`);
  console.log(`  Cache Hit Evaluation: ${hitCount}/${TEST_ROUTES.length} routes registered HIT`);
  console.log("==================================================================\n");
}

run();

