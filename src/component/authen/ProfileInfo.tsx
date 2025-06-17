// ProfilePage.tsx
import React, { useState } from 'react';
import { Edit, Upload, X } from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';
import UploadImage from '../common/UploadImage';
import { CldUploadWidget } from 'next-cloudinary';
import axios from 'axios';
import { REACT_APP_ROOT_BACKEND } from './authentication';
import alertStore from '@/store/AlertStore';
import loadingStore from '@/store/LoadingStore';

const ProfileInfo = () => {
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);
    const updateCurrentUser = authenticationStore((state) => state.updateCurrentUser);
    const currentUser = authenticationStore((state) => state.currentUser);

    const handleBackgroundChangeClick = () => {
        setShowBackgroundUpload((state) => !state);
    };

    const handleProfileImageClick = () => {
        setShowAvatarUpload((state) => !state);
    };

    const handleCloseUpload = () => {
        if (showAvatarUpload) {
            setShowAvatarUpload((state) => !state);
        }
        if (showBackgroundUpload) {
            setShowBackgroundUpload((state) => !state);
        }
    };

    const handleUploadClick = () => {
        // Handle the actual upload logic here
        console.log(`Uploading image`);
        // You can integrate with your UploadImage component here
        // For example: trigger file input or open upload modal
    };

    return (
        <div className="w-full bg-white rounded-lg shadow">
            {/* Cover Image & Profile Section */}
            <div className="relative">
                <div className="w-full h-100 bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div className="opacity-80">
                            <div className="bg-black flex items-center justify-center">
                                <img
                                    src={currentUser.background}
                                    alt="cover-image"
                                    className="object-fill w-full h-100"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleBackgroundChangeClick}
                        className="absolute bottom-2 right-2 bg-amber-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium cursor-pointer hover:bg-amber-200"
                    >
                        <Edit size={16} /> Upload background image
                    </button>

                </div>

                {showBackgroundUpload && (
                    <div className='absolute -bottom-16 right-0 flex items-center p-2 justify-between bg-white border border-gray-400 rounded-xl shadow-lg z-10 min-w-max'>
                        <CldUploadWidget
                            signatureEndpoint="/api/image_upload"
                            onSuccess={async (result, { widget }) => {
                                console.log(result);
                                if (typeof result?.info !== 'string') {
                                    try {
                                        changeLoad();
                                        const token = localStorage.getItem("access_token");
                                        if (token) {
                                            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                                            const res = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/updateImage`, {
                                                background: result?.info?.url
                                            });
                                            if (res.status == 200) {
                                                setType('info');
                                                setMessage('Update successfully');
                                                updateCurrentUser({ background: result?.info?.url })
                                                setShowBackgroundUpload(false);
                                            }
                                        } else {
                                            setType('error');
                                            setMessage("Error !");
                                            changeLoad();
                                        }
                                    } catch (error: any) {
                                        setType('error');
                                        setMessage(error?.response?.data?.message || error?.message);
                                        changeLoad();
                                        console.error('Error fetching categories:', error);
                                    }
                                }
                                widget.close();
                            }}
                        >
                            {({ open }) => {
                                function handleOnClick() {
                                    open();
                                }
                                return (
                                    <div className="rounded-md w-full">
                                        <label htmlFor="upload" className="flex w-full items-center gap-2 cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-white stroke-indigo-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div className="text-gray-600 font-medium">Upload file</div>
                                        </label>
                                        <button onClick={handleOnClick} id="upload" className="hidden cursor-pointer" />
                                    </div>
                                );
                            }}
                        </CldUploadWidget>
                        <button
                            onClick={handleCloseUpload}
                            className='ml-2 p-1 hover:bg-gray-100 rounded transition-colors'
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="absolute -bottom-30 left-6 flex items-center">
                    <div className="w-50 h-50 rounded-full border-4 border-white relative hover:bg-sky-700">
                        <img
                            src={currentUser.avatar || "http://localhost:3000/icon/profile/hippo.png"}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full cursor-pointer"
                            onClick={handleProfileImageClick}
                        />

                        {showAvatarUpload && (
                            <div className='absolute w-full -bottom-16 left-0 flex items-center p-2 justify-between bg-white border border-gray-400 rounded-xl shadow-lg z-10 min-w-max'>
                                <CldUploadWidget
                                    signatureEndpoint="/api/image_upload"
                                    onSuccess={async (result, { widget }) => {
                                        console.log(result);
                                        if (typeof result?.info !== 'string') {
                                            try {
                                                changeLoad();
                                                const token = localStorage.getItem("access_token");
                                                if (token) {
                                                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                                                    const res = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/updateImage`, {
                                                        avatar: result?.info?.url
                                                    });
                                                    if (res.status == 200) {
                                                        setType('info');
                                                        setMessage('Update successfully');
                                                        updateCurrentUser({ avatar: result?.info?.url })
                                                        setShowAvatarUpload(false);
                                                    }
                                                } else {
                                                    setType('error');
                                                    setMessage("Authentication error !");
                                                    changeLoad();
                                                }
                                            } catch (error: any) {
                                                setType('error');
                                                setMessage(error?.response?.data?.message || error?.message)
                                                changeLoad();
                                                console.error('Error fetching categories:', error);
                                            }
                                        }
                                        widget.close();
                                    }}
                                >
                                    {({ open }) => {
                                        function handleOnClick() {
                                            console.log(1);

                                            open();

                                            console.log(2);

                                        }
                                        return (
                                            <div className="rounded-md w-full">
                                                <label htmlFor="upload" className="flex w-full items-center gap-2 cursor-pointer">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 fill-white stroke-indigo-500" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <div className="text-gray-600 font-medium">Upload file</div>
                                                </label>
                                                <button onClick={handleOnClick} id="upload" className="hidden cursor-pointer" />
                                            </div>
                                        );
                                    }}
                                </CldUploadWidget>
                                <button
                                    onClick={handleCloseUpload}
                                    className='ml-2 p-1 hover:bg-gray-100 rounded transition-colors'
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-14 px-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{currentUser.name ? currentUser.name : currentUser.username}</h1>
                                <p className="text-gray-700">{currentUser.email}</p>
                                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                    <span>{currentUser.bio ?? "No bio"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;