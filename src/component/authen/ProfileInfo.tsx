// ProfilePage.tsx
import React from 'react';
import Image from 'next/image';
import { CheckCircle, Edit, ChevronRight, X } from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';

const ProfileInfo = () => {

    const authenUser = authenticationStore((state) => state.currentUser);
    return (
        <div className="w-full bg-white rounded-lg shadow">
            {/* Cover Image & Profile Section */}
            <div className="relative">
                <div className="w-full h-100 bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div className="opacity-80">
                            <div className="bg-black flex items-center justify-center">
                                <img
                                    src="https://codetheweb.blog/assets/img/posts/css-advanced-background-images/cover.jpg"
                                    alt="cover-image"
                                    className="object-fill w-full h-100"
                                />
                            </div>
                        </div>
                    </div>
                    <button className="absolute bottom-2 right-2 bg-amber-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium cursor-pointer hover:bg-amber-200">
                        <Edit size={16} /> Enhance cover image
                    </button>
                </div>

                <div className="absolute -bottom-30 left-6 flex items-center">
                    <div className="w-50 h-50 rounded-full border-4 border-white relative overflow-hidden">
                        <img src={authenUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="pt-14 px-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">{authenUser.username}</h1>
                                <p className="text-gray-700">{authenUser.email}</p>
                                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                    <span>{authenUser.bio ?? "No bio"}</span>
                                    <span className="mx-1">·</span>
                                    <span className="text-blue-600 hover:underline cursor-pointer ">
                                        <a href={"/my-info"} className='text-red-800'>
                                            Edit contact info
                                        </a>
                                    </span>
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