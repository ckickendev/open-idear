# OpenIdear AI Content Architecture Review

> **Reviewer:** Senior Staff Engineer / AI Platform Architect  
> **Date:** 2026-08-22  
> **Scope:** Full codebase audit — frontend (`open-trash-tech`) + backend (`open-trash-tech-be`)

---

## 1. Executive Summary

OpenIdear already has a **surprisingly mature AI platform core** for a project at its stage. The backend AI module is a multi-layered, provider-abstracted, schema-validated system with execution pipelines, middleware, telemetry, prompt versioning, task registries, and an orchestration engine. Several components that would normally be Sprint 3–4 work are already built.

**The critical finding is not about building new infrastructure. It is about extending what already exists.**

The current AI Writer outputs **raw Markdown text**. The frontend converts that Markdown to **raw HTML** using a basic 62-line regex-based parser, injects it into a **Tiptap editor**, and stores it as an **HTML string** in MongoDB (`content: { type: String }`). The preview renders that HTML string via `dangerouslySetInnerHTML`.

This means:
- There is **no structured article schema**. Content is a monolithic HTML blob.
- There are **no reusable article components** on the frontend. All rendering is CSS prose styling.
- The AI Writer **cannot produce callouts, comparison tables, FAQ blocks, or CTAs** in a semantically structured way that the frontend can independently control.
- The post database model has **no concept of content blocks, sections, schema version, or article type**.

However, critically:
- The **GrowthWorkflow already generates FAQs and comparison tables** as structured JSON — they just are not rendered as proper components.
- The **Orchestration layer already supports multi-step pipelines** with conditional execution.
- The **Execution Facade already handles prompt loading, retry, telemetry, and JSON validation**.
- The **AI Platform Core is ready** to accept new capabilities without architectural changes.

The path forward is surgical, incremental, and lower-risk than a rebuild.

---

## 2. Current Architecture

### Frontend Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Editor | Tiptap (ProseMirror-based rich text) |
| State Management | Zustand (per-feature stores), local useState |
| AI State | `aiStore.ts` (Zustand, ephemeral, not persisted) |
| Styling | TailwindCSS + CSS custom properties (`--color-editor-*`) |
| API Client | Custom Axios wrapper + native `fetch` for SSE streams |
| Preview | `dangerouslySetInnerHTML` + CSS prose classes |
| Design System | CSS custom property tokens throughout |

**Feature Modules** (`src/features/`):
- `ai/` — Planner UI, Image Generator, Image Editor, Diagram Generator, hooks, API client
- `editor/` — EditorShell orchestrator (1,285 lines), Tiptap extensions, autosave, publishing panel
- `preview/` — LivePreviewSystem, HtmlRenderer, viewport switching
- `media/`, `media-library/` — Image upload and library browsing
- `seo/` — Content metrics hook
- `publish/`, `autosave/`, `series/`, `categories/`

### Backend Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js / Express |
| Language | Mixed: TypeScript (AI layer), JavaScript (controllers, services, models) |
| Database | MongoDB / Mongoose |
| AI Provider | Google Gemini (via `GeminiProvider`) |
| Queue | Custom MongoDB-backed job queue (`AIJob` schema) |
| Deployment | Netlify serverless functions |

**Backend AI Directory Structure:**
```
ai/
├── agent/         # BaseAgent + concrete agents (Writer, Planner, SEO, etc.)
├── config/        # Model aliases, rate limits, per-scope config
├── context/       # AIContext builders (Editor, Publishing, Growth)
├── execution/     # ExecutionFacade, Pipeline, Middleware chain
├── orchestration/ # Declarative OrchestratedWorkflow + TaskRegistry
├── prompt/        # PromptRegistry, PromptLoader, VersionManager, templates/
├── provider/      # ProviderRegistry, GeminiProvider, FallbackStrategy
├── telemetry/     # TelemetryLogger, Console + File sinks
├── tool/          # ToolRegistry, AITool, concrete tools
├── vision/        # Image analysis providers
├── workflow/      # High-level workflow orchestrators
└── index.ts       # Single public API surface
```

---

## 3. Current AI Writer Analysis

### Inputs

**PlannerAgent receives:** `topic, audience, goal, tone, length, category`  
(from `AIPlannerView.tsx` form)

**WriterAgent receives:**  
```
plan: PlannerOutline  — { title, difficulty, estimatedReadingTime, keywords, outline[] }
additionalInstructions: string
```

