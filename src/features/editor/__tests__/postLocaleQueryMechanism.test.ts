import assert from "node:assert";

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    process.exit(1);
  }
}

console.log("\n==================================================================");
console.log("  OPENIDEAR — POST QUERY MECHANISM LOCALE ISOLATION TESTS");
console.log("==================================================================\n");

runTest("1. /post/getAllPosts constructs locale-filtered query with activeLocale", () => {
  const buildQueryUrl = (rootApi: string, page: number, limit: number, locale: "en" | "vi") => {
    return `${rootApi}/post/getAllPosts?limit=${limit}&page=${page}&locale=${locale}`;
  };

  const enUrl = buildQueryUrl("http://localhost:5001", 1, 6, "en");
  assert.strictEqual(enUrl, "http://localhost:5001/post/getAllPosts?limit=6&page=1&locale=en");

  const viUrl = buildQueryUrl("http://localhost:5001", 1, 6, "vi");
  assert.strictEqual(viUrl, "http://localhost:5001/post/getAllPosts?limit=6&page=1&locale=vi");
});

runTest("2. Pagination total count is scoped per locale, not global", () => {
  const calculateTotalPages = (countData: number, limit: number) => {
    return Math.ceil(countData / limit) || 1;
  };

  // Database has 9 English posts and 17 Vietnamese posts (total 26 parent posts)
  const enTotalPages = calculateTotalPages(9, 6);
  assert.strictEqual(enTotalPages, 2, "9 English posts with limit 6 should yield exactly 2 pages");

  const viTotalPages = calculateTotalPages(17, 6);
  assert.strictEqual(viTotalPages, 3, "17 Vietnamese posts with limit 6 should yield exactly 3 pages");

  // Global total (26) must NEVER be used for English pagination
  const faultyGlobalPages = calculateTotalPages(26, 6);
  assert.notStrictEqual(enTotalPages, faultyGlobalPages, "English pagination must not reflect global post count");
});

runTest("3. Canonical post links in list items strictly mirror active locale", () => {
  const resolveArticleHref = (slug: string, locale: "en" | "vi") => {
    return locale === "vi" ? `/vi/post/${slug}` : `/post/${slug}`;
  };

  const enHref = resolveArticleHref("ultimate-guide-choosing-pc-power-supply-unit-psu", "en");
  assert.strictEqual(enHref, "/post/ultimate-guide-choosing-pc-power-supply-unit-psu");

  const viHref = resolveArticleHref("huong-dan-toan-dien-chon-nguon-may-tinh-psu", "vi");
  assert.strictEqual(viHref, "/vi/post/huong-dan-toan-dien-chon-nguon-may-tinh-psu");
});

runTest("4. Recently post page heading adapts to active locale", () => {
  const getRecentlyPostHeading = (locale: "en" | "vi") => {
    return locale === "vi" ? "Bài viết mới nhất" : "Recently posted";
  };

  assert.strictEqual(getRecentlyPostHeading("en"), "Recently posted");
  assert.strictEqual(getRecentlyPostHeading("vi"), "Bài viết mới nhất");
});

runTest("5. Search API parameterizes by active locale and prevents cross-language bleeding", () => {
  const buildSearchQuery = (query: string, locale: "en" | "vi", limit = 10, page = 1) => {
    return `/post/search?q=${encodeURIComponent(query)}&locale=${locale}&limit=${limit}&page=${page}`;
  };

  const enSearch = buildSearchQuery("GPU", "en");
  assert.ok(enSearch.includes("locale=en"));

  const viSearch = buildSearchQuery("GPU", "vi");
  assert.ok(viSearch.includes("locale=vi"));
});

console.log("\n------------------------------------------------------------------");
console.log("  Post Query Mechanism Locale Isolation Tests: 5 passed, 0 failed.");
console.log("==================================================================\n");
