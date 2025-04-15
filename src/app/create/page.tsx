'use client'

import { useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '<p>Start writing your post...</p>',
  })

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const { url } = await res.json()
    editor.chain().focus().setImage({ src: url }).run()
  }

  const handleSubmit = async () => {
    const content = editor?.getHTML()
    console.log('Post submitted:', { title, content })

    // Later: send to MongoDB or your API
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create a New Post</h1>

      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Post Title"
        className="w-full p-3 text-lg border rounded"
      />

      {/* Formatting buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="btn">Bold</button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="btn">H2</button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="btn">List</button>
        <button onClick={() => fileRef.current?.click()} className="btn">Upload Image</button>
      </div>

      {/* Hidden image input */}
      <input type="file" accept="image/*" hidden ref={fileRef} onChange={insertImage} />

      <EditorContent editor={editor} className="border rounded p-4 min-h-[200px]" />

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
        Publish Post
      </button>
    </main>
  )
}