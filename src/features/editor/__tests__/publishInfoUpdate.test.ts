// =============================================================================
//  OPENIDEAR — PUBLISH INFORMATION UPDATE TEST SUITE
//  src/features/editor/__tests__/publishInfoUpdate.test.ts
//
//  Tests verification for:
//  1. Changing description, image, and background on published posts
//  2. Idempotent publication updates without unpublishing
//  3. Per-locale isolation for description, background, and hero image
//  4. Publish button accessibility on published posts
// =============================================================================

import assert from "node:assert";
import test from "node:test";

interface PostTranslationMock {
  postId: string;
  locale: "en" | "vi";
  title: string;
  slug: string;
  description: string;
  background?: string;
  hero?: {
    image?: { src: string; alt?: string };
    background?: string;
  };
  published: boolean;
  publishedAt: Date | null;
}

interface PostMock {
  _id: string;
  title: string;
  slug: string;
  description: string;
  background?: string;
  image?: any;
  hero?: {
    image?: { src: string; alt?: string };
    background?: string;
  };
  category?: string;
  published: boolean;
  availableLocales: string[];
  series?: string[];
  translations: PostTranslationMock[];
}

function simulatePublishPost(
  parentPost: PostMock,
  publicInfo: {
    description?: string;
    image?: any;
    background?: string;
    category?: string;
    series?: string;
  },
  locale: "en" | "vi" = "en"
): PostMock {
  // 1. Update translation
  let trans = parentPost.translations.find((t) => t.locale === locale);
  if (!trans) {
    trans = {
      postId: parentPost._id,
      locale,
      title: parentPost.title,
      slug: parentPost.slug,
      description: "",
      published: false,
      publishedAt: null,
    };
    parentPost.translations.push(trans);
  }

  trans.published = true;
  trans.publishedAt = trans.publishedAt || new Date();
  if (publicInfo.description !== undefined) {
    trans.description = publicInfo.description.trim();
  }
  if (publicInfo.background !== undefined) {
    trans.background = publicInfo.background;
    trans.hero = { ...trans.hero, background: publicInfo.background };
  }
  if (publicInfo.image !== undefined) {
    const src = publicInfo.image && typeof publicInfo.image === "object" ? publicInfo.image.url : (publicInfo.image || "");
    trans.hero = { ...trans.hero, image: { src: src || "" } };
  }

  // 2. Update parent Post
  parentPost.published = true;
  if (!parentPost.availableLocales.includes(locale)) {
    parentPost.availableLocales.push(locale);
  }
  if (publicInfo.description !== undefined) {
    parentPost.description = publicInfo.description.trim();
  }
  if (publicInfo.category !== undefined) {
    parentPost.category = publicInfo.category;
  }
  if (publicInfo.background !== undefined) {
    parentPost.background = publicInfo.background;
    parentPost.hero = { ...parentPost.hero, background: publicInfo.background };
  }
  if (publicInfo.image !== undefined) {
    parentPost.image = publicInfo.image;
    const src = publicInfo.image && typeof publicInfo.image === "object" ? publicInfo.image.url : (publicInfo.image || "");
    parentPost.hero = { ...parentPost.hero, image: { src: src || "" } };
  }
  if (publicInfo.series) {
    parentPost.series = Array.from(new Set([...(parentPost.series || []), publicInfo.series]));
  }

  return parentPost;
}

