// =============================================================================
//  AI VISUAL TAXONOMY & PRESETS
//  src/features/editor/constants/aiVisualTaxonomy.ts
//
//  Shared taxonomy for AI image styles, aspect ratios, and visual intents
//  across the editor and AI Visual Assistant.
// =============================================================================

import {
  Box,
  Compass,
  Layers,
  Cpu,
  Network,
  GitBranch,
  Split,
  BarChart3,
  Code,
  Monitor,
} from "lucide-react";
import type { IllustrationPreset, VisualIntent } from "@/features/ai-visual";

export interface StylePresetDefinition {
  id: IllustrationPreset;
  label: string;
  icon: any;
  hint: string;
}

export interface AspectRatioDefinition {
  id: string;
  label: string;
  description: string;
  ratioClass: string;
}

export interface VisualIntentDefinition {
  id: VisualIntent;
  label: string;
  icon: any;
  defaultPreset: IllustrationPreset;
  defaultRatio: string;
  description: string;
  reasonTemplate: string;
}

export const STYLE_PRESETS: StylePresetDefinition[] = [
  { id: "isometric", label: "Isometric", icon: Box, hint: "30° orthographic 3D view" },
  { id: "blueprint", label: "Blueprint", icon: Compass, hint: "CAD technical schematic" },
  { id: "flat_vector", label: "Flat Vector", icon: Layers, hint: "Modern minimal icon style" },
  { id: "3d_technical", label: "3D Technical", icon: Cpu, hint: "Soft volumetric matte 3D" },
];

export const ASPECT_RATIOS: AspectRatioDefinition[] = [
  { id: "16:9", label: "16:9", description: "Landscape", ratioClass: "aspect-video" },
  { id: "4:3", label: "4:3", description: "Classic", ratioClass: "aspect-4/3" },
  { id: "1:1", label: "1:1", description: "Square", ratioClass: "aspect-square" },
];

export const VISUAL_INTENTS: Record<VisualIntent, VisualIntentDefinition> = {
  architecture: {
    id: "architecture",
    label: "Architecture Diagram",
    icon: Network,
    defaultPreset: "isometric",
    defaultRatio: "16:9",
    description: "System topology, microservices, cloud boundaries & component interaction",
    reasonTemplate: "The selected text describes component boundaries, service interactions, and system architecture.",
  },
  workflow: {
    id: "workflow",
    label: "Workflow / Pipeline",
    icon: GitBranch,
    defaultPreset: "blueprint",
    defaultRatio: "16:9",
    description: "Step-by-step lifecycle, data ingestion pipeline or sequential execution",
    reasonTemplate: "Explains a sequential flow, request lifecycle, or multi-step execution pipeline.",
  },
  diagram: {
    id: "diagram",
    label: "Technical Diagram",
    icon: Compass,
    defaultPreset: "blueprint",
    defaultRatio: "16:9",
    description: "Orthographic schematic with labeled connections and data pathways",
    reasonTemplate: "Details system interactions best illustrated with clean connected nodes.",
  },
  technical_illustration: {
    id: "technical_illustration",
    label: "Technical Illustration",
    icon: Box,
    defaultPreset: "isometric",
    defaultRatio: "16:9",
    description: "High-craft 3D isometric representation of technical mechanisms",
    reasonTemplate: "Visualizes modular technical systems and mental models in 30° isometric view.",
  },
  comparison: {
    id: "comparison",
    label: "System Comparison",
    icon: Split,
    defaultPreset: "flat_vector",
    defaultRatio: "16:9",
    description: "Side-by-side trade-off analysis or architectural contrast",
    reasonTemplate: "Compares contrasting technologies, paradigms, or architectural trade-offs.",
  },
  chart: {
    id: "chart",
    label: "Benchmark / Chart",
    icon: BarChart3,
    defaultPreset: "flat_vector",
    defaultRatio: "16:9",
    description: "Quantitative metrics, throughput, latency or performance comparisons",
    reasonTemplate: "Contains quantitative benchmarks and performance comparisons best presented as a chart.",
  },
  code_visual: {
    id: "code_visual",
    label: "Code Visual",
    icon: Code,
    defaultPreset: "blueprint",
    defaultRatio: "16:9",
    description: "Interface signatures, data structure layout or syntax relationship",
    reasonTemplate: "Focuses on implementation structures and code architectural relationships.",
  },
  screenshot: {
    id: "screenshot",
    label: "UI Flow / Console",
    icon: Monitor,
    defaultPreset: "flat_vector",
    defaultRatio: "16:9",
    description: "Developer console dashboard or interactive configuration interface",
    reasonTemplate: "Illustrates developer interface configurations or interactive console views.",
  },
  concept: {
    id: "concept",
    label: "Conceptual Model",
    icon: Layers,
    defaultPreset: "flat_vector",
    defaultRatio: "16:9",
    description: "Abstract conceptual mental model and domain relationship",
    reasonTemplate: "Explains foundational concepts and abstract domain relationships.",
  },
  abstract: {
    id: "abstract",
    label: "Abstract Schematic",
    icon: Cpu,
    defaultPreset: "3d_technical",
    defaultRatio: "16:9",
    description: "Volumetric high-tech representation of computing ideas",
    reasonTemplate: "Visualizes high-level compute concepts with volumetric geometric composition.",
  },
};

export const VISUAL_INTENT_LIST: VisualIntentDefinition[] = Object.values(VISUAL_INTENTS);
