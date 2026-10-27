// =============================================================================
//  EDITOR ANCHOR UTILITIES TESTS
//  src/features/editor/__tests__/editorAnchorUtils.test.ts
// =============================================================================

import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { insertImageAtSectionAnchor } from "../utils/editorAnchorUtils.ts";

describe("editorAnchorUtils — Resilient Heading Anchor Insertion", () => {
  it("matches exact heading with standard newlines", () => {
    const md = "# Title\n\n## Section One\nContent for section one.\n\n## Section Two\nContent for section two.";
    const res = insertImageAtSectionAnchor(
      md,
      "Section One",
      "https://example.com/img1.jpg",
      "Alt 1"
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.updatedMarkdown.includes("![Alt 1](https://example.com/img1.jpg)"));
    assert.ok(res.updatedMarkdown.indexOf("## Section One\n\n![Alt 1]") !== -1);
  });

  it("matches heading at EOF without trailing newline", () => {
    const md = "# Title\n\n## Section One\nContent\n\n## Section Two";
    const res = insertImageAtSectionAnchor(
      md,
      "Section Two",
      "https://example.com/img2.jpg",
      "Alt 2"
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.updatedMarkdown.includes("![Alt 2](https://example.com/img2.jpg)"));
  });

  it("matches heading with markdown formatting (bold, italic, code)", () => {
    const md = "# Title\n\n## **1. Tổng quan cấu hình**\nChi tiết linh kiện.";
    const res = insertImageAtSectionAnchor(
      md,
      "Tổng quan cấu hình",
      "https://example.com/img3.jpg",
      "Cấu hình"
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.updatedMarkdown.includes("![Cấu hình](https://example.com/img3.jpg)"));
  });

  it("matches heading with Vietnamese editorial prefixes (Bước, Công cụ, Phần)", () => {
    const md = "# Title\n\n## Bước 1: Chuẩn bị linh kiện và đồ nghề\nHướng dẫn chuẩn bị.";
    const res = insertImageAtSectionAnchor(
      md,
      "Chuẩn bị linh kiện và đồ nghề",
      "https://example.com/img4.jpg",
      "Chuẩn bị"
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.updatedMarkdown.includes("![Chuẩn bị](https://example.com/img4.jpg)"));
  });

  it("matches heading with HTML entities like &amp;", () => {
    const md = "# Title\n\n## GPU &amp; CPU Benchmark\nKết quả đo lường.";
    const res = insertImageAtSectionAnchor(
      md,
      "GPU & CPU Benchmark",
      "https://example.com/img5.jpg",
      "Benchmark"
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.updatedMarkdown.includes("![Benchmark](https://example.com/img5.jpg)"));
  });

  it("replaces existing image immediately beneath heading without duplicate stacking", () => {
    const md = "# Title\n\n## Section One\n\n![Old Image](https://example.com/old.jpg)\n*Photo by John*\n\nContent paragraph.";
    const res = insertImageAtSectionAnchor(
      md,
      "Section One",
      "https://example.com/new.jpg",
      "New Image",
      { author: "Jane", provider: "Unsplash" }
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.updatedMarkdown.includes("https://example.com/new.jpg"));
    assert.ok(!res.updatedMarkdown.includes("https://example.com/old.jpg"));
    assert.ok(res.updatedMarkdown.includes("*Photo by Jane on Unsplash*"));
  });

  it("falls back to H1 or document start for Overview when article has no H2 headings", () => {
    const md = "# Hướng Dẫn Ép Xung RAM DDR5\n\nBài viết này giải thích các bước ép xung.";
    const res = insertImageAtSectionAnchor(
      md,
      "Overview",
      "https://example.com/ram.jpg",
      "RAM Overview"
    );
    assert.strictEqual(res.success, true);
    assert.ok(res.updatedMarkdown.includes("![RAM Overview](https://example.com/ram.jpg)"));
  });
});
