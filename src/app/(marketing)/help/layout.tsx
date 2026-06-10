"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  ShieldAlert,
  BadgeCheck,
  Mail,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useState } from "react";

const HELP_NAV = [
  {
    href: "/help/trung-tam-tro-giup",
    icon: HelpCircle,
    label: "Trung tâm trợ giúp",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    href: "/help/ngan-chan-lua-dao",
    icon: ShieldAlert,
    label: "Trung tâm ngăn chặn hành vi lừa đảo",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  {
    href: "/help/trang-thai-tai-khoan",
    icon: BadgeCheck,
    label: "Trạng thái tài khoản",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/40",
  },
  {
    href: "/help/hop-thu-ho-tro",
    icon: Mail,
    label: "Hộp thư hỗ trợ",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    href: "/help/bao-cao-su-co",
    icon: AlertTriangle,
    label: "Báo cáo sự cố",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
];

function HelpSidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filtered = HELP_NAV.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-72 flex-shrink-0 hidden md:block">
      <div className="sticky top-6 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">Trợ giúp & Hỗ trợ</h2>
          <p className="text-xs text-muted-foreground mt-0.5">OpenIdear Help Center</p>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm trợ giúp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-muted rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground text-foreground"
            />
          </div>
        </div>

        {/* Nav items */}
        <nav className="py-2">
          {filtered.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? item.bg : "bg-muted group-hover:" + item.bg
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={isActive ? item.color : "text-muted-foreground"}
                    />
                  </span>
                  <span
                    className={`text-sm font-medium leading-tight ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">
              Không tìm thấy kết quả
            </p>
          )}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © 2024 OpenIdear · Tất cả quyền được bảo lưu
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Page header banner */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-violet-800 to-purple-700 py-10">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle size={28} className="text-white/80" />
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Trung tâm trợ giúp OpenIdear
            </h1>
          </div>
          <p className="text-white/70 text-sm md:text-base max-w-xl">
            Tìm câu trả lời, liên hệ hỗ trợ và quản lý tài khoản của bạn.
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8 items-start">
        <HelpSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
