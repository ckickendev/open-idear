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
  { id: "categories", label: "Categories", icon: Folder },
  { id: "topics", label: "Topics", icon: Lightbulb },
  { id: "posts", label: "Ideas & Posts", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "series", label: "Series", icon: BookText },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "course-categories", label: "Course Categories", icon: Folder },
  { id: "reports", label: "Violation Reports", icon: AlertTriangle },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type DashboardNavItem = (typeof dashboardNavItems)[number];
export type DashboardTabId = DashboardNavItem["id"];
