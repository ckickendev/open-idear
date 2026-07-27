import React, { useState } from "react";
import { ListTree, ChevronDown, ChevronUp } from "lucide-react";
import { useHeadingOutline, type HeadingItem } from "../hooks/useHeadingOutline";

interface StickyOutlineNavProps {
  readonly html?: string;
  readonly outlinePlan?: Array<{ title: string; level: number; description?: string }>;
  readonly title?: string;
  readonly className?: string;
  readonly onHeadingClick?: (heading: HeadingItem) => void;
  readonly defaultCollapsed?: boolean;
}

export const StickyOutlineNav: React.FC<StickyOutlineNavProps> = ({
  html = "",
  outlinePlan,
  title = "Xem nhanh",
  className = "",
  onHeadingClick,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const { headings, activeId, scrollToHeading } = useHeadingOutline({
    html,
    outlinePlan,
  });

  if (!headings || headings.length === 0) {
    return null;
  }

  const handleClick = (item: HeadingItem) => {
    scrollToHeading(item.id);
    if (onHeadingClick) {
      onHeadingClick(item);
    }
  };

  return (
    <div
      className={`sticky top-6 z-20 w-full max-w-xs transition-all duration-200 ease-out ${className}`}
    >
      <div className="flex flex-col bg-[var(--color-editor-surface,white)] border border-[var(--color-editor-border,#e4e4e7)] rounded-2xl shadow-sm overflow-hidden p-4 sm:p-5">
        {/* Header Block with Title & Icon Badge */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-[var(--color-editor-text,#090d16)] tracking-tight">
            {title}
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              title={isCollapsed ? "Mở rộng mục lục" : "Thu gọn mục lục"}
            >
              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {/* Icon Badge matching screenshot design */}
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 shadow-xs">
              <ListTree size={18} strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Collapsible Items List */}
        {!isCollapsed && (
          <nav className="flex flex-col gap-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 text-sm font-sans custom-scrollbar">
            {headings.map((item, idx) => {
              const isActive = activeId === item.id;
              const isH3 = item.level === 3;
              const isH4 = item.level >= 4;

              return (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => handleClick(item)}
                  className={`group text-left transition-all duration-150 rounded-lg cursor-pointer flex items-start gap-2 ${
                    isH4
                      ? "pl-8 text-xs text-slate-500 dark:text-slate-400"
                      : isH3
                      ? "pl-5 text-xs text-slate-600 dark:text-slate-300"
                      : "pl-1.5 text-sm font-medium text-slate-800 dark:text-slate-100"
                  } ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-blue-500 py-1 pr-2"
                      : "hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 py-0.5"
                  }`}
                >
                  <span className="leading-snug flex-1 break-words">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default StickyOutlineNav;
