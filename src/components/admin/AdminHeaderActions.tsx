"use client";

// =============================================================================
//  ADMIN HEADER ACTIONS — NOTIFICATIONS & USER PROFILE MENU
//  src/components/admin/AdminHeaderActions.tsx
//
//  Design Decisions:
//  - Fully functional notifications popover with unread badge, filtering,
//    mark-as-read, clear, and direct navigation links.
//  - Interactive Admin user profile dropdown featuring:
//    * User identity (name, email, avatar, Administrator badge)
//    * Quick administrative links (Management, Content Studio, Editor, Shop)
//    * Profile & Settings shortcuts
//    * Main website / storefront access
//    * Live theme switcher (Light / Dark / System)
//    * Secure sign-out action with token clearance and toast confirmation
// =============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Bell,
  User,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  FileEdit,
  Globe,
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Check,
  ShoppingBag,
  AlertTriangle,
  FileText,
  Clock,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import authenticationStore from "@/store/AuthenticationStore";
import { ENV } from "@/api/const";
import axios from "axios";

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "content" | "order" | "report" | "system";
  link?: string;
}

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-1",
    type: "content",
    title: "AI Content Studio Draft Ready",
    description: "Article draft 'The Ultimate Beginner's Guide to Building Your First Gaming PC' is compiled and ready for review.",
    time: "5m ago",
    unread: true,
    link: "/management/content-studio",
  },
  {
    id: "notif-2",
    type: "order",
    title: "New Shop Inquiry / Order",
    description: "Order #ORD-2026-8849 received and awaiting processing & confirmation.",
    time: "25m ago",
    unread: true,
    link: "/management",
  },
  {
    id: "notif-3",
    type: "report",
    title: "Violation Report Submitted",
    description: "1 community report has been submitted and is pending moderation.",
    time: "1h ago",
    unread: false,
    link: "/management",
  },
  {
    id: "notif-4",
    type: "system",
    title: "System & AI Pipeline Status",
    description: "AI Writer and content transformers are healthy with normal latency.",
    time: "3h ago",
    unread: false,
  },
];

interface AdminHeaderActionsProps {
  onSelectTab?: (tabId: string) => void;
  className?: string;
}

export function AdminHeaderActions({ onSelectTab, className = "" }: AdminHeaderActionsProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const currentUser = authenticationStore((state) => state.currentUser);

  const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Fetch current user if not populated yet
  useEffect(() => {
    const fetchUser = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token || currentUser?._id) return;

      try {
        const rootApi = ENV?.ROOT_API || "http://localhost:5001";
        const res = await axios.get(`${rootApi}/auth/getProfile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.userInfo) {
          authenticationStore.getState().setCurrentUser(res.data.userInfo);
        }
      } catch {
        // Fallback gracefully in dev mode
      }
    };

    fetchUser();
  }, [currentUser?._id]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications =
    notifFilter === "unread" ? notifications.filter((n) => n.unread) : notifications;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read.");
  };

  const handleNotificationClick = (notif: AdminNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setIsNotifOpen(false);

    if (notif.link) {
      if (notif.link === "/management" && onSelectTab) {
        if (notif.type === "order") {
          onSelectTab("shop-orders");
        } else if (notif.type === "report") {
          onSelectTab("reports");
        } else {
          onSelectTab("posts");
        }
      } else {
        router.push(notif.link);
      }
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      authenticationStore.setState({
        currentUser: {
          _id: "",
          username: "",
          name: "",
          email: "",
          role: 0,
          activate: false,
          createdAt: new Date(),
          bio: "",
          background: "",
          avatar: "",
        },
      });
      toast.success("Successfully logged out.");
      setIsUserMenuOpen(false);
      window.location.href = "/";
    } catch (e) {
      console.warn("Logout error:", e);
      router.push("/");
    }
  };

  const displayName = currentUser?.name || currentUser?.username || "Admin";
  const displayEmail = currentUser?.email || "admin@openidear.com";
  const avatarUrl = currentUser?.avatar || "";

  const getNotifIcon = (type: AdminNotification["type"]) => {
    switch (type) {
      case "content":
        return <Sparkles className="w-4 h-4 text-primary" />;
      case "order":
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case "report":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* ── NOTIFICATIONS DROPDOWN ────────────────────────────────────────── */}
      <DropdownMenu open={isNotifOpen} onOpenChange={setIsNotifOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 group"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={19} className="transition-transform group-hover:rotate-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-card"></span>
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-80 sm:w-96 p-0 rounded-2xl border border-border shadow-xl bg-card text-foreground overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-border/70 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={12} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 border-b border-border/40">
            <button
              type="button"
              onClick={() => setNotifFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                notifFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setNotifFilter("unread")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                notifFilter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-border/40">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                <Bell className="w-6 h-6 mx-auto opacity-30 mb-2" />
                <p className="font-medium">No notifications</p>
                <p className="text-[11px] text-muted-foreground/80">You are all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-3.5 px-4 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                    notif.unread ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-xs leading-snug truncate ${notif.unread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                        {notif.title}
                      </p>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-1">
                      {notif.description}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      {notif.time}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 px-4 bg-muted/20 border-t border-border/60 text-center">
            <Link
              href="/management"
              onClick={() => setIsNotifOpen(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View management dashboard</span>
              <ExternalLink size={11} />
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── USER PROFILE MENU ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 ml-1 pl-3 border-l border-border">
        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-muted/80 text-foreground transition-all border border-transparent hover:border-border/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer group"
              title="Open Admin Account Panel"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-primary" />
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-primary" />
                  Admin
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-muted-foreground group-hover:text-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 p-1.5 rounded-2xl border border-border shadow-xl bg-card text-foreground"
          >
            {/* Header Identity Card */}
            <div className="p-3 bg-muted/40 rounded-xl mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                  {displayEmail}
                </p>
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck size={10} />
                    Administrator
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Quick Management Shortcuts */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/management"
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <LayoutDashboard size={15} className="text-muted-foreground" />
                  <span>Dashboard Overview</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/management/content-studio"
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={15} className="text-primary" />
                    <span>AI Content Studio</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary">
                    AI
                  </span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileEdit size={15} className="text-muted-foreground" />
                    <span>Create New Post</span>
                  </div>
                  <ExternalLink size={12} className="text-muted-foreground/60" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Account & Profile */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={`/profile/${currentUser?.username || "admin"}`}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <User size={15} className="text-muted-foreground" />
                  <span>Public Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/profile/settings"
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Settings size={15} className="text-muted-foreground" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe size={15} className="text-muted-foreground" />
                    <span>Back to Main Site</span>
                  </div>
                  <ExternalLink size={12} className="text-muted-foreground/60" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Theme Toggle Group */}
            <div className="px-2.5 py-2">
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                Appearance
              </span>
              <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    theme === "light"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Light mode"
                >
                  <Sun size={12} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Dark mode"
                >
                  <Moon size={12} />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    theme === "system"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="System preference"
                >
                  <Monitor size={12} />
                  <span>System</span>
                </button>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Logout Action */}
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut size={15} />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default AdminHeaderActions;
