'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Bookmark,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    SquarePen,
} from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: number[]; // undefined = visible to all
}

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', href: '/profile', icon: <LayoutDashboard size={20} /> },
    { id: 'posts', label: 'My Posts', href: '/profile/posts', icon: <SquarePen size={20} /> },
    { id: 'courses', label: 'My Courses', href: '/profile/courses', icon: <BookOpen size={20} /> },
    { id: 'saved', label: 'Saved', href: '/profile/saved', icon: <Bookmark size={20} /> },
    { id: 'analytics', label: 'Analytics', href: '/profile/analytics', icon: <BarChart3 size={20} />, roles: [1, 2] },
    { id: 'settings', label: 'Settings', href: '/profile/settings', icon: <Settings size={20} /> },
];

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const params = useParams();
    const usernameParam = params?.username as string | undefined;

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const currentUser = authenticationStore((state) => state.currentUser);
    const userRole = Number(currentUser?.role || 0);
    const isOwner = !usernameParam || usernameParam.toLowerCase() === String(currentUser?.username).toLowerCase();

    let visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(userRole));

    if (!isOwner) {
        visibleItems = [
            { id: 'overview', label: 'Overview', href: `/profile/${usernameParam}`, icon: <LayoutDashboard size={20} /> },
        ];
    }

    const isActive = (href: string) => {
        if (!isOwner && usernameParam && href.includes(usernameParam)) return true;
        if (href === '/profile') return pathname === '/profile' || pathname === `/profile/${currentUser?.username}`;
        return pathname.startsWith(href);
    };

    const SidebarContent = () => (
        <>
            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4">
                <ul className="space-y-1">
                    {visibleItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        active
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className={`flex-shrink-0 transition-colors ${
                                        active
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                    }`}>
                                        {item.icon}
                                    </span>
                                    {!collapsed && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                    {active && !collapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse toggle (desktop) */}
            <div className="hidden lg:block px-3 py-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-2 px-3 py-2 w-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center justify-center transition-colors cursor-pointer"
            >
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-2xl flex flex-col animate-slide-in-left">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Navigation</span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col sticky top-6 h-fit bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm transition-all duration-300 ${
                    collapsed ? 'w-[72px]' : 'w-64'
                }`}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
