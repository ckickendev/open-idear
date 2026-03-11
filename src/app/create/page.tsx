'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core';
import Head from 'next/head';
import Paragraph from '@tiptap/extension-paragraph';

import "./edit.css";
import Toolbar from './ToolBar';
import Color from '@tiptap/extension-color';
import { Code, Eye, EyeOff, Globe, MessageCircleQuestion, Plus, Save } from 'lucide-react';
import FloatingToolbar from './FloatingToolbar';
import CodeBlock from '@tiptap/extension-code-block';
import contentStore from '@/store/ContentStore';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

import { getHeadersToken } from '@/api/authentication';
import { api } from '@/common/apiClient';
import LoadingComponent from '@/components/common/Loading';
import loadingStore from '@/store/LoadingStore';
import PostLists from './PostLists';

import HtmlEditor, { RawHtmlExtension } from './HtmlEditor';
import Instruction from './Instruction';
import { useInstructionStore } from '@/store/useInstruction';
import authenticationStore from '@/store/AuthenticationStore';
import FileHandler from '@tiptap/extension-file-handler';
import ImageUpload from './ImageUpload';
import alertStore from '@/store/AlertStore';
import Notification from '@/components/common/Notification';
import { ButtonCyanToBlue, ButtonGray, ButtonPinkToOrange, ButtonPurpleToBlue, ButtonPurpleToPink } from '@/components/common/ButtonCustom';
import { TextAreaCustom } from '@/components/common/TextAreaCustom';

