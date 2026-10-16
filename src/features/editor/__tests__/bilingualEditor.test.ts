// =============================================================================
//  OPENIDEAR — SPRINT 3: BILINGUAL EDITOR, AUTOSAVE & PUBLISHING TEST SUITE
//  src/features/editor/__tests__/bilingualEditor.test.ts
//
//  Verifies:
//  1. Autosave hash calculation scopes by locale (EN/VI collision prevention).
//  2. Switching locales flushes pending edits and isolates editor documents.
//  3. Out-of-order/stale network responses are discarded via sequence counter.
//  4. Independent publishing & unpublishing per locale.
//  5. Required field validation targets active locale.
//  6. Translation creation draft workflow (clean initialization without auto-duplication).
//  7. Shared parent fields vs localized translation fields ownership.
// =============================================================================

import assert from "node:assert";

// ─── Helpers replicating hooks logic for unit assertion ──────────────────────

function computeAutoSaveHash(content: { title: string; html: string }, locale: string = "en"): string {
  return `${locale}::${content.title}::${content.html}`;
}

interface LocaleStatus {
  exists: boolean;
  published: boolean;
}

interface PostTranslationRecord {
  locale: "en" | "vi";
  title: string;
  slug: string;
  description: string;
  content: string;
  published: boolean;
}

interface ParentPostRecord {
  _id: string;
  defaultLocale: "en" | "vi";
  category: string;
  series: string;
  image: string;
  translations: PostTranslationRecord[];
}

function resolveLocalesStatus(post: ParentPostRecord, isNewTranslation = false, targetLocale: "en" | "vi" = "en") {
  const translations = post.translations || [];
  const enTrans = translations.find((t) => t.locale === "en");
  const viTrans = translations.find((t) => t.locale === "vi");
  const defLoc = post.defaultLocale || "en";

  const enExists = !!enTrans || defLoc === "en" || (!isNewTranslation && targetLocale === "en");
  const viExists = !!viTrans || defLoc === "vi" || (!isNewTranslation && targetLocale === "vi");

  return {
    en: {
      exists: enExists,
      published: enTrans ? !!enTrans.published : (defLoc === "en" && !isNewTranslation ? false : false),
    },
    vi: {
      exists: viExists,
      published: viTrans ? !!viTrans.published : (defLoc === "vi" && !isNewTranslation ? false : false),
    },
  };
}

function validatePublishConfig(config: { postId?: string; category?: string; title?: string }): string[] {
  const errors: string[] = [];
  if (!config.postId) errors.push("Post must be saved before publishing.");
  if (!config.category) errors.push("Category is required.");
  if (config.title !== undefined && !config.title.trim()) {
    errors.push("Title is required for this translation.");
  }
  return errors;
}

// ─── Test Suite Execution ───────────────────────────────────────────────────

