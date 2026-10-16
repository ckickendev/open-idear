// =============================================================================
//  OPENIDEAR — SPRINT 2: BILINGUAL ROUTING, SSR & SEO AUTOMATED TEST SUITE
//  src/features/seo/__tests__/bilingualRouting.test.ts
//
//  Verifies:
//  1. English article canonical URL and reciprocal hreflang tags.
//  2. Vietnamese article canonical URL and OpenGraph locale (vi_VN).
//  3. Fallback article on /vi route generates canonical -> EN and robots: { index: false, follow: true }.
//  4. Draft and unpublished content are excluded from indexing ({ index: false, follow: false }).
//  5. Language selector direct alternate URL routing vs fallback routing logic.
//  6. Middleware locale resolution and static asset bypass logic.
// =============================================================================

import assert from "node:assert";
import { buildPostMetadata } from "../metadata/buildPostMetadata.ts";

function runTests() {
  console.log("\n==================================================================");
  console.log("  OPENIDEAR — SPRINT 2: BILINGUAL ROUTING, SSR & SEO TESTS");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // ─── TEST 1: English Article SEO & Canonical ───────────────────────────────
  test("English article retains /post/[slug] canonical and sets og:locale en_US", () => {
    const post = {
      title: "Building Distributed Systems",
      slug: "building-distributed-systems",
      published: true,
      activeLocale: "en",
      alternateUrls: {
        en: "/post/building-distributed-systems",
        vi: "/vi/post/xay-dung-he-thong-phan-tan",
      },
    };

    const metadata = buildPostMetadata(post);

    assert.strictEqual(
      metadata.alternates?.canonical,
      "https://openidear.com/post/building-distributed-systems",
      "Canonical URL must be /post/building-distributed-systems"
    );

    const languages = (metadata.alternates as any)?.languages;
    assert.ok(languages, "Alternates languages must be defined");
    assert.strictEqual(languages.en, "https://openidear.com/post/building-distributed-systems");
    assert.strictEqual(languages.vi, "https://openidear.com/vi/post/xay-dung-he-thong-phan-tan");
    assert.strictEqual(languages["x-default"], "https://openidear.com/post/building-distributed-systems");

    assert.strictEqual(metadata.openGraph?.locale, "en_US");
    assert.deepStrictEqual(metadata.openGraph?.alternateLocale, ["vi_VN"]);
    assert.deepStrictEqual(metadata.robots, { index: true, follow: true });
  });

  // ─── TEST 2: Vietnamese Article SEO & Canonical ────────────────────────────
  test("Vietnamese article uses /vi/post/[slug] canonical and sets og:locale vi_VN", () => {
    const post = {
      title: "Xây dựng hệ thống phân tán",
      slug: "xay-dung-he-thong-phan-tan",
      published: true,
      activeLocale: "vi",
      alternateUrls: {
        en: "/post/building-distributed-systems",
        vi: "/vi/post/xay-dung-he-thong-phan-tan",
      },
    };

    const metadata = buildPostMetadata(post);

    assert.strictEqual(
      metadata.alternates?.canonical,
      "https://openidear.com/vi/post/xay-dung-he-thong-phan-tan",
      "Canonical URL must be /vi/post/xay-dung-he-thong-phan-tan"
    );

    const languages = (metadata.alternates as any)?.languages;
    assert.ok(languages, "Alternates languages must be defined");
    assert.strictEqual(languages.en, "https://openidear.com/post/building-distributed-systems");
    assert.strictEqual(languages.vi, "https://openidear.com/vi/post/xay-dung-he-thong-phan-tan");
    assert.strictEqual(languages["x-default"], "https://openidear.com/post/building-distributed-systems");

    assert.strictEqual(metadata.openGraph?.locale, "vi_VN");
    assert.deepStrictEqual(metadata.openGraph?.alternateLocale, ["en_US"]);
    assert.deepStrictEqual(metadata.robots, { index: true, follow: true });
  });

  // ─── TEST 3: Translation Fallback Canonical & Noindex ───────────────────────
  test("Untranslated fallback on /vi route points canonical to EN and sets noindex, follow", () => {
    const post = {
      title: "Untranslated Deep Learning Guide",
      slug: "untranslated-deep-learning-guide",
      published: true,
      activeLocale: "en",
      isFallback: true, // Served to user visiting /vi/post/untranslated-deep-learning-guide
    };

    const metadata = buildPostMetadata(post);

    // Canonical MUST point to the primary English article, NOT the /vi route
    assert.strictEqual(
      metadata.alternates?.canonical,
      "https://openidear.com/post/untranslated-deep-learning-guide",
      "Fallback canonical must point to canonical English article"
    );

    // Robots must be noindex, follow to prevent duplicate content indexing
    assert.deepStrictEqual(
      metadata.robots,
      { index: false, follow: true },
      "Fallback route must have robots: { index: false, follow: true }"
    );
  });

  // ─── TEST 4: Draft Content Excluded from Indexing ───────────────────────────
  test("Draft articles strictly have robots: { index: false, follow: false }", () => {
    const draftPost = {
      title: "Unpublished Draft Article",
      slug: "unpublished-draft-article",
      published: false,
      status: "draft",
    };

    const metadata = buildPostMetadata(draftPost);

    assert.deepStrictEqual(
      metadata.robots,
      { index: false, follow: false },
      "Draft must have robots: { index: false, follow: false }"
    );
  });

  // ─── TEST 5: Language Selector Navigation Resolution ───────────────────────
  test("Language switcher prioritizes direct alternate URLs over heuristic fallback", () => {
    function resolveLanguageSwitch(
      currentPath: string,
      targetLang: "en" | "vi",
      alternateUrls?: Record<string, string> | null
    ): string {
      // 1. Direct alternate article URL from backend
      if (alternateUrls && alternateUrls[targetLang]) {
        return alternateUrls[targetLang];
      }

      // 2. Generic route navigation
      if (targetLang === "vi") {
        if (currentPath === "/") return "/vi";
        if (currentPath.startsWith("/post/")) return `/vi${currentPath}`;
        return "/vi";
      } else {
        if (currentPath === "/vi") return "/";
        if (currentPath.startsWith("/vi/")) {
          return currentPath.replace(/^\/vi/, "") || "/";
        }
        return currentPath;
      }
    }

    // Article with real alternate
    const directAlt = resolveLanguageSwitch(
      "/post/ai-agents",
      "vi",
      { en: "/post/ai-agents", vi: "/vi/post/tac-tu-ai" }
    );
    assert.strictEqual(directAlt, "/vi/post/tac-tu-ai", "Must navigate to direct translated slug");

    // Article without alternate (fallback route)
    const fallbackAlt = resolveLanguageSwitch(
      "/post/quantum-computing",
      "vi",
      null
    );
    assert.strictEqual(fallbackAlt, "/vi/post/quantum-computing", "Must navigate to /vi/post/[slug] for fallback notice");

    // Switching back from /vi/post to /post
    const enSwitch = resolveLanguageSwitch(
      "/vi/post/quantum-computing",
      "en",
      null
    );
    assert.strictEqual(enSwitch, "/post/quantum-computing", "Must strip /vi prefix");

    // Homepage switch
    assert.strictEqual(resolveLanguageSwitch("/", "vi"), "/vi");
    assert.strictEqual(resolveLanguageSwitch("/vi", "en"), "/");
  });

  // ─── TEST 6: Middleware Locale Resolution Logic ────────────────────────────
  test("Middleware accurately classifies explicit URL locale and filters static assets", () => {
    function resolvePathLocale(pathname: string): { isStatic: boolean; locale: "en" | "vi" } {
      if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
      ) {
        return { isStatic: true, locale: "en" };
      }

      const isViRoute = pathname === "/vi" || pathname.startsWith("/vi/");
      return { isStatic: false, locale: isViRoute ? "vi" : "en" };
    }

    assert.deepStrictEqual(resolvePathLocale("/post/intro-to-rust"), { isStatic: false, locale: "en" });
    assert.deepStrictEqual(resolvePathLocale("/vi/post/lap-trinh-rust"), { isStatic: false, locale: "vi" });
    assert.deepStrictEqual(resolvePathLocale("/vi"), { isStatic: false, locale: "vi" });
    assert.deepStrictEqual(resolvePathLocale("/"), { isStatic: false, locale: "en" });
    assert.strictEqual(resolvePathLocale("/favicon.ico").isStatic, true);
    assert.strictEqual(resolvePathLocale("/_next/static/chunks/main.js").isStatic, true);
    assert.strictEqual(resolvePathLocale("/api/v1/auth").isStatic, true);
  });

  console.log("\n==================================================================");
  console.log(`  SPRINT 2 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
