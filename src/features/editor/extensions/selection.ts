import { Extension } from "@tiptap/core";

/**
 * Custom selection extension.
 *
 * Enables Delete key to remove selected images
 * (ProseMirror default doesn't handle this for node selections).
 */
export const SelectionExtension = Extension.create({
  name: "selection",

  addKeyboardShortcuts() {
    return {
      Delete: ({ editor }) => {
        if (editor.isActive("image")) {
          editor.chain().deleteSelection().run();
          return true;
        }
        return false;
      },
    };
  },
});