### Output

`WriterSchema` (Zod-validated JSON):
```typescript
{ markdown: string, wordCount: number, estimatedReadingTime: number }
```

The output is **pure Markdown text**. No structure beyond Markdown syntax.

### Transformation Pipeline

In `EditorShell.tsx` (lines 729–763):
1. Markdown chunks accumulate in `accumulatedMarkdown` during SSE stream
2. `parseMarkdownToHtml(accumulatedMarkdown)` converts to HTML on each chunk
3. `editor.commands.setContent(html)` injects into Tiptap

The Markdown parser (`markdownParser.ts`) is a 62-line regex pipeline handling: H2, H3, code blocks (with language), bold, bullet lists, and paragraphs only. **Does not handle:** tables, blockquotes, images, links, nested lists, or any extended Markdown.

### Storage

Tiptap's `getHTML()` output → `post.content` field (raw HTML string in MongoDB).  
No structured document. No schema version. No block array.

### Rendering

`HtmlRenderer.tsx` uses `dangerouslySetInnerHTML`. Post-render DOM manipulation adds copy buttons to code blocks and anchor IDs to headings.

### Rich Content Block Support

| Block Type | Supported? | Notes |
|---|---|---|
| Paragraphs | ✅ Yes | Via `<p>` tags |
| Headings H2/H3 | ✅ Yes | Via regex in parser |
| Code blocks | ✅ Yes | With language class |
| Bold text | ✅ Yes | `<strong>` |
| Bullet lists | ✅ Yes | Basic `<ul><li>` |
| **Tables** | ⚠️ Partial | HtmlRenderer wraps existing tables, but the parser cannot generate them |
| **Callouts / Warnings / Tips** | ❌ No | No extension, no parser rule, no component |
| **Images (AI-placed)** | ⚠️ Manual only | User-inserted, not AI-placed contextually |
| **FAQ sections** | ⚠️ JSON only | GrowthWorkflow generates FAQs as JSON — never rendered as components in articles |
| **CTA blocks** | ❌ No | No concept exists in the system |
| **Comparison tables** | ⚠️ JSON only | GrowthWorkflow generates as structured JSON — never surfaced in articles |
| **Metadata (alt, captions)** | ❌ No | No per-block metadata concept |
| **SEO structured data** | ❌ No | Not generated, not stored |

### What Would Break If We Introduced a Structured Article Schema?

1. **Existing posts** (HTML strings) need a migration path or compatibility renderer.
2. **`useAutoSave`** saves `getHTML()` — must know whether to serialize as HTML or structured JSON.
3. **Tiptap** only handles HTML content — new block types need custom Tiptap extensions.
4. **`HtmlRenderer`** needs a new rendering mode for structured block schemas.
5. **`WriterSchema`** only outputs `{ markdown, wordCount, estimatedReadingTime }` — must be extended.
6. **`markdownParser.ts`** must be completely replaced or supplemented.

---

## 4. Current Article / Content Model

### Database Schema (`post.schema.js`)

```javascript
{
  _id, image, title, slug, description,
  content: String,  // ← Raw HTML blob — the structural problem
  text: String,     // Plain text for full-text search
  author, category, tags, published, views, likes, marked,
  comments, isFreePreview, lessonType, mediaContent,
  del_flag, readtime, createdAt, updatedAt
}
```

**Missing fields:**
- No `contentVersion` — cannot distinguish HTML from structured schema
- No `articleType` — cannot distinguish AI articles from manual posts
- No `blocks[]` array
- No `seo` subdocument
- No `hero` subdocument
- No `aiContext` — AI outputs (plan, writer output, growth results) are never persisted
- No `articleStatus` beyond `published: Boolean`

### Current Content Flow

```
AIPlannerView (form)
  → POST /ai/v1/planner → PlannerAgent → PlannerOutline (JSON)
  → UI displays outline tree
  → User clicks "Generate Article"
  → SSE /ai/v1/writer/stream → WriterAgent → Markdown chunks
  → parseMarkdownToHtml() → Tiptap setContent(html)
  → Autosave → POST /api/post → MongoDB: content = editor.getHTML()
  → Preview → HtmlRenderer → dangerouslySetInnerHTML
```

**Critical gap:** PlannerOutline and WriterOutput are transient React state. Once the markdown streams in and becomes HTML, all structured AI context is permanently lost.

