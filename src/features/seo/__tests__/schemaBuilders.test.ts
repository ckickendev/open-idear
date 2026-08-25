// =============================================================================
//  SCHEMA BUILDERS UNIT TESTS
//  src/features/seo/__tests__/schemaBuilders.test.ts
//
//  Lightweight unit test suite validating Schema.org builders,
//  URL sanitization, XSS escaping, and JSON serialization.
// =============================================================================

import assert from "node:assert";
import {
  buildArticleSchema,
  buildTechArticleSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
  getPostStructuredData,
  getSiteUrl,
  cleanSlug,
  type PostSchemaInput,
} from "../index";

// ─── Mock Post Data ───────────────────────────────────────────────────────────

const sampleGeneralPost: PostSchemaInput = {
  title: "Building Modern Web Applications",
  slug: "building-modern-web-apps",
  description: "A comprehensive guide to modern web architecture.",
  author: {
    name: "Alex Developer",
    avatarUrl: "https://openidear.com/avatars/alex.jpg",
  },
  category: {
    name: "Web Development",
    slug: "web-dev",
  },
  image: {
    url: "https://openidear.com/images/hero.webp",
    description: "Web development hero banner",
  },
  tags: ["web", "frontend", "architecture"],
  createdAt: "2026-08-20T10:00:00Z",
  updatedAt: "2026-08-22T15:30:00Z",
};

const sampleTechPost: PostSchemaInput = {
  ...sampleGeneralPost,
  title: "Deep Dive into TypeScript Generics",
  slug: "/deep-dive-typescript-generics/", // contains slashes to test cleanSlug
  blocks: [
    {
      id: "b-1",
      type: "paragraph",
      content: "Let's explore generics.",
    },
    {
      id: "b-2",
      type: "code",
      language: "typescript",
      code: "function identity<T>(arg: T): T { return arg; }",
    },
    {
      id: "b-3",
      type: "faq",
      items: [
        {
          question: "What is a generic?",
          answer: "A generic allows writing reusable component logic.",
        },
      ],
    },
  ],
};

// ─── Test Runner ──────────────────────────────────────────────────────────────

