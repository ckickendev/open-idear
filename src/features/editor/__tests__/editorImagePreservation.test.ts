// =============================================================================
//  EDITOR IMAGE PRESERVATION TESTS
//  src/features/editor/__tests__/editorImagePreservation.test.ts
// =============================================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  preserveImagesInMarkdown,
  filterSuggestionsForPreservedImages,
  mergeAiDraftWithExistingEditorImages,
  type ExtractedEditorImage,
} from "../utils/editorImagePreservation.ts";

describe("editorImagePreservation — Robust Image Retainment", () => {
  it("preserves an image with exact heading match and attribution", () => {
    const aiMarkdown = `# Mid-Range GPUs for Devs: RTX 3060, 4060, 5060 in 2026

## Introduction: The Developer's Mid-Range GPU Dilemma in 2026

The year 2026 presents a fascinating landscape for developers...

## Architecture Comparison

When looking at architecture...`;

    const existingImages: ExtractedEditorImage[] = [
      {
        src: "https://images.unsplash.com/photo-rtx4080",
        alt: "RTX 4080 Super",
        sectionHeading: "Introduction: The Developer's Mid-Range GPU Dilemma in 2026",
        attributionLine: "*Photo by Đào Hiếu on unsplash*",
        sectionIndex: 1,
      },
    ];

    const result = preserveImagesInMarkdown(aiMarkdown, existingImages);

    assert.ok(result.includes("![RTX 4080 Super](https://images.unsplash.com/photo-rtx4080)"));
    assert.ok(result.includes("*Photo by Đào Hiếu on unsplash*"));
    // Ensure it was placed under Introduction
    const introIndex = result.indexOf("## Introduction: The Developer's Mid-Range GPU Dilemma in 2026");
    const imageIndex = result.indexOf("![RTX 4080 Super]");
    const archIndex = result.indexOf("## Architecture Comparison");

    assert.ok(introIndex < imageIndex, "Image must be placed after Introduction heading");
    assert.ok(imageIndex < archIndex, "Image must be placed before next heading");
  });

  it("preserves image under leniently rephrased heading (numbering or case differences)", () => {
    const aiMarkdown = `# GPU Guide

## 1. Introduction: The Developer GPU Dilemma

Intro paragraph here.

## 2. Benchmark Scores

Scores paragraph here.`;

    const existingImages: ExtractedEditorImage[] = [
      {
        src: "https://images.unsplash.com/photo-gpu",
        alt: "GPU Overview",
        sectionHeading: "Introduction: The Developer GPU Dilemma",
        sectionIndex: 1,
      },
    ];

    const result = preserveImagesInMarkdown(aiMarkdown, existingImages);

    assert.ok(result.includes("![GPU Overview](https://images.unsplash.com/photo-gpu)"));
    const headingIndex = result.indexOf("## 1. Introduction: The Developer GPU Dilemma");
    const imageIndex = result.indexOf("![GPU Overview]");
    const nextHeadingIndex = result.indexOf("## 2. Benchmark Scores");

    assert.ok(headingIndex < imageIndex);
    assert.ok(imageIndex < nextHeadingIndex);
  });

  it("falls back to section index when AI generated completely un-matched heading names", () => {
    const aiMarkdown = `# Modern Hardware Guide

## Getting Started with AI Hardware

First section details...

## Performance Benchmarks

Second section details...`;

    const existingImages: ExtractedEditorImage[] = [
      {
        src: "https://images.unsplash.com/photo-fallback",
        alt: "Fallback Graphic",
        sectionHeading: "My Custom Local Rig Setup", // Not present in aiMarkdown
        sectionIndex: 1,
      },
    ];

    const result = preserveImagesInMarkdown(aiMarkdown, existingImages);

    assert.ok(result.includes("![Fallback Graphic](https://images.unsplash.com/photo-fallback)"));
    const firstH2 = result.indexOf("## Getting Started with AI Hardware");
    const imagePos = result.indexOf("![Fallback Graphic]");
    assert.ok(firstH2 < imagePos);
  });

  it("does not duplicate image if already present in markdown", () => {
    const aiMarkdown = `# Title

## Section One

![Existing](https://images.unsplash.com/photo-already-there)

Content...`;

    const existingImages: ExtractedEditorImage[] = [
      {
        src: "https://images.unsplash.com/photo-already-there",
        alt: "Existing",
        sectionHeading: "Section One",
        sectionIndex: 1,
      },
    ];

    const result = preserveImagesInMarkdown(aiMarkdown, existingImages);

    const occurrences = result.split("https://images.unsplash.com/photo-already-there").length - 1;
    assert.equal(occurrences, 1, "Must not duplicate an existing image");
  });

  it("filters out visual suggestion placeholders for sections that already have preserved images", () => {
    const existingImages: ExtractedEditorImage[] = [
      {
        src: "https://images.unsplash.com/photo-intro",
        alt: "Intro Image",
        sectionHeading: "Introduction: The Developer's Mid-Range GPU Dilemma in 2026",
        sectionIndex: 1,
      },
    ];

    const suggestions = [
      {
        heading: "Introduction: The Developer's Mid-Range GPU Dilemma in 2026",
        visualType: "diagram",
      },
      {
        heading: "Architecture Comparison",
        visualType: "chart",
      },
    ];

    const filtered = filterSuggestionsForPreservedImages(suggestions, existingImages);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].heading, "Architecture Comparison");
  });

  it("extracts images and attributions from mock TipTap editor document", () => {
    // Mock TipTap editor structure
    const mockNodes = [
      {
        type: { name: "heading" },
        textContent: "Introduction: The Developer's Mid-Range GPU Dilemma in 2026",
        attrs: { level: 2 },
        nodeSize: 60,
      },
      {
        type: { name: "image" },
        attrs: {
          src: "https://images.unsplash.com/photo-rtx4080",
          alt: "RTX 4080 Super",
          title: "RTX 4080 Super GPU",
        },
        nodeSize: 1,
      },
      {
        type: { name: "paragraph" },
        textContent: "Photo by Đào Hiếu on unsplash",
        descendants: (cb: any) => {
          cb({
            isText: true,
            text: "Đào Hiếu",
            marks: [{ type: { name: "link" }, attrs: { href: "https://unsplash.com/@daohieu" } }],
          });
        },
        nodeSize: 32,
      },
    ];

    const mockEditor: any = {
      state: {
        doc: {
          content: { size: 100 },
          descendants: (callback: (node: any, pos: number) => boolean | void) => {
            let pos = 0;
            for (const n of mockNodes) {
              callback(n, pos);
              pos += n.nodeSize;
            }
          },
          nodeAt: (pos: number) => {
            // After heading (60) + image (1) = 61
            if (pos === 61) return mockNodes[2];
            return null;
          },
        },
      },
    };

    const aiMarkdown = `# Mid-Range GPUs 2026

## Introduction: The Developer's Mid-Range GPU Dilemma in 2026

Modern developers need GPUs...

## Architecture Benchmarks

Specs here...`;

    const { markdown, html, preservedCount } = mergeAiDraftWithExistingEditorImages(
      aiMarkdown,
      mockEditor
    );

    assert.equal(preservedCount, 1);
    assert.ok(markdown.includes("![RTX 4080 Super](https://images.unsplash.com/photo-rtx4080)"));
    assert.ok(markdown.includes("*Photo by [Đào Hiếu](https://unsplash.com/@daohieu) on unsplash*"));
    assert.ok(html.includes("src=\"https://images.unsplash.com/photo-rtx4080\""));
  });
});
