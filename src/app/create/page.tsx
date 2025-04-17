'use client'
// pages/create-post.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline'
import { NodeViewWrapper } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import Head from 'next/head';
import Paragraph from '@tiptap/extension-paragraph';

import "./edit.css";
import Logo from '@/component/common/Logo';

// Make sure to add these dependencies to your package.json:
// yarn add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-text-align

interface ToolbarItemProps {
  icon: string;
  title: string;
  action: () => void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({ icon, title, action }) => {
  return (
    <button
      onClick={action}
      className="p-2 hover:bg-gray-200 rounded transition-colors"
      title={title}
    >
      {icon}
    </button>
  );
};

interface DraggableElementProps {
  type: string;
  label: string;
  icon?: string;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ type, label, icon }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center p-3 mb-2 bg-gray-100 rounded cursor-move hover:bg-gray-200 transition-colors"
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </div>
  );
};

const HardBreakExtension = Extension.create({
  name: 'customHardBreak',

  addKeyboardShortcuts() {
    return {
      // Override the default Enter key behavior
      Enter: ({ editor }) => {
        // Split the node and create a new paragraph
        // editor.commands.splitBlock();
        editor.commands.setHardBreak();
        return true;
      },
      // Keep Shift+Enter as soft break if needed
      'Shift-Enter': () => {
        return this.editor.commands.setHardBreak();
      },
    };
  },
});

const SelectionExtension = Extension.create({
  name: 'selection',

  addKeyboardShortcuts() {
    return {
      // Add Delete and Backspace key handling
      'Delete': ({ editor }) => {
        if (editor.isActive('image')) {
          editor.chain().deleteSelection().run();
          return true;
        }
        return false;
      },
      'Backspace': ({ editor }) => {
        if (editor.isActive('image') || editor.isActive('heading') ||
          editor.isActive('blockquote') || editor.isActive('codeBlock')) {
          editor.chain().deleteSelection().run();
          return true;
        }
        return false;
      },
    };
  },
});

const FloatingToolbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const elements = [
    { type: "paragraph", label: "Paragraph", icon: "¶" },
    { type: "heading1", label: "Heading 1", icon: "H1" },
    { type: "heading2", label: "Heading 2", icon: "H2" },
    { type: "heading3", label: "Heading 3", icon: "H3" },
    { type: "image", label: "Image", icon: "🖼️" },
    { type: "link", label: "Link", icon: "🔗" },
    { type: "blockquote", label: "Blockquote", icon: "❝" },
    { type: "codeBlock", label: "Code Block", icon: "<>" }
  ];

  return (
    <div
      className="fixed left-4 top-1/4 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        {!isExpanded ? (
          <div className="flex items-center justify-center w-12 h-12 text-white rounded-full cursor-pointer">
            <Logo className="w-full h-full" />
          </div>
        ) : (
          <div className="p-2 min-w-[180px]">
            <h3 className="font-medium mb-2 text-gray-700">Elements</h3>
            <div className="space-y-2">
              {elements.map((element) => (
                <DraggableElement
                  key={element.type}
                  type={element.type}
                  label={element.label}
                  icon={element.icon}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreatePost() {
  const [previewMode, setPreviewMode] = useState(false);
  const [postTitle, setPostTitle] = useState('Untitled Post');
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Paragraph.configure({
        HTMLAttributes: {
          class: 'pb-2 pt-2 mb-4 mt-4',
        },
      }),
      HardBreakExtension,
      SelectionExtension,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing or drag elements here...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'edit-container prose prose-lg focus:outline-none min-h-[300px] max-w-none',
      },
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!editor) return;

      e.preventDefault();
      const elementType = e.dataTransfer.getData('application/reactflow');

      // Calculate drop position
      if (editorContainerRef.current) {
        const editorRect = editorContainerRef.current.getBoundingClientRect();
        const view = editor.view;

        // Get the position relative to editor container
        const x = e.clientX - editorRect.left;
        const y = e.clientY - editorRect.top;

        // Convert screen coordinates to editor position
        const pos = view.posAtCoords({ left: e.clientX, top: e.clientY })?.pos;

        if (pos !== undefined) {
          insertElementAtPosition(elementType, pos);
        } else {
          // Fallback: insert at the end
          insertElementAtPosition(elementType, editor.state.doc.content.size);
        }
      }
    },
    [editor]
  );



  const insertElementAtPosition = (type: string, position: number) => {
    if (!editor) return;

    switch (type) {
      case 'paragraph':
        editor.chain().focus().insertContentAt(position, '<p>Type your paragraph here</p>').run();
        break;
      case 'heading1':
        editor.chain().focus().insertContentAt(position, '<h1>Heading 1</h1>').run();
        break;
      case 'heading2':
        editor.chain().focus().insertContentAt(position, '<h2>Heading 2</h2>').run();
        break;
      case 'heading3':
        editor.chain().focus().insertContentAt(position, '<h3>Heading 3</h3>').run();
        break;
      case 'image':
        const imageUrl = prompt('Enter image URL:', 'https://source.unsplash.com/random/800x400');
        if (imageUrl) {
          editor.chain().focus().insertContentAt(position, `<img src="${imageUrl}" alt="Inserted image" />`).run();
        }
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://example.com');
        const text = prompt('Enter link text:', 'Link text');
        if (url && text) {
          editor.chain().focus().insertContentAt(position, `<a href="${url}">${text}</a>`).run();
        }
        break;
      case 'blockquote':
        editor.chain().focus().insertContentAt(position, '<blockquote>Add a quote here</blockquote>').run();
        break;
      case 'codeBlock':
        editor.chain().focus().insertContentAt(position, '<pre><code>// Your code here</code></pre>').run();
        break;
      default:
        break;
    }
  };

  // Editor toolbar components
  const Toolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <ToolbarItem
          icon="B"
          title="Bold"
          action={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarItem
          icon="I"
          title="Italic"
          action={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarItem
          icon="U"
          title="Underline"
          action={() => editor.chain().focus().toggleUnderline().run()}
        />
        <div className="border-r border-gray-300 mx-1"></div>
        <ToolbarItem
          icon="≡"
          title="Align Left"
          action={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarItem
          icon="≡"
          title="Align Center"
          action={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarItem
          icon="≡"
          title="Align Right"
          action={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <div className="border-r border-gray-300 mx-1"></div>
        <ToolbarItem
          icon="•"
          title="Bullet List"
          action={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarItem
          icon="1."
          title="Ordered List"
          action={() => editor.chain().focus().toggleOrderedList().run()}
        />
      </div>
    );
  };

  const savePost = () => {
    if (!editor) return;

    const content = editor.getHTML();
    console.log({ title: postTitle, content });
    alert('Post saved successfully!');
    // In a real app, you would send this to your API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Create New Post</title>
        <meta name="description" content="Create a new post with our drag and drop editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Post</h1>

        <div className="mb-6">
          <label htmlFor="post-title" className="block mb-2 font-medium">
            Post Title
          </label>
          <input
            id="post-title"
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter post title"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Element sidebar */}
          <FloatingToolbar />

          {/* Editor area */}
          <div className="lg:w-full flex flex-col">
            <div className="bg-white rounded shadow mb-4">
              <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-lg font-medium">
                  {previewMode ? 'Preview' : 'Editor'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                  <button
                    onClick={savePost}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Save Post
                  </button>
                </div>
              </div>

              {!previewMode && editor && <Toolbar editor={editor} />}

              <div
                ref={editorContainerRef}
                className="p-6"
                onDragOver={previewMode ? undefined : handleDragOver}
                onDrop={previewMode ? undefined : handleDrop}
              >
                {previewMode ? (
                  <div className="prose max-w-none">
                    <h1 className="text-3xl font-bold mb-6">{postTitle}</h1>
                    {editor && (
                      <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
                    )}
                  </div>
                ) : (
                  editor && <EditorContent editor={editor} />
                )}
              </div>
            </div>

            <div className="bg-white rounded shadow p-4">
              <h2 className="text-lg font-medium mb-2">Instructions</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Drag elements from the sidebar into the editor area</li>
                <li>Click on elements to edit their content</li>
                <li>Use the toolbar to format your text</li>
                <li>Switch to Preview mode to see how your post will look</li>
                <li>Click Save Post when you're finished</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}