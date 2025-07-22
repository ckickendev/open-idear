'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';

const Test = ({ onImageUploaded, onClose }: any) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // const handleFileSelect = (event: any) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         // Validate file type
    //         const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    //         if (!allowedTypes.includes(file.type)) {
    //             setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
    //             return;
    //         }

    //         // Validate file size (5MB limit)
    //         if (file.size > 5 * 1024 * 1024) {
    //             setError('File size must be less than 5MB');
    //             return;
    //         }

    //         setSelectedFile(file);
    //         setError(null);

    //         // Create preview
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             setPreview(e.target.result);
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    // const handleUpload = async () => {
    //     if (!selectedFile) return;

    //     setUploading(true);
    //     setError(null);

    //     const formData = new FormData();
    //     formData.append('image', selectedFile);

    //     try {
    //         const response = await fetch('http://localhost:5001/media/upload', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error('Upload failed');
    //         }

    //         const data = await response.json();

    //         if (data.status === 'success') {
    //             // Call the callback with the uploaded image URL
    //             onImageUploaded(data.data.imageUrl);
    //             // Close the modal
    //             onClose();
    //         } else {
    //             throw new Error(data.error || 'Upload failed');
    //         }
    //     } catch (err) {
    //         setError(err.message || 'Upload failed. Please try again.');
    //     } finally {
    //         setUploading(false);
    //     }
    // };

    // const handleClearSelection = () => {
    //     setSelectedFile(null);
    //     setPreview(null);
    //     setError(null);
    //     if (fileInputRef.current) {
    //         fileInputRef.current.value = '';
    //     }
    // };

    // const handleDragOver = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    // };

    // const handleDrop = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();

    //     const files = e.dataTransfer.files;
    //     if (files.length > 0) {
    //         const file = files[0];
    //         const event = { target: { files: [file] } };
    //         handleFileSelect(event);
    //     }
    // };

    // return (
    //     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    //         <div className="flex justify-between items-center mb-6">
    //             <h2 className="text-2xl font-bold text-gray-800">Upload Image</h2>
    //             <button
    //                 onClick={onClose}
    //                 className="text-gray-400 hover:text-gray-600 transition-colors"
    //             >
    //                 <X size={24} />
    //             </button>
    //         </div>

    //         {/* Upload Area */}
    //         <div
    //             className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
    //             onDragOver={handleDragOver}
    //             onDrop={handleDrop}
    //             onClick={() => fileInputRef.current?.click()}
    //         >
    //             <input
    //                 ref={fileInputRef}
    //                 type="file"
    //                 accept="image/*"
    //                 onChange={handleFileSelect}
    //                 className="hidden"
    //             />

    //             {preview ? (
    //                 <div className="relative">
    //                     <img
    //                         src={preview}
    //                         alt="Preview"
    //                         className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
    //                     />
    //                     <button
    //                         onClick={(e) => {
    //                             e.stopPropagation();
    //                             handleClearSelection();
    //                         }}
    //                         className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
    //                     >
    //                         <X size={16} />
    //                     </button>
    //                 </div>
    //             ) : (
    //                 <div className="space-y-4">
    //                     <div className="flex justify-center">
    //                         <FileImage size={48} className="text-gray-400" />
    //                     </div>
    //                     <div>
    //                         <p className="text-lg font-medium text-gray-700">
    //                             Click to upload or drag and drop
    //                         </p>
    //                         <p className="text-sm text-gray-500 mt-1">
    //                             JPEG, PNG, GIF, or WebP (max 5MB)
    //                         </p>
    //                     </div>
    //                 </div>
    //             )}
    //         </div>

    //         {/* Error Message */}
    //         {error && (
    //             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    //                 <p className="text-red-600 text-sm">{error}</p>
    //             </div>
    //         )}

    //         {/* Upload Button */}
    //         {selectedFile && (
    //             <div className="mt-6 flex gap-3">
    //                 <button
    //                     onClick={handleUpload}
    //                     disabled={uploading}
    //                     className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
    //                 >
    //                     {uploading ? (
    //                         <>
    //                             <Loader2 size={20} className="animate-spin" />
    //                             Uploading...
    //                         </>
    //                     ) : (
    //                         <>
    //                             <Upload size={20} />
    //                             Upload Image
    //                         </>
    //                     )}
    //                 </button>

    //                 <button
    //                     onClick={handleClearSelection}
    //                     disabled={uploading}
    //                     className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    //                 >
    //                     Clear
    //                 </button>
    //             </div>
    //         )}
    //     </div>
    // );
    return <>
        Test
    </>
};

export default Test;