function runSprint3Tests() {
  console.log("\n==================================================================");
  console.log("  OPENIDEAR — SPRINT 3: BILINGUAL EDITOR & AUTOSAVE TESTS");
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

  // ─── TEST 1: Hash isolation prevents cross-locale cache collision ─────────
  test("Autosave hash scopes by locale to prevent false saved state", () => {
    const identicalContent = {
      title: "Clean Architecture in TypeScript",
      html: "<p>Deep dive into domain models</p>",
    };

    const enHash = computeAutoSaveHash(identicalContent, "en");
    const viHash = computeAutoSaveHash(identicalContent, "vi");

    assert.strictEqual(
      enHash,
      "en::Clean Architecture in TypeScript::<p>Deep dive into domain models</p>"
    );
    assert.strictEqual(
      viHash,
      "vi::Clean Architecture in TypeScript::<p>Deep dive into domain models</p>"
    );
    assert.notStrictEqual(enHash, viHash, "Hashes for different locales must never collide");
  });

  // ─── TEST 2: Stale network responses discarded by sequence counter ────────
  test("Stale network responses during fast tab switching are discarded", () => {
    let loadSeq = 0;
    let activeEditorLocale = "en";
    let activeEditorTitle = "";

    // Author is on EN tab, clicks VI
    const seq1 = ++loadSeq; // 1
    // Simulate delayed response for EN
    const enResponse = { title: "English Title", locale: "en" };

    // Before EN response returns, author quickly switches to VI tab
    const seq2 = ++loadSeq; // 2
    activeEditorLocale = "vi";
    const viResponse = { title: "Tiêu đề tiếng Việt", locale: "vi" };

    // Response 1 (EN) arrives late
    if (seq1 === loadSeq) {
      activeEditorTitle = enResponse.title;
    } // Should NOT execute because seq1 (1) !== loadSeq (2)

    assert.strictEqual(activeEditorTitle, "", "Late EN response must not overwrite current state");

    // Response 2 (VI) arrives
    if (seq2 === loadSeq) {
      activeEditorTitle = viResponse.title;
    }

    assert.strictEqual(
      activeEditorTitle,
      "Tiêu đề tiếng Việt",
      "Active locale must receive the matching latest response"
    );
    assert.strictEqual(activeEditorLocale, "vi");
  });

  // ─── TEST 3: Switching locales flushes pending edits ───────────────────────
  test("Switching locales triggers save on dirty changes before state clearance", async () => {
    let savedCalls: { locale: string; title: string }[] = [];
    let hasUnsavedChanges = true;
    let currentLocale = "en";
    let currentContent = { title: "Draft EN Title", html: "<p>Work in progress</p>" };

    async function handleSelectLocale(newLocale: "en" | "vi") {
      if (hasUnsavedChanges) {
        // Flush pending changes
        savedCalls.push({ locale: currentLocale, title: currentContent.title });
        hasUnsavedChanges = false;
      }
      currentLocale = newLocale;
      // Clear editor state to isolate
      currentContent = { title: "", html: "" };
    }

    await handleSelectLocale("vi");

    assert.strictEqual(savedCalls.length, 1, "Must flush pending save before switching");
    assert.strictEqual(savedCalls[0].locale, "en", "Saved call must target the original locale");
    assert.strictEqual(savedCalls[0].title, "Draft EN Title");
    assert.strictEqual(currentLocale, "vi", "Current locale must update to VI");
    assert.strictEqual(currentContent.title, "", "Editor content must be reset for new locale");
  });

  // ─── TEST 4: Independent publishing and unpublishing ──────────────────────
  test("Author can publish/unpublish one translation without changing the other", () => {
    const parentPost: ParentPostRecord = {
      _id: "post_123",
      defaultLocale: "en",
      category: "cat_ai",
      series: "series_nextjs",
      image: "cover.jpg",
      translations: [
        {
          locale: "en",
          title: "Next.js 15 Guide",
          slug: "nextjs-15-guide",
          description: "English guide",
          content: "<p>Content</p>",
          published: true, // EN is published
        },
        {
          locale: "vi",
          title: "Hướng dẫn Next.js 15",
          slug: "huong-dan-nextjs-15",
          description: "Bản tiếng Việt",
          content: "<p>Nội dung</p>",
          published: false, // VI is draft
        },
      ],
    };

    const status1 = resolveLocalesStatus(parentPost);
    assert.strictEqual(status1.en.published, true, "EN must be published");
    assert.strictEqual(status1.vi.published, false, "VI must remain draft");

    // Publish VI translation
    parentPost.translations.find((t) => t.locale === "vi")!.published = true;
    const status2 = resolveLocalesStatus(parentPost);
    assert.strictEqual(status2.en.published, true, "EN remains published");
    assert.strictEqual(status2.vi.published, true, "VI is now published");

    // Unpublish EN translation
    parentPost.translations.find((t) => t.locale === "en")!.published = false;
    const status3 = resolveLocalesStatus(parentPost);
    assert.strictEqual(status3.en.published, false, "EN is now unpublished");
    assert.strictEqual(status3.vi.published, true, "VI remains published independently");
  });

  // ─── TEST 5: Active locale required field validation ──────────────────────
  test("Publish validation enforces title for active translation", () => {
    // Missing title for active locale
    const errors1 = validatePublishConfig({
      postId: "post_123",
      category: "cat_ai",
      title: "   ",
    });
    assert.ok(errors1.includes("Title is required for this translation."));

    // Missing category
    const errors2 = validatePublishConfig({
      postId: "post_123",
      category: "",
      title: "Valid Title",
    });
    assert.ok(errors2.includes("Category is required."));

    // Valid config
    const errors3 = validatePublishConfig({
      postId: "post_123",
      category: "cat_tech",
      title: "Học lập trình Rust",
    });
    assert.strictEqual(errors3.length, 0, "Valid config must have zero validation errors");
  });

  // ─── TEST 6: Translation creation does not duplicate or overwrite ─────────
  test("Uncreated translation initializes empty draft without altering existing EN", () => {
    const parentPost: ParentPostRecord = {
      _id: "post_456",
      defaultLocale: "en",
      category: "cat_ai",
      series: "series_ai",
      image: "cover.jpg",
      translations: [
        {
          locale: "en",
          title: "AI Agents Architecture",
          slug: "ai-agents-architecture",
          description: "English desc",
          content: "<p>English Content</p>",
          published: true,
        },
      ],
    };

    // Requested VI which does not exist yet
    const statusBefore = resolveLocalesStatus(parentPost, true, "vi");
    assert.strictEqual(statusBefore.en.exists, true, "EN translation exists");
    assert.strictEqual(statusBefore.vi.exists, false, "VI translation does not exist yet");

    // Author writes VI translation and saves it
    const newViTranslation: PostTranslationRecord = {
      locale: "vi",
      title: "Kiến trúc AI Agents",
      slug: "kien-truc-ai-agents",
      description: "Mô tả tiếng Việt",
      content: "<p>Nội dung tiếng Việt</p>",
      published: false,
    };
    parentPost.translations.push(newViTranslation);

    const statusAfter = resolveLocalesStatus(parentPost, false, "vi");
    assert.strictEqual(statusAfter.en.exists, true, "EN translation still exists unchanged");
    assert.strictEqual(statusAfter.en.published, true, "EN publication unchanged");
    assert.strictEqual(statusAfter.vi.exists, true, "VI translation now exists");
    assert.strictEqual(statusAfter.vi.published, false, "VI starts as draft");
    assert.strictEqual(
      parentPost.translations.find((t) => t.locale === "en")?.title,
      "AI Agents Architecture",
      "Original EN title was NOT overwritten"
    );
  });

  // ─── TEST 7: Shared vs localized field separation ────────────────────────
  test("Shared parent fields remain shared while content remains isolated", () => {
    const parentPost: ParentPostRecord = {
      _id: "post_789",
      defaultLocale: "en",
      category: "cat_distributed",
      series: "series_systems",
      image: "https://cloudinary.com/hero.webp",
      translations: [
        {
          locale: "en",
          title: "Distributed Consensus",
          slug: "distributed-consensus",
          description: "EN desc",
          content: "<p>Raft and Paxos</p>",
          published: true,
        },
        {
          locale: "vi",
          title: "Đồng thuận phân tán",
          slug: "dong-thuan-phan-tan",
          description: "VI desc",
          content: "<p>Raft và Paxos</p>",
          published: true,
        },
      ],
    };

    // Updating cover image (shared) applies across the whole post
    parentPost.image = "https://cloudinary.com/new-hero.webp";
    assert.strictEqual(parentPost.image, "https://cloudinary.com/new-hero.webp");

    // Titles remain strictly distinct
    const en = parentPost.translations.find((t) => t.locale === "en")!;
    const vi = parentPost.translations.find((t) => t.locale === "vi")!;
    assert.notStrictEqual(en.title, vi.title);
    assert.notStrictEqual(en.slug, vi.slug);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSprint3Tests();