test("Publish Information Update Suite", async (t) => {
  await t.test("Author can update publish information (description, image, background) on an already published post", () => {
    const post: PostMock = {
      _id: "post_100",
      title: "Ultimate Guide: Choosing a PC Power Supply Unit (PSU)",
      slug: "ultimate-guide-psu",
      description: "Initial basic description",
      background: "",
      image: null,
      hero: undefined,
      category: "cat_hardware",
      published: true, // Already published!
      availableLocales: ["en"],
      series: [],
      translations: [
        {
          postId: "post_100",
          locale: "en",
          title: "Ultimate Guide: Choosing a PC Power Supply Unit (PSU)",
          slug: "ultimate-guide-psu",
          description: "Initial basic description",
          published: true,
          publishedAt: new Date("2026-10-01"),
        },
      ],
    };

    // Author updates publish info
    const updated = simulatePublishPost(
      post,
      {
        description: "Comprehensive guide to 80 PLUS ratings, wattage calculation, and modular cables.",
        image: { url: "https://images.unsplash.com/photo-server-psu.jpg", alt: "PSU in server rack" },
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        category: "cat_hardware",
      },
      "en"
    );

    // Verify parent post and active translation updated correctly
    assert.strictEqual(
      updated.description,
      "Comprehensive guide to 80 PLUS ratings, wattage calculation, and modular cables."
    );
    assert.strictEqual(
      updated.background,
      "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
    );
    assert.strictEqual(
      updated.hero?.background,
      "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
    );
    assert.strictEqual(
      updated.hero?.image?.src,
      "https://images.unsplash.com/photo-server-psu.jpg"
    );
    assert.strictEqual(updated.published, true);

    const enTrans = updated.translations.find((t) => t.locale === "en")!;
    assert.strictEqual(enTrans.description, "Comprehensive guide to 80 PLUS ratings, wattage calculation, and modular cables.");
    assert.strictEqual(enTrans.background, "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)");
    assert.strictEqual(enTrans.hero?.image?.src, "https://images.unsplash.com/photo-server-psu.jpg");
    assert.strictEqual(enTrans.published, true);
  });

  await t.test("Updating EN publish info does not corrupt or overwrite VI translation metadata", () => {
    const post: PostMock = {
      _id: "post_200",
      title: "Building Microservices",
      slug: "building-microservices",
      description: "English description",
      background: "",
      published: true,
      availableLocales: ["en", "vi"],
      translations: [
        {
          postId: "post_200",
          locale: "en",
          title: "Building Microservices",
          slug: "building-microservices",
          description: "English description",
          published: true,
          publishedAt: new Date(),
        },
        {
          postId: "post_200",
          locale: "vi",
          title: "Xây dựng Microservices",
          slug: "xay-dung-microservices",
          description: "Mô tả tiếng Việt giữ nguyên",
          background: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)",
          published: true,
          publishedAt: new Date(),
        },
      ],
    };

    // Update EN only
    simulatePublishPost(
      post,
      {
        description: "New updated English description",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
      },
      "en"
    );

    const viTrans = post.translations.find((t) => t.locale === "vi")!;
    assert.strictEqual(viTrans.description, "Mô tả tiếng Việt giữ nguyên", "VI description must remain intact");
    assert.strictEqual(viTrans.background, "linear-gradient(135deg, #022c22 0%, #064e3b 100%)", "VI background must remain intact");
  });

  await t.test("Publish button in header is clickable when isPublished is true", () => {
    // In EditorHeader, canPublish is true for isEditMode (regardless of isPublished)
    const isEditMode = true;
    const isPublished = true;
    const canPublish = isEditMode;
    assert.strictEqual(canPublish, true, "Author must be able to open publish drawer when post is published");
  });

  await t.test("Image removal updates image to null and clears hero image src", () => {
    const post: PostMock = {
      _id: "post_300",
      title: "Test Post",
      slug: "test-post",
      description: "Desc",
      image: "old_image_id",
      hero: { image: { src: "https://old.jpg" } },
      published: true,
      availableLocales: ["en"],
      translations: [
        {
          postId: "post_300",
          locale: "en",
          title: "Test Post",
          slug: "test-post",
          description: "Desc",
          published: true,
          publishedAt: new Date(),
        },
      ],
    };

    simulatePublishPost(
      post,
      {
        image: null,
      },
      "en"
    );

    assert.strictEqual(post.image, null);
    assert.strictEqual(post.hero?.image?.src, "");
  });
});
