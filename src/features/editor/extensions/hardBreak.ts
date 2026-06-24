import { Extension } from "@tiptap/core";

/**
 * Custom hard break extension.
 *
 * Makes Enter produce a hard break (<br>) instead of a new paragraph,
 * except inside code blocks where Enter creates a new line normally.
 * Shift+Enter always produces a hard break.
 */
export const HardBreakExtension = Extension.create({
  name: "customHardBreak",

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive("codeBlock")) {
          return false;
        }
        editor.commands.setHardBreak();
        return true;
      },
      "Shift-Enter": () => {
        return this.editor.commands.setHardBreak();
      },
    };
  },
});
