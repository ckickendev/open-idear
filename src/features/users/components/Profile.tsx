"use client";

import { useState } from "react";
import {
  User,
  Settings,
  HelpCircle,
  Moon,
  MessageSquare,
  LogOut,
  ArrowLeft,
  Sun,
  Monitor,
  ShieldAlert,
  BadgeCheck,
  Mail,
  AlertTriangle,
} from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import ContributeModal from "./ContributeModal";

type Panel = "main" | "display" | "help";


export default function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("main");
  const [contributeOpen, setContributeOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const userInfo = authenticationStore((state) => state.currentUser);

  const logout = () => {
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
    setIsOpen(false);
    window.location.href = "/";
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setPanel("main");
  };

  const themeOptions = [
    {
      value: "light",
      label: "Off",
      icon: Sun,
      description: undefined,
    },
    {
      value: "dark",
      label: "On",
      icon: Moon,
      description: undefined,
    },
    {
      value: "system",
      label: "Automatic",
      icon: Monitor,
      description:
        "We'll automatically adjust the display based on your device system settings.",
    },
  ] as const;

  // ── Chevron SVG ──────────────────────────────────────────────────
  const ChevronRight = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  return (
    <div className="relative">
      {/* Avatar trigger */}
      <div className="relative cursor-pointer">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setPanel("main");
          }}
          className="w-10 h-10 relative rounded-full bg-accent flex items-center justify-center overflow-hidden border-2 border-green-400 hover:opacity-90"
        >
          <Image
            src={userInfo.avatar}
            alt="Profile avatar image"
            fill
            sizes="40px"
            className="cursor-pointer w-full h-full object-cover"
          />
        </button>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-bold rounded-full flex items-center justify-center text-[10px] leading-none z-10">
          1
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-2 min-w-72 max-w-80 bg-card text-card-foreground border border-border/50 rounded-lg shadow-lg absolute top-16 right-6 overflow-hidden z-50">
          {/* ── MAIN PANEL ────────────────────────────────── */}
          <div
            className="transition-all duration-200"
            style={{ display: panel === "main" ? "block" : "none" }}
          >
            {/* User info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-accent overflow-hidden flex-shrink-0">
                  <Image
                    src={userInfo.avatar}
                    alt="Profile avatar image"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-base font-semibold leading-tight text-foreground">
                    {userInfo.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userInfo.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href={`/profile/${userInfo.username}`}
                onClick={closeDropdown}
              >
                <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent text-foreground transition-colors cursor-pointer">
                  <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-muted-foreground/50" />
                  </span>
                  <span className="text-sm font-medium">Profile</span>
                </button>
              </Link>

              <Link href="/profile/settings" onClick={closeDropdown}>
                <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent text-foreground transition-colors cursor-pointer">
                  <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Settings size={18} className="text-muted-foreground/50" />
                  </span>
                  <span className="text-sm font-medium flex-1 text-left">
                    Settings & Privacy
                  </span>
                  <ChevronRight />
                </button>
              </Link>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPanel("help");
                }}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent text-foreground transition-colors cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <HelpCircle
                    size={18}
                    className="text-muted-foreground/50"
                  />
                </span>
                <span className="text-sm font-medium flex-1 text-left">
                  Help & Support
                </span>
                <ChevronRight />
              </button>

              {/* 🌙 Display & Accessibility — opens sub-panel */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPanel("display");
                }}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent text-foreground transition-colors cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Moon size={18} className="text-muted-foreground/50" />
                </span>
                <span className="text-sm font-medium flex-1 text-left">
                  Display &amp; Accessibility
                </span>
                <ChevronRight />
              </button>

              <button
                onClick={() => {
                  closeDropdown();
                  setContributeOpen(true);
                }}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent text-foreground transition-colors cursor-pointer"
              >
                  <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <MessageSquare
                      size={18}
                      className="text-muted-foreground/50"
                    />
                  </span>
                  <span className="text-sm font-medium">Feedback</span>
              </button>

              <button
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent text-foreground transition-colors cursor-pointer"
                onClick={logout}
              >
                <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <LogOut size={18} className="text-muted-foreground/50" />
                </span>
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
              <p>Privacy · Terms · Advertising · Cookies</p>
            </div>
          </div>

          {/* ── DISPLAY & ACCESSIBILITY SUB-PANEL ─────────── */}
          <div
            className="transition-all duration-200"
            style={{ display: panel === "display" ? "block" : "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-2 py-3 border-b border-border flex items-center gap-2">
              <button
                onClick={() => setPanel("main")}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent text-foreground transition-colors flex-shrink-0"
                aria-label="Back"
              >
                <ArrowLeft size={18} className="text-muted-foreground/50" />
              </button>
              <h3 className="text-base font-bold text-foreground">Display &amp; Accessibility</h3>
            </div>

            {/* Dark mode section */}
            <div className="px-4 pt-4 pb-2">
              {/* Section heading */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Moon size={22} className="text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    Dark Mode
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    Adjust the appearance of OpenIdear to reduce glare and give
                    your eyes a break.
                  </p>
                </div>
              </div>

              {/* Radio options */}
              <div className="space-y-0.5 mb-4">
                {themeOptions.map((opt) => {
                  const isSelected = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-accent text-foreground transition-colors cursor-pointer group"
                    >
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">
                          {opt.label}
                        </p>
                        {opt.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            {opt.description}
                          </p>
                        )}
                      </div>
                      {/* Custom radio circle */}
                      <div
                        className={`
  mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
  ${
    isSelected
      ? "border-primary bg-primary"
      : "border-border bg-transparent group-hover:border-border"
  }
  `}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
              <p>Privacy · Terms · Advertising · Cookies</p>
            </div>
          </div>

          {/* ── HELP & SUPPORT SUB-PANEL ─────────────────── */}
          <div
            className="transition-all duration-200"
            style={{ display: panel === "help" ? "block" : "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-2 py-3 border-b border-border flex items-center gap-2">
              <button
                onClick={() => setPanel("main")}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent text-foreground transition-colors flex-shrink-0"
                aria-label="Back"
              >
                <ArrowLeft size={18} className="text-muted-foreground/50" />
              </button>
              <h3 className="text-base font-bold text-foreground">Help & Support</h3>
            </div>

            {/* Help menu items */}
            <div className="py-1">
              {[
                {
                  href: "/help/trung-tam-tro-giup",
                  icon: HelpCircle,
                  label: "Help Center",
                },
                {
                  href: "/help/ngan-chan-lua-dao",
                  icon: ShieldAlert,
                  label: "Safety Center",
                },
                {
                  href: "/help/trang-thai-tai-khoan",
                  icon: BadgeCheck,
                  label: "Account Status",
                },
                {
                  href: "/help/hop-thu-ho-tro",
                  icon: Mail,
                  label: "Support Inbox",
                },
                {
                  href: "/help/bao-cao-su-co",
                  icon: AlertTriangle,
                  label: "Report a Problem",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDropdown}
                >
                  <button className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent text-foreground transition-colors cursor-pointer">
                    <span className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-muted-foreground/50" />
                    </span>
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.label}
                    </span>
                  </button>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 text-xs text-muted-foreground border-t border-border">
              <p>Privacy · Terms · Advertising · Cookies</p>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside overlay */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={closeDropdown} />}

      {/* Contribute Modal */}
      <ContributeModal
        isOpen={contributeOpen}
        onClose={() => setContributeOpen(false)}
      />
    </div>
  );
}