---

## 5. Architectural Problems

### Critical

#### C1 — Content is a monolithic HTML string with no schema

**Current implementation:** `content: { type: String }` in `post.schema.js`.

**Problem:** No way to distinguish headings from callouts, tables from paragraphs, FAQ from prose. All semantic intent is in raw HTML class attributes.

**Impact:** Cannot build AI-aware article components, cannot add new block types, cannot analyze content, cannot migrate or transform content programmatically.

**Recommendation:** Introduce a `contentVersion` field and optional `blocks[]` array. Both coexist during a migration window.

---

#### C2 — The Markdown parser is inadequate for rich content generation

**Current implementation:** `markdownParser.ts` — 62-line regex-based converter.

**Problem:** Even if WriterAgent generates rich Markdown (tables, callouts, etc.), the frontend parser silently drops or corrupts these constructs.

**Impact:** Blocks all efforts to enrich content at the writing stage. AI can generate structure, but the rendering pipeline strips it.

**Recommendation:** Replace with `marked`, `remark`, or `markdown-it`. This is a 2-hour fix with very high leverage.

---

#### C3 — No persistence of structured AI outputs

**Current implementation:** PlannerOutline and WriterOutput live in React state only. GrowthWorkflow results are computed ad-hoc and not stored on the post.

**Problem:** All structured AI context is lost when the user navigates away.

**Impact:** Cannot build a structured article pipeline. Cannot re-run SEO, FAQ, or comparison generation from the original plan.

**Recommendation:** Add `aiContext` subdocument to the post schema to store `{ plannerOutput, writerOutput, growthResults }`. MongoDB schema addition + backend save step — no architectural restructuring needed.

---

### Important

#### I1 — WriterSchema outputs Markdown, not structured blocks

**Recommended direction:** Extend `WriterSchema` with an optional `blocks?: ArticleBlock[]` field. Preserve `markdown` for backwards compatibility.

---

#### I2 — GrowthWorkflow outputs are disconnected from article rendering

The `GrowthWorkflow` already generates `FAQResult` and `ComparisonTableResult` as structured JSON. These are never stored on the post and never rendered as visual components in the article.

**Recommended direction:** Store growth results in `post.aiContext.growthResults`. Create `<ArticleFAQ />` and `<ArticleComparisonTable />` that consume stored results. No new AI generation needed — just routing existing output to the right place.

---

#### I3 — Markdown parser has no abstraction layer

`parseMarkdownToHtml()` is called directly inside `EditorShell.tsx`. When replaced, `EditorShell.tsx` must be modified.

**Recommended direction:** Extract a `ContentTransformer` service.

---

#### I4 — EditorShell.tsx is a 1,285-line God component

Orchestrates: editor, autosave, publish, image upload, AI planner, image generator, image editor, diagram generator, bubble menu, shortcuts, content metrics, post list navigation, HTML mode, and block insertion — all in one file.

**Recommended direction:** Extract `useAIArticleWriter` hook that encapsulates the full plan → write → enhance → persist pipeline.

---

#### I5 — Prompt template files are stubs

`planner.prompts.js` and `writer.prompts.js` contain only comment headers, no actual prompt text. The actual prompts are presumably loaded from `.md` files via `FilePromptSource`, but this is not confirmed in the reviewed code.

**Recommended direction:** Confirm and document where live prompts are stored.

---

### Nice to Have

- **N1** — ProviderRegistry is Gemini-only despite being provider-agnostic
- **N2** — No `"layoutArchitect"` AIConfigScope — would default to `"editor"` scope
- **N3** — No `schema.org/Article` JSON-LD generation for AEO

---

## 6. Proposed Article Architecture

The right architecture is a **progressive extension** of the existing system.

```
User Input (AIPlannerView)
         │
         ▼
  PlannerAgent (unchanged) ──────────▶  PlannerOutline (JSON)
         │                                      │
         │                              stored in post.aiContext
         ▼
  WriterAgent (schema extended) ─────▶  { markdown, blocks[], wordCount }
         │                                      │
         │                              stored in post.aiContext
         ▼
  GrowthEngine (outputs rerouted) ───▶  { faq, comparisonTable, ... }
         │                                      │
         │                              stored in post.aiContext
         ▼
  ContentStructureService (NEW — service, not agent)
         │
         ▼
  ArticleBlock[] ────────────────────▶  stored as post.blocks[]
         │
         ▼
  ArticleRenderer ────────────────────▶  Published Article
```

**Key insight:** The data to build a rich article is almost entirely already generated. The gaps are:
1. Storing structured AI outputs on the post
2. A block schema to express content structurally
3. A renderer that reads blocks, not HTML strings

---

## 7. Proposed Article Schema

The schema must handle **both content versions simultaneously** during the migration window.

**MongoDB schema extensions** (additive only, no breaking changes):

```
post.contentVersion: "html-v1" | "blocks-v1"   ← NEW discriminator
post.blocks: ArticleBlock[]                     ← NEW, sparse (blocks-v1 only)
post.hero: HeroSubdocument                      ← NEW, sparse
post.aiContext: {                               ← NEW, sparse
  plannerOutput: PlannerOutline,
  writerOutput: { markdown, wordCount, estimatedReadingTime },
  growthResults: { faq, comparisonTable, affiliateLinks },
  seo: { metaTitle, metaDescription, keywords, schemaOrg }
}
```

**ArticleBlock discriminated union — initial v1 block types:**

| Block Type | Reason to Include |
|---|---|
| `paragraph` | Fundamental |
| `heading` | Fundamental, H2/H3 hierarchy |
| `image` | Already in system |
| `code` | Already rendered, needs semantic wrapper |
| `callout` (info/warning/tip/caution) | High editorial value, no AI generation needed |
| `comparison` | GrowthWorkflow already generates this as JSON |
| `faq` | GrowthWorkflow already generates this as JSON |
| `cta` | Needed for affiliate and conversion |
| `quote` | Editorial quality, low complexity |

**Do NOT include in v1:** gallery, video, diagram, product card, pros/cons, checklist.

---

## 8. Layout Architect Evaluation

**Should there be a Layout Architect Agent?**

**No — not as a separate full LLM agent. Yes — as a lightweight service.**

The "Layout Architect" job is: *Given a markdown article body and structured AI outputs (FAQ, comparison table), assemble a block array.*

This is **deterministic assembly work**, not generation work:
- Headings, paragraphs, and code blocks can be parsed from Markdown deterministically.
- FAQ blocks come from `growthResults.faq` — already structured JSON.
- Comparison blocks come from `growthResults.comparisonTable` — already structured JSON.
- Callouts can be heuristically detected from Markdown patterns (`> **Note:**`).

**Only a small part genuinely requires AI:**
- Deciding where to position a comparison table within sections
- Generating hero subtitle text from the plan

**Recommendation:** Implement a `ContentStructureService` (a regular Node.js service class, not a BaseAgent subclass) that:
1. Parses the Writer's Markdown into typed blocks using a proper parser
2. Injects FAQ, comparison, and affiliate blocks from growth results at appropriate positions
3. Assembles the final `ArticleBlock[]` array

If AI-assisted placement is ever needed, add a single prompt call **within this service** backed by the existing `ExecutionFacade` — without creating a new agent class, prompt template, or versioning entry.

**This avoids:** An LLM call for deterministic work (cost + latency), premature agent abstraction, a new prompt to maintain, version management overhead.

---

## 9. Rendering Architecture

### Where components should live

```
src/features/article/
├── components/
│   ├── ArticleHero.tsx
│   ├── ArticleSection.tsx
│   ├── ArticleCallout.tsx
│   ├── ArticleCodeBlock.tsx
│   ├── ArticleComparisonTable.tsx
│   ├── ArticleFAQ.tsx
│   ├── ArticleCTA.tsx
│   ├── ArticleImage.tsx
│   └── ArticleRenderer.tsx    ← master renderer, maps block.type → component
├── types/
│   └── article.types.ts       ← ArticleBlock discriminated union
└── index.ts
```

### How ArticleRenderer works

Receives `ArticleBlock[]` and renders each block via a switch/map on `block.type`. Each component is self-contained, receives only the data its block type needs.

For backwards compatibility:
- If `contentVersion === "blocks-v1"` → render blocks
- If `contentVersion === "html-v1"` or missing → delegate to existing `HtmlRenderer`

This is a **single conditional at the top of the renderer**. Zero disruption to existing posts.

### Styling

Use the existing CSS custom property system. Add `--color-article-*` namespace. Each article component uses only semantic variables, never hardcoded colors. Dark mode works for free.

### SEO

