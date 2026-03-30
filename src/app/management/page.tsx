'use client';
import React, { useState } from 'react';
import {
    Menu,
    FileText,
    Folder,
    AlertTriangle,
    Settings,
    Bell,
    User,
    ChevronDown,
    Users,
    BookText,
    BookOpen,
    PanelLeftClose,
    PanelLeft,
    Lightbulb,
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import Category from '@/features/categories/components/management/Category';
import CourseCategory from '@/features/categories/components/management/CourseCategory';
import Topic from '@/features/topics/components/management/Topic';
import Post from '@/features/ideas/components/management/Post';
import Report from './Report';
import UserList from '@/features/users/components/UserList';
import LoadingComponent from '@/components/common/Loading';
import loadingStore from '@/store/LoadingStore';
import Notification from '@/components/common/Notification';
import Series from '@/features/series/components/management/Series';
import Courses from '@/features/series/components/management/Courses';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('categories');
    const isLoading = loadingStore(state => state.isLoading);

    const menuItems = [
        { id: 'categories', label: 'Danh mục', icon: Folder },
        { id: 'topics', label: 'Chủ đề', icon: Lightbulb },
        { id: 'posts', label: 'Ý tưởng/Bài viết', icon: FileText },
        { id: 'users', label: 'Người dùng', icon: Users },
        { id: 'series', label: 'Series', icon: BookText },
        { id: 'courses', label: 'Khóa học', icon: BookOpen },
        { id: 'course-categories', label: 'Danh mục khoá học', icon: Folder },
        { id: 'reports', label: 'Báo cáo vi phạm', icon: AlertTriangle },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <Category />
            case 'topics':
                return <Topic />
            case 'posts':
                return <Post />
            case 'users':
                return <UserList />
            case 'reports':
                return <Report />
            case 'series':
                return <Series />;
            case 'courses':
                return <Courses />;
            case 'course-categories':
                return <CourseCategory />;
            default:
                return <div className="text-gray-500 text-sm">Chọn một mục từ menu</div>;
        }
    };

    return (
        <div className="flex h-screen bg-admin-bg">
            <Notification />

            {/* Sidebar */}
            <aside
                className={`
                    ${sidebarOpen ? 'w-64' : 'w-[72px]'} 
                    bg-white border-r border-gray-200 
                    transition-all duration-300 ease-in-out
                    flex flex-col flex-shrink-0
                    max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40
                    ${!sidebarOpen ? 'max-md:-translate-x-full' : ''}
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 flex-shrink-0">
                    <div className="w-9 h-9 bg-admin-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Logo size={20} className="text-white" />
                    </div>
                    {sidebarOpen && (
                        <div className="min-w-0">
                            <h1 className="font-bold text-base text-gray-900 truncate">OpenIdear</h1>
                            <p className="text-[11px] text-gray-400 font-medium">Admin Panel</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 px-3 overflow-y-auto">
                    <div className="space-y-0.5">
                        {menuItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                                        transition-all duration-150 text-[13.5px] font-medium
                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary-ring
                                        ${isActive
                                            ? 'bg-indigo-100/70 text-admin-primary border-l-[3px] border-admin-primary pl-[9px]'
                                            : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900 border-l-[3px] border-transparent pl-[9px]'
                                        }
                                    `}
                                    title={!sidebarOpen ? item.label : undefined}
                                >
                                    <item.icon size={18} className={isActive ? 'text-admin-primary' : 'text-gray-400'} />
                                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom section */}
                <div className="border-t border-gray-100 p-3 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors text-[13.5px] font-medium"
                        title={sidebarOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
                    >
                        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                        {sidebarOpen && <span>Thu gọn</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/30 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors md:hidden"
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                                {menuItems.find(item => item.id === activeTab)?.label}
                            </h2>
                            <p className="text-xs text-gray-400 hidden sm:block">
                                Quản lý và theo dõi {menuItems.find(item => item.id === activeTab)?.label.toLowerCase()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <button
                            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary-ring"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                        </button>

                        {/* User menu */}
                        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-200">
                            <div className="w-8 h-8 bg-admin-primary-light rounded-full flex items-center justify-center">
                                <User size={16} className="text-admin-primary" />
                            </div>
                            <button className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                                <span>Admin</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    <LoadingComponent isLoading={isLoading} />
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;