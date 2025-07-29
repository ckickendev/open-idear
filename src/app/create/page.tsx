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
import { ChevronDown, MessageCircleQuestion, Plus } from 'lucide-react';
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
import Instruction from './Instruction';
import { useInstructionStore } from '@/store/useInstruction';
import authenticationStore from '@/store/AuthenticationStore';
import FileHandler from '@tiptap/extension-file-handler';
import ImageUpload from './ImageUpload';
import alertStore from '@/store/AlertStore';
import { set } from 'react-hook-form';
import Notification from '@/component/common/Notification';

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
  const [imagePublic, setImagePublic] = useState<{ imageUrl: string; description: string } | null>(null);

  const setType = alertStore((state) => state.setType);
  const setMessage = alertStore((state) => state.setMessage);

  useEffect(() => {
    const fetchPreData = async () => {
      changeLoad();
      const token = localStorage.getItem("access_token");
      if (token) {
        const headers = getHeadersToken();
        const idPost = searchParams.get('id');

        // Get category
        try {
          const resCategory = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category`, { headers });
          console.log("resCategory: ", resCategory);

          if (resCategory.status === 200) {
            setCategory(resCategory.data.categories);
          }
        } catch (error) {
          alert('Error fetching user data');
          changeLoad();
        }

        // Get series 
        try {
          const resSeries = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/getByUser`, { headers });
          console.log("res srestes: ", resSeries);

          if (resSeries.status === 200) {
            setSeries(resSeries.data.series);
          }
        } catch (error) {
          alert('Error fetching user data');
          changeLoad();
        }

        setIdPost(idPost);
        if (!idPost) {
          setTitle("");
          setContent("");
          console.log("content: ", content);
          changeLoad();
          return;
        }

        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostToEdit?postId=${idPost}`, { headers });
          if (res.status === 200) {
            console.log('res.data.post to edit: ', res.data.post);
            
            setTitle(res.data.post.title);
            setContent(res.data.post.content);
            // setImagePublic({ imageUrl: res.data.post.image.url, description: res.data.post.image.description });
            setIsPublic(res.data.post.published);
          }
        } catch (error) {
          alert('Error fetching user data');
          changeLoad();
        }
        changeLoad();
      }
    };
    fetchPreData();
  }, [searchParams, pathname]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleKit ,
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
              // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
              // you could extract the pasted file from this url string and upload it to a server for example
              console.log(htmlContent) // eslint-disable-line no-console
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

  const handleImageUploadedPublic = (image: any) => {
    setShowImageUpload(false);
    setImageInsertPosition(null);
    setImagePublic({imageUrl: image.url, description: image.description});
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

  const createNewSeriesHandler = () => {
    console.log("Creating new series...");
    setCreateNewSeries(false);
    axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/create`, {
      newSeries: newSeries,
      headers: getHeadersToken()
    }).then((res) => {
      console.log('Created series:', res.data);
      setNewSeries('');
      setSeries((prev) => [...prev, res.data.data]);
      changeLoad();
      alert('New series created successfully!');
    }).catch((err) => {
      const errorMessage = err?.response?.data?.error || err?.message;
      changeLoad();
      alert(errorMessage);
    });
  };

  const onPublicHandle = async () => {
    console.log("description: ", descriptionPublic);
    console.log("imagePublic: ", imagePublic);
    console.log("seriesPublic: ", seriesPublic);
    console.log("categoryPublic: ", categoryPublic);
    const publicInfo = {
      postId: idPost,
      description: descriptionPublic,
      image: imagePublic,
      series: seriesPublic,
      category: categoryPublic
    };

    try {
      const onPublic = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/public`, {
        headers: getHeadersToken(),
        publicInfo
      });
      console.log("onPublic: ", onPublic);
      if (onPublic.status === 200) {
        setType('success');
        setMessage("Public post successfully!");
        setOnPublic(false);
        setIsPublic(true);
      }
    } catch (error: any) {
      setType('error');
      setMessage(error?.response?.data?.message || error?.message);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Notification />
      <Instruction />
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
              onClick={() => setDisplayInstructions(true)}
            />
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

        <div className="relative w-full flex flex-col lg:flex-row outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-200 focus:border-teal-200">
          <LoadingComponent isLoading={isLoading} />
          {/*All posts*/}
          <PostLists />

          {/* Editor area */}
          <div className="w-full flex flex-col justify-between items-center">
            <div className="w-full bg-white mb-4 flex flex-col items-center">

              {!previewMode && editor &&
                <>
                  <div className="w-full mt-2 flex items-center justify-center">
                    <HtmlEditor editor={editor} setRawHtml={setRawHtml} rawHtml={rawHtml} />
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

              <div className="fixed w-full bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] flex justify-between bottom-2 flex flex-col z-50 md:flex-row">
                <div className="w-full p-4 flex items-left">
                  <div className="flex gap-2 p-4">
                    {modeHTML || <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="whitespace-nowrap px-8 py-4 bg-blue-600 from-blue-500 to-purple-500 text-white font-bold rounded-md transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    >
                      {previewMode ? 'Return to edit' : 'Click to Preview'}
                    </button>}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => {
                        syncWithEditor();
                        setShowHtmlEditor(!showHtmlEditor);
                        setModeHTML(!modeHTML);
                      }}
                      className="px-8 py-4 bg-white from-blue-500 to-purple-500 text-gray-700 font-bold rounded-md shadow hover:bg-gray-100 transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    >
                      {showHtmlEditor ? 'Hide HTML' : 'Transfer to HTML Mode'}
                    </button>

                    {showHtmlEditor && (
                      <button
                        onClick={applyHtml}
                        className="px-8 py-4 bg-blue-200 from-blue-500 to-purple-500 text-gray-700 font-bold rounded-md shadow hover:bg-blue-300 transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                      >
                        Apply HTML
                      </button>
                    )}
                  </div>
                </div>
                {title ?
                  <div className='w-full p-4 flex justify-end'>
                    <div className="p-4 gap-2">
                      <button
                        onClick={onPublicPage}
                        className={`px-8 py-4 bg-green-600 hover:bg-green-700 from-blue-500 to-purple-500 text-white font-bold rounded-xl transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg ${isPublic ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isPublic}
                      >
                        Public
                      </button>
                    </div>
                    <div className="p-4">
                      <button
                        onClick={savePost}
                        className="whitespace-nowrap px-8 py-4 bg-blue-600 from-blue-500 to-purple-500 text-white font-bold rounded-xl transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                      >
                        Save Draft
                      </button>
                    </div>
                  </div>
                  :
                  <div className='w-full p-4 flex justify-end'>
                    <div className="p-4 gap-2">
                      <button
                        className="px-8 py-4 bg-gray-300 from-blue-500 to-purple-500 text-white font-bold rounded-xl transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-not-allowed" disabled
                      >
                        Public
                      </button>
                    </div>
                    <div className="p-4" >
                      <button
                        className="whitespace-nowrap px-8 py-4 bg-gray-300 from-blue-500 to-purple-500 text-white font-bold rounded-xl transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-not-allowed" disabled
                      >
                        Save Draft
                      </button>
                    </div>
                  </div>

                }

              </div>

            </div>
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

          {/* Element sidebar */}
          <FloatingToolbar />
        </div>
        {/* Public page */}
        {onPublic && <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center bg-gray-50/70">
          <div className='relative p-t-20 p-4 w-full max-w-xl max-h-full bg-white shadow sm:rounded-xl sm:px-10 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8'>
            <button type="button" className="text-gray-400 bg-transparent p-2 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center cursor-pointer dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="static-modal" onClick={() => setOnPublic(false)}>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
            </button>
            <div className="w-full">
              <div className="prose max-w-none">
                <div className=" mx-auto p-6 bg-white">
                  {/* Title Section */}
                  <div className="mb-6">
                    <h2 className="text-sm font-medium text-gray-800 mb-2">
                      Desciption <span className="text-gray-400 italic">(no required but we recommend it for SEO)</span>
                    </h2>
                    <textarea id="message" 
                      value={descriptionPublic} 
                      onChange={(e) => setDescriptionPublic(e.target.value)} 
                      rows={4} 
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-red-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here...">
                      </textarea>
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
                </div>
              </div>
            </div>
            <button
              onClick={() => onPublicHandle()}
              className="w-50 px-8 py-4 bg-blue-600 from-blue-500 to-purple-500 text-white font-bold rounded-full transition-transform transform-gpu hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              Public
            </button>
          </div>
        </div>}

      </div>
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
