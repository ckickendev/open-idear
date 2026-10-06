// =============================================================================
//  AI Image Assist Action & Modal Unit Tests (Sprint 1, Sprint 2 & Sprint 3)
//  src/features/editor/__tests__/aiImageAction.test.ts
// =============================================================================

import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  extractEditorContextForAiImage,
  synthesizeAiImagePrompt,
  classifyVisualIntent,
  generateStructuredAiImagePrompt,
  trackAiImageTelemetry,
  buildImageNodeAttributes,
  getStandardAIAssistActions,
  type VisualSuggestionInput,
} from "../utils/aiAssistContext";
import {
  STYLE_PRESETS,
  ASPECT_RATIOS,
  VISUAL_INTENTS,
} from "../constants/aiVisualTaxonomy";

describe("Sprint 1, 2 & 3 — Context-Aware AI Visual Assistant", () => {
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
      assert.strictEqual(
        imageAction.description,
        "Generate an illustration or architecture diagram for your article"
      );
      assert.strictEqual(imageAction.variant, "accent");

      imageAction.onClick?.();
      assert.strictEqual(
        imageActionTriggered,
        true,
        "Clicking AI Image must trigger the modal opening handler"
      );
    });
  });

  describe("2. Sprint 3 Visual Intent Classification", () => {
    it("classifies architecture intent for systems with microservices, caches, and gateways", () => {
      const text =
        "Redis operates as an in-memory caching tier between the backend API gateway and primary Postgres database.";
      const res = classifyVisualIntent(text);
      assert.strictEqual(res.intent, "architecture");
      assert.strictEqual(res.recommendedPreset, "isometric");
      assert.strictEqual(res.recommendedRatio, "16:9");
      assert.ok(res.confidence >= 0.9);
      assert.ok(res.reason.includes("component boundaries"));
    });

    it("classifies workflow intent for multi-step request pipelines", () => {
      const text =
        "The request passes through auth filters before reaching the controller and dispatching to worker queues.";
      const res = classifyVisualIntent(text);
      assert.strictEqual(res.intent, "workflow");
      assert.strictEqual(res.recommendedPreset, "blueprint");
      assert.strictEqual(res.recommendedRatio, "16:9");
      assert.ok(res.reason.includes("sequential flow"));
    });

    it("classifies comparison intent for architectural trade-offs", () => {
      const text =
        "Comparing gRPC vs REST: assessing throughput trade-offs and serialization latency differences.";
      const res = classifyVisualIntent(text);
      assert.strictEqual(res.intent, "comparison");
      assert.strictEqual(res.recommendedPreset, "flat_vector");
    });

    it("classifies benchmark / chart intent for performance metrics", () => {
      const text =
        "Evaluating p99 latency and throughput metrics reaching 50,000 QPS under sustained load.";
      const res = classifyVisualIntent(text);
      assert.strictEqual(res.intent, "chart");
      assert.strictEqual(res.recommendedPreset, "flat_vector");
      assert.ok(res.reason.includes("quantitative benchmarks"));
    });

    it("classifies code_visual intent for syntax and structural representations", () => {
      const text =
        "Defining TypeScript interface contracts and compiler AST tokenization rules.";
      const res = classifyVisualIntent(text);
      assert.strictEqual(res.intent, "code_visual");
      assert.strictEqual(res.recommendedPreset, "blueprint");
    });
  });

  describe("3. Sprint 3 Structured Prompt Generation (Sprint 3 Requirement 4)", () => {
    it("generates clean architecture diagram prompt with directional arrows for Spring Boot lifecycle", () => {
      const input =
        "Spring Boot receives an HTTP request through the embedded server before passing it through filters and eventually reaching the controller.";
      const prompt = generateStructuredAiImagePrompt({
        text: input,
        intent: "architecture",
        heading: "Spring Boot Request Lifecycle",
      });

      assert.ok(prompt.includes("Spring Boot Request Lifecycle"));
      assert.ok(prompt.includes("Client"));
      assert.ok(prompt.includes("Embedded Server"));
      assert.ok(prompt.includes("Servlet Filters"));
      assert.ok(prompt.includes("→"));
      assert.ok(prompt.includes("professional developer documentation style"));
      assert.ok(prompt.includes("clear directional arrows"));
    });

    it("generates side-by-side comparison prompt for contrasting technologies", () => {
      const prompt = generateStructuredAiImagePrompt({
        text: "Kafka vs RabbitMQ architecture",
        intent: "comparison",
        heading: "Message Broker Comparison",
      });

      assert.ok(prompt.includes("Message Broker Comparison"));
      assert.ok(prompt.includes("side-by-side technical comparison"));
      assert.ok(prompt.includes("Left vs Right comparative columns"));
    });

    it("generates dark-mode data chart prompt for benchmark metrics", () => {
      const prompt = generateStructuredAiImagePrompt({
        text: "p99 latency benchmarks across caching layers",
        intent: "chart",
        heading: "Latency Benchmark",
      });

      assert.ok(prompt.includes("Latency Benchmark"));
      assert.ok(prompt.includes("benchmark data chart"));
      assert.ok(prompt.includes("modern dark-mode technical styling"));
    });
  });

  describe("4. Context Priority Hierarchy & Guardrails (Sprint 3 Requirement 1)", () => {
    it("Priority 1: Selected text overrides block and heading", () => {
      const mockEditor: any = {
        state: {
          selection: {
            from: 10,
            to: 45,
            $from: {
              parent: { isTextblock: true, textContent: "This entire block is background context." },
              depth: 1,
              pos: 10,
            },
          },
          doc: {
            textBetween: (from: number, to: number) => {
              if (from === 10 && to === 45) return "Redis in-memory caching tier";
              return "";
            },
            nodesBetween: () => {},
          },
        },
      };

      const ctx = extractEditorContextForAiImage(mockEditor);
      assert.strictEqual(ctx.contextType, "selection");
      assert.strictEqual(ctx.contextSnippet, "Redis in-memory caching tier");
      assert.strictEqual(ctx.visualIntent, "architecture");
    });

    it("Priority 3: Heading + Paragraph combined when no selection", () => {
      const mockEditor: any = {
        state: {
          selection: {
            from: 50,
            to: 50,
            $from: {
              parent: {
                isTextblock: true,
                textContent: "Requests enter the gateway before routing to downstream services.",
              },
              depth: 1,
              pos: 50,
            },
          },
          doc: {
            textBetween: () => "",
            nodesBetween: (_from: number, _to: number, callback: (node: any) => boolean) => {
              callback({ type: { name: "heading" }, textContent: "API Gateway Architecture" });
              return true;
            },
          },
        },
      };

      const ctx = extractEditorContextForAiImage(mockEditor);
      assert.strictEqual(ctx.contextType, "heading_paragraph");
      assert.strictEqual(ctx.heading, "API Gateway Architecture");
      assert.strictEqual(ctx.visualIntent, "architecture");
    });

    it("Priority 4: Heading only (Section start with empty block)", () => {
      const mockEditor: any = {
        state: {
          selection: {
            from: 5,
            to: 5,
            $from: {
              parent: { isTextblock: true, textContent: "" },
              depth: 1,
              pos: 5,
            },
          },
          doc: {
            textBetween: () => "",
            nodesBetween: (_from: number, _to: number, callback: (node: any) => boolean) => {
              callback({ type: { name: "heading" }, textContent: "Microservices Data Mesh" });
              return true;
            },
          },
        },
      };

      const ctx = extractEditorContextForAiImage(mockEditor);
      assert.strictEqual(ctx.contextType, "section");
      assert.strictEqual(ctx.heading, "Microservices Data Mesh");
    });

    it("Caps context length at 1500 chars maximum (Anti-bloat guardrail)", () => {
      const hugeText = "A".repeat(3000);
      const mockEditor: any = {
        state: {
          selection: {
            from: 0,
            to: 3000,
            $from: { parent: { isTextblock: true, textContent: hugeText }, depth: 1, pos: 0 },
          },
          doc: {
            textBetween: () => hugeText,
            nodesBetween: () => {},
          },
        },
      };

      const ctx = extractEditorContextForAiImage(mockEditor);
      assert.ok(ctx.contextSnippet.length <= 1500);
    });
  });

  describe("5. Visual Suggestion Integration", () => {
    it("pre-fills all fields and preserves suggestion intent", () => {
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
      assert.strictEqual(ctx.contextType, "suggestion");
      assert.strictEqual(ctx.suggestedAlt, "Isometric server rack");
      assert.strictEqual(ctx.visualIntent, "diagram");
      assert.strictEqual(ctx.heading, "Physical Infrastructure");
      assert.strictEqual(
        ctx.recommendationReason,
        "Helps readers understand physical cluster topologies"
      );
    });
  });

  describe("6. Safe Editor Insertion & Non-Destructive Invariants", () => {
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

      const { from, to, $to } = mockEditor.state.selection;
      assert.notStrictEqual(from, to);

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

      assert.strictEqual(
        insertedPos,
        120,
        "Must insert at $to.end() to avoid destroying selected text"
      );
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

      assert.strictEqual(
        attrs.src,
        "https://res.cloudinary.com/demo/image/upload/v1234/test.webp"
      );
      assert.strictEqual(attrs.alt, "Redis cache topology");
      assert.strictEqual(attrs["data-media-id"], "media_asset_987654");
      assert.strictEqual(attrs.caption, "Figure 1: Redis cache");
    });
  });

  describe("7. Visual Taxonomies & Intents Completeness", () => {
    it("contains all 10 canonical visual intents with valid style presets and ratios", () => {
      const expectedIntents = [
        "architecture",
        "workflow",
        "diagram",
        "technical_illustration",
        "comparison",
        "chart",
        "code_visual",
        "screenshot",
        "concept",
        "abstract",
      ];

      for (const intent of expectedIntents) {
        const def = VISUAL_INTENTS[intent as keyof typeof VISUAL_INTENTS];
        assert.ok(def, `Intent definition must exist for ${intent}`);
        assert.ok(def.label, `Label required for ${intent}`);
        assert.ok(def.defaultPreset, `Preset required for ${intent}`);
        assert.ok(def.defaultRatio, `Ratio required for ${intent}`);
      }
    });
  });
});
