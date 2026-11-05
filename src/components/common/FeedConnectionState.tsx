"use client";

// =============================================================================
//  FEED CONNECTION STATE & RESILIENCY INDICATORS
//  src/components/common/FeedConnectionState.tsx
//
//  Design Decisions:
//  - Replaces stark, demoralizing "No posts found" empty states when backend
//    times out or server is spinning up (cold starts).
//  - Offers reassuring copy explaining the system is actively working/waking up.
//  - Provides an interactive "Try Again" button with live spinner feedback.
//  - Supports both full-width section mode and compact sidebar widget mode.
//  - Fully bilingual (English / Vietnamese) matching OpenIdear tokens and themes.
// =============================================================================

import React from "react";
import Link from "next/link";
import { Radio, RefreshCw, AlertCircle, Sparkles, PenSquare, WifiOff } from "lucide-react";

export type FeedConnectionStatus = "timeout" | "error" | "empty" | "connecting";

interface FeedConnectionStateProps {
  status: FeedConnectionStatus;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  activeLocale?: string;
  compact?: boolean;
  customTitle?: string;
  customMessage?: string;
  actionHref?: string;
  actionText?: string;
  className?: string;
}

export const FeedConnectionState: React.FC<FeedConnectionStateProps> = ({
  status,
  onRetry,
  isRetrying = false,
  activeLocale = "en",
  compact = false,
  customTitle,
  customMessage,
  actionHref,
  actionText,
  className = "",
}) => {
  const isVi = activeLocale === "vi";

  // ─── Compact Sidebar Variant ────────────────────────────────────────────────
  if (compact) {
    if (status === "empty") {
      return (
        <div className={`py-4 px-3 text-center rounded-xl bg-card/40 border border-border/40 ${className}`}>
          <p className="text-xs text-muted-foreground">
            {customMessage || (isVi ? "Chưa có nội dung." : "No content available yet.")}
          </p>
        </div>
      );
    }

    return (
      <div className={`py-4 px-3 text-center rounded-xl bg-card/60 border border-border/50 shadow-xs ${className}`}>
        <div className="relative inline-flex items-center justify-center mb-2">
          <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Radio size={14} className="animate-pulse text-primary" />
          </span>
        </div>
        <p className="text-xs font-semibold text-foreground tracking-tight mb-1">
          {customTitle || (isVi ? "Đang kết nối lại..." : "Reconnecting feed...")}
        </p>
        <p className="text-[10px] text-muted-foreground leading-snug mb-3">
          {customMessage || (isVi ? "Máy chủ phản hồi chậm hoặc đang khởi động" : "Server is taking longer to respond")}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-secondary hover:bg-accent text-secondary-foreground border border-border/60 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={11} className={isRetrying ? "animate-spin text-primary" : ""} />
            <span>{isRetrying ? (isVi ? "Đang thử lại..." : "Retrying...") : (isVi ? "Thử lại ngay" : "Retry Now")}</span>
          </button>
        )}
      </div>
    );
  }

  // ─── Full-width Section Variant ─────────────────────────────────────────────
  const isTimeoutOrConnecting = status === "timeout" || status === "connecting";
  const isError = status === "error";
  const isEmpty = status === "empty";

  // Dynamic titles and messages
  let title = customTitle;
  let message = customMessage;

  if (!title) {
    if (isTimeoutOrConnecting) {
      title = isVi ? "Đang kết nối với bảng tin..." : "Connecting to OpenIdear Feed...";
    } else if (isError) {
      title = isVi ? "Không thể tải danh sách bài viết" : "Unable to reach the feed";
    } else {
      title = isVi ? "Chưa có bài viết nào" : "No posts found yet";
    }
  }

  if (!message) {
    if (isTimeoutOrConnecting) {
      message = isVi
        ? "Máy chủ đang mất nhiều thời gian hơn bình thường để phản hồi (có thể đang khởi động). Chúng tôi đang tiếp tục kết nối lại."
        : "The server is taking longer than expected to respond (it may be waking up). We're keeping things ready for you.";
    } else if (isError) {
      message = isVi
        ? "Đã xảy ra sự cố khi đồng bộ bài viết mới. Vui lòng kiểm tra kết nối mạng hoặc thử lại."
        : "There was a problem syncing the latest feed. Check your connection or try again.";
    } else {
      message = isVi
        ? "Hãy là người đầu tiên chia sẻ kiến thức hoặc ý tưởng với cộng đồng!"
        : "Be the first to share your thoughts, guides, or ideas with the community!";
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 backdrop-blur-xs p-8 sm:p-12 text-center transition-all ${className}`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
        {/* Animated Status Icon */}
        {isTimeoutOrConnecting ? (
          <div className="relative inline-flex items-center justify-center mb-4">
            <span className="absolute w-14 h-14 rounded-full bg-primary/15 animate-ping opacity-75" />
            <span className="relative w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Radio size={22} className="animate-pulse" />
            </span>
          </div>
        ) : isError ? (
          <div className="relative inline-flex items-center justify-center mb-4">
            <span className="relative w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-xs">
              <WifiOff size={22} />
            </span>
          </div>
        ) : (
          <div className="relative inline-flex items-center justify-center mb-4">
            <span className="relative w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-xs">
              <Sparkles size={22} className="text-primary" />
            </span>
          </div>
        )}

        {/* Heading */}
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 font-normal">
          {message}
        </p>

        {/* Actions */}
        {isEmpty ? (
          <Link
            href={actionHref || (isVi ? "/vi/create" : "/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            <PenSquare size={14} />
            <span>{actionText || (isVi ? "Viết bài chia sẻ" : "Write a Post")}</span>
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} />
                <span>
                  {isRetrying
                    ? (isVi ? "Đang thử lại..." : "Reconnecting...")
                    : (isVi ? "Thử lại ngay" : "Try Again")}
                </span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isVi ? "Đang giữ trạng thái sẵn sàng" : "Standing by for connection"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Subtle Notice for Cached Fallback ────────────────────────────────────────
interface FeedCachedNoticeProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  activeLocale?: string;
  className?: string;
}

export const FeedCachedNotice: React.FC<FeedCachedNoticeProps> = ({
  onRetry,
  isRetrying = false,
  activeLocale = "en",
  className = "",
}) => {
  const isVi = activeLocale === "vi";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 backdrop-blur-xs transition-all ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>{isVi ? "Đang xem dữ liệu đã lưu · Máy chủ đang kết nối lại" : "Viewing saved feed · Server reconnecting"}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer ml-1 transition-colors"
        >
          <RefreshCw size={10} className={isRetrying ? "animate-spin" : ""} />
          <span>{isRetrying ? (isVi ? "Đang thử..." : "Retrying...") : (isVi ? "Thử lại" : "Refresh")}</span>
        </button>
      )}
    </div>
  );
};

// ─── Floating Live Status Cue for Skeletons ──────────────────────────────────
export interface FeedFloatingStatusProps {
  status: FeedConnectionStatus;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  activeLocale?: string;
  className?: string;
}

export const FeedFloatingStatus: React.FC<FeedFloatingStatusProps> = ({
  status,
  onRetry,
  isRetrying = false,
  activeLocale = "en",
  className = "",
}) => {
  const isVi = activeLocale === "vi";
  const [countdown, setCountdown] = React.useState(5);

  React.useEffect(() => {
    if (status === "empty") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (onRetry && !isRetrying) {
            onRetry();
          }
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onRetry, isRetrying]);

  if (status === "empty") return null;

  const isTimeout = status === "timeout" || status === "connecting";

  return (
    <div className={`my-4 flex items-center justify-center ${className}`}>
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card/90 dark:bg-card/95 backdrop-blur-md border border-border/70 shadow-lg shadow-primary/5 transition-all">
        {/* Pulsing indicator */}
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isTimeout ? "bg-amber-500" : "bg-rose-500"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isTimeout ? "bg-amber-500" : "bg-rose-500"
            }`}
          />
        </span>

        {/* Informative text */}
        <span className="text-xs font-medium text-foreground tracking-tight">
          {isRetrying
            ? isVi
              ? "Đang kết nối lại máy chủ..."
              : "Reconnecting to feed..."
            : isTimeout
            ? isVi
              ? `Máy chủ đang khởi động · Tự động thử lại sau ${countdown}s`
              : `Server waking up (cold start) · Auto-retrying in ${countdown}s`
            : isVi
            ? `Chưa kết nối được máy chủ · Thử lại sau ${countdown}s`
            : `Syncing latest feed · Retrying in ${countdown}s`}
        </span>

        {/* Retry button */}
        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry()}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              size={11}
              className={isRetrying ? "animate-spin text-primary" : ""}
            />
            <span>{isRetrying ? (isVi ? "Đang thử..." : "Connecting...") : (isVi ? "Thử ngay" : "Retry Now")}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedConnectionState;

