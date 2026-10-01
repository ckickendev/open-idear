---
name: ai-visual-assistant
description: Guidelines and contracts for the OpenIdear AI Visual Assistant, including decision classification, batch generation, asset picking, and telemetry.
---

# AI Visual Assistant Architecture & Implementation Guide

This skill governs the AI Visual Assistant subsystem in `open-trash-tech`. It outlines the decision classification rules, batch generation flows, editor UI components, and telemetry tracking contracts.

---

## 1. Canonical Visual Decision Types

The decision engine classifies section content into 7 canonical types:

| Decision Type | Context / Domain | Primary Action | Default Preset / Treatment |
| :--- | :--- | :--- | :--- |
| **`SEARCH_IMAGE`** | Physical products, camera hardware, consumer tech | `search` | Stock / Asset library query |
| **`GENERATE_IMAGE`** | Technical mental models, conceptual workflows | `generate` | AI Illustration (`isometric`, `flat_vector`, etc.) |
| **`DIAGRAM`** | System architectures, microservices, cloud topologies | `diagram` | Architecture diagram preset |
| **`SCREENSHOT`** | Step-by-step UI tutorials, dashboards, CLI configs | `screenshot` | UI Screenshot placeholder |
| **`CHART`** | Latency benchmarks, performance metrics, throughput | `chart` | Data benchmark chart |
| **`CODE_VISUAL`** | Implementation details, syntax blocks | `code` | Code visual block |
| **`NO_VISUAL`** | Conceptual prose, summaries, conclusions | `none` | Omitted (anti-clutter) |

---

## 2. Decision Rules & Thresholds

1. **Confidence Threshold**: Minimum confidence is `0.70` (70%). Any section scoring below 0.70 must default to `NO_VISUAL`.
2. **Anti-Clutter Filter**: Introduction, summary, and conclusion sections must be filtered to `NO_VISUAL` (0.95 confidence) to prevent visual noise.
3. **Fuzzy Duplicate Reuse**: During batch runs, sections sharing similar concepts (similarity ≥ 0.75) reuse existing illustrations (`isReused: true`) instead of generating new assets.

---

## 3. UI Component Responsibilities

1. **`ImagePlaceholderView.tsx`**:
   - Displays the recommendation badge: `Recommended: [Diagram]` with match %.
   - Displays the explainable `Why?` rationale.
   - Primary actions: `[Search]`, `[Generate]`, `[Dismiss]`.
   - Result states: `[Use Image]`, `[Regenerate]`, `[Change Style]`, `[Reject]`, `[Dismiss]`.
2. **`BatchVisualsModal.tsx`**:
   - **Progress Breakdown**: `✓ X inserted`, `✓ Y searched`, `⟳ Z generating`, `○ W skipped`.
   - **Author Checklist**: Allows authors to review each section's visual result and uncheck any unwanted items before applying.
   - **Never Silently Publish**: Always requires explicit author confirmation before inserting visuals into the editor.
3. **`AssetPickerDrawer.tsx`**:
   - Multi-provider stock search (Unsplash, Pexels) & Asset Library.
   - Attribution badges, license indicators, and alt-text confirmation before inserting.

---

## 4. Telemetry Contract (8 Lifecycle Events)

Always track telemetry using `aiVisualApi.trackAnalytics(...)`:

1. `visual_suggestion_created`: Placeholder or section recommendation classified.
2. `visual_search_started`: User opened the search drawer from a placeholder.
3. `visual_search_selected`: Asset selected and inserted into editor.
4. `visual_generation_started`: User or batch initiated image generation.
5. `visual_generation_accepted`: User clicked `Use Image` to confirm a generated asset.
6. `visual_generation_rejected`: User rejected or discarded a generated asset.
7. `visual_generation_regenerated`: User requested a new variation with fresh seed.
8. `visual_suggestion_dismissed`: User dismissed/deleted a placeholder suggestion.
