'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core';
import Head from 'next/head';
import Paragraph from '@tiptap/extension-paragraph';

import "./edit.css";
import Toolbar from './ToolBar';
import Instruction from './Instruction';
import Color from '@tiptap/extension-color';
import { MessageCircleQuestion } from 'lucide-react';
import FloatingToolbar from './FloatingToolbar';
import CodeBlock from '@tiptap/extension-code-block';
import contentStore from '@/store/ContentStore';
import axios from 'axios';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

import { getHeadersToken } from '@/api/authentication';
import LoadingComponent from '@/component/common/Loading';
import loadingStore from '@/store/LoadingStore';
import PostLists from './PostLists';

import HtmlEditor, { RawHtmlExtension } from './HtmlEditor';

export default function CreatePost() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [instructionDis, setInstructionDis] = useState(false);

  const title = contentStore((state) => state.title);
  const setTitle = contentStore((state) => state.setTitle);
  const content = contentStore((state) => state.content);
  const setContent = contentStore((state) => state.setContent);
  const modeHTML = contentStore((state) => state.modeHTML);
  const setModeHTML = contentStore((state) => state.setModeHTML);

  const isLoading = loadingStore((state) => state.isLoading);
  const changeLoad = loadingStore((state) => state.changeLoad);
  const [idPost, setIdPost] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostData = async () => {
      changeLoad();
      const token = localStorage.getItem("access_token");
      if (token) {
        const headers = getHeadersToken();
        const idPost = searchParams.get('id');

        setIdPost(idPost);
        if (!idPost) {
          setTitle("");
          setContent("");
          console.log("content: ", content);
          changeLoad();
          return;
        }

        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPost?postId=${idPost}`, { headers });
          if (res.status === 200) {
            setTitle(res.data.post.title);
            setContent(res.data.post.content);
            changeLoad();
          }
        } catch (error) {
          alert('Error fetching user data');
          changeLoad();
        }
      }
    };
    fetchPostData();
  }, [searchParams, pathname]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      CodeBlock.configure({
        exitOnArrowDown: true, // Allow exiting code block with down arrow at the end
        exitOnTripleEnter: true, // Exit after three consecutive Enter presses
        defaultLanguage: 'plaintext',
        HTMLAttributes: {
          class: 'my-code-block p-4 bg-gray-100 rounded',
        },
      }),
      Color,
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
      }),
      RawHtmlExtension,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'edit-container prose prose-lg focus:outline-none max-w-none',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }

  }, [content, editor]);

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
        editor.chain().focus().insertContentAt(position, '<pre><code>// insert code here</code></pre>').run();
        break;
      default:
        break;
    }
  };

  // Editor toolbar components

  const savePost = async () => {
    if (!editor) return;

    const text = editor.getText().replace(/\n/g, '');
    const content = editor.getHTML();

    console.log("Saving post with text: ", text);
    

    changeLoad();
    const headers = getHeadersToken();

    if (idPost) {
      axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/update`, {
        postId: idPost,
        title: title,
        text: text,
        content: content,
        headers
      }).then((res) => {
        console.log(res.data);
        changeLoad();
        alert('Post updated successfully!');
      }).catch((err) => {
        const errorMessage = err?.response?.data?.error || err?.message;
        changeLoad();
        alert(errorMessage);
      });
      return;
    }

    axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/create`, {
      title: title,
      text: text,
      content: content,
      headers
    }).then((res) => {
      console.log(res.data);
      const params = new URLSearchParams()
      params.set('id', res.data.post._id)
      router.push(`${pathname}?${params.toString()}`)
      changeLoad();
      alert('Post saved successfully!');
    }).catch((err) => {
      const errorMessage = err?.response?.data?.error || err?.message;
      changeLoad();
      alert(errorMessage);
    });
  };

  return (
    <div className="min-h-screen bg-white">

      <Head>
        <title>Create New Post</title>
        <meta name="description" content="Create a new post with our drag and drop editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto py-8 flex flex-col items-center justify-center">
        <div className='w-full flex items-center justify-center mb-2'>
          <h1 className="text-3xl font-bold text-gray-600">{!idPost ? "Create new post" : "Edit your post"}</h1>
          <div className='relative'>
            <MessageCircleQuestion className=' m-2'
              onMouseEnter={() => setInstructionDis(true)}
              onMouseLeave={() => setInstructionDis(false)} />
            {instructionDis && <Instruction />}

          </div>
        </div>

        <div className="mb-6 w-1/3">
          <input
            id="post-title"
            type="text"
            value={title.toString()}
            onChange={(e) => setTitle(e.target.value)}
            className="pr-10 input w-full rounded-lg pt-2 pb-2 pl-2 border border-gray-500 focus:outline-none focus:border-red-500"
            placeholder="Enter post title"
          />
        </div>

        <div className="w-full flex flex-col lg:flex-row outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-200 focus:border-teal-200">
          {/*All posts*/}
          <PostLists />

          {/* Editor area */}
          <div className="w-full flex flex-col justify-between items-center">
            <div className="w-full bg-white mb-4 flex flex-col items-center">
              <div className="w-full p-4 flex justify-around items-center">
                <div className="flex gap-2">
                  {modeHTML || <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-8 py-4 bg-red-600 from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  >
                    {previewMode ? 'Return to edit' : 'Click to Preview'}
                  </button>}
                </div>
              </div>

              {!previewMode && editor &&
                <>
                  <div className="w-full mt-2 flex items-center justify-center">
                    <HtmlEditor editor={editor} />
                  </div>
                  {modeHTML || <Toolbar editor={editor} />}
                </>
              }

              {modeHTML || <div
                ref={editorContainerRef}
                className="p-6 w-4xl min-h-screen editor-end"
                onDragOver={previewMode ? undefined : handleDragOver}
                onDrop={previewMode ? undefined : handleDrop}
              >
                <LoadingComponent isLoading={isLoading} />
                {previewMode ? (
                  <div className="prose max-w-none preview-container">

                    <h1 className="text-3xl font-bold mb-6">{title}</h1>
                    {editor && (
                      <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
                    )}
                  </div>
                ) : (
                  editor && <>
                    <EditorContent editor={editor} />
                  </>
                )}
              </div>
              }

              <div className="flex gap-2 mb-4 mt-4 w-full justify-end">
                {title && <button
                  onClick={savePost}
                  className="px-8 py-4 bg-blue-600 from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                >
                  Save Post
                </button>}

              </div>

            </div>
          </div>

          {/* Element sidebar */}
          <FloatingToolbar />
        </div>
      </div>
    </div>

  );
}

const HardBreakExtension = Extension.create({
  name: 'customHardBreak',

  addKeyboardShortcuts() {
    return {
      // Override the default Enter key behavior
      Enter: ({ editor }) => {

        if (editor.isActive('codeBlock')) {
          return false;
        }
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

Color.configure({
  types: ['textStyle'],
})

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
      // 'Backspace': ({ editor }) => {
      //   if (editor.isActive('image') || editor.isActive('heading') ||
      //     editor.isActive('blockquote') || editor.isActive('codeBlock')) {
      //     editor.chain().deleteSelection().run();
      //     return true;
      //   }
      //   return false;
      // },
    };
  },
});