For structured articles, render `<script type="application/ld+json">` server-side using Next.js `generateMetadata()`. The `post.aiContext.seo.schemaOrg` field feeds directly into this.

---

## 10. AI Agent / Capability Architecture

| Proposed Role | Recommended Classification | Rationale |
|---|---|---|
| **Content Director** | ❌ Not needed yet | User input + PlannerAgent already covers this. Premature. |
| **Research Agent** | 🟡 Tool, not Agent | ToolRegistry already has `ReadPostTool`, `SearchPostTool`, `SearchMediaTool`. Add tool access to WriterAgent, not a new agent. |
| **Writer Agent** | ✅ Already exists | `WriterAgent` — extend schema only. |
| **Layout Architect** | 🟡 Service, not Agent | Deterministic assembly. `ContentStructureService`. See Section 8. |
| **Media Agent** | 🟡 Partial | `aiImageGenerationOrchestratorService` + `SearchMediaTool` exist. Needs `ContentMediaPlacer` service. |
| **SEO/AEO Agent** | ✅ Workflow step | `seo-task` exists in publishing task registry. Extend to output schema.org JSON-LD. |
| **Publishing Agent** | ✅ Already exists | `PublishingEngine` + `PublishingWorkflow` + `SmartPublishWorkflow` are complete. |

**Mapping to new article pipeline:**
```
PlannerAgent          → PlannerOutline (unchanged)
WriterAgent           → markdown + optional blocks[] (extend schema only)
GrowthEngine          → { faq, comparison, affiliate } (reroute outputs to post.aiContext)
ContentStructureService → ArticleBlock[] (NEW service, not agent)
SEO Task              → seo metadata + schema.org (extend existing task)
PublishingEngine      → publish (unchanged)
```

---

## 11. Backward Compatibility Strategy

**Strategy: Versioned coexistence — no migration required upfront.**

1. Add `contentVersion: { type: String, default: "html-v1" }` to `post.schema.js`. Existing posts get `"html-v1"` automatically (Mongoose default handles this transparently).

2. New structured articles get `contentVersion: "blocks-v1"` and a `blocks[]` array.

3. `ArticleRenderer` routes based on `contentVersion`. No migration. Both coexist indefinitely.

4. If a user edits an old `html-v1` post through the Tiptap editor and resaves, it remains `html-v1`.

5. **Progressive migration (optional, later):** A background script can re-process old posts. This is a nice-to-have, not a blocker.

**Why not migrate everything now?**
- Zero upside: existing HTML posts render correctly.
- High risk: parsing arbitrary user-written HTML into typed blocks is lossy.
- Better to let the new system prove itself first.

---

## 12. Target Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                            USER                                     │
│  (Topic, Audience, Tone, Length, Goal, Category)                   │
└─────────────────────────────────────────┬──────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────┐
│                     AIPlannerView (Frontend)                        │
│  Form → POST /ai/v1/planner → PlannerAgent → PlannerOutline (JSON) │
│  User reviews and approves outline                                  │
└─────────────────────────────────────────┬──────────────────────────┘
                                          │ User clicks "Generate"
                                          ▼
┌────────────────────────────────────────────────────────────────────┐
│                 Article Creation Pipeline (Backend)                 │
│                                                                     │
│  WriterAgent (SSE stream) ──────▶ markdown + blocks[]              │
│       │                                                             │
│       ├──▶ GrowthEngine (parallel) ──▶ { faq, comparison, ... }    │
│       │                                                             │
│       └──▶ ContentStructureService ──▶ ArticleBlock[]              │
│               (assembles from writer output + growth results)       │
│                                                                     │
│  SEO Task ─────▶ { metaTitle, metaDescription, schema.org JSON-LD }│
└─────────────────────────────────────────┬──────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────┐
│                     MongoDB (post document)                         │
│                                                                     │
│  content: string (legacy HTML)   contentVersion: "blocks-v1"       │
│  blocks: ArticleBlock[]          hero: HeroSubdoc                  │
│  aiContext: { plannerOutput, writerOutput, growthResults, seo }     │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────────┐ ┌─────────────────────────────────────────┐
│  Editor Preview      │ │    Published Article Page               │
│                      │ │                                         │
│  LivePreviewSystem   │ │  ArticleRenderer                        │
│  ├── html-v1         │ │  ├── "html-v1" → HtmlRenderer (legacy)  │
│  │   HtmlRenderer    │ │  └── "blocks-v1" → block components:    │
│  └── blocks-v1       │ │      ├── ArticleHero                    │
│      ArticleRenderer │ │      ├── ArticleCallout                 │
└──────────────────────┘ │      ├── ArticleCodeBlock               │
                         │      ├── ArticleComparisonTable         │
                         │      ├── ArticleFAQ                     │
                         │      └── ArticleCTA                     │
                         └─────────────────────────────────────────┘
