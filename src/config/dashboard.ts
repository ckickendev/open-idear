import {
  Folder,
  Lightbulb,
  FileText,
  Users,
  BookText,
  BookOpen,
  AlertTriangle,
  Settings,
} from "lucide-react";

/**
 * Dashboard navigation configuration.
 * Single source of truth for admin sidebar items.
 */
export const dashboardNavItems = [
  { id: "categories", label: "Danh mục", icon: Folder },
  { id: "topics", label: "Chủ đề", icon: Lightbulb },
  { id: "posts", label: "Ý tưởng/Bài viết", icon: FileText },
  { id: "users", label: "Người dùng", icon: Users },
  { id: "series", label: "Series", icon: BookText },
  { id: "courses", label: "Khóa học", icon: BookOpen },
  { id: "course-categories", label: "Danh mục khoá học", icon: Folder },
  { id: "reports", label: "Báo cáo vi phạm", icon: AlertTriangle },
  { id: "settings", label: "Cài đặt", icon: Settings },
] as const;

export type DashboardNavItem = (typeof dashboardNavItems)[number];
export type DashboardTabId = DashboardNavItem["id"];
