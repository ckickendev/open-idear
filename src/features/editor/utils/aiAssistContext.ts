// =============================================================================
//  AI ASSIST CONTEXT, INTENT CLASSIFICATION & STRUCTURED PROMPT BUILDER (SPRINT 3)
//  src/features/editor/utils/aiAssistContext.ts
//
//  Upgrades AI Image from simple text prompt to a context-aware visual assistant:
//  1. Multi-tier context extraction with 1500 char guardrail.
//  2. Visual intent classification (architecture, workflow, diagram, comparison, chart, etc.).
//  3. Structured prompt generation with component flow mapping and technical styling rules.
//  4. Safe telemetry tracking adhering to privacy guardrails.
// =============================================================================

import type { Editor } from "@tiptap/core";
import { Sparkles, Wand2, BookOpen, FileText, Image as ImageIcon } from "lucide-react";
import type { AIAssistAction } from "../types/editor.types";
import {
  aiVisualApi,
  type VisualIntent,
  type IllustrationPreset,
  type VisualAnalyticsAction,
  type VisualAnalyticsEvent,
} from "@/features/ai-visual";
import { VISUAL_INTENTS } from "../constants/aiVisualTaxonomy";

export type ContextSourceType =
  | "selection"
  | "paragraph"
  | "heading_paragraph"
  | "section"
  | "suggestion"
  | "fallback";

export interface EditorAiImageContext {
  /** The structured prompt generated from editor context */
  suggestedPrompt: string;
  /** The raw context snippet (capped at 1500 chars) */
  contextSnippet: string;
  /** The priority tier where context was extracted */
  contextType: ContextSourceType;
  /** The nearest heading above the cursor/selection, if available */
  heading?: string;
  /** Article title if available */
  articleTitle?: string;
  /** Alt text suggested for the visual */
  suggestedAlt?: string;
  /** Inferred visual intent */
  visualIntent: VisualIntent;
  /** Backward-compatible alias for visualIntent */
  visualType?: string;
  /** Intent confidence score (0.0 to 1.0) */
  confidence: number;
  /** Explainable reasoning for the author */
  recommendationReason: string;
  /** Recommended style preset based on intent */
  recommendedPreset: IllustrationPreset;
  /** Recommended aspect ratio based on intent */
  recommendedRatio: string;
  /** Visual suggestion details if opened from suggestion */
  visualSuggestion?: VisualSuggestionInput;
}

/**
 * Backward-compatible prompt synthesizer for Sprint 1 & 2 consumers.
 */
export function synthesizeAiImagePrompt(
  rawText: string,
  contextType: "selection" | "paragraph" | "heading" = "selection"
): string {
  const classification = classifyVisualIntent(rawText);
  return generateStructuredAiImagePrompt({
    text: rawText,
    intent: classification.intent,
  });
}

export interface VisualSuggestionInput {
  prompt?: string;
  altText?: string;
  visualType?: VisualIntent | string;
  visualTypeLabel?: string;
  heading?: string;
  caption?: string;
  reason?: string;
  style?: IllustrationPreset;
  aspectRatio?: "16:9" | "4:3" | "1:1" | string;
}

export interface ArticleMetadataInput {
  title?: string;
  category?: string;
  tags?: string[];
}

export interface VisualIntentClassificationResult {
  intent: VisualIntent;
  confidence: number;
  reason: string;
  recommendedPreset: IllustrationPreset;
  recommendedRatio: string;
}

export interface ContextSignals {
  isHardwareDiagnostics: boolean;
  isHardwareTool: boolean;
  isBottleneck: boolean;
  components: string[];
  metrics: string[];
  isBackendArchitecture: boolean;
  isBenchmark: boolean;
  isWorkflow: boolean;
  isComparison: boolean;
}

/**
 * Sanitizes and normalizes heading/subject strings by stripping common section numbering,
 * prefixes (e.g., "Công cụ 2:", "Tool 1:", "Bước 3:", "Phần 1:"), and trailing punctuation.
 */
export function sanitizeHeadingSubject(raw?: string): string {
  if (!raw) return "";
  let cleaned = raw.trim();

  // Strip wrapping quotes
  cleaned = cleaned.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();

  // Strip prefixes like "Công cụ 2:", "Tool 1:", "Bước 3:", "Phần 1:", "Section 2:", "Chương 4:"
  cleaned = cleaned.replace(
    /^(?:công\s+cụ|tiện\s+ích|phần\s+mềm|bước|phần|mục|chương|bài|tool|step|section|part|chapter)\s*(?:[0-9ivx]+|[a-z])?[:\s\-–—.]+/i,
    ""
  );

  // Strip leading numbers like "1.", "2:", "3 -", "1.2"
  cleaned = cleaned.replace(/^(?:[0-9]+(?:\.[0-9]+)*|[ivx]+)[.):\s\-–—]+/i, "");

  // Strip trailing punctuation
  cleaned = cleaned.replace(/[:;.\-–—\s]+$/, "").trim();

  return cleaned || raw.trim();
}

/**
 * Analyzes text and subject to extract key domain entities, components, and metrics.
 */
export function extractContextSignals(text: string, subject = ""): ContextSignals {
  const combined = `${subject} ${text}`.toLowerCase();

  // Hardware components
  const components: string[] = [];
  if (/(?:^|[^\p{L}\p{N}])(?:cpu|vi xử lý|vi-xử-lý|processor)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) components.push("CPU");
  if (/(?:^|[^\p{L}\p{N}])(?:gpu|card đồ họa|card màn hình|graphics card|vga)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) components.push("GPU");
  if (/(?:^|[^\p{L}\p{N}])(?:ram|bộ nhớ ram|memory)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) components.push("RAM");
  if (/(?:^|[^\p{L}\p{N}])(?:bo mạch chủ|motherboard|mainboard)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) components.push("Motherboard");
  if (/(?:^|[^\p{L}\p{N}])(?:ssd|nvme|ổ cứng|storage)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) components.push("Storage");
  if (/(?:^|[^\p{L}\p{N}])(?:vram)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) components.push("VRAM");
  if (/(?:^|[^\p{L}\p{N}])(?:psu|nguồn|power supply)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) components.push("PSU");

  // Telemetry & Diagnostic Metrics
  const metrics: string[] = [];
  if (/(?:^|[^\p{L}\p{N}])(?:nhiệt độ|temperature|thermals?)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) metrics.push("temperatures");
  if (/(?:^|[^\p{L}\p{N}])(?:điện áp|voltage|vcore)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) metrics.push("voltages");
  if (/(?:^|[^\p{L}\p{N}])(?:xung nhịp|clock speed|frequency|xung)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) metrics.push("clock speeds");
  if (/(?:^|[^\p{L}\p{N}])(?:tải|load|utilization)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) metrics.push("load metrics");
  if (/(?:^|[^\p{L}\p{N}])(?:cảm biến|sensors?)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) metrics.push("sensor telemetry");
  if (/(?:^|[^\p{L}\p{N}])(?:quạt|fan|rpm)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) metrics.push("fan speeds");
  if (/(?:^|[^\p{L}\p{N}])(?:ép xung|overclock(?:ing)?)(?:[^\p{L}\p{N}]|$)/iu.test(combined)) metrics.push("overclocking status");

  const isHardwareDiagnostics =
    components.length > 0 ||
    metrics.length > 0 ||
    /(?:^|[^\p{L}\p{N}])(?:hwinfo|gpu-z|cpu-z|afterburner|aida64|furmark|cinebench|phần cứng|linh kiện|bottleneck|nghẽn cổ chai)(?:[^\p{L}\p{N}]|$)/iu.test(combined);

  const isBottleneck =
    /\b(?:bottleneck|nghẽn\s+cổ\s+chai|chokepoint|throttle|saturation)\b/i.test(combined);

  const isHardwareTool =
    /\b(?:hwinfo|gpu-z|cpu-z|afterburner|aida64|furmark|cinebench)\b/i.test(combined) ||
    (/(?:^|[^\p{L}\p{N}])(?:công\s+cụ|tiện\s+ích|phần\s+mềm|giám\s+sát)(?:[^\p{L}\p{N}]|$)/iu.test(combined) && components.length > 0);

  const isBackendArchitecture =
    /(?:architecture|microservice|client[\s\S]*server|gateway|in-memory|database|cache|redis|kafka|cluster|kubernetes|docker|cloud topology|backend|load balancer)/i.test(
      combined
    );

  const isBenchmark =
    /(?:benchmark|latency|throughput|p99|p95|qps|rps|đo kiểm|điểm số|fps)/i.test(combined);

  const isWorkflow =
    /(?:workflow|pipeline|lifecycle|quy trình|các bước|luồng|step [0-9]|bước [0-9])/i.test(combined);

  const isComparison =
    /(?:vs|versus|so sánh|đối chiếu|comparison|trade-off|pros and cons)/i.test(combined);

  return {
    isHardwareDiagnostics,
    isHardwareTool,
    isBottleneck,
    components,
    metrics,
    isBackendArchitecture,
    isBenchmark,
    isWorkflow,
    isComparison,
  };
}

// ─── 1. Visual Intent Classifier ──────────────────────────────────────────────

/**
 * Classifies the semantic visual intent from context and optional heading.
 * Heuristics prefer technical diagrams/architectures over decorative images.
 */
export function classifyVisualIntent(
  text: string,
  heading = ""
): VisualIntentClassificationResult {
  const combined = `${heading} ${text}`.toLowerCase();
  const signals = extractContextSignals(text, heading);

  // 1. Architecture: System components, microservices, caches, cloud boundaries
  if (
    /(architecture|kiến trúc|hệ thống|hạ tầng|microservice|client[\s\S]*server|gateway|in-memory|database|cache|redis|kafka|cluster|kubernetes|docker|cloud topology|backend[\s\S]*frontend|load balancer|dispatcher)/i.test(
      combined
    )
  ) {
    return {
      intent: "architecture",
      confidence: 0.94,
      reason:
        "The selected text describes component boundaries, service interactions, and system architecture.",
      recommendedPreset: "isometric",
      recommendedRatio: "16:9",
    };
  }

  // 2. Workflow / Lifecycle: Request flows, step-by-step pipelines, sequential stages
  if (
    /(workflow|pipeline|lifecycle|quy trình|các bước|luồng|before passing|eventually reaching|first[\s\S]*then|step [0-9]|phase [0-9]|bước [0-9]|ingestion|process flow|dispatch|ci\/cd|handshake)/i.test(
      combined
    )
  ) {
    return {
      intent: "workflow",
      confidence: 0.91,
      reason:
        "Explains a sequential flow, request lifecycle, or multi-step execution pipeline.",
      recommendedPreset: "blueprint",
      recommendedRatio: "16:9",
    };
  }

  // 3. Comparison / Trade-offs: Contrast between approaches
  if (
    /(vs|versus|so sánh|đối chiếu|ưu nhược điểm|khác biệt giữa|comparison|compared to|trade-off|pros and cons|difference between|benchmark against)/i.test(
      combined
    )
  ) {
    return {
      intent: "comparison",
      confidence: 0.9,
      reason:
        "Compares contrasting technologies, paradigms, or architectural trade-offs.",
      recommendedPreset: "flat_vector",
      recommendedRatio: "16:9",
    };
  }

  // 4. Data Benchmark / Chart: Quantitative metrics, throughput, latency
  if (
    /(latency|throughput|benchmark|metrics|p99|p95|qps|rps|megabytes|memory consumption|power efficiency|clock speed|fps|percentile|đo kiểm|điểm số|hiệu năng|tiêu thụ điện)/i.test(
      combined
    )
  ) {
    return {
      intent: "chart",
      confidence: 0.92,
      reason:
        "Features quantitative benchmarks and performance metrics best shown as a data chart.",
      recommendedPreset: "flat_vector",
      recommendedRatio: "16:9",
    };
  }

  // 5. Code Architecture Visual: Syntax blocks, interfaces, classes, AST
  if (
    /(syntax|interface|class diagram|ast|compiler|tokenization|type definition|struct|algorithm|call stack|mã nguồn|cú pháp|thuật toán)/i.test(
      combined
    )
  ) {
    return {
      intent: "code_visual",
      confidence: 0.88,
      reason:
        "Focuses on implementation structures and code architectural relationships.",
      recommendedPreset: "blueprint",
      recommendedRatio: "16:9",
    };
  }

  // 6. UI / Screenshot / Tool Console / Dashboard
  if (
    /(dashboard|ui|console|terminal|command line|screen|gui|settings panel|devtools|inspector|hwinfo|gpu-z|cpu-z|afterburner|task manager|giao diện|bảng điều khiển|màn hình|phần mềm|tiện ích|công cụ|giám sát)/i.test(
      combined
    )
  ) {
    return {
      intent: "screenshot",
      confidence: 0.91,
      reason: signals.isHardwareDiagnostics
        ? "Illustrates the hardware diagnostic tool interface, real-time telemetry dashboard, and sensor monitoring panel."
        : "Describes developer interface configurations or interactive console views.",
      recommendedPreset: "flat_vector",
      recommendedRatio: "16:9",
    };
  }

  // 7. General Technical Diagram: Connected nodes, protocol handshakes
  if (
    /(diagram|protocol|connection|packet|network|node|channel|socket|endpoint|sơ đồ|kết nối)/i.test(
      combined
    )
  ) {
    return {
      intent: "diagram",
      confidence: 0.89,
      reason:
        "Details system interactions best illustrated with clean connected nodes.",
      recommendedPreset: "blueprint",
      recommendedRatio: "16:9",
    };
  }

  // 8. Technical Illustration: Default high-craft technical mental model
  return {
    intent: "technical_illustration",
    confidence: signals.isHardwareDiagnostics ? 0.88 : 0.84,
    reason: signals.isHardwareDiagnostics
      ? "Visualizes PC hardware components, thermal sensors, and telemetry diagnostics in 30° isometric view."
      : "Visualizes modular technical systems and mental models in 30° isometric view.",
    recommendedPreset: "isometric",
    recommendedRatio: "16:9",
  };
}

