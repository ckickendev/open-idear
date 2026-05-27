'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, User, Lock, Bell, Save, X } from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';
import alertStore from '@/store/AlertStore';
import loadingStore from '@/store/LoadingStore';
import axios from 'axios';
import convertDate from '@/common/datetime';

// ─── Schemas ──────────────────────────────
const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
    bio: z.string().max(500, 'Max 500 characters').optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Minimum 6 characters'),
    newPassword: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string().min(6, 'Minimum 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Section Wrapper ──────────────────────
const SettingsSection: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {icon}
                </div>
                <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// ─── Field Row ────────────────────────────
const FieldRow: React.FC<{
    label: string;
    children: React.ReactNode;
    error?: string;
}> = ({ label, children, error }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 py-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 pt-2">{label}</label>
        <div className="sm:col-span-2">
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    </div>
);

// ─── Main Component ───────────────────────
export default function ProfileSettingsPage() {
    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        marketing: false,
    });

    const currentUser = authenticationStore((state) => state.currentUser);
    const updateCurrentUser = authenticationStore((state) => state.updateCurrentUser);
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const profileForm = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentUser?.name || '',
            bio: currentUser?.bio || '',
        },
    });

    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const handleProfileSave = async (data: ProfileForm) => {
        setSavingProfile(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/updateProfile`,
                { data }
            );
            if (res.status === 200) {
                setType('info');
                setMessage('Profile updated successfully!');
                updateCurrentUser({ name: data.name, bio: data.bio });
                setEditingProfile(false);
            }
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async (data: PasswordForm) => {
        setSavingPassword(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/user/changePassword`,
                { currentPassword: data.currentPassword, newPassword: data.newPassword }
            );
            if (res.status === 200) {
                setType('info');
                setMessage('Password updated successfully!');
                passwordForm.reset();
            }
        } catch (error: any) {
            setType('error');
            setMessage(error?.response?.data?.message || 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    const inputClass =
        'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500';
    const readonlyClass =
        'w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed';

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings size={24} className="text-indigo-600 dark:text-indigo-400" />
                    Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account preferences
                </p>
            </div>

            {/* Profile Information */}
            <SettingsSection
                icon={<User size={18} />}
                title="Profile Information"
                description="Update your personal details"
            >
                <form onSubmit={profileForm.handleSubmit(handleProfileSave)}>
                    <FieldRow label="Registration Date">
                        <input
                            type="text"
                            readOnly
                            className={readonlyClass}
                            value={convertDate(currentUser.createdAt?.toString() || '')}
                        />
                    </FieldRow>

                    <FieldRow label="Full Name" error={profileForm.formState.errors.name?.message}>
                        {editingProfile ? (
                            <input
                                {...profileForm.register('name')}
                                type="text"
                                className={inputClass}
                                placeholder="Your full name"
                            />
                        ) : (
                            <input type="text" readOnly className={readonlyClass} value={currentUser.name || ''} />
                        )}
                    </FieldRow>

                    <FieldRow label="Username">
                        <input
                            type="text"
                            readOnly
                            className={readonlyClass}
                            value={String(currentUser.username || '')}
                        />
                    </FieldRow>

                    <FieldRow label="Email">
                        <input
                            type="email"
                            readOnly
                            className={readonlyClass}
                            value={String(currentUser.email || '')}
                        />
                    </FieldRow>

                    <FieldRow label="Bio" error={profileForm.formState.errors.bio?.message}>
                        {editingProfile ? (
                            <textarea
                                {...profileForm.register('bio')}
                                className={`${inputClass} min-h-[80px] resize-none`}
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <div className={readonlyClass}>
                                {currentUser.bio || <span className="italic text-gray-400">No bio set</span>}
                            </div>
                        )}
                    </FieldRow>

                    <FieldRow label="Account Status">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                currentUser.activate
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${currentUser.activate ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {currentUser.activate ? 'Activated' : 'Not Activated'}
                        </span>
                    </FieldRow>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        {editingProfile ? (
                            <>
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                                >
                                    <Save size={14} />
                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingProfile(false);
                                        profileForm.reset({
                                            name: currentUser.name || '',
                                            bio: currentUser.bio || '',
                                        });
                                    }}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                                >
                                    <X size={14} /> Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingProfile(true);
                                    profileForm.reset({
                                        name: currentUser.name || '',
                                        bio: currentUser.bio || '',
                                    });
                                }}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </SettingsSection>

            {/* Change Password */}
            <SettingsSection
                icon={<Lock size={18} />}
                title="Change Password"
                description="Update your login credentials"
            >
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)}>
                    <FieldRow label="Current Password" error={passwordForm.formState.errors.currentPassword?.message}>
                        <input
                            {...passwordForm.register('currentPassword')}
                            type="password"
                            className={inputClass}
                            placeholder="••••••••"
                        />
                    </FieldRow>

                    <FieldRow label="New Password" error={passwordForm.formState.errors.newPassword?.message}>
                        <input
                            {...passwordForm.register('newPassword')}
                            type="password"
                            className={inputClass}
                            placeholder="••••••••"
                        />
                    </FieldRow>

                    <FieldRow label="Confirm Password" error={passwordForm.formState.errors.confirmPassword?.message}>
                        <input
                            {...passwordForm.register('confirmPassword')}
                            type="password"
                            className={inputClass}
                            placeholder="••••••••"
                        />
                    </FieldRow>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                        >
                            <Lock size={14} />
                            {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </SettingsSection>

            {/* Notification Preferences */}
            <SettingsSection
                icon={<Bell size={18} />}
                title="Notifications"
                description="Choose what updates you receive"
            >
                <div className="space-y-4">
                    {[
                        { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates about your courses and posts via email' },
                        { key: 'push' as const, label: 'Push Notifications', desc: 'Get instant alerts in your browser' },
                        { key: 'marketing' as const, label: 'Marketing Emails', desc: 'Tips, product updates, and promotional content' },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                                }
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                                    notifications[item.key]
                                        ? 'bg-indigo-600'
                                        : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                        notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </SettingsSection>
        </div>
    );
}
