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
import Toolbar from './ToolBar';
import DraggableElement from './DragableElement';
import Instruction from './Instruction';

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
          <div className="flex items-center justify-center w-full h-full rounded-full cursor-pointer">
            <Logo className="w-12 h-full" />
            <h1 className='text-xl text-gray-600'>Select elements</h1>
          </div>
        ) : (
          <div className="p-2 min-w-[180px] w-full">
            <div className='d-flex items-center justify-center'>
              <h3 className="mb-2 text-gray-700 text-center">Elements</h3>
            </div>

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
  const [postTitle, setPostTitle] = useState('');
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
          // Instead of inserting HTML content which creates a new element
          // Focus at the position, then use the built-in setLink command
          editor
            .chain()
            .focus()
            .insertContentAt(position, text)
            .setTextSelection({ from: position, to: position + text.length })
            .setLink({ href: url })
            // Move cursor after the link to ensure new content is not part of the link
            .setTextSelection(position + text.length)
            .run();
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

  const savePost = () => {
    if (!editor) return;

    const content = editor.getHTML();
    console.log({ title: postTitle, content });
    alert('Post saved successfully!');
    // In a real app, you would send this to your API
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Create New Post</title>
        <meta name="description" content="Create a new post with our drag and drop editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-8 ">
        <div className='w-full flex items-center justify-center mb-2'>
          <h1 className="text-3xl font-bold text-gray-600 mb-6">Create New Post</h1>

        </div>

        <div className="mb-6">
          <input
            id="post-title"
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="pr-10 input w-full rounded-lg pt-2 pb-2 pl-2 border border-gray-500 focus:outline-none focus:border-red-500"
            placeholder="Enter post title"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-200 focus:border-teal-200">
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

            <Instruction />
          </div>
        </div>
      </div>
    </div>
  );
}