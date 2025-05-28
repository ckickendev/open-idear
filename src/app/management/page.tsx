'use client';
import React, { useState, useEffect } from 'react';
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

} from 'lucide-react';
import Logo from '@/component/common/Logo';
import Category from './Category';
import Post from './Post';
import Report from './Report';
import UserList from './UserList';
import LoadingComponent from '@/component/common/Loading';
import loadingStore from '@/store/LoadingStore';
import Notification from '@/component/common/Notification';
import alertStore from '@/store/AlertStore';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('categories');
    const isLoading = loadingStore(state => state.isLoading);

    const menuItems = [
        { id: 'categories', label: 'Danh mục', icon: Folder },
        { id: 'posts', label: 'Ý tưởng/Bài viết', icon: FileText },
        { id: 'users', label: 'Người dùng', icon: Users },
        { id: 'reports', label: 'Báo cáo vi phạm', icon: AlertTriangle },
        { id: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <Category />
            case 'posts':
                return <Post />
            case 'users':
                return <UserList />
            case 'reports':
                return <Report />
            default:
                return <div>Chọn một mục từ menu</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Notification />
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Logo size={24} className="text-white" />
                        </div>
                        {sidebarOpen && (
                            <div>
                                <h1 className="font-bold text-lg text-gray-900">OpenIdear</h1>
                                <p className="text-xs text-gray-500">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === item.id
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {menuItems.find(item => item.id === activeTab)?.label}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium">Admin</span>
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <LoadingComponent isLoading={isLoading} />
                    {renderContent()}
                </main>
            </div>

            {/* Modal */}

        </div>
    );
};

export default AdminDashboard;