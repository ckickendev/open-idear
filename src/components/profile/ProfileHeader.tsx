'use client';
import React, { useState } from 'react';
import { Edit, Camera, Shield, GraduationCap, User, X, Upload } from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';
import { CldUploadWidget } from 'next-cloudinary';
import axios from 'axios';
import alertStore from '@/store/AlertStore';
import loadingStore from '@/store/LoadingStore';

const roleConfig: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
    0: {
        label: 'Member',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        icon: <User size={12} />,
    },
    1: {
        label: 'Instructor',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        icon: <GraduationCap size={12} />,
    },
    2: {
        label: 'Admin',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        icon: <Shield size={12} />,
    },
};

const ProfileHeader: React.FC = () => {
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const [showBgUpload, setShowBgUpload] = useState(false);

    const currentUser = authenticationStore((state) => state.currentUser);
    const updateCurrentUser = authenticationStore((state) => state.updateCurrentUser);
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const role = roleConfig[Number(currentUser.role)] || roleConfig[0];

    const handleImageUpload = async (type: 'avatar' | 'background', url: string) => {
        try {
            changeLoad();
            const token = localStorage.getItem('access_token');
            if (!token) return;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/updateImage`, {
                [type]: url,
            });
            if (res.status === 200) {
                setType('info');
                setMessage('Updated successfully!');
                updateCurrentUser({ [type]: url });
                setShowAvatarUpload(false);
                setShowBgUpload(false);
            }
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || 'Upload failed');
        } finally {
            changeLoad();
        }
    };

    return (
        <div className="relative mb-8">
            {/* Cover Image */}
            <div className="relative h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
                {currentUser.background ? (
                    <img
                        src={currentUser.background}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
                        {/* Abstract pattern overlay */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>
                )}

                {/* Gradient overlay at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Change cover button */}
                <div className="absolute top-4 right-4">
                    {showBgUpload ? (
                        <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-2 shadow-lg">
                            <CldUploadWidget
                                signatureEndpoint="/api/image_upload"
                                onSuccess={(result, { widget }) => {
                                    if (typeof result?.info !== 'string' && result?.info?.url) {
                                        handleImageUpload('background', result.info.url);
                                    }
                                    widget.close();
                                }}
                            >
                                {({ open }) => (
                                    <button
                                        onClick={() => open()}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                                    >
                                        <Upload size={14} /> Upload
                                    </button>
                                )}
                            </CldUploadWidget>
                            <button
                                onClick={() => setShowBgUpload(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={14} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowBgUpload(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 text-xs font-medium rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm cursor-pointer"
                        >
                            <Camera size={14} /> Edit Cover
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Info Bar */}
            <div className="relative -mt-16 mx-4 sm:mx-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        {/* Avatar */}
                        <div className="relative -mt-16 sm:-mt-20 flex-shrink-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <img
                                    src={currentUser.avatar || '/icon/profile/hippo.png'}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Avatar edit button */}
                            <div className="absolute -bottom-1 -right-1">
                                {showAvatarUpload ? (
                                    <div className="absolute bottom-full right-0 mb-2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border border-gray-100 dark:border-gray-700 min-w-max">
                                        <CldUploadWidget
                                            signatureEndpoint="/api/image_upload"
                                            onSuccess={(result, { widget }) => {
                                                if (typeof result?.info !== 'string' && result?.info?.url) {
                                                    handleImageUpload('avatar', result.info.url);
                                                }
                                                widget.close();
                                            }}
                                        >
                                            {({ open }) => (
                                                <button
                                                    onClick={() => open()}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                                                >
                                                    <Upload size={14} /> Upload
                                                </button>
                                            )}
                                        </CldUploadWidget>
                                        <button
                                            onClick={() => setShowAvatarUpload(false)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : null}
                                <button
                                    onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                                    className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-md transition-colors cursor-pointer"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                    {currentUser.name || currentUser.username || 'User'}
                                </h1>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit ${role.color}`}>
                                    {role.icon} {role.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {String(currentUser.email)}
                            </p>
                            {currentUser.bio && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                                    {currentUser.bio}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                                href="/profile/settings"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                            >
                                <Edit size={14} /> Edit Profile
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
