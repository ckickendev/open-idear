/**
 * Simple, dependency-free Markdown to HTML compiler.
 * Translates headings, code blocks, bullet lists, bold text, and paragraphs
 * into valid HTML elements that Tiptap editor commands understand natively.
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // 1. Escape HTML special characters inside code blocks to prevent parsing issues
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return `<pre><code class="language-${lang}">${escapedCode}</code></pre>`;
  });

  // 2. Headings H3
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");

  // 3. Headings H2
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");

  // 4. Bullet list items
  html = html.replace(/^\s*-\s+(.*$)/gim, "<li>$1</li>");
  
  // Wrap li nodes into ul. This is a basic wrapper.
  // Checks for contiguous lists of <li> nodes.
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
  // Merge adjacent ul groups
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // 5. Bold text formatting
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 6. Split text into paragraphs on double-newlines, excluding code blocks and structural tags
  const blocks = html.split("\n\n");
  const parsedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    
    // If it starts with block elements, return unaltered
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<li")
    ) {
      return trimmed;
    }
    
    // Otherwise, wrap in standard paragraph
    return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
  });

  return parsedBlocks.filter(Boolean).join("");
}
