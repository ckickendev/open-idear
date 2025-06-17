import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import convertDate from "@/common/datetime";
import authenticationStore from "@/store/AuthenticationStore";
import loadingStore from '@/store/LoadingStore';
import axios from 'axios';
import alertStore from '@/store/AlertStore';

// Zod schema for validation
const profileSchema = z.object({
    name: z.string().min(1, "Tên không được để trống").max(100, "Tên không được quá 100 ký tự"),
    bio: z.string().max(500, "Tiểu sử không được quá 500 ký tự").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileInformation = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const changeLoad = loadingStore((state) => state.changeLoad);
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const currentUser = authenticationStore((state) => state.currentUser);
    const updateCurrentUser = authenticationStore((state) => state.updateCurrentUser);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentUser?.name || '',
            bio: currentUser?.bio || '',
        }
    });

    const handleEdit = () => {
        setIsEditing(true);
        // Reset form with current user data
        reset({
            name: currentUser?.name || '',
            bio: currentUser?.bio || '',
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        reset(); // Reset to original values
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        try {
            changeLoad();
            const token = localStorage.getItem("access_token");
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/updateProfile`, {
                    data
                });
                console.log("ressss");

                if (res.status == 200) {
                    setType('info');
                    setMessage('Update successfully');
                    updateCurrentUser({ bio: data.bio, name: data.name })
                }
            } else {
                setType('error');
                setMessage("Error !");
            }
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || error?.message);
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
            changeLoad();
        }
    };

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="w-full mx-auto p-6 bg-white">
                    {/* Header */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-8">Your information</h1>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Profile Information */}
                        <div className="space-y-6">
                            {/* Registration Date - Read only */}
                            <div className="flex items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium w-1/4">Ngày đăng ký</span>
                                <span className="text-gray-800">{convertDate(currentUser.createdAt.toString())}</span>
                            </div>

                            {/* Name */}
                            <div className="flex items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium w-1/4">Họ Tên</span>
                                {isEditing ? (
                                    <div className="flex-1">
                                        <input
                                            {...register('name')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            type="text"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-800">{currentUser.name}</span>
                                )}
                            </div>

                            {/* Username */}
                            <div className="flex items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium w-1/4">Tên người dùng</span>
                                {isEditing ? (
                                    <div className="flex-1">
                                        <input
                                            readOnly
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                                            type="text"
                                            value={currentUser.username?.toString()}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-800">{currentUser.username}</span>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium w-1/4">Email</span>
                                {isEditing ? (
                                    <div className="flex-1">
                                        <input
                                            readOnly
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                                            type="email"
                                            value={currentUser.email?.toString()}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-blue-600">{currentUser.email}</span>
                                )}
                            </div>

                            {/* Biography */}
                            <div className="flex items-start py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium w-1/4 pt-2">Tiểu sử</span>
                                {isEditing ? (
                                    <div className="flex-1">
                                        <textarea
                                            {...register('bio')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                            placeholder="Nhập tiểu sử của bạn..."
                                        />
                                        {errors.bio && (
                                            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-400">{currentUser.bio || "---"}</span>
                                )}
                            </div>

                            {/* Account Status - Read only */}
                            <div className="flex items-center py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium w-1/4">Trạng thái tài khoản</span>
                                <span className="text-gray-400">{currentUser.activate ? "Đã kích hoạt" : "Chưa kích hoạt"}</span>
                            </div>
                        </div>

                        {/* Action Buttons for Edit Mode */}
                        {isEditing && (
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Membership Section */}
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Thông Tin Gói Hội Viên</h2>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <p className="text-gray-600 mb-4">Bạn chưa đăng ký gói hội viên nào.</p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                                    Đăng ký gói hội viên
                                </button>

                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    disabled={isEditing}
                                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 font-medium py-3 px-6 rounded-lg transition-colors"
                                >
                                    {isEditing ? 'Đang chỉnh sửa...' : 'Chỉnh sửa hồ sơ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileInformation;