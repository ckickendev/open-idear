"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
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
} from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: number[]; // undefined = visible to all
}

const navItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/profile",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "posts",
    label: "My Posts",
    href: "/profile/posts",
    icon: <SquarePen size={20} />,
  },
  {
    id: "courses",
    label: "My Courses",
    href: "/profile/courses",
    icon: <BookOpen size={20} />,
  },
  {
    id: "saved",
    label: "Saved",
    href: "/profile/saved",
    icon: <Bookmark size={20} />,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/profile/analytics",
    icon: <BarChart3 size={20} />,
    roles: [1, 2],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/profile/settings",
    icon: <Settings size={20} />,
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const params = useParams();
  const usernameParam = params?.username as string | undefined;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUser = authenticationStore((state) => state.currentUser);
  const userRole = Number(currentUser?.role || 0);
  const isOwner =
    !usernameParam ||
    usernameParam.toLowerCase() === String(currentUser?.username).toLowerCase();

  let visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  if (!isOwner) {
    visibleItems = [
      {
        id: "overview",
        label: "Overview",
        href: `/profile/${usernameParam}`,
        icon: <LayoutDashboard size={20} />,
      },
    ];
  }

  const isActive = (href: string) => {
    if (!isOwner && usernameParam && href.includes(usernameParam)) return true;
    if (href === "/profile")
      return (
        pathname === "/profile" ||
        pathname === `/profile/${currentUser?.username}`
      );
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
              <li key={item.id} className="relative">
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-admin-primary)] rounded-r-full" />
                )}
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden relative ${
                    active
                      ? "bg-[var(--color-admin-primary-light)] dark:bg-indigo-900/30 text-[var(--color-admin-primary)] dark:text-indigo-300 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.02)]"
                      : "text-muted-foreground dark:text-muted-foreground hover:bg-muted/30 dark:hover:bg-accent/50 hover:text-foreground dark:hover:text-white hover:pl-4"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-admin-primary)]/10 to-transparent opacity-50" />
                  )}
                  <span
                    className={`relative z-10 flex-shrink-0 transition-all duration-300 ${
                      active
                        ? "text-[var(--color-admin-primary)] dark:text-indigo-400 scale-110"
                        : "text-muted-foreground dark:text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-muted-foreground/70"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="relative z-10 truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Gamification Widget */}
      {!collapsed && isOwner && (
        <div className="px-4 py-4 mx-2 mb-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100/50 dark:border-indigo-800/50">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-foreground/80 dark:text-muted-foreground/70">
              Level 5
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">
              120/500 XP
            </span>
          </div>
          <div className="w-full bg-background dark:bg-card rounded-full h-1.5 overflow-hidden shadow-inner">
            <div
              className="bg-[var(--color-admin-primary)] h-full rounded-full transition-all duration-1000"
              style={{ width: "24%" }}
            />
          </div>
        </div>
      )}

      {/* Collapse toggle (desktop) */}
      <div className="hidden lg:block px-3 py-4 border-t border-border dark:border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 px-3 py-2 w-full text-xs font-medium text-muted-foreground dark:text-muted-foreground hover:text-foreground/80 dark:hover:text-muted-foreground/70 rounded-lg hover:bg-muted/30 dark:hover:bg-accent/50 transition-colors cursor-pointer"
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
            className="absolute inset-0 bg-background/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background dark:bg-card shadow-2xl flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-border">
              <span className="text-sm font-bold text-foreground dark:text-white">
                Navigation
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 hover:bg-muted dark:hover:bg-accent rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col sticky top-6 h-fit bg-background dark:bg-card border border-border dark:border-border rounded-2xl shadow-sm transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