```

---

## 13. Implementation Roadmap

### Sprint 1 — Foundation: Schema + Parser

**Goal:** Fix the rendering pipeline and establish the content schema. No AI changes.

**Why:** Everything downstream depends on a proper parser and a schema version discriminator.

**Backend changes:**
- Add `contentVersion`, `blocks`, `aiContext`, `hero` fields to `post.schema.js` (additive, no migration)

**Frontend changes:**
- Replace `markdownParser.ts` regex with `marked` or `remark`
- Create `src/features/article/types/article.types.ts` — `ArticleBlock` discriminated union
- Create `ArticleRenderer.tsx` with `HtmlRenderer` delegation for `html-v1`

**AI changes:** None  
**Database changes:** Schema additions only. Existing documents unaffected.  
**Risks:** Low. Purely additive.

**Definition of Done:**
- Existing posts render identically
- `contentVersion` defaults to `"html-v1"` on new posts
- New Markdown parser handles tables and blockquotes correctly

---

### Sprint 2 — Persist AI Outputs + ContentStructureService

**Goal:** Persist PlannerOutline, WriterOutput, and GrowthResults alongside the post. Build `ContentStructureService`.

**Why:** Without persisting AI outputs, the block assembly has nothing to work with. The data is already being generated — it just needs to be saved.

**Backend changes:**
- Extend `POST /api/post` (save) to accept and persist `aiContext`
- Create `ContentStructureService`:
  - Parses Markdown into typed blocks
  - Injects FAQ blocks from `growthResults.faq`
  - Injects comparison blocks from `growthResults.comparisonTable`
  - Assigns stable UUIDs to each block

**Frontend changes:**
- After writing completes, store `outline` in `post.aiContext.plannerOutput`
- After GrowthEngine runs, store results in `post.aiContext.growthResults`
- Pass `aiContext` in autosave payload

**AI changes:** None to agents. GrowthEngine runs unchanged — just route output.  
**Risks:** Medium. Autosave payload changes need careful handling.

**Definition of Done:**
- `post.aiContext.plannerOutput` and `post.aiContext.growthResults` populated in MongoDB after generation
- `ContentStructureService` converts markdown + FAQ result into `ArticleBlock[]`

---

### Sprint 3 — Article Block Components + ArticleRenderer

**Goal:** Build the frontend article components and wire `ArticleRenderer` to consume `blocks-v1` content.

**Why:** This is the visible payoff — the professional editorial article presentation.

**Backend changes:**
- After stream completes, invoke `ContentStructureService`, store `blocks[]`, set `contentVersion = "blocks-v1"`

**Frontend changes:**
- Build: `ArticleHero`, `ArticleCallout`, `ArticleComparisonTable`, `ArticleFAQ`, `ArticleCTA`, `ArticleCodeBlock`
- Wire `ArticleRenderer` to map `block.type` to components
- Update `LivePreviewSystem` to use `ArticleRenderer` for `blocks-v1` posts

**AI changes:** None.  
**Risks:** Medium. Component design decisions and design tokens need agreement before building.

**Definition of Done:**
- New AI-generated articles render structured blocks (Hero, FAQ, Comparison, CTA, Callout)
- Old HTML posts continue rendering identically via `HtmlRenderer`
- Dark mode works for all new components

---

### Sprint 4 — SEO/AEO Generation

**Goal:** Generate and persist SEO metadata including `schema.org/Article` and `schema.org/FAQPage` JSON-LD.

**Why:** AEO (Answer Engine Optimization) requires structured FAQ schema for discoverability by AI answer engines.

**Backend changes:**
- Extend the existing SEO task in `publishTask.registry.ts` to generate schema.org JSON-LD
- Store in `post.aiContext.seo.schemaOrg`

**Frontend changes:**
- Inject `<script type="application/ld+json">` using Next.js `generateMetadata()`
- FAQ blocks rendered with `<details>/<summary>` or accordion for AEO discoverability
- `<meta>` tags use `aiContext.seo.metaTitle` and `aiContext.seo.metaDescription`

**AI changes:** Extend SEO task prompt to output `schema.org/Article` and `schema.org/FAQPage`  
**Risks:** Low. Additive only.

**Definition of Done:**
- Published structured articles include valid `schema.org` JSON-LD
- `<meta>` tags use AI-generated SEO metadata

---

### Future

- **Image placement intelligence:** `ContentMediaPlacer` using `SearchMediaTool` to inject contextual images as `ImageBlock`
- **Callout detection:** Heuristic detection in `ContentStructureService` for blockquote → `CalloutBlock`
- **Multi-provider support:** Register Claude or GPT-4o in `ProviderRegistry` via `FallbackStrategy`
- **Editor support for blocks-v1:** Custom Tiptap node types for callouts, comparison tables, FAQs
- **Article analytics:** Use `PostInsightsManager` for block-level engagement tracking

---

## 14. What NOT To Build

**Do NOT build a Layout Architect Agent.** Block assembly from markdown + structured JSON is deterministic work. An LLM call costs latency and money for a task that does not need AI. Build `ContentStructureService`. Add a single AI call inside it only if heuristics provably fail.

**Do NOT build a Content Director Agent.** The user form + `PlannerAgent` already covers this role. A separate director would be redundant at OpenIdear's current stage.

**Do NOT build a Research Agent.** The `ToolRegistry` already has `SearchPostTool`, `ReadPostTool`, `SearchMediaTool`. If WriterAgent needs research, add tool access to the agent — not a new agent class.

**Do NOT migrate existing HTML posts to blocks format.** Parsing arbitrary user-written HTML into typed blocks is lossy. Existing posts render correctly via `HtmlRenderer`. The versioned coexistence strategy handles this indefinitely.

**Do NOT generate CSS with AI.** Article components are styled by the existing design system. AI outputs block data. Frontend owns visual presentation. AI-generated CSS is unmaintainable.

**Do NOT generate arbitrary HTML with AI.** `WriterAgent` outputs Markdown (prose) and typed block data (JSON). It never outputs HTML. The frontend renders blocks as components. This separation is the architectural guarantee.

**Do NOT split into microservices.** No justification at this stage. The Express monolith with the `ai/` module handles everything needed.

**Do NOT build new orchestration abstractions.** `OrchestratedWorkflow` and `OrchestrationPipeline` already exist and are sufficient. Do not add abstractions before there is a concrete need the current system cannot serve.

**Do NOT over-engineer the block schema.** Start with 9 block types: `paragraph, heading, image, code, callout, comparison, faq, cta, quote`. GrowthWorkflow already generates comparison and FAQ. You do not need 30 block types in v1.

**Do NOT rebuild the Publishing pipeline.** `PublishingEngine`, `PublishingWorkflow`, `SmartPublishWorkflow`, and `PublishingScheduler` are complete and mature.

---

## 15. CTO Recommendation

### 1. Should we modify the existing AI Writer?

**Yes, but surgically.** Extend `WriterSchema` with an optional `blocks?: ArticleBlock[]` field alongside the existing `markdown` field. The `markdown` field is preserved — it drives the SSE stream display and backwards-compatible rendering. The `blocks` field is new structured output for downstream consumption. Schema extension, not a rewrite.

### 2. Should we introduce an Article Schema?

**Yes. This is the single highest-leverage change in the roadmap.**

Add `contentVersion`, `blocks[]`, `hero`, and `aiContext` to `post.schema.js`. The change is additive. No existing documents break. The `contentVersion` discriminator allows the renderer to safely handle both formats.

### 3. Should we introduce a Layout Architect?

**Yes, but as `ContentStructureService` — not an Agent.**

Its job is deterministic: parse Markdown → typed blocks, inject growth results at appropriate positions, assign block IDs. This is a Node.js service class. If a specific decision needs AI reasoning, add a single focused prompt call inside the service using the existing `ExecutionFacade`.

### 4. Should Layout Architect be an Agent, Capability, or Workflow step?

**Service.** It runs as part of the article creation pipeline after `WriterAgent` completes and `GrowthEngine` finishes. Its output is `ArticleBlock[]`. It uses the `ExecutionFacade` only if AI assistance is specifically needed — and even then, it is a single targeted call, not a full agent.

### 5. Should the frontend use reusable Article Components?

**Yes. Absolutely.** Without typed article components, there is no way to render callouts, FAQs, comparison tables, or CTAs with design consistency. `ArticleRenderer` + component library is the visual delivery of the entire product goal.

### 6. What is the smallest architecture that will still scale later?

1. `contentVersion` discriminator on the post schema
2. `blocks[]` array on the post schema
3. `ContentStructureService` that assembles blocks from markdown + growth results
4. `ArticleRenderer` that routes to `HtmlRenderer` (legacy) or block components (new)

This is the minimum viable architecture. Everything else builds on top of it cleanly.

### 7. What should we build FIRST?

**Sprint 1: Schema additions + Markdown parser upgrade.** Zero-risk, purely additive, no AI dependency, no backwards-compatibility risk. Unlocks everything else.

### 8. What should we explicitly postpone?

Multi-agent orchestration, Content Director Agent, Research Agent, AI-generated CSS or HTML, database migration of existing posts, microservices decomposition, video/gallery/diagram/product-card block types, multi-provider switching.

---

## 16. Final Decision

### BUILD NOW

| Item | Reason |
|---|---|
| `contentVersion`, `blocks[]`, `aiContext`, `hero` on `post.schema.js` | Foundation. Zero risk. No existing documents affected. |
| Replace `markdownParser.ts` with proper Markdown library | High leverage. Tables and blockquotes now work. 2-hour change. |
| `ArticleBlock` TypeScript discriminated union | Type safety for all downstream work. Frontend-only. |
| `ContentStructureService` | Assembles blocks from markdown + growth results. No new agents, no new LLM calls for basic functionality. |
| `ArticleRenderer` with `HtmlRenderer` fallback | Enables structured article rendering without breaking existing posts. |
| Persist `aiContext` (plannerOutput, writerOutput, growthResults) alongside posts | GrowthWorkflow results are already generated — just save them. |
| `ArticleHero`, `ArticleCallout`, `ArticleComparisonTable`, `ArticleFAQ`, `ArticleCTA` components | Visual delivery. The user-facing payoff. |

---

### MODIFY

| Item | Change |
|---|---|
| `WriterSchema` | Add optional `blocks?: ArticleBlock[]` — preserve `markdown` field |
| `GrowthEngine` flow | Route outputs to `post.aiContext.growthResults` |
| `handleStartWriting` in `EditorShell.tsx` | After stream completes, invoke `ContentStructureService`, persist `blocks[]` |
| SEO Task | Extend to generate `schema.org/Article` + `schema.org/FAQPage` JSON-LD |
| `LivePreviewSystem` | Use `ArticleRenderer` instead of always delegating to `HtmlRenderer` |

---

### KEEP

| Item | Reason |
|---|---|
| `BaseAgent` and all existing agents | Sound design. Do not touch. |
| `ExecutionFacade` and `ExecutionPipeline` | Production-grade execution infrastructure. Use it for new capabilities. |
| `ProviderRegistry` and `GeminiProvider` | Works. Provider abstraction already in place for future expansion. |
| `GrowthTaskRegistry` and `GrowthEngine` | Already generates FAQ and comparison data. Preserve and reroute outputs. |
| `PublishingEngine`, `PublishingWorkflow` | Complete and working. |
| `ToolRegistry` with existing tools | Ready for extension when research capability is needed. |
| `TelemetryLogger` | Already logging AI calls. Keep it. |
| `PromptVersionManager` | Prompt versioning already in place. |
| Tiptap editor | Remains the human editing surface. AI writes blocks, humans edit them in Tiptap. |
| `AIPlannerView` and `useAIPlanner` | User-facing planning UI is good. Keep it. |

---

### POSTPONE

| Item | Reason |
|---|---|
| Content Director Agent | User form + PlannerAgent already covers this. |
| Research Agent | Add tool access to WriterAgent instead of creating a new agent. |
| Layout Architect as full LLM Agent | `ContentStructureService` is sufficient. Add AI only when heuristics provably fail. |
| Migration of existing HTML posts | No urgency. `HtmlRenderer` fallback handles them forever. |
| Multi-provider switching | `ProviderRegistry` is ready. Add when there's a specific model capability need. |
| Video, gallery, diagram, product card block types | v2 schema extension. Do not bloat v1. |
| Real-time collaborative editing | No architecture support and no product need today. |
| Microservices decomposition | No justification. Current monolith is the right abstraction level. |