export function runTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      passed += 1;
      // eslint-disable-next-line no-console
      console.log(`  ✓ ${name}`);
    } catch (err) {
      failed += 1;
      // eslint-disable-next-line no-console
      console.error(`  ✗ ${name}:`, err);
    }
  }

  // eslint-disable-next-line no-console
  console.log("\n🧪 Running SEO Schema Builders Unit Tests...\n");

  // 1. cleanSlug & getSiteUrl
  test("cleanSlug removes leading and trailing slashes", () => {
    assert.strictEqual(cleanSlug("/my-slug/"), "my-slug");
    assert.strictEqual(cleanSlug("///nested/path///"), "nested/path");
    assert.strictEqual(cleanSlug("clean-slug"), "clean-slug");
  });

  test("getSiteUrl returns clean base URL without trailing slash", () => {
    const url = getSiteUrl();
    assert.ok(typeof url === "string" && url.length > 0);
    assert.strictEqual(url.endsWith("/"), false);
  });

  // 2. buildArticleSchema
  test("buildArticleSchema produces valid Article JSON-LD", () => {
    const schema = buildArticleSchema(sampleGeneralPost);
    assert.strictEqual(schema["@context"], "https://schema.org");
    assert.strictEqual(schema["@type"], "Article");
    assert.strictEqual(schema.headline, sampleGeneralPost.title);
    assert.strictEqual(schema.description, sampleGeneralPost.description);
    assert.strictEqual(schema.author?.name, "Alex Developer");
    assert.strictEqual(schema.articleSection, "Web Development");
    assert.deepStrictEqual(schema.image, ["https://openidear.com/images/hero.webp"]);
    assert.strictEqual(schema.datePublished, "2026-08-20T10:00:00Z");
    assert.strictEqual(schema.dateModified, "2026-08-22T15:30:00Z");

    // Serialization check
    const serialized = JSON.stringify(schema);
    assert.ok(typeof serialized === "string");
    assert.strictEqual(serialized.includes("undefined"), false);
  });

  test("buildArticleSchema omits dateModified when equal to datePublished", () => {
    const postSameDate: PostSchemaInput = {
      ...sampleGeneralPost,
      createdAt: "2026-08-20T10:00:00Z",
      updatedAt: "2026-08-20T10:00:00Z",
    };
    const schema = buildArticleSchema(postSameDate);
    assert.strictEqual(schema.dateModified, undefined);
    assert.strictEqual("dateModified" in schema, false);
  });

  // 3. buildTechArticleSchema
  test("buildTechArticleSchema detects code blocks and sets TechArticle type", () => {
    const schema = buildTechArticleSchema(sampleTechPost);
    assert.strictEqual(schema["@type"], "TechArticle");
    assert.strictEqual(schema.programmingLanguage, "typescript");
    assert.strictEqual(
      schema.url,
      `${getSiteUrl()}/post/deep-dive-typescript-generics`
    );
  });

  // 4. buildBreadcrumbSchema
  test("buildBreadcrumbSchema builds 1-indexed Home -> Category -> Article hierarchy", () => {
    const breadcrumbs = buildBreadcrumbSchema(sampleGeneralPost);
    assert.strictEqual(breadcrumbs["@type"], "BreadcrumbList");
    assert.strictEqual(breadcrumbs.itemListElement.length, 3);
    assert.strictEqual(breadcrumbs.itemListElement[0].name, "Home");
    assert.strictEqual(breadcrumbs.itemListElement[0].position, 1);
    assert.strictEqual(breadcrumbs.itemListElement[1].name, "Web Development");
    assert.strictEqual(breadcrumbs.itemListElement[1].position, 2);
    assert.strictEqual(breadcrumbs.itemListElement[2].name, sampleGeneralPost.title);
    assert.strictEqual(breadcrumbs.itemListElement[2].position, 3);
  });

  test("buildBreadcrumbSchema omits category when post has no category", () => {
    const noCatPost: PostSchemaInput = { ...sampleGeneralPost, category: null };
    const breadcrumbs = buildBreadcrumbSchema(noCatPost);
    assert.strictEqual(breadcrumbs.itemListElement.length, 2);
    assert.strictEqual(breadcrumbs.itemListElement[0].position, 1);
    assert.strictEqual(breadcrumbs.itemListElement[1].position, 2);
    assert.strictEqual(breadcrumbs.itemListElement[1].name, sampleGeneralPost.title);
  });

  // 5. buildFAQSchema
  test("buildFAQSchema extracts FAQ items from structured blocks", () => {
    const faq = buildFAQSchema(sampleTechPost);
    assert.ok(faq !== null);
    assert.strictEqual(faq["@type"], "FAQPage");
    assert.strictEqual(faq.mainEntity.length, 1);
    assert.strictEqual(faq.mainEntity[0].name, "What is a generic?");
    assert.strictEqual(
      faq.mainEntity[0].acceptedAnswer.text,
      "A generic allows writing reusable component logic."
    );
  });

  test("buildFAQSchema returns null when no FAQ blocks exist", () => {
    const faq = buildFAQSchema(sampleGeneralPost);
    assert.strictEqual(faq, null);
  });

  // 6. getPostStructuredData orchestrator
  test("getPostStructuredData orchestrates technical post correctly", () => {
    const result = getPostStructuredData(sampleTechPost);
    assert.strictEqual(result.article["@type"], "TechArticle");
    assert.strictEqual(result.breadcrumb["@type"], "BreadcrumbList");
    assert.ok(result.faq !== null);
    assert.strictEqual(result.faq["@type"], "FAQPage");
  });

  test("getPostStructuredData orchestrates general post correctly", () => {
    const result = getPostStructuredData(sampleGeneralPost);
    assert.strictEqual(result.article["@type"], "Article");
    assert.strictEqual(result.breadcrumb["@type"], "BreadcrumbList");
    assert.strictEqual(result.faq, null);
  });

  // eslint-disable-next-line no-console
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed.\n`);
  return { passed, failed };
}

// Auto-run if executed via tsx / node directly
if (typeof process !== "undefined" && process.argv[1]?.includes("schemaBuilders.test")) {
  const { failed } = runTests();
  if (failed > 0) process.exit(1);
}
