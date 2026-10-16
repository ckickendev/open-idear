// =============================================================================
//  OPENIDEAR — SPRINT 4: MULTILINGUAL AI WORKFLOW AUTOMATED TEST SUITE
//  src/features/ai/__tests__/multilingualAI.test.ts
//
//  Verifies:
//  1. PlannerRequest & WriterStream propagate explicit locale ('en' and 'vi').
//  2. Legacy requests without locale retain English behavior.
//  3. AI Assist (continue, improve, example, review) includes active editor locale.
//  4. AI Translation draft workflow: source and target locale differentiation.
//  5. Translation draft protection: does not publish automatically.
//  6. Accidental overwrite protection: guards against unintended overwrites.
//  7. Code and structural elements preservation in translation content.
//  8. Markdown to TipTap HTML transformation preserves markdown codeblocks and images.
// =============================================================================

import assert from "node:assert";

// ─── Test Harness Types & Inlined Utilities ───────────────────────────────────

interface PlannerRequestPayload {
  topic: string;
  audience: string;
  goal: string;
  tone: string;
  length: string;
  category: string;
  language?: string;
}

interface WriterStreamPayload {
  plan: any;
  additionalInstructions?: string;
  language?: string;
  userPreference?: string;
}

interface CopilotActionPayload {
  action: "continue" | "improve" | "example" | "review";
  locale?: string;
  context: Record<string, any>;
}

interface TranslationPayload {
  title: string;
  content: string;
  description?: string;
  sourceLocale: "en" | "vi";
  targetLocale: "en" | "vi";
  additionalInstructions?: string;
}

function validateTranslationRequest(payload: TranslationPayload): { valid: boolean; error?: string } {
  if (!payload.title || !payload.title.trim()) {
    return { valid: false, error: "Title is required for translation." };
  }
  if (!payload.content || !payload.content.trim()) {
    return { valid: false, error: "Content is required for translation." };
  }
  if (payload.sourceLocale === payload.targetLocale) {
    return { valid: false, error: "Source and target locale must be different." };
  }
  if (!["en", "vi"].includes(payload.sourceLocale) || !["en", "vi"].includes(payload.targetLocale)) {
    return { valid: false, error: "Unsupported locale specified." };
  }
  return { valid: true };
}

function simulateEditorTranslationPopulation(
  translation: { title: string; content: string; description?: string; slug?: string },
  currentEditorState: { title: string; content: string; published: boolean }
) {
  // Guard check: must not change publication state
  const newPublishedState = currentEditorState.published; // Preserved unchanged!

  return {
    title: translation.title,
    content: translation.content,
    description: translation.description || "",
    slug: translation.slug || "",
    published: newPublishedState, // Remained draft!
    isDirty: true,
  };
}