export default function CreatePost() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const title = contentStore((state) => state.title);
  const setTitle = contentStore((state) => state.setTitle);
  const content = contentStore((state) => state.content);
  const setContent = contentStore((state) => state.setContent);
  const modeHTML = contentStore((state) => state.modeHTML);
  const setModeHTML = contentStore((state) => state.setModeHTML);

  const isLoading = loadingStore((state) => state.isLoading);
  const changeLoad = loadingStore((state) => state.changeLoad);
  const showHtmlEditor = contentStore((state) => state.showHtmlEditor);
  const setShowHtmlEditor = contentStore((state) => state.setShowHtmlEditor);

  const setDisplayInstructions = useInstructionStore((state) => state.setDisplayInstructions);

  const [idPost, setIdPost] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isPublic, setIsPublic] = useState(false);
  const [onPublic, setOnPublic] = useState(false);
  const [category, setCategory] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [rawHtml, setRawHtml] = useState('');
  const [onCreateNewSeries, setCreateNewSeries] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageInsertPosition, setImageInsertPosition] = useState<number | null>(null);

  const [newSeries, setNewSeries] = useState<string>('');
  const [descriptionPublic, setDescriptionPublic] = useState<string>('');
  const [seriesPublic, setSeriesPublic] = useState<string>('');
  const [categoryPublic, setCategoryPublic] = useState<string>('');
  const [imagePublic, setImagePublic] = useState<{ _id: string } | null>(null);

  const setType = alertStore((state) => state.setType);
  const setMessage = alertStore((state) => state.setMessage);

  useEffect(() => {
    const fetchPreData = async () => {
      changeLoad();
      const token = localStorage.getItem("access_token");
      if (token) {
        const idPost = searchParams.get('id');

        // Get category
        const resCategory = await api.get('/category');
        if (resCategory.success) {
          setCategory(resCategory.data.categories);
        } else {
          setType('error');
          setMessage("Error fetching categories");
        }

        // Get series 
        const resSeries = await api.get('/series/getByUser');
        if (resSeries.success) {
          setSeries(resSeries.data.series);
        } else {
          setType('error');
          setMessage("Error fetching user data");
        }

        setIdPost(idPost);
        if (!idPost) {
          setTitle("");
          setContent("");
          changeLoad();
          return;
        }

        const resPost = await api.get(`/post/getPostToEdit?postId=${idPost}`);
        if (resPost.success) {
          setTitle(resPost.data.post.title);
          setContent(resPost.data.post.content);
          // setImagePublic({ imageUrl: resPost.data.post.image.url, description: resPost.data.post.image.description });
          setIsPublic(resPost.data.post.published);
        } else {
          setType('error');
          setMessage("Error fetching user data");
        }
        changeLoad();
      } else {
        changeLoad();
      }
    };
    fetchPreData();
  }, [searchParams, pathname]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleKit,
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
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: (currentEditor, files, pos) => {
          files.forEach(file => {
            const fileReader = new FileReader()

            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result,
                  },
                })
                .focus()
                .run()
            }
          })
        },
        onPaste: (currentEditor: any, files: any, htmlContent: any) => {
          files.forEach((file: any) => {
            if (htmlContent) {
              return false
            }

            const fileReader = new FileReader()

            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: fileReader.result,
                  },
                })
                .focus()
                .run()
            }
          })
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'edit-container prose prose-lg focus:outline-none max-w-none',
      },
    },
    immediatelyRender: false,
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
        // Instead of prompting for URL, open the upload modal
        setImageInsertPosition(position);
        setShowImageUpload(true);
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

  const onPublicPage = () => {
    setOnPublic((prev) => !prev);
  }

  const applyHtml = () => {
    if (editor) {
      editor.commands.setContent(rawHtml);
      setShowHtmlEditor(false);
      setModeHTML(!modeHTML);
    }
  };

  const syncWithEditor = () => {
    if (editor) {
      const html = editor.getHTML();
      setRawHtml(formatHtml(html));
    }
  };

  // Format HTML with indentation and line breaks
  const formatHtml = (html: any) => {
    if (!html) return '';

    // Replace closing tags followed by opening tags with line break
    let formatted = html.replace(/>\s*</g, '>\n<');

    // Add indentation
    const indent = 2;
    const lines = formatted.split('\n');
    let indentLevel = 0;

    formatted = lines.map((line: any) => {
      // Check for closing tag
      if (line.match(/^<\//)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Add indentation
      const indentation = ' '.repeat(indentLevel * indent);
      const indentedLine = indentation + line;

      // Check for opening tag (not self-closing)
      if (line.match(/<[^/][^>]*[^/]>$/)) {
        indentLevel++;
      }

      return indentedLine;
    }).join('\n');

    return formatted;
  };

  const handleAutoGenerate = async () => {
    if (!title.toString().trim()) {
      setType('error');
      setMessage('Please enter a title to generate content.');
      return;
    }

    setIsGenerating(true);
    const response = await api.post('/api/generate', { title: title.toString() });

    if (response.success && response.data?.content) {
      if (editor) {
        editor.commands.setContent(response.data.content);
      } else {
        setContent(response.data.content);
      }
      setType('success');
      setMessage('Content generated successfully!');
    } else {
      setType('error');
      setMessage(response.message || 'Failed to generate content');
    }
    setIsGenerating(false);
  };

  // Editor toolbar components
  const savePost = async () => {
    if (!editor) return;

    const text = editor.getText().replace(/\n/g, '');
    const content = editor.getHTML();

    changeLoad();

    if (idPost) {
      const res = await api.patch('/post/update', {
        postId: idPost,
        title: title,
        text: text,
        content: content
      });
      changeLoad();
      if (res.success) {
        setType('success');
        setMessage('Post updated successfully!');
      } else {
        setType('error');
        setMessage(res.message || 'Error updating post');
      }
      return;
    }

    const res = await api.post('/post/create', {
      title: title,
      text: text,
      content: content
    });

    changeLoad();
    if (res.success) {
      const params = new URLSearchParams();
      params.set('id', res.data.post._id);
      router.push(`${pathname}?${params.toString()}`);
      setType('success');
      setMessage('Post created successfully!');
    } else {
      setType('error');
      setMessage(res.message || 'Error creating post');
    }
  };

  const handleImageUploadedPublic = (image: any) => {
    setShowImageUpload(false);
    setImageInsertPosition(null);
    setImagePublic(image._id);
  };

  const handleImageUploaded = (image: any) => {
    if (editor && imageInsertPosition !== null) {
      editor
        .chain()
        .focus()
        .insertContentAt(imageInsertPosition, {
          type: 'image',
          attrs: {
            src: image.url,
            alt: image.description,
          },
        },
        )
        // .insertContentAt(imageInsertPosition + 1, {
        //   type: 'paragraph',
        //   content: [
        //     {
        //       type: 'text',
        //       text: description,
        //       class: 'image-description',
        //     },
        //   ],
        //   attrs: {
        //     class: 'image-description',
        //   },
        // })
        .run();

    }
    setShowImageUpload(false);
    setImageInsertPosition(null);
  };

  const createNewSeriesHandler = async () => {
    setCreateNewSeries(false);
    changeLoad(); // Adding start load matching the end load.
    const res = await api.post('/series/create', {
      newSeries: newSeries
    });
    changeLoad();
    if (res.success) {
      setNewSeries('');
      setSeries((prev) => [...prev, res.data.data]);
      setType('success');
      setMessage('New series created successfully!');
    } else {
      setType('error');
      setMessage(res.message || 'Error creating series');
    }
  };

  const onPublicHandle = async () => {
    const publicInfo = {
      postId: idPost,
      description: descriptionPublic,
      image: imagePublic,
      series: seriesPublic,
      category: categoryPublic
    };

    changeLoad();
    const res = await api.post('/post/public', {
      publicInfo
    });
    changeLoad();
    if (res.success) {
      setType('success');
      setMessage("Public post successfully!");
      setOnPublic(false);
      setIsPublic(true);
    } else {
      setType('error');
      setMessage(res.message || "Error publishing post");
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/*All posts*/}
      <PostLists />
      <Notification />
      <Instruction />
      <Head>
        <title>Create New Post</title>
        <meta name="description" content="Create a new post with our drag and drop editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-7xl mx-auto px-4 py-6">
        <div className='mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='w-full flex items-center mb-2'>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-600 truncate">{!idPost ? "Create new post" : "Edit your post"}</h1>
            <div className='relative'>
              <MessageCircleQuestion className=' m-2'
                onClick={() => setDisplayInstructions(true)}
              />
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium w-fit ${isPublic
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-100 text-amber-700'
            }`}>
            <div className={`w-2 h-2 rounded-full ${isPublic ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            {isPublic ? 'Published' : 'Draft'}
          </div>
        </div>


        <div className="mb-6 w-full px-2 flex flex-col sm:flex-row gap-4">
          <input
            id="post-title"
            type="text"
            value={title.toString()}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 w-full px-6 py-4 text-2xl font-semibold bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all placeholder:text-slate-400"
            placeholder="Enter post title"
          />
          <button
            onClick={handleAutoGenerate}
            disabled={isGenerating || !title.toString().trim()}
            className={`px-6 py-4 rounded-2xl font-bold flex items-center justify-center transition-all min-w-[280px] ${isGenerating || !title.toString().trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5'
              }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Content...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto generate by AI
              </>
            )}
          </button>
        </div>

        <div className="relative w-full flex flex-col lg:flex-row outline-none hover:outline-none focus:ring-teal-200 focus:border-teal-200">
          <LoadingComponent isLoading={isLoading} />

          {/* Editor area */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden w-full">
            <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 w-full">
              {!previewMode && editor &&
                <>
                  <div className="flex items-center gap-2">
                    <HtmlEditor editor={editor} setRawHtml={setRawHtml} rawHtml={rawHtml} />
                  </div>
                  {modeHTML || <Toolbar editor={editor} />}
                </>
              }

              {modeHTML || <div
                ref={editorContainerRef}
                className="p-8 min-h-[500px]"
                onDragOver={previewMode ? undefined : handleDragOver}
                onDrop={previewMode ? undefined : handleDrop}
              >
                {previewMode ? (
                  <div className="prose prose-lg max-w-none">

                    <p className="text-3xl font-bold mb-4">{title || 'Untitled Post'}</p>
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
            </div>
          </div>
          <div className="fixed w-full bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] flex justify-between left-0 bottom-0 flex flex-col z-50 md:flex-row">
            <div className="w-full px-4 flex items-left h-auto p-1">
              <div className="flex items-center gap-2 justify-center px-2">
                {modeHTML ||
                  <ButtonPurpleToBlue
                    onClick={() => setPreviewMode(!previewMode)}
                    classAddition="flex items-center whitespace-nowrap px-8 py-2 rounded-md"
                    title={previewMode ? 'Return to edit' : 'Click to Preview'}
                    icon={previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  />
                }
              </div>
              <div className="flex items-center gap-2 justify-center px-2">
                <ButtonPurpleToPink
                  onClick={() => {
                    syncWithEditor();
                    setShowHtmlEditor(!showHtmlEditor);
                    setModeHTML(!modeHTML);
                  }}
                  classAddition="flex items-center whitespace-nowrap px-8 py-2 rounded-md"
                  title={showHtmlEditor ? 'Hide HTML' : 'HTML Mode'}
                  icon={<Code className="w-4 h-4 mr-2" />}
                />

                {showHtmlEditor && (
                  <>
                    <ButtonPurpleToPink
                      onClick={() => {
                        applyHtml();
                      }}
                      classAddition="flex items-center whitespace-nowrap px-8 py-2 rounded-md"
                      title='Apply HTML'
                      icon={<Code className="w-4 h-4 mr-2" />}
                    />
                  </>
                )}
              </div>
            </div>
            {title ?
              <div className='w-full px-2 flex justify-end h-auto'>
                <div className="flex items-center gap-2 justify-center px-2">
                  {idPost ? (
                    <ButtonPinkToOrange
                      onClick={onPublicPage}
                      classAddition={`flex items-center px-8 py-2 min-w-40 text-white ${isPublic ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isPublic}
                      title={isPublic ? 'Published' : 'Public'}
                      icon={<Globe className="w-4 h-4 mr-2" />}
                    />
                  ) : (
                    <ButtonGray
                      classAddition="flex items-center px-8 py-2 rounded-md min-w-40 text-white"
                      disabled
                      title="Public"
                      icon={<Globe className="w-4 h-4 mr-2" />}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 justify-center px-2">
                  <ButtonCyanToBlue
                    onClick={savePost}
                    classAddition="flex items-center whitespace-nowrap px-8 py-2 rounded-md"
                    title="Save Draft"
                    icon={<Save className="w-4 h-4 mr-2" />}
                  />
                </div>
              </div>
              :
              <div className='w-full px-2 flex justify-end h-auto'>
                <div className="flex items-center gap-2 justify-center px-2">
                  <ButtonGray
                    classAddition="flex items-center px-8 py-2 rounded-md min-w-40 text-white"
                    disabled
                    title="Public"
                    icon={<Globe className="w-4 h-4 mr-2" />}
                  />
                </div>
                <div className="flex items-center gap-2 justify-center px-2" >
                  <ButtonGray
                    classAddition="flex items-center px-8 py-2 rounded-md min-w-40 text-white"
                    disabled
                    title="Save Draft"
                    icon={<Save className="w-4 h-4 mr-2" />}
                  />
                </div>
              </div>
            }

          </div>

          {showImageUpload && (
            <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  onClose={() => {
                    setShowImageUpload(false);
                    setImageInsertPosition(null);
                  }}
                  isTitleDisplay={true}
                />
              </div>
            </div>
          )}
        </div>
        {/* Public page */}
        {onPublic && <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 flex justify-center items-center bg-gray-50/70">
          <div className='absolute top-2 p-2 w-full max-w-xl bg-white shadow sm:rounded-xl sm:px-10 flex items-center justify-center py-0 sm:px-6 lg:px-8'>
            <div className="w-full">
              <div className="p-6 bg-white">
                <div className='flex justify-end'>
                  <button type="button" className="text-gray-400 bg-transparent p-2 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setOnPublic(false)}>
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                  </button>
                </div>
                {/* Title Section */}
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-800 mb-2">
                    Desciption <span className="text-gray-400 italic">(no required but we recommend it for SEO)</span>
                  </h2>
                  <TextAreaCustom
                    id="message"
                    value={descriptionPublic} onChange={(e: any) => setDescriptionPublic(e.target.value)}
                    rows={4}
                    className=""
                    placeholder="Write your thoughts here..."
                  />
                </div>

                {/* Title Section */}
                <div className='mb-2'>
                  <h2 className="text-sm font-medium text-gray-800 mb-2">
                    Image (Recommend for SEO)
                  </h2>
                  <ImageUpload
                    onImageUploaded={handleImageUploadedPublic}
                    onClose={() => {
                      setShowImageUpload(false);
                      setImageInsertPosition(null);
                    }}
                    isTitleDisplay={false}
                  />
                </div>

                {/* Series Section */}
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-800 mb-3">Series</h2>

                  {/* Dropdown */}
                  <div className="relative mb-4">

                    {!onCreateNewSeries ? <>
                      <select defaultValue="" onChange={(e) => setSeriesPublic(e.target.value)} id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">No Select</option>
                        {series.map((ser: any) => (
                          <option key={ser._id} value={ser._id}>{ser.title} </option>
                        ))}
                      </select>
                      <div className="flex gap-2 mt-3">
                        <button className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none">
                          Hoặc
                        </button>
                        <button className="flex items-center gap-1 px-4 py-2 text-blue-600 hover:text-blue-700 focus:outline-none cursor-pointer" onClick={() => setCreateNewSeries(true)}>
                          <Plus className="h-4 w-4" />
                          Tạo mới
                        </button>
                      </div>
                    </> :
                      (<div className="w-full h-full bg-white">
                        <div className="p-b-6">
                          <input
                            type="text"
                            value={newSeries}
                            onChange={(e) => setNewSeries(e.target.value)}
                            placeholder="Enter series name"
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                          />
                          <button
                            onClick={() => setCreateNewSeries(false)}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer mr-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => createNewSeriesHandler()}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            Create
                          </button>
                        </div>
                      </div>)
                    }

                  </div>
                </div>

                {/* Category Selection */}
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-800 mb-3">Category *</h2>

                  {/* Add Category Button */}
                  <select defaultValue={categoryPublic} onChange={(e) => setCategoryPublic(e.target.value)} id="countries" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option value="">No Select</option>
                    {category && category.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className='flex justify-center'>
                  <button
                    onClick={() => onPublicHandle()}
                    className="w-50 px-8 py-4 mb-2 bg-blue-600 from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  >
                    Public
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>}

      </div>

      {/* Element sidebar */}
      <FloatingToolbar />
    </div >
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
