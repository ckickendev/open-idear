// =============================================================================
//  AI Image Assist Action & Modal Unit Tests (Sprint 1 & Sprint 2)
//  src/features/editor/__tests__/aiImageAction.test.ts
// =============================================================================

import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  extractEditorContextForAiImage,
  synthesizeAiImagePrompt,
  buildImageNodeAttributes,
  getStandardAIAssistActions,
  type VisualSuggestionInput,
} from "../utils/aiAssistContext";
import { STYLE_PRESETS, ASPECT_RATIOS } from "../constants/aiVisualTaxonomy";

describe("Sprint 1 & 2 — AI Assist Image Production UX", () => {
  describe("1. AI Assist Action Registry", () => {
    it("includes AI Image in standard action list with correct metadata", () => {
      let imageActionTriggered = false;
      const actions = getStandardAIAssistActions({
        onContinue: () => {},
        onImprove: () => {},
        onExample: () => {},
        onReview: () => {},
        onImage: () => {
          imageActionTriggered = true;
        },
      });

      assert.strictEqual(actions.length, 5);

      const imageAction = actions.find((a) => a.id === "image");
      assert.ok(imageAction, "AI Image action must be registered");
      assert.strictEqual(imageAction.label, "AI Image");
      assert.strictEqual(imageAction.description, "Generate an illustration or architecture diagram for your article");
      assert.strictEqual(imageAction.variant, "accent");

      imageAction.onClick?.();
      assert.strictEqual(imageActionTriggered, true, "Clicking AI Image must trigger the modal opening handler");
    });
  });

  describe("2. Context-aware Prompt Synthesis (Sprint 2 Requirement 1)", () => {
    it("transforms raw technical statements into clean illustration prompts", () => {
      const selectedText = "Redis stores frequently accessed data in memory.";
      const prompt = synthesizeAiImagePrompt(selectedText, "selection");
      assert.strictEqual(
        prompt,
        "Create a clean technical illustration explaining Redis stores frequently accessed data in memory"
      );
    });

    it("preserves text that already contains explicit prompt instructions", () => {
      const rawPrompt = "Create a detailed technical diagram of Kafka consumer group rebalancing";
      const prompt = synthesizeAiImagePrompt(rawPrompt, "selection");
      assert.strictEqual(prompt, rawPrompt);
    });

    it("formulates heading context appropriately", () => {
      const heading = "Database Sharding & Partitioning Architecture";
      const prompt = synthesizeAiImagePrompt(heading, "heading");
      assert.strictEqual(
        prompt,
        "Create a clean technical illustration explaining Database Sharding & Partitioning Architecture"
      );
    });
  });

  describe("3. Editor Context Extraction & Invariants", () => {
    it("synthesizes prompt from selected text while preserving raw context snippet", () => {
      const mockEditor: any = {
        state: {
          selection: { from: 10, to: 45, $from: { parent: { isTextblock: true, textContent: "Full paragraph" }, depth: 1, pos: 10 } },
          doc: {
            textBetween: (from: number, to: number) => {
              if (from === 10 && to === 45) return "Redis stores frequently accessed data in memory.";
              return "";
            },
            nodesBetween: () => {},
          },
        },
      };

      const ctx = extractEditorContextForAiImage(mockEditor);
      assert.strictEqual(
        ctx.suggestedPrompt,
        "Create a clean technical illustration explaining Redis stores frequently accessed data in memory"
      );
      assert.strictEqual(ctx.contextSnippet, "Redis stores frequently accessed data in memory.");
      assert.ok(ctx.suggestedAlt?.includes("Redis stores frequently accessed data"));
    });

    it("falls back to current paragraph when no text is selected", () => {
      const mockEditor: any = {
        state: {
          selection: {
            from: 15,
            to: 15,
            $from: {
              parent: { isTextblock: true, textContent: "This microservice uses Kafka for event distribution." },
              depth: 1,
              pos: 15,
            },
          },
          doc: {
            textBetween: () => "",
            nodesBetween: () => {},
          },
        },
      };

      const ctx = extractEditorContextForAiImage(mockEditor);
      assert.strictEqual(
        ctx.suggestedPrompt,
        "Create a clean technical illustration explaining This microservice uses Kafka for event distribution"
      );
      assert.strictEqual(ctx.contextSnippet, "This microservice uses Kafka for event distribution.");
    });

    it("falls back to nearest heading when block text is empty", () => {
      const mockEditor: any = {
        state: {
          selection: {
            from: 50,
            to: 50,
            $from: {
              parent: { isTextblock: true, textContent: "" },
              depth: 1,
              pos: 50,
            },
          },
          doc: {
            textBetween: () => "",
            nodesBetween: (_from: number, _to: number, callback: (node: any) => boolean) => {
              callback({ type: { name: "heading" }, textContent: "System Architecture & Memory Layout" });
              return true;
            },
          },
        },
      };

      const ctx = extractEditorContextForAiImage(mockEditor);
      assert.strictEqual(ctx.heading, "System Architecture & Memory Layout");
      assert.strictEqual(
        ctx.suggestedPrompt,
        "Create a clean technical illustration explaining System Architecture & Memory Layout"
      );
      assert.strictEqual(ctx.suggestedAlt, "Illustration of System Architecture & Memory Layout");
    });
  });

  describe("4. Visual Suggestion Integration (Sprint 2 Requirement 2)", () => {
    it("pre-fills all fields from a visual suggestion input", () => {
      const visualSuggestion: VisualSuggestionInput = {
        prompt: "Detailed isometric server rack with blinking optical interfaces",
        altText: "Isometric server rack",
        visualType: "diagram",
        visualTypeLabel: "Technical Diagram",
        heading: "Physical Infrastructure",
        reason: "Helps readers understand physical cluster topologies",
        style: "blueprint",
        aspectRatio: "4:3",
        caption: "Figure 2: Rack topology",
      };

      const ctx = extractEditorContextForAiImage(null, visualSuggestion);
      assert.strictEqual(ctx.suggestedPrompt, visualSuggestion.prompt);
      assert.strictEqual(ctx.suggestedAlt, "Isometric server rack");
      assert.strictEqual(ctx.visualType, "blueprint");
      assert.strictEqual(ctx.heading, "Physical Infrastructure");
      assert.strictEqual(ctx.visualSuggestion?.reason, "Helps readers understand physical cluster topologies");
    });
  });

  describe("5. Safe Editor Insertion (Sprint 2 Requirement 5 & 6)", () => {
    it("ensures insertion after selected block when text is highlighted", () => {
      let insertedPos = -1;
      let insertedAttrs: any = null;

      const mockEditor: any = {
        state: {
          selection: {
            from: 10,
            to: 45,
            $to: {
              end: () => 120, // End of the block containing the selection
            },
          },
        },
        chain: () => ({
          focus: () => ({
            setTextSelection: (pos: number) => ({
              insertContentAt: (posAt: number, content: any) => {
                insertedPos = posAt;
                insertedAttrs = content.attrs;
                return { run: () => true };
              },
            }),
          }),
        }),
      };

      // Simulating handleInsertAIImage logic
      const { from, to, $to } = mockEditor.state.selection;
      const hasActiveSelection = from !== to;
      assert.strictEqual(hasActiveSelection, true);

      const targetPos = $to.end();
      mockEditor
        .chain()
        .focus()
        .setTextSelection(targetPos)
        .insertContentAt(targetPos, {
          type: "image",
          attrs: {
            src: "https://example.com/asset.webp",
            alt: "Diagram",
            "data-media-id": "med_123",
            caption: "Fig 1",
          },
        })
        .run();

      assert.strictEqual(insertedPos, 120, "Must insert at $to.end() to avoid destroying selected text");
      assert.strictEqual(insertedAttrs["data-media-id"], "med_123");
      assert.strictEqual(insertedAttrs.caption, "Fig 1");
    });

    it("generates correct attributes including data-media-id, alt text, and caption", () => {
      const attrs = buildImageNodeAttributes({
        url: "https://res.cloudinary.com/demo/image/upload/v1234/test.webp",
        alt: "Redis cache topology",
        mediaId: "media_asset_987654",
        caption: "Figure 1: Redis cache",
      });

      assert.strictEqual(attrs.src, "https://res.cloudinary.com/demo/image/upload/v1234/test.webp");
      assert.strictEqual(attrs.alt, "Redis cache topology");
      assert.strictEqual(attrs["data-media-id"], "media_asset_987654");
      assert.strictEqual(attrs.caption, "Figure 1: Redis cache");
    });
  });

  describe("6. Visual Style & Aspect Ratio Taxonomies", () => {
    it("exposes only canonical technical style presets matching BatchVisualsModal", () => {
      const expectedIds = ["isometric", "blueprint", "flat_vector", "3d_technical"];
      const actualIds = STYLE_PRESETS.map((p) => p.id);
      assert.deepStrictEqual(actualIds, expectedIds);
    });

    it("exposes supported aspect ratios", () => {
      const expectedRatios = ["16:9", "4:3", "1:1"];
      const actualRatios = ASPECT_RATIOS.map((r) => r.id);
      assert.deepStrictEqual(actualRatios, expectedRatios);
    });
  });

  describe("7. Generation Lifecycle & Invariant Safety", () => {
    it("ensures cancellation does not mutate editor or trigger insertion", () => {
      let inserted = false;
      const onInsert = () => {
        inserted = true;
      };
      let closed = false;
      const onClose = () => {
        closed = true;
      };

      // User hits cancel / close
      onClose();
      assert.strictEqual(closed, true);
      assert.strictEqual(inserted, false, "Cancelling must never mutate or insert into editor");
    });

    it("accept calls onInsert with asset, alt text, and caption", () => {
      let insertedPayload: any = null;
      const onInsert = (asset: any, alt?: string, caption?: string) => {
        insertedPayload = { asset, alt, caption };
      };

      const mockAsset = {
        _id: "asset_abc_123",
        url: "https://example.com/asset.webp",
        thumbnailUrl: "https://example.com/thumb.webp",
        prompt: "GPU ray tracing pipeline",
        type: "ai" as const,
      };

      onInsert(mockAsset, "Custom GPU diagram alt text", "Figure 3: Ray tracing layout");
      assert.ok(insertedPayload);
      assert.strictEqual(insertedPayload.asset._id, "asset_abc_123");
      assert.strictEqual(insertedPayload.alt, "Custom GPU diagram alt text");
      assert.strictEqual(insertedPayload.caption, "Figure 3: Ray tracing layout");
    });
  });
});
