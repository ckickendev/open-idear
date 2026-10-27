// =============================================================================
//  HEADING SANITIZER UTILITY
//  src/features/editor/utils/headingSanitizer.ts
// =============================================================================

/**
 * Strips editorial noise, leading sequence indicators (e.g., "1.", "2.1", "IV."),
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
