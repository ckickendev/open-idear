'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';
import Color from '@tiptap/extension-color';
import CodeBlock from '@tiptap/extension-code-block';
import FileHandler from '@tiptap/extension-file-handler';

import '@/styles/editor.css';
import Toolbar from './ToolBar';
import HtmlEditor, { RawHtmlExtension } from './HtmlEditor';
import BlockInsertButton from './FloatingToolbar';
import PostListPanel from './PostLists';
import EditorHeader from './EditorHeader';
import EditorTitle from './EditorTitle';
import PublishDrawer from './PublishDrawer';
import WriterMetrics from './WriterMetrics';
import SaveStatusIndicator, { SaveStatus } from './SaveStatusIndicator';
import Instruction from './Instruction';
import ImageUpload from './ImageUpload';
import { toast } from 'sonner';

import contentStore from '@/store/ContentStore';
import { useInstructionStore } from '@/store/useInstruction';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { categoryApi } from '@/features/categories/api/category.api';
import { seriesApi } from '@/features/series/api/series.api';
import { postApi } from '@/features/ideas/api/post.api';
import { api } from '@/lib/api/axios';

// ─── Auto-save debounce delay (ms) ───
const AUTO_SAVE_DELAY = 3000;

export default function CreatePost() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ─── Editor state (from store) ───
  const title = contentStore((state) => state.title);
  const setTitle = contentStore((state) => state.setTitle);
  const content = contentStore((state) => state.content);
  const setContent = contentStore((state) => state.setContent);
  const modeHTML = contentStore((state) => state.modeHTML);
  const setModeHTML = contentStore((state) => state.setModeHTML);
  const showHtmlEditor = contentStore((state) => state.showHtmlEditor);
  const setShowHtmlEditor = contentStore((state) => state.setShowHtmlEditor);

  // ─── UI state ───
  const [idPost, setIdPost] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawHtml, setRawHtml] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  // Panel states
  const [postListOpen, setPostListOpen] = useState(false);
  const [publishDrawerOpen, setPublishDrawerOpen] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageInsertPosition, setImageInsertPosition] = useState<number | null>(null);

  // Publish form
  const [category, setCategory] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [descriptionPublic, setDescriptionPublic] = useState('');
  const [seriesPublic, setSeriesPublic] = useState('');
  const [categoryPublic, setCategoryPublic] = useState('');
  const [imagePublic, setImagePublic] = useState<{ _id: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Save status
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);



  const editorContainerRef = useRef<HTMLDivElement>(null);

  // ─── Fetch initial data ───
  useEffect(() => {
    const fetchPreData = async () => {
      setPageLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setPageLoading(false);
        return;
      }

      try {
        const postId = searchParams.get('id');

        // Fetch categories + series in parallel
        const [resCategory, resSeries] = await Promise.all([
          categoryApi.getCategories(),
          seriesApi.getSeriesByUser(),
        ]);

        if (resCategory.success) setCategory(resCategory.data.categories);
        if (resSeries.success) setSeries(resSeries.data.series);

        setIdPost(postId);
        if (!postId) {
          setTitle('');
          setContent('');
          setPageLoading(false);
          return;
        }

        const resPost = await postApi.getPostToEdit(postId);
        if (resPost.success) {
          setTitle(resPost.data.post.title);
          setContent(resPost.data.post.content);
          setIsPublic(resPost.data.post.published);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchPreData();
  }, [searchParams, pathname]);

  // ─── TipTap editor ───
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleKit,
      CodeBlock.configure({
        exitOnArrowDown: true,
        exitOnTripleEnter: true,
        defaultLanguage: 'plaintext',
        HTMLAttributes: {
          class: 'my-code-block',
        },
      }),
      Color,
      Paragraph.configure({
        HTMLAttributes: {
          class: '',
        },
      }),
      HardBreakExtension,
      SelectionExtension,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-xl',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your ideas...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
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
          files.forEach((file) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: { src: fileReader.result },
                })
                .focus()
                .run();
            };
          });
        },
        onPaste: (currentEditor: any, files: any, htmlContent: any) => {
          files.forEach((file: any) => {
            if (htmlContent) return false;
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: { src: fileReader.result },
                })
                .focus()
                .run();
            };
          });
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'editor-canvas prose prose-lg focus:outline-none max-w-none',
      },
    },
    immediatelyRender: false,
    onUpdate: () => {
      // Trigger auto-save on content change
      if (idPost) {
        setSaveStatus('unsaved');
        triggerAutoSave();
      }
    },
  });

  // Sync content from store to editor
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // ─── Auto-save logic ───
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      performSave(true);
    }, AUTO_SAVE_DELAY);
  }, [idPost, title]);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // ─── Save handler ───
  const performSave = async (isAutoSave = false) => {
    if (!editor) return;
    if (!title.toString().trim()) return;

    const text = editor.getText().replace(/\n/g, '');
    const editorContent = editor.getHTML();

    setSaveStatus('saving');

    try {
      if (idPost) {
        const res = await postApi.updatePost({
          postId: idPost,
          title: title,
          text: text,
          content: editorContent,
        });
        if (res.success) {
          setSaveStatus('saved');
          if (!isAutoSave) {
            toast.success('Post updated successfully!');
          }
        } else {
          setSaveStatus('error');
          toast.error(res.message || 'Error updating post');
        }
      } else {
        const res = await postApi.createPost({
          title: title,
          text: text,
          content: editorContent,
        });
        if (res.success) {
          const params = new URLSearchParams();
          params.set('id', res.data.post._id);
          router.push(`${pathname}?${params.toString()}`);
          setSaveStatus('saved');
          if (!isAutoSave) {
            toast.success('Post created successfully!');
          }
        } else {
          setSaveStatus('error');
          toast.error(res.message || 'Error creating post');
        }
      }
    } catch {
      setSaveStatus('error');
    }

    // Fade status after 4s
    setTimeout(() => {
      setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
    }, 4000);
  };

  // ─── AI Generate ───
  const handleAutoGenerate = async () => {
    if (!title.toString().trim()) {
      toast.error('Please enter a title to generate content.');
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
      toast.success('Content generated successfully!');
    } else {
      toast.error(response.message || 'Failed to generate content');
    }
    setIsGenerating(false);
  };

  // ─── HTML mode ───
  const applyHtml = () => {
    if (editor) {
      editor.commands.setContent(rawHtml);
      setShowHtmlEditor(false);
      setModeHTML(false);
    }
  };

  const syncWithEditor = () => {
    if (editor) {
      const html = editor.getHTML();
      setRawHtml(formatHtml(html));
    }
  };

  const toggleHtmlMode = () => {
    if (!modeHTML) {
      syncWithEditor();
      setShowHtmlEditor(true);
      setModeHTML(true);
    } else {
      applyHtml();
    }
  };

  // ─── Block insert ───
  const insertElementAtPosition = (type: string) => {
    if (!editor) return;
    const position = editor.state.doc.content.size;

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
        setImageInsertPosition(position);
        setShowImageUpload(true);
        break;
      case 'link':
        const url = prompt('Enter URL:', 'https://example.com');
        const text = prompt('Enter link text:', 'Link text');
        if (url && text) {
          editor
            .chain()
            .focus()
            .insertContentAt(position, text)
            .setTextSelection({ from: position, to: position + text.length })
            .setLink({ href: url })
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
    }
  };

  // ─── Image upload handlers ───
  const handleImageUploaded = (image: any) => {
    if (editor && imageInsertPosition !== null) {
      editor
        .chain()
        .focus()
        .insertContentAt(imageInsertPosition, {
          type: 'image',
          attrs: { src: image.url, alt: image.description },
        })
        .run();
    }
    setShowImageUpload(false);
    setImageInsertPosition(null);
  };

  const handleImageUploadedPublic = (image: any) => {
    setShowImageUpload(false);
    setImageInsertPosition(null);
    setImagePublic(image._id);
  };

  // ─── Create series ───
  const createNewSeriesHandler = async (name: string) => {
    const res = await seriesApi.createSeries({ newSeries: name });
    if (res.success) {
      setSeries((prev) => [...prev, res.data.data]);
      toast.success('New series created successfully!');
    } else {
      toast.error(res.message || 'Error creating series');
    }
  };

  // ─── Publish handler ───
  const onPublicHandle = async () => {
    setIsPublishing(true);
    const publicInfo = {
      postId: idPost,
      description: descriptionPublic,
      image: imagePublic,
      series: seriesPublic,
      category: categoryPublic,
    };

    const res = await postApi.publishPost({ publicInfo });
    setIsPublishing(false);

    if (res.success) {
      toast.success('Post published successfully!');
      setPublishDrawerOpen(false);
      setIsPublic(true);
    } else {
      toast.error(res.message || 'Error publishing post');
    }
  };

  // ─── Drag & drop ───
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!editor) return;
      e.preventDefault();
      const elementType = e.dataTransfer.getData('application/reactflow');
      if (editorContainerRef.current) {
        const view = editor.view;
        const pos = view.posAtCoords({ left: e.clientX, top: e.clientY })?.pos;
        if (pos !== undefined) {
          insertElementAtPosition(elementType);
        }
      }
    },
    [editor]
  );

  // ─── Loading state ───
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-editor-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-[fade-in_0.3s_ease-out]">
          <div className="w-8 h-8 border-2 border-[var(--color-editor-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-editor-muted)]">Loading editor...</p>
        </div>
      </div>
    );
  }

  const editorText = editor?.getText() || '';

  return (
    <div className="min-h-screen bg-editor-bg flex flex-col">
      <Instruction />

      {/* Sticky header */}
      <EditorHeader
        isEditMode={!!idPost}
        isPublished={isPublic}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode(!previewMode)}
        htmlMode={modeHTML}
        onToggleHtmlMode={toggleHtmlMode}
        onSave={() => performSave(false)}
        onPublish={() => setPublishDrawerOpen(true)}
        onTogglePostList={() => setPostListOpen(!postListOpen)}
        saveStatus={saveStatus}
        onRetrySave={() => performSave(false)}
        hasTitle={!!title.toString().trim()}
        onAIGenerate={handleAutoGenerate}
        isGenerating={isGenerating}
      />

      {/* Post list panel (left drawer) */}
      <PostListPanel
        isOpen={postListOpen}
        onClose={() => setPostListOpen(false)}
      />

      {/* Main editor area */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-[slide-up_0.3s_ease-out]">
        {/* Title */}
        <EditorTitle
          value={title.toString()}
          onChange={(val) => {
            setTitle(val);
            if (idPost) {
              setSaveStatus('unsaved');
              triggerAutoSave();
            }
          }}
          placeholder="Untitled"
        />

        {/* Spacer */}
        <div className="h-8" />

        {/* Editor content area */}
        {modeHTML ? (
          /* HTML mode */
          <div className="animate-[fade-in_0.15s_ease-out]">
            <HtmlEditor editor={editor} setRawHtml={setRawHtml} rawHtml={rawHtml} />
            <div className="flex justify-end mt-4">
              <button
                onClick={applyHtml}
                className="px-4 py-2 text-sm font-medium bg-[var(--color-editor-accent)] text-white rounded-lg hover:bg-[var(--color-editor-accent-hover)] transition-all duration-150 cursor-pointer"
              >
                Apply HTML
              </button>
            </div>
          </div>
        ) : previewMode ? (
          /* Preview mode */
          <div className="preview-pane animate-[fade-in_0.15s_ease-out]">
            <h1 className="text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em] text-[var(--color-editor-text)] mb-8">
              {title || 'Untitled Post'}
            </h1>
            {editor && (
              <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            )}
          </div>
        ) : (
          /* Visual editor */
          <div className="animate-[fade-in_0.15s_ease-out]">
            {/* Toolbar */}
            {editor && <Toolbar editor={editor} />}

            {/* Editor canvas */}
            <div
              ref={editorContainerRef}
              className="mt-1 min-h-[60vh]"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {editor && <EditorContent editor={editor} />}
            </div>

            {/* Floating Block insert button */}
            <div className="fixed bottom-8 right-8 z-40 animate-[slide-up_0.3s_ease-out]">
              <BlockInsertButton onInsert={insertElementAtPosition} />
            </div>
          </div>
        )}

        {/* Writer metrics */}
        <WriterMetrics text={editorText} />
      </main>

      {/* Publish drawer */}
      <PublishDrawer
        isOpen={publishDrawerOpen}
        onClose={() => setPublishDrawerOpen(false)}
        onPublish={onPublicHandle}
        categories={category}
        selectedCategory={categoryPublic}
        onCategoryChange={setCategoryPublic}
        seriesList={series}
        selectedSeries={seriesPublic}
        onSeriesChange={setSeriesPublic}
        onCreateSeries={createNewSeriesHandler}
        description={descriptionPublic}
        onDescriptionChange={setDescriptionPublic}
        onCoverImageUploaded={handleImageUploadedPublic}
        isPublishing={isPublishing}
      />

      {/* Image upload modal */}
      {showImageUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]">
          <div className="bg-[var(--color-editor-surface)] rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[var(--color-editor-border)] shadow-2xl">
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
  );
}

// ─── Format HTML utility ───
function formatHtml(html: string): string {
  if (!html) return '';
  let formatted = html.replace(/>\s*</g, '>\n<');
  const indent = 2;
  const lines = formatted.split('\n');
  let indentLevel = 0;

  formatted = lines
    .map((line: string) => {
      if (line.match(/^<\//)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      const indentation = ' '.repeat(indentLevel * indent);
      const indentedLine = indentation + line;
      if (line.match(/<[^/][^>]*[^/]>$/)) {
        indentLevel++;
      }
      return indentedLine;
    })
    .join('\n');

  return formatted;
}

// ─── TipTap Extensions ───
const HardBreakExtension = Extension.create({
  name: 'customHardBreak',

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive('codeBlock')) {
          return false;
        }
        editor.commands.setHardBreak();
        return true;
      },
      'Shift-Enter': () => {
        return this.editor.commands.setHardBreak();
      },
    };
  },
});

Color.configure({
  types: ['textStyle'],
});

const SelectionExtension = Extension.create({
  name: 'selection',

  addKeyboardShortcuts() {
    return {
      Delete: ({ editor }) => {
        if (editor.isActive('image')) {
          editor.chain().deleteSelection().run();
          return true;
        }
        return false;
      },
    };
  },
});