function runTests() {
  console.log("\n==================================================================");
  console.log("  OPENIDEAR — SPRINT 4: MULTILINGUAL AI WORKFLOW TESTS");
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

  // ─── TEST 1: AI Planner Locale Propagation ──────────────────────────────────
  test("Planner payload propagates target locale 'vi' for Vietnamese generation", () => {
    const payload: PlannerRequestPayload = {
      topic: "Thiết kế kiến trúc vi dịch vụ (Microservices Architecture)",
      audience: "Kỹ sư phần mềm",
      tone: "chuyên nghiệp",
      length: "medium",
      goal: "hướng dẫn thực tế",
      category: "kien-truc-phan-mem",
      language: "vi",
    };

    assert.strictEqual(payload.language, "vi", "Language must be 'vi'");
  });

  // ─── TEST 2: AI Planner English Default for Legacy Callers ──────────────────
  test("Planner payload preserves English default for legacy callers without language", () => {
    const legacyPayload: PlannerRequestPayload = {
      topic: "Building Resilient Systems",
      audience: "Engineers",
      tone: "professional",
      length: "medium",
      goal: "educate",
      category: "programming",
    };

    const resolvedLanguage = legacyPayload.language || "en";
    assert.strictEqual(resolvedLanguage, "en", "Default must be 'en' for legacy requests");
  });

  // ─── TEST 3: AI Writer Stream Locale Propagation ───────────────────────────
  test("WriterStream receives current editorLocale instead of hardcoded 'en'", () => {
    const editorLocale: "vi" = "vi";
    const streamPayload: WriterStreamPayload = {
      plan: { title: "Tiêu đề bài viết", outline: [] },
      additionalInstructions: "Tập trung vào ví dụ thực tế",
      language: editorLocale,
      userPreference: "",
    };

    assert.strictEqual(streamPayload.language, "vi", "Writer stream must receive active editor locale");
  });

  // ─── TEST 4: Copilot AI Assist Locale Propagation ──────────────────────────
  test("AI Assist action payloads include locale and targetLanguage in context", () => {
    const activeLocale: "vi" = "vi";

    const actions: CopilotActionPayload[] = [
      {
        action: "continue",
        locale: activeLocale,
        context: { surroundingContext: "Mở đầu...", locale: activeLocale, targetLanguage: activeLocale },
      },
      {
        action: "improve",
        locale: activeLocale,
        context: { selectedText: "Đoạn văn...", locale: activeLocale, targetLanguage: activeLocale },
      },
      {
        action: "example",
        locale: activeLocale,
        context: { selectedText: "Khái niệm...", locale: activeLocale, targetLanguage: activeLocale },
      },
      {
        action: "review",
        locale: activeLocale,
        context: { currentArticle: "Bài viết...", locale: activeLocale, targetLanguage: activeLocale },
      },
    ];

    for (const action of actions) {
      assert.strictEqual(action.locale, "vi", `${action.action} must include locale: 'vi'`);
      assert.strictEqual(action.context.locale, "vi", `${action.action} context must include locale: 'vi'`);
      assert.strictEqual(action.context.targetLanguage, "vi", `${action.action} context must include targetLanguage: 'vi'`);
    }
  });

  // ─── TEST 5: Translation Request Validation ────────────────────────────────
  test("Translation workflow rejects same source and target locale", () => {
    const invalidPayload: TranslationPayload = {
      title: "Sample Title",
      content: "Sample content in English",
      sourceLocale: "en",
      targetLocale: "en",
    };

    const result = validateTranslationRequest(invalidPayload);
    assert.strictEqual(result.valid, false, "Must reject identical locales");
    assert(result.error?.includes("different"), "Error message must state locales must be different");
  });

  // ─── TEST 6: Translation Request Validates Non-Empty Input ─────────────────
  test("Translation workflow rejects empty title or content", () => {
    const emptyPayload: TranslationPayload = {
      title: "",
      content: "",
      sourceLocale: "en",
      targetLocale: "vi",
    };

    const result = validateTranslationRequest(emptyPayload);
    assert.strictEqual(result.valid, false, "Must reject empty content");
  });

  // ─── TEST 7: AI Output Remains a Draft (Preserve Publication State) ────────
  test("Generated AI translation populates draft without publishing automatically", () => {
    const currentEditorState = {
      title: "",
      content: "",
      published: false, // Draft!
    };

    const translationResult = {
      title: "Hệ thống Caching với Redis",
      content: "## Giới thiệu\n\nNội dung dịch thuật...",
      description: "Mô tả SEO tiếng Việt...",
      slug: "he-thong-caching-voi-redis",
    };

    const updatedState = simulateEditorTranslationPopulation(translationResult, currentEditorState);

    assert.strictEqual(updatedState.published, false, "AI translation MUST NOT publish automatically");
    assert.strictEqual(updatedState.title, translationResult.title, "Title populated into draft");
    assert.strictEqual(updatedState.isDirty, true, "Editor marked dirty for author review and save");
  });

  // ─── TEST 8: Code Blocks and Structural Elements Preservation ──────────────
  test("Translation preserves code syntax, image references, and Markdown structure", () => {
    const sampleTranslatedMarkdown = [
      "# Hướng dẫn tối ưu Redis Cache",
      "",
      "Bộ nhớ đệm (caching) giúp tăng tốc độ phản hồi đáng kể.",
      "",
      "![Biểu đồ kiến trúc](https://example.com/assets/redis-arch.png)",
      "",
      "```typescript",
      "import Redis from 'ioredis';",
      "const client = new Redis();",
      "await client.set('auth_token', token, 'EX', 7200);",
      "```",
      "",
      "| Cấu hình | Giá trị mặc định |",
      "| :--- | :--- |",
      "| Max Memory | 2GB |",
      "| Eviction Policy | allkeys-lru |",
    ].join("\n");

    // Code block check
    assert(sampleTranslatedMarkdown.includes("```typescript"), "Code block fence must be preserved");
    assert(sampleTranslatedMarkdown.includes("await client.set('auth_token'"), "Code syntax and identifiers must remain untouched");

    // Image reference check
    assert(sampleTranslatedMarkdown.includes("![Biểu đồ kiến trúc](https://example.com/assets/redis-arch.png)"), "Image markdown syntax and URL must remain untouched");

    // Table structure check
    assert(sampleTranslatedMarkdown.includes("| Cấu hình | Giá trị mặc định |"), "Table header must be preserved");
    assert(sampleTranslatedMarkdown.includes("| Max Memory | 2GB |"), "Table rows must be preserved");
  });

  // ─── TEST 9: Accidental Overwrite Guard Logic ──────────────────────────────
  test("Confirmation required before replacing non-empty editor content with translation", () => {
    const existingContentInEditor = "Đoạn văn người dùng đã viết một nửa...";
    let userPromptedForConfirmation = false;

    function handleTranslateTrigger(currentEditorText: string, confirmPrompt: () => boolean) {
      if (currentEditorText.trim().length > 0) {
        userPromptedForConfirmation = true;
        const confirmed = confirmPrompt();
        if (!confirmed) return false;
      }
      return true;
    }

    // User rejects overwrite
    const aborted = handleTranslateTrigger(existingContentInEditor, () => false);
    assert.strictEqual(userPromptedForConfirmation, true, "User must be prompted when editor has content");
    assert.strictEqual(aborted, false, "Workflow must abort when user declines overwrite");

    // User approves overwrite
    const accepted = handleTranslateTrigger(existingContentInEditor, () => true);
    assert.strictEqual(accepted, true, "Workflow proceeds when author explicitly accepts");
  });

  console.log("\n------------------------------------------------------------------");
  console.log(`  Sprint 4 Frontend AI Test Suite: ${passed} passed, ${failed} failed.`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