// ─── 2. Structured Prompt Generation (Sprint 3 Requirement 4) ────────────────

/**
 * Extracts sequence components from technical text (e.g. A through B before C).
 */
function extractSequentialComponents(text: string): string[] {
  const steps: string[] = [];

  // Match common sequential connectors
  const parts = text.split(
    /\b(?:receives|through|before passing (?:it )?through|passing through|eventually reaching|reaches|and then|then to|to the|finally reaching)\b/i
  );

  if (parts.length > 1) {
    for (const part of parts) {
      const clean = part
        .trim()
        .replace(/^[a-z]+\s+(?:an?|the)\s+/i, "")
        .replace(/[.,;].*$/, "")
        .trim();
      if (clean && clean.length > 2 && clean.length < 50) {
        // Capitalize first letter of each component
        const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
        if (!steps.includes(formatted)) {
          steps.push(formatted);
        }
      }
    }
  }

  return steps;
}

/**
 * Builds a structured, high-craft generation prompt from context and classified intent.
 */
export function generateStructuredAiImagePrompt(options: {
  text: string;
  heading?: string;
  intent: VisualIntent;
  articleTitle?: string;
}): string {
  const { text, heading, intent, articleTitle } = options;
  const cleanSnippet = text.trim().replace(/^["'“”‘’]|["'“”‘’]$/g, "").replace(/\s+/g, " ");

  // Subject title derived from sanitized heading, snippet or article title
  const cleanHeading = sanitizeHeadingSubject(heading);
  const rawSubject =
    cleanHeading ||
    sanitizeHeadingSubject(cleanSnippet.slice(0, 75).replace(/[.:;!]+$/, "")) ||
    sanitizeHeadingSubject(articleTitle) ||
    "Technical Architecture";

  const subject = rawSubject.replace(/[.:;!]+$/, "").trim();

  // If already formulated as an explicit custom diagram prompt by author, preserve it
  if (
    /^(create a|generate a|clean technical architecture|detailed technical diagram)\b/i.test(
      cleanSnippet
    ) &&
    cleanSnippet.length > 40
  ) {
    return cleanSnippet;
  }

  const detectedSteps = extractSequentialComponents(cleanSnippet);
  const contextSignals = extractContextSignals(cleanSnippet, subject);

  switch (intent) {
    case "architecture": {
      let flowText = "";
      if (cleanSnippet.toLowerCase().includes("spring boot")) {
        flowText =
          "\n\nClient\n→ Embedded Server\n→ Servlet Filters\n→ DispatcherServlet\n→ Controller\n→ Service\n→ Repository\n\n";
      } else if (cleanSnippet.toLowerCase().includes("redis")) {
        flowText =
          "\n\nApplication Client\n→ API Server\n⇄ In-Memory Cache (Redis)\n→ Primary Database\n\n";
      } else if (detectedSteps.length >= 2) {
        const fullSteps =
          /request|http/i.test(cleanSnippet) &&
          !detectedSteps[0].toLowerCase().includes("client")
            ? ["Client", ...detectedSteps]
            : detectedSteps;
        flowText = `\n\n${fullSteps.join("\n→ ")}\n\n`;
      }

      return `Create a clean technical architecture diagram showing the ${subject}:${flowText}Use clear directional arrows, component boundary boxes, minimal labels, professional developer documentation style, clean composition.`;
    }

    case "workflow": {
      const flow =
        detectedSteps.length >= 2
          ? `\n\n${detectedSteps.join("\n→ ")}\n\n`
          : "";
      return `Create a clean technical workflow diagram illustrating ${subject}:${flow}\nHigh-contrast directional arrows, sequential step indicators, modern developer handbook aesthetic.`;
    }

    case "diagram": {
      if (contextSignals.isHardwareDiagnostics) {
        return `Create a detailed technical diagram explaining ${subject} telemetry data flow:\n\nPC hardware sensor bus to diagnostic software pipeline, labeled connector lines, clean modular topology, professional developer documentation style.`;
      }
      return `Create a detailed technical diagram explaining ${subject}:\n\nOrthographic schematic layout, labeled connector lines, clean modular topology, professional developer documentation style.`;
    }

    case "comparison": {
      return `Create a side-by-side technical comparison diagram illustrating ${subject}:\n\nLeft vs Right comparative columns, structural trade-off indicator badges, high-contrast clean technical layout.`;
    }

    case "chart": {
      if (contextSignals.isHardwareDiagnostics) {
        return `Create a clean technical benchmark data chart illustrating ${subject} telemetry metrics:\n\nComparative horizontal benchmark metric bars, temperature curves, voltage stability, and clock frequency indicators, modern dark-mode technical styling.`;
      }
      return `Create a clean technical benchmark data chart illustrating ${subject}:\n\nComparative horizontal benchmark metric bars, throughput and latency indicators, modern dark-mode technical styling.`;
    }

    case "code_visual": {
      return `Create a modern technical code architecture blueprint showing ${subject}:\n\nClean syntax hierarchy blocks, API interface signatures, Blueprint CAD schematic styling.`;
    }

    case "screenshot": {
      if (contextSignals.isHardwareDiagnostics) {
        const compList =
          contextSignals.components.length > 0
            ? contextSignals.components.join(", ")
            : "CPU, GPU, RAM";
        return `Create a clean technical UI dashboard mockup for ${subject} hardware diagnostics:\n\nDisplaying real-time telemetry sensor readouts for ${compList}, core clock frequencies, voltage meters, and thermal curves. Modern dark-mode hardware monitoring console, crisp data hierarchy, professional enthusiast utility layout.`;
      }
      return `Create a clean technical UI dashboard mockup illustrating ${subject}:\n\nModern developer console window, wireframe controls, high-craft dark mode UI.`;
    }

    case "abstract": {
      return `Create an abstract technical concept illustration for ${subject}:\n\nVolumetric geometric data streams, distributed computing matrix, subtle isometric elevation.`;
    }

    case "concept": {
      return `Create a clear technical concept diagram visualizing ${subject}:\n\nClean vector iconography, connected conceptual nodes, minimal aesthetic.`;
    }

    case "technical_illustration":
    default: {
      if (contextSignals.isBottleneck) {
        const compList =
          contextSignals.components.length > 0
            ? contextSignals.components.join(", ")
            : "CPU, GPU";
        return `Create a clean technical isometric illustration explaining ${subject}:\n\nIsometric 30-degree orthographic view, modular PC hardware architecture (${compList}) visualizing data throughput pipeline, PCIe bus communication, processor utilization, and hardware balance, soft volumetric technical matte style, clean high-tech composition.`;
      }
      if (contextSignals.isHardwareTool) {
        const compList =
          contextSignals.components.length > 0
            ? contextSignals.components.join(", ")
            : "CPU, GPU, RAM";
        const metricList =
          contextSignals.metrics.length > 0
            ? contextSignals.metrics.join(", ")
            : "temperature, voltage, and clock speed";
        return `Create a clean technical isometric illustration explaining ${subject} hardware diagnostics:\n\nIsometric 30-degree orthographic view, modular PC hardware components (${compList}) with glowing real-time telemetry sensor streams, ${metricList} indicators, soft volumetric technical matte style, clean high-tech composition.`;
      }
      if (contextSignals.isHardwareDiagnostics) {
        const compList =
          contextSignals.components.length > 0
            ? contextSignals.components.join(", ")
            : "CPU, GPU, RAM";
        return `Create a clean technical isometric illustration explaining ${subject}:\n\nIsometric 30-degree orthographic view, modular PC hardware components (${compList}) with glowing real-time telemetry sensor streams, soft volumetric technical matte style, clean high-tech composition.`;
      }
      return `Create a clean technical isometric illustration explaining ${subject}:\n\nIsometric 30-degree orthographic view, modular layered architecture, soft volumetric technical matte style.`;
    }
  }
}

/**
 * Returns dynamic, context-aware prompt idea chips based on subject, intent, and text context.
 */
export function getDynamicPromptChips(options: {
  heading?: string;
  text?: string;
  intent: VisualIntent;
  articleTitle?: string;
}): string[] {
  const { heading, text = "", intent, articleTitle } = options;
  const cleanSubject =
    sanitizeHeadingSubject(heading) ||
    sanitizeHeadingSubject(articleTitle) ||
    "Technical System";

  const signals = extractContextSignals(text, cleanSubject);

  if (signals.isBottleneck) {
    return [
      `3D isometric ${cleanSubject} data throughput & PCIe communication pipeline`,
      `CPU vs GPU utilization and frame time balance diagram`,
      `Hardware workload saturation and bottleneck indicator architecture`,
      `Balanced PC gaming component topology with throughput telemetry`,
    ];
  }

  if (signals.isHardwareDiagnostics) {
    return [
      `${cleanSubject} real-time sensor telemetry dashboard with CPU & GPU thermals`,
      `Hardware diagnostic monitoring panel showing voltages, clock speeds, and fan RPM`,
      `3D isometric PC component sensor architecture with live data streams`,
      `Minimalist dark-mode hardware status gauge HUD`,
    ];
  }

  switch (intent) {
    case "architecture": {
      if (/redis|cache|database/i.test(text)) {
        return [
          "In-memory Redis caching topology with primary database read-replica",
          "High-concurrency API gateway load-balancing topology",
          `${cleanSubject} distributed caching cluster data flow`,
          "Multi-region database replication and failover architecture",
        ];
      }
      return [
        `${cleanSubject} system component architecture with directional data flow`,
        `Microservices event-driven communication topology for ${cleanSubject}`,
        "High-concurrency service boundary and load balancer topology",
        "End-to-end distributed infrastructure architecture diagram",
      ];
    }
    case "workflow": {
      return [
        `Step-by-step execution pipeline for ${cleanSubject}`,
        `Sequential data processing flow with directional stages`,
        `Interactive walkthrough with state transition indicators`,
        `Lifecycle stage progression flowchart for ${cleanSubject}`,
      ];
    }
    case "comparison": {
      return [
        `Side-by-side technical trade-off matrix for ${cleanSubject}`,
        `Performance throughput and latency benchmark comparison`,
        `Feature matrix and architectural differences breakdown`,
        `Dual-column comparative schematic layout`,
      ];
    }
    case "chart": {
      return [
        `Quantitative benchmark comparison chart for ${cleanSubject}`,
        `Latency and throughput distribution metrics chart`,
        `Hardware power efficiency and performance curve`,
        `Comparative horizontal bar chart with telemetry indicators`,
      ];
    }
    case "screenshot": {
      return [
        `${cleanSubject} modern dark-mode application dashboard UI`,
        `Interactive developer console and configuration inspector`,
        `Real-time telemetry HUD with telemetry graphs and meters`,
        `Minimalist desktop utility window layout for ${cleanSubject}`,
      ];
    }
    case "code_visual": {
      return [
        `${cleanSubject} interface contracts and type definitions`,
        `Abstract syntax tree (AST) tokenization flowchart`,
        `Data structure memory layout blueprint for ${cleanSubject}`,
        `Function call hierarchy and recursion stack diagram`,
      ];
    }
    case "technical_illustration":
    default: {
      return [
        `3D isometric orthographic view of ${cleanSubject} internal mechanisms`,
        `Modular layered technical illustration of ${cleanSubject}`,
        `High-craft soft volumetric matte 3D schematic`,
        `Exploded isometric view showing system component interactions`,
      ];
    }
  }
}

// ─── 3. Context Analysis & Extraction Pipeline (Sprint 3 Priority Tiers) ─────

const MAX_CONTEXT_LENGTH = 1500;

/**
 * Extracts and analyzes editor context following the Sprint 3 priority hierarchy:
 * 1. Selected text
 * 2. Current paragraph
 * 3. Current heading + paragraph
 * 4. Current section
 * 5. Existing visual suggestion
 * 6. Article title/category/tags fallback
 * 
 * Caps context to 1500 characters max to prevent payload bloat.
 */
export function extractEditorContextForAiImage(
  editor: Editor | null,
  visualSuggestion?: VisualSuggestionInput,
  articleMeta?: ArticleMetadataInput
): EditorAiImageContext {
  // ── Priority 5: Explicit Visual Suggestion ──────────────────────────────────
  if (visualSuggestion?.prompt) {
    const rawPrompt = visualSuggestion.prompt.slice(0, MAX_CONTEXT_LENGTH).trim();
    const classification = classifyVisualIntent(rawPrompt, visualSuggestion.heading || "");
    const matchedIntent = (visualSuggestion.visualType as VisualIntent) || classification.intent;
    const config = VISUAL_INTENTS[matchedIntent] || VISUAL_INTENTS.technical_illustration;

    return {
      suggestedPrompt: rawPrompt,
      contextSnippet: rawPrompt,
      contextType: "suggestion",
      heading: visualSuggestion.heading,
      articleTitle: articleMeta?.title,
      suggestedAlt:
        visualSuggestion.altText ||
        `Illustration for ${visualSuggestion.heading || "section"}`,
      visualIntent: matchedIntent,
      visualType: matchedIntent,
      confidence: 0.95,
      recommendationReason:
        visualSuggestion.reason || config.reasonTemplate,
      recommendedPreset:
        visualSuggestion.style || config.defaultPreset,
      recommendedRatio:
        visualSuggestion.aspectRatio || config.defaultRatio,
      visualSuggestion,
    };
  }

  // ── Fallback when editor instance is unavailable ────────────────────────────
  if (!editor || !editor.state) {
    const fallbackTitle = articleMeta?.title?.slice(0, MAX_CONTEXT_LENGTH) || "Technical Architecture";
    const classification = classifyVisualIntent(fallbackTitle);
    const structuredPrompt = generateStructuredAiImagePrompt({
      text: fallbackTitle,
      intent: classification.intent,
      articleTitle: articleMeta?.title,
    });

    return {
      suggestedPrompt: structuredPrompt,
      contextSnippet: fallbackTitle,
      contextType: "fallback",
      articleTitle: articleMeta?.title,
      visualIntent: classification.intent,
      visualType: classification.intent,
      confidence: classification.confidence,
      recommendationReason: classification.reason,
      recommendedPreset: classification.recommendedPreset,
      recommendedRatio: classification.recommendedRatio,
    };
  }

  const { from, to } = editor.state.selection;
  const isRangeSelected = from !== to;
  const selectedText = isRangeSelected
    ? editor.state.doc.textBetween(from, to, " ").trim().slice(0, MAX_CONTEXT_LENGTH)
    : "";

  // ── Priority 1: Selected Text ──────────────────────────────────────────────
  if (selectedText) {
    // Search backward for nearest heading for contextual subject
    let nearestHeading = "";
    try {
      editor.state.doc.nodesBetween(0, from, (node) => {
        if (node.type.name === "heading" && node.textContent.trim()) {
          nearestHeading = node.textContent.trim();
        }
        return true;
      });
    } catch {}

    const classification = classifyVisualIntent(selectedText, nearestHeading);
    const structuredPrompt = generateStructuredAiImagePrompt({
      text: selectedText,
      heading: nearestHeading,
      intent: classification.intent,
      articleTitle: articleMeta?.title,
    });

    return {
      suggestedPrompt: structuredPrompt,
      contextSnippet: selectedText,
      contextType: "selection",
      heading: nearestHeading || undefined,
      articleTitle: articleMeta?.title,
      suggestedAlt: `Illustration explaining ${selectedText.slice(0, 80).replace(/[.:;!]+$/, "")}`,
      visualIntent: classification.intent,
      visualType: classification.intent,
      confidence: classification.confidence,
      recommendationReason: classification.reason,
      recommendedPreset: classification.recommendedPreset,
      recommendedRatio: classification.recommendedRatio,
    };
  }

  // ── Priority 2 & 3: Current Paragraph & Heading ───────────────────────────
  const $from = editor.state.selection.$from;
  let blockText = "";
  if ($from.parent && $from.parent.isTextblock) {
    blockText = $from.parent.textContent.trim().slice(0, MAX_CONTEXT_LENGTH);
  }

  let nearestHeading = "";
  try {
    editor.state.doc.nodesBetween(0, $from.pos, (node) => {
      if (node.type.name === "heading" && node.textContent.trim()) {
        nearestHeading = node.textContent.trim();
      }
      return true;
    });
  } catch {}

  // Priority 3: Heading + Paragraph combined
  if (nearestHeading && blockText) {
    const combinedContext = `${nearestHeading}: ${blockText}`.slice(0, MAX_CONTEXT_LENGTH);
    const classification = classifyVisualIntent(combinedContext, nearestHeading);
    const structuredPrompt = generateStructuredAiImagePrompt({
      text: blockText,
      heading: nearestHeading,
      intent: classification.intent,
      articleTitle: articleMeta?.title,
    });

    return {
      suggestedPrompt: structuredPrompt,
      contextSnippet: blockText,
      contextType: "heading_paragraph",
      heading: nearestHeading,
      articleTitle: articleMeta?.title,
      suggestedAlt: `Illustration of ${sanitizeHeadingSubject(nearestHeading) || nearestHeading}`,
      visualIntent: classification.intent,
      visualType: classification.intent,
      confidence: classification.confidence,
      recommendationReason: classification.reason,
      recommendedPreset: classification.recommendedPreset,
      recommendedRatio: classification.recommendedRatio,
    };
  }

  // Priority 2: Current Paragraph only
  if (blockText) {
    const classification = classifyVisualIntent(blockText);
    const structuredPrompt = generateStructuredAiImagePrompt({
      text: blockText,
      intent: classification.intent,
      articleTitle: articleMeta?.title,
    });

    return {
      suggestedPrompt: structuredPrompt,
      contextSnippet: blockText,
      contextType: "paragraph",
      articleTitle: articleMeta?.title,
      suggestedAlt: `Illustration for ${sanitizeHeadingSubject(blockText.slice(0, 80).replace(/[.:;!]+$/, "")) || blockText.slice(0, 80)}`,
      visualIntent: classification.intent,
      visualType: classification.intent,
      confidence: classification.confidence,
      recommendationReason: classification.reason,
      recommendedPreset: classification.recommendedPreset,
      recommendedRatio: classification.recommendedRatio,
    };
  }

  // Priority 4: Heading only (Section start)
  if (nearestHeading) {
    const classification = classifyVisualIntent(nearestHeading, nearestHeading);
    const structuredPrompt = generateStructuredAiImagePrompt({
      text: nearestHeading,
      heading: nearestHeading,
      intent: classification.intent,
      articleTitle: articleMeta?.title,
    });

    return {
      suggestedPrompt: structuredPrompt,
      contextSnippet: nearestHeading,
      contextType: "section",
      heading: nearestHeading,
      articleTitle: articleMeta?.title,
      suggestedAlt: `Illustration of ${sanitizeHeadingSubject(nearestHeading) || nearestHeading}`,
      visualIntent: classification.intent,
      confidence: classification.confidence,
      recommendationReason: classification.reason,
      recommendedPreset: classification.recommendedPreset,
      recommendedRatio: classification.recommendedRatio,
    };
  }

  // Priority 6: Article title / category fallback
  const fallback = articleMeta?.title || "Technical System Architecture";
  const classification = classifyVisualIntent(fallback);
  const structuredPrompt = generateStructuredAiImagePrompt({
    text: fallback,
    intent: classification.intent,
    articleTitle: articleMeta?.title,
  });

  return {
    suggestedPrompt: structuredPrompt,
    contextSnippet: fallback,
    contextType: "fallback",
    articleTitle: articleMeta?.title,
    suggestedAlt: `Illustration of ${fallback}`,
    visualIntent: classification.intent,
    visualType: classification.intent,
    confidence: classification.confidence,
    recommendationReason: classification.reason,
    recommendedPreset: classification.recommendedPreset,
    recommendedRatio: classification.recommendedRatio,
  };
}

// ─── 4. Telemetry Tracking (Sprint 3 Requirement 8) ──────────────────────────

/**
 * Dispatches an analytics event with sanitized telemetry metadata.
 * Never logs raw article passwords, access tokens, or sensitive payload details.
 */
export async function trackAiImageTelemetry(
  actionTaken: VisualAnalyticsAction,
  options: {
    heading?: string;
    intent?: VisualIntent | string;
    preset?: string;
    postId?: string;
    contextType?: ContextSourceType;
    latencyMs?: number;
    success?: boolean;
    provider?: string;
    model?: string;
    confidence?: number;
    promptLength?: number;
  }
) {
  const event: VisualAnalyticsEvent = {
    actionTaken,
    heading: options.heading?.slice(0, 100),
    visualType: options.intent,
    preset: options.preset,
    postId: options.postId,
    confidence: options.confidence,
    metadata: {
      source: "ai_assist",
      contextType: options.contextType,
      latencyMs: options.latencyMs,
      success: options.success,
      provider: options.provider || "gemini",
      model: options.model || "gemini-imagen",
      promptLength: options.promptLength,
    },
  };

    try {
      return await aiVisualApi.trackAnalytics(event);
    } catch {
      // Non-blocking telemetry: Analytics failures must never break the authoring workflow
      return null;
    }
  }

// ─── 5. Tiptap Node Attribute Builder ─────────────────────────────────────────

export function buildImageNodeAttributes(params: {
  url: string;
  alt?: string;
  mediaId?: string;
  caption?: string;
}): {
  src: string;
  alt: string;
  "data-media-id"?: string;
  caption?: string;
} {
  const attrs: {
    src: string;
    alt: string;
    "data-media-id"?: string;
    caption?: string;
  } = {
    src: params.url,
    alt: params.alt?.trim() || "AI generated illustration",
  };

  if (params.mediaId) {
    attrs["data-media-id"] = params.mediaId;
  }

  if (params.caption) {
    attrs.caption = params.caption;
  }

  return attrs;
}

export interface AIAssistActionHandlers {
  onContinue: () => void;
  onImprove: () => void;
  onExample: () => void;
  onReview: () => void;
  onImage: () => void;
}

export function getStandardAIAssistActions(
  handlers: AIAssistActionHandlers
): AIAssistAction[] {
  return [
    {
      id: "continue",
      label: "Continue Writing",
      description: "Generate natural continuation based on previous context",
      icon: Sparkles,
      onClick: handlers.onContinue,
    },
    {
      id: "improve",
      label: "Improve Text",
      description: "Refactor tone, grammar, and technical clarity",
      icon: Wand2,
      onClick: handlers.onImprove,
    },
    {
      id: "example",
      label: "Generate Example",
      description: "Insert relevant code or real-world use cases",
      icon: BookOpen,
      onClick: handlers.onExample,
    },
    {
      id: "review",
      label: "Review Article",
      description: "Get comprehensive quality, tone, and SEO suggestions",
      icon: FileText,
      onClick: handlers.onReview,
    },
    {
      id: "image",
      label: "AI Visual Assistant",
      description: "Generate an AI illustration or find real images from the internet",
      icon: Sparkles,
      onClick: handlers.onImage,
      variant: "accent",
    },
  ];
}
