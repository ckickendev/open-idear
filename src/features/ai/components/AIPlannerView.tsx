/**
 * src/features/ai/components/AIPlannerView.tsx
 *
 * Responsibility:
 *   Renders the structured ArticleOutline returned by PlannerAgent
 *   as an interactive, editable outline tree.
 *
 *   Features:
 *   - Displays title, sections, and sub-points
 *   - Allows manual edits before passing to WriterAgent
 *   - "Write this section" button per outline node
 *   - "Write full article" button to trigger article.pipeline
 *
 * Why it exists:
 *   The planner output is structured JSON — it needs a dedicated view
 *   component to render it meaningfully. Embedding this logic in
 *   AICommandBar would make that component too large and unfocused.
 */
