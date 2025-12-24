'use client'
import React, { useState } from 'react';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Code, 
  Globe, 
  X, 
  Plus, 
  ChevronDown,
  MessageCircleQuestion,
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';

export default function ImprovedEditorUI() {
  const [previewMode, setPreviewMode] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm ${
            notificationType === 'success' 
              ? 'bg-emerald-500/95 text-white' 
              : 'bg-red-500/95 text-white'
          }`}>
            {notificationType === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Create New Post
            </h1>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <MessageCircleQuestion className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isPublished 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isPublished ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
            {isPublished ? 'Published' : 'Draft'}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 text-2xl font-semibold bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
            placeholder="Enter your post title..."
          />
        </div>

        {/* Editor Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="font-bold">B</span>
              </button>
              <button className="px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="italic">I</span>
              </button>
              <button className="px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="underline">U</span>
              </button>
              <div className="w-px h-6 bg-slate-300 mx-2" />
              <button className="px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium text-slate-700">
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="p-8 min-h-[500px]">
            {previewMode ? (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold mb-4">{title || 'Untitled Post'}</h2>
                <p className="text-slate-600">Your content preview will appear here...</p>
              </div>
            ) : htmlMode ? (
              <textarea
                className="w-full h-96 p-4 font-mono text-sm bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HTML code..."
              />
            ) : (
              <div className="prose prose-lg max-w-none">
                <p className="text-slate-400">Start writing your post here...</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  previewMode
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {previewMode ? 'Edit' : 'Preview'}
              </button>

              <button
                onClick={() => setHtmlMode(!htmlMode)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  htmlMode
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Code className="w-4 h-4" />
                HTML
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => showNotif('success', 'Draft saved successfully!')}
                disabled={!title}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  title
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>

              <button
                onClick={() => {
                  if (title) setShowPublishModal(true);
                }}
                disabled={!title || isPublished}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  title && !isPublished
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Globe className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>
        </div>

        {/* Publish Modal */}
        {showPublishModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Publish Your Post</h2>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                    <span className="text-slate-400 font-normal ml-2">(Recommended for SEO)</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="Write a brief description of your post..."
                  />
                </div>

                {/* Featured Image */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Featured Image
                    <span className="text-slate-400 font-normal ml-2">(Recommended)</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
                    <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {/* Series */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Series
                  </label>
                  <select className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all">
                    <option>No Series</option>
                    <option>Getting Started with React</option>
                    <option>Advanced JavaScript</option>
                  </select>
                  <button className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                    <Plus className="w-4 h-4" />
                    Create New Series
                  </button>
                </div>

                {/* Category */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all">
                    <option>Select a category</option>
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Business</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowPublishModal(false);
                      setIsPublished(true);
                      showNotif('success', 'Post published successfully!');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Publish Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}