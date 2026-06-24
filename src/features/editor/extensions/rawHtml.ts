import { Extension } from "@tiptap/core";

/**
 * Raw HTML extension.
 *
 * Adds a `setRawHtml` command that replaces the editor content
 * with raw HTML string. Used by the HTML source editor mode.
 */
export const RawHtmlExtension = Extension.create({
  name: "rawHtml",

  addCommands() {
    return {
      setRawHtml:
        (html: string) =>
        ({ commands }: { commands: any }) => {
          commands.setContent(html);
          return true;
        },
    } as Partial<Record<string, any>>;
  },
});
