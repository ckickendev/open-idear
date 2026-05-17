'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { getHeadersToken } from '@/lib/api/axios';
import MediaBrowser from './MediaBrowser';

interface ImageUploadProps {
  onImageUploaded: (image: any) => void;
  onClose?: () => void;
  isTitleDisplay?: boolean;
  darkMode?: boolean;
}

const ImageUpload = ({ onImageUploaded, onClose = () => {}, isTitleDisplay = false, darkMode = false }: ImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUploadDone, setIsUploadDone] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dark mode class helpers
  const bg = darkMode ? 'bg-[var(--color-editor-surface)]' : 'bg-white';
  const bgElevated = darkMode ? 'bg-[var(--color-editor-elevated)]' : 'bg-gray-50';
  const text = darkMode ? 'text-[var(--color-editor-text)]' : 'text-gray-800';
  const textSec = darkMode ? 'text-[var(--color-editor-secondary)]' : 'text-gray-500';
  const textMuted = darkMode ? 'text-[var(--color-editor-muted)]' : 'text-gray-400';
  const border = darkMode ? 'border-[var(--color-editor-border)]' : 'border-gray-300';
  const borderHover = darkMode ? 'hover:border-[var(--color-editor-accent)]' : 'hover:border-blue-400';
  const accent = darkMode ? 'bg-[var(--color-editor-accent)]' : 'bg-blue-500';
  const accentHover = darkMode ? 'hover:bg-[var(--color-editor-accent-hover)]' : 'hover:bg-blue-600';
  const accentText = darkMode ? 'text-[var(--color-editor-accent)]' : 'text-blue-600';
  const ring = darkMode ? 'focus:ring-[var(--color-editor-accent)]/40' : 'focus:ring-blue-500';

  const handleFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setIsUploadDone(false);
    setDescription('');

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('description', description);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/media/uploadImage`, {
        method: 'POST',
        body: formData,
        headers: getHeadersToken(),
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      if (data.status === 'success') {
        onImageUploaded(data.image);
        setIsUploadDone(true);
        onClose();
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setIsUploadDone(false);
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowserSelect = (media: any) => {
    onImageUploaded(media);
    setIsUploadDone(true);
    setShowBrowser(false);
    onClose();
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files: [files[0]] } });
    }
  };

  return (
    <div className={`max-w-2xl p-6 ${bg} rounded-xl`}>
      {isTitleDisplay && (
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${text}`}>Upload Image</h2>
          <button
            onClick={onClose}
            className={`${textMuted} hover:${text} transition-colors cursor-pointer p-1 rounded-lg hover:${bgElevated}`}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed ${border} ${borderHover} rounded-xl p-8 text-center transition-all duration-200 cursor-pointer`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-64 mx-auto rounded-xl shadow-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              className="absolute top-2 right-2 bg-[var(--color-editor-danger)] text-white rounded-full p-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className={`p-3 rounded-xl ${bgElevated}`}>
                <FileImage size={32} className={textMuted} />
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium ${text}`}>
                Click to upload or drag and drop
              </p>
              <p className={`text-xs ${textSec} mt-1`}>
                JPEG, PNG, GIF, or WebP (max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Description Input */}
      {selectedFile && (
        <div className="mt-5 space-y-2 animate-[fade-in_0.15s_ease-out]">
          <label htmlFor="img-description" className={`block text-sm font-medium ${text}`}>
            Image Description
          </label>
          <textarea
            id="img-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this image..."
            className={`w-full px-4 py-3 ${bgElevated} border ${border} rounded-xl text-sm ${text} placeholder:${textMuted} focus:outline-none focus:ring-2 ${ring} resize-none transition-all duration-150`}
            rows={2}
          />
          <p className={`text-[11px] ${textMuted}`}>
            Optional: Helps with accessibility and SEO
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-[var(--color-editor-danger)]/10 border border-[var(--color-editor-danger)]/30 rounded-xl">
          <p className="text-sm text-[var(--color-editor-danger)]">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isUploadDone && (
        <div className="mt-5 flex gap-3 animate-[fade-in_0.15s_ease-out]">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`flex-1 ${accent} text-white py-3 px-6 rounded-xl font-medium ${accentHover} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer`}
          >
            {uploading ? (
              <><Loader2 size={18} className="animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={18} /> Upload Image</>
            )}
          </button>
          <button
            onClick={handleClearSelection}
            disabled={uploading}
            className={`px-4 py-3 border ${border} ${text} rounded-xl hover:${bgElevated} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer text-sm`}
          >
            Clear
          </button>
        </div>
      )}

      {/* Upload success */}
      {isUploadDone && (
        <div className="mt-4 p-3 bg-[var(--color-editor-success)]/10 border border-[var(--color-editor-success)]/30 rounded-xl flex items-center justify-center gap-2 animate-[fade-in_0.15s_ease-out]">
          <CheckCircle size={18} className="text-[var(--color-editor-success)]" />
          <span className="text-sm text-[var(--color-editor-success)] font-medium">Image uploaded successfully!</span>
        </div>
      )}

      {/* Browse Media */}
      {!selectedFile && !isUploadDone && (
        <div className="mt-4 pt-4 border-t border-[var(--color-editor-border)]/40">
          <button
            onClick={() => setShowBrowser(true)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${border} ${accentText} rounded-xl ${borderHover} transition-all duration-200 font-medium text-sm cursor-pointer`}
          >
            <ImageIcon size={18} />
            Browse Your Media Library
          </button>
        </div>
      )}

      {showBrowser && (
        <MediaBrowser
          onSelect={handleBrowserSelect}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </div>
  );
};

export default ImageUpload;