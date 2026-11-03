/**
 * Search text highlighting and snippet extraction utilities.
 * Supports Vietnamese diacritics folding (e.g. "dau tu" matches "Đầu tư")
 * and regex-safe escaping.
 */

const VIETNAMESE_CHAR_MAP: Record<string, string> = {
  a: "[aàáảãạăằắẳẵặâầấẩẫậAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ]",
  d: "[dđDĐ]",
  e: "[eèéẻẽẹêềếểễệEÈÉẺẼẸÊỀẾỂỄỆ]",
  i: "[iìíỉĩịIÌÍỈĨỊ]",
  o: "[oòóỏõọôồốổỗộơờớởỡợOÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ]",
  u: "[uùúủũụưừứửữựUÙÚỦŨỤƯỪỨỬỮỰ]",
  y: "[yỳýỷỹỵYỲÝỶỸỴ]",
};

/**
 * Escapes regex special characters in a string.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Converts a single word/token into a regex pattern that matches
 * all Vietnamese accent variants.
 */
function buildTokenPattern(token: string): string {
  const normalized = token
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();

  let pattern = "";
  for (const ch of normalized) {
    if (VIETNAMESE_CHAR_MAP[ch]) {
      pattern += VIETNAMESE_CHAR_MAP[ch];
    } else {
      pattern += ch.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    }
  }
  return pattern;
}

/**
 * Builds a global case-insensitive RegExp from a user query string.
 * Splits into words and handles accent folding.
 */
export function buildHighlightRegex(query?: string): RegExp | null {
  if (!query) return null;
  const trimmed = query.trim();
  if (!trimmed) return null;

  // Split query into unique tokens of length >= 1
  const words = trimmed
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  if (words.length === 0) return null;

  // If multi-word, also include the full phrase pattern first
  const patterns: string[] = [];
  if (words.length > 1) {
    const fullPhrasePattern = words.map(buildTokenPattern).join("\\s+");
    patterns.push(fullPhrasePattern);
  }

  // Add individual word patterns
  for (const word of words) {
    const p = buildTokenPattern(word);
    if (p && !patterns.includes(p)) {
      patterns.push(p);
    }
  }

  // Sort longest patterns first so compound phrases/words match first
  patterns.sort((a, b) => b.length - a.length);

  try {
    return new RegExp(`(${patterns.join("|")})`, "gi");
  } catch {
    return null;
  }
}

/**
 * Extracts a relevant contextual snippet around the first matching keyword.
 * If text is short or no match, returns truncated or full text with ellipses.
 *
 * @param text The full content/description
 * @param query The search query
 * @param maxLength Max characters to return
 */
export function extractSnippet(
  text: string,
  query?: string,
  maxLength = 140
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const regex = buildHighlightRegex(query);
  if (!regex) {
    return text.slice(0, maxLength).trim() + "...";
  }

  // Find first match
  const match = regex.exec(text);
  if (!match) {
    return text.slice(0, maxLength).trim() + "...";
  }

  const matchIndex = match.index;
  const matchLength = match[0].length;

  // If match is already in the beginning window
  if (matchIndex < maxLength - 30) {
    const end = Math.min(text.length, maxLength);
    const slice = text.slice(0, end);
    const lastSpace = slice.lastIndexOf(" ");
    const cleanEnd = lastSpace > maxLength - 30 ? lastSpace : end;
    return text.slice(0, cleanEnd).trim() + (cleanEnd < text.length ? "..." : "");
  }

  // Match is deeper in the text: center around the match
  const halfWindow = Math.floor((maxLength - matchLength) / 2);
  let start = Math.max(0, matchIndex - halfWindow);
  let end = Math.min(text.length, matchIndex + matchLength + halfWindow);

  // Adjust start to word boundary
  const firstSpace = text.indexOf(" ", start);
  if (firstSpace !== -1 && firstSpace < matchIndex) {
    start = firstSpace + 1;
  }

  // Adjust end to word boundary
  const lastSpace = text.lastIndexOf(" ", end);
  if (lastSpace > matchIndex + matchLength) {
    end = lastSpace;
  }

  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

/**
 * Splits text into segments marked as match or non-match without modifying
 * the original casing or accents.
 */
export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

export function splitTextByHighlight(
  text: string,
  query?: string
): HighlightSegment[] {
  if (!text) return [];
  const regex = buildHighlightRegex(query);
  if (!regex) return [{ text, isMatch: false }];

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;

    // Guard against 0-length infinite loops
    if (matchEnd === matchStart) {
      regex.lastIndex++;
      continue;
    }

    if (matchStart > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, matchStart),
        isMatch: false,
      });
    }

    segments.push({
      text: text.slice(matchStart, matchEnd),
      isMatch: true,
    });

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isMatch: false,
    });
  }

  return segments;
}
