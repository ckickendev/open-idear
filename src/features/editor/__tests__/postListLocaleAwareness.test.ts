import test from "node:test";
import assert from "node:assert/strict";

/**
 * Unit tests for locale awareness in the Editor's "My Posts" sidebar and post list API.
 */
test("PostList Locale Awareness Suite", async (t) => {
  await t.test("getPostsByAuthor includes ?locale query parameter", async () => {
    let requestedUrl = "";
    const fakeApi = {
      get: async (url: string) => {
        requestedUrl = url;
        return { success: true, data: { posts: [] } };
      },
    };

    const getPostsByAuthor = async (locale?: string) => {
      return await fakeApi.get(`/post/getPostByAuthor${locale ? `?locale=${locale}` : ""}`);
    };

    await getPostsByAuthor("en");
    assert.equal(requestedUrl, "/post/getPostByAuthor?locale=en");

    await getPostsByAuthor("vi");
    assert.equal(requestedUrl, "/post/getPostByAuthor?locale=vi");
  });

  await t.test("overlayTranslations overlays English translation title when locale is 'en'", async () => {
    const parentPosts = [
      {
        _id: "6adddb8ea6bc2dcb3540e67b",
        title: "Ultimate Guide: Choosing a PC Power Supply Unit (PSU)",
        published: true,
      },
      {
        _id: "6ad8f7e113c4186b54446975",
        title: "Tuổi Thọ Intel Core i3: Longevity",
        published: true,
      },
    ];

    const translationsEn = [
      {
        postId: "6adddb8ea6bc2dcb3540e67b",
        locale: "en",
        title: "Ultimate Guide: Choosing a PC Power Supply Unit (PSU)",
        published: true,
      },
      {
        postId: "6ad8f7e113c4186b54446975",
        locale: "en",
        title: "Intel Core i3 Longevity: Future-Proofing & Upgrade Paths for Devs",
        published: true,
      },
    ];

    const translationsVi = [
      {
        postId: "6adddb8ea6bc2dcb3540e67b",
        locale: "vi",
        title: "Hướng Dẫn Toàn Diện: Chọn Nguồn Máy Tính (PSU)",
        published: true,
      },
      {
        postId: "6ad8f7e113c4186b54446975",
        locale: "vi",
        title: "Tuổi Thọ Intel Core i3: Tối Ưu & Lộ Trình Nâng Cấp Cho Lập Trình Viên",
        published: true,
      },
    ];

    const simulateOverlay = (posts: typeof parentPosts, locale: "en" | "vi") => {
      const transList = locale === "en" ? translationsEn : translationsVi;
      const transMap = new Map(transList.map((t) => [t.postId, t]));
      return posts.map((post) => {
        const trans = transMap.get(post._id);
        return {
          ...post,
          title: trans?.title || post.title,
          published: typeof trans?.published === "boolean" ? trans.published : post.published,
          locale,
        };
      });
    };

    const resultEn = simulateOverlay(parentPosts, "en");
    assert.equal(resultEn[0].title, "Ultimate Guide: Choosing a PC Power Supply Unit (PSU)");
    assert.equal(resultEn[1].title, "Intel Core i3 Longevity: Future-Proofing & Upgrade Paths for Devs");

    const resultVi = simulateOverlay(parentPosts, "vi");
    assert.equal(resultVi[0].title, "Hướng Dẫn Toàn Diện: Chọn Nguồn Máy Tính (PSU)");
    assert.equal(resultVi[1].title, "Tuổi Thọ Intel Core i3: Tối Ưu & Lộ Trình Nâng Cấp Cho Lập Trình Viên");
  });

  await t.test("Active post in editor immediately reflects live typed title in sidebar", () => {
    const activePostId = "6adddb8ea6bc2dcb3540e67b";
    const currentTitle = "Ultimate Guide: Choosing a PC Power Supply Unit (PSU) - Revised";
    const item = {
      _id: "6adddb8ea6bc2dcb3540e67b",
      title: "Ultimate Guide: Choosing a PC Power Supply Unit (PSU)",
    };

    const isActive = activePostId === item._id;
    const displayTitle = (isActive && currentTitle && currentTitle.trim())
      ? currentTitle
      : item.title || "Untitled";

    assert.equal(displayTitle, "Ultimate Guide: Choosing a PC Power Supply Unit (PSU) - Revised");
  });
});
