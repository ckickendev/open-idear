'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, Loader2, Check } from 'lucide-react';
import { getHeadersToken } from '@/api/authentication';

const ImageUpload = ({ onImageUploaded, onClose, isTitleDisplay }: any) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isUploadDone, setIsUploadDone] = useState(false);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setSelectedFile(file);
            setError(null);
            setIsUploadDone(false);
            setDescription('');

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    setPreview(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('description', description);

        try {
            const response = await fetch('http://localhost:5001/media/uploadImage', {
                method: 'POST',
                body: formData,
                headers: getHeadersToken(),
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            if (data.status === 'success') {
                // Call the callback with the uploaded image data
                console.log('Image uploaded successfully:', data.image);
                
                onImageUploaded(
                    data.image
                );
                setIsUploadDone(true);
                // Close the modal
                onClose();
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err : any) {
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

    const handleDragOver = (e : any) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e : any) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const event = { target: { files: [file] } };
            handleFileSelect(event);
        }
    };

    return (
        <div className="max-w-2xl p-6 bg-white rounded-lg shadow-lg">
            {isTitleDisplay && (
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Upload Image</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}

            {/* Upload Area */}
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
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
                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClearSelection();
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <FileImage size={48} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                JPEG, PNG, GIF, or WebP (max 5MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Description Input - Shows after file selection */}
            {selectedFile && (
                <div className="mt-6 space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Image Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a description for this image..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                    />
                    <p className="text-xs text-gray-500">
                        Optional: Add a description to help identify this image later
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Upload Button */}
            {selectedFile && !isUploadDone && (
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                Upload Image
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleClearSelection}
                        disabled={uploading}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;