"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Play,
  Loader2,
  AlertCircle,
  Lock,
  RefreshCw,
  Video,
  Film,
  VideoOff,
  ChevronRight,
} from "lucide-react";
import { courseApi } from "@/features/series/api/course.api";
import { BunnyPlaybackConfigResponse } from "@/features/series/types/course.types";

export interface BunnyPlayerRef {
  seek: (seconds: number) => void;
}

export interface BunnyPlayerProps {
  /** If provided, player fetches secure signed playback configuration from backend */
  lessonId?: string;
  /** Or directly provide embedUrl if already retrieved */
  embedUrl?: string;
  /** Fallback video GUID if direct embedding */
  videoId?: string;
  /** Fallback thumbnail poster URL */
  posterUrl?: string;
  /** Video title for aria labels */
  title?: string;
  autoplay?: boolean;
  className?: string;
  /** Callback when playback progress advances */
  onTimeUpdate?: (currentTime: number) => void;
  /** Callback with comprehensive progress and percentage */
  onProgress?: (progressData: { currentTime: number; duration: number; percent: number }) => void;
  /** Callback triggered once when playback crosses the completion threshold (e.g. >= 90%) or finishes */
  onAutoCompleted?: () => void;
  /** Playback completion ratio threshold between 0.1 and 1.0 (default 0.90) */
  completionThreshold?: number;
  /** Known total duration in seconds from lesson metadata */
  knownDuration?: number;
  /** Callback when video finishes playing */
  onEnded?: () => void;
  /** Callback for errors */
  onError?: (errorMessage: string) => void;
  /** Callback to advance to the next lesson */
  onGoToNext?: () => void;
}

type PlayerState = "idle" | "loading" | "ready" | "processing" | "failed" | "locked" | "empty";

export const BunnyPlayer = forwardRef<BunnyPlayerRef, BunnyPlayerProps>(function BunnyPlayer(
  {
    lessonId,
    embedUrl: propEmbedUrl,
    videoId: propVideoId,
    posterUrl: propPosterUrl,
    title = "Lecture Video",
    autoplay = false,
    className = "",
    onTimeUpdate,
    onProgress,
    onAutoCompleted,
    completionThreshold = 0.9,
    knownDuration,
    onEnded,
    onError,
    onGoToNext,
  },
  ref
) {
  const [playerState, setPlayerState] = useState<PlayerState>("loading");
  const [config, setConfig] = useState<BunnyPlaybackConfigResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTriggeredCompletionRef = useRef(false);

  // Reset completion trigger state and video error state when lessonId changes
  useEffect(() => {
    hasTriggeredCompletionRef.current = false;
    setVideoLoadError(false);
  }, [lessonId]);

  useImperativeHandle(ref, () => ({
    seek: (seconds: number) => {
      try {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
          return;
        }
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "seek", data: { time: seconds } }),
            "*"
          );
          iframeRef.current.contentWindow.postMessage(
            { event: "seek", data: { time: seconds } },
            "*"
          );
        }
      } catch (err) {
        console.warn("BunnyPlayer seek error:", err);
      }
    },
  }));

  // Fetch signed playback configuration from backend
  const fetchPlaybackConfig = useCallback(
    async (isManualRefresh = false) => {
      if (!lessonId) {
        if (propEmbedUrl) {
          setPlayerState("ready");
        } else {
          setPlayerState("empty");
        }
        return;
      }

      if (isManualRefresh) setIsRefreshing(true);

      try {
        const res = await courseApi.getBunnyPlayback(lessonId);

        if (!res.success) {
          const status = (res as any)?.status;
          if (status === 403 || (res as any)?.code === "LESSON_LOCKED") {
            setPlayerState("locked");
            setErrorMessage(res.message || "This lecture is locked. Enroll to access.");
            return;
          }
          throw new Error(res.message || "Unable to fetch playback authorization.");
        }

        const data: BunnyPlaybackConfigResponse = res.data?.data || res.data;

        setConfig(data);

        if (!data.isAuthorized) {
          setPlayerState("locked");
          setErrorMessage(data.message || "Enroll in course to view this lecture.");
        } else if (data.status === "failed" && !data.streamUrl) {
          setPlayerState("failed");
          setErrorMessage(data.message || "Video processing failed on provider.");
          onError?.(data.message || "Video processing failed.");
        } else if ((!data.isReady || data.status === "processing" || data.status === "uploaded") && !data.streamUrl) {
          setPlayerState("processing");
          setErrorMessage(data.message || "Video is currently encoding. Please check back shortly.");
        } else if (data.streamUrl || data.embedUrl) {
          setPlayerState("ready");
        } else {
          setPlayerState("empty");
        }
      } catch (err: any) {
        if (err.statusCode === 403 || err.response?.status === 403) {
          setPlayerState("locked");
          setErrorMessage("This lecture is locked. Enroll in the course to view.");
        } else {
          setPlayerState("failed");
          setErrorMessage(err.message || "Error retrieving playback stream.");
          onError?.(err.message || "Error retrieving playback stream.");
        }
      } finally {
        if (isManualRefresh) setIsRefreshing(false);
      }
    },
    [lessonId, propEmbedUrl, onError]
  );

  // Initial load
  useEffect(() => {
    fetchPlaybackConfig();

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchPlaybackConfig]);

  // Polling for processing videos
  useEffect(() => {
    if (playerState === "processing" && lessonId) {
      pollTimerRef.current = setInterval(() => {
        fetchPlaybackConfig();
      }, 8000); // Poll every 8s while processing
    } else if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [playerState, lessonId, fetchPlaybackConfig]);

  // Listen to postMessage events from the Bunny Stream iframe player
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Validate origin or payload structure
      if (!event.data) return;

      const data = typeof event.data === "string" ? safeJsonParse(event.data) : event.data;
      if (!data) return;

      const eventType = data.event || data.type || data.action;

      let currTime: number | null = null;
      let dur: number | null = typeof knownDuration === "number" && knownDuration > 0 ? knownDuration : null;

      if (typeof data.data?.currentTime === "number") currTime = data.data.currentTime;
      else if (typeof data.currentTime === "number") currTime = data.currentTime;

      if (typeof data.data?.duration === "number") dur = data.data.duration;
      else if (typeof data.duration === "number") dur = data.duration;

      if (currTime !== null && currTime >= 0) {
        onTimeUpdate?.(currTime);

        if (dur !== null && dur > 0) {
          const percent = Math.min(1, currTime / dur);
          onProgress?.({ currentTime: currTime, duration: dur, percent });

          if (percent >= completionThreshold && !hasTriggeredCompletionRef.current) {
            hasTriggeredCompletionRef.current = true;
            onAutoCompleted?.();
          }
        }
      }

      if (eventType === "error") {
        setVideoLoadError(true);
        onError?.(data.message || "Video stream error");
      }

      if (eventType === "ended") {
        if (!hasTriggeredCompletionRef.current) {
          hasTriggeredCompletionRef.current = true;
          onAutoCompleted?.();
        }
        onEnded?.();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onTimeUpdate, onProgress, onAutoCompleted, onEnded, onError, completionThreshold, knownDuration]);

  // Construct active embed URL
  let resolvedEmbedUrl = propEmbedUrl || config?.embedUrl || "";
  if (resolvedEmbedUrl && autoplay && !resolvedEmbedUrl.includes("autoplay=")) {
    resolvedEmbedUrl += (resolvedEmbedUrl.includes("?") ? "&" : "?") + "autoplay=true";
  }

  const activePoster = propPosterUrl || config?.thumbnailUrl || "";

  // ── Render Video Not Found / Missing State ────────────────────────────────
  const renderVideoNotFound = (customMessage?: string) => (
    <div
      className={`relative w-full h-full min-h-[320px] aspect-video bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
    >
      {/* Ambient Atmospheric Lighting */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      {/* Pulsing Sonar / Radar Wave Effect with VideoOff Icon */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-amber-500/10 animate-ping [animation-duration:2.5s] pointer-events-none" />
        <div className="absolute w-20 h-20 rounded-full bg-amber-500/15 animate-pulse [animation-duration:2s] pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 shadow-xl shadow-black/60 flex items-center justify-center backdrop-blur-md">
          <VideoOff className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
        </div>
      </div>

      {/* Status Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 mb-3 backdrop-blur-sm shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span>Video Chưa Khả Dụng • Not Found</span>
      </div>

      {/* Primary Headline */}
      <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-100 tracking-tight mb-2">
        Không Tìm Thấy Video Bài Giảng
      </h3>

      {/* Lesson Title Chip */}
      {title && (
        <div className="inline-flex items-center gap-2 max-w-lg px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 font-medium truncate mb-3 shadow-inner">
          <Film className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
      )}

      {/* Explanatory Description */}
      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        {customMessage ||
          errorMessage ||
          "Hệ thống không tìm thấy nguồn phát hoặc tệp video tương ứng cho bài học này trên máy chủ. Bạn có thể thử tải lại hoặc chuyển ngay sang bài tiếp theo để tiếp tục học tập."}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
        <button
          type="button"
          onClick={() => {
            setVideoLoadError(false);
            fetchPlaybackConfig(true);
          }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all border border-zinc-700 shadow-md cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Đang thử lại…" : "Thử tải lại"}</span>
        </button>

        {onGoToNext && (
          <button
            type="button"
            onClick={onGoToNext}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <span>Bài tiếp theo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  // ── Render States ──────────────────────────────────────────────────────────

  // 1. Video Load Error (e.g. video element failed to load or postMessage error)
  if (videoLoadError) {
    return renderVideoNotFound();
  }

  // 2. Loading State
  if (playerState === "loading") {
    return (
      <div
        className={`relative w-full h-full min-h-[220px] aspect-video bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 rounded-xl overflow-hidden ${className}`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
        <p className="text-xs font-medium tracking-wide">Loading video player…</p>
      </div>
    );
  }

  // 3. Processing State (Video is encoding on Bunny)
  if (playerState === "processing") {
    return (
      <div
        className={`relative w-full h-full min-h-[220px] aspect-video bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-100 rounded-xl overflow-hidden border border-zinc-800 ${className}`}
      >
        {activePoster && (
          <img
            src={activePoster}
            alt="Video Poster"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
          />
        )}
        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">Video is Processing</h4>
          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            {errorMessage || "Bunny Stream is optimizing and encoding this lecture for adaptive streaming."}
          </p>
          <button
            type="button"
            onClick={() => fetchPlaybackConfig(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer border border-zinc-700 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Checking…" : "Refresh Status"}
          </button>
        </div>
      </div>
    );
  }

  // 4. Failed State -> Render rich Video Not Found View
  if (playerState === "failed") {
    return renderVideoNotFound(errorMessage);
  }

  // 5. Locked / Unauthorized State
  if (playerState === "locked") {
    return (
      <div
        className={`relative w-full h-full min-h-[220px] aspect-video bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-100 rounded-xl overflow-hidden border border-zinc-800 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-zinc-400" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-100 mb-1">This Lecture is Locked</h4>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          {errorMessage || "Enroll in the course to unlock full access to this video lecture."}
        </p>
      </div>
    );
  }

  // 6. Empty State (No stream source) -> Render rich Video Not Found View
  if (playerState === "empty" || (!resolvedEmbedUrl && !config?.streamUrl)) {
    return renderVideoNotFound();
  }

  // 7. Direct / Local Stream Video Player
  if (config?.streamUrl) {
    return (
      <div
        className={`relative w-full h-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center ${className}`}
      >
        <video
          ref={videoRef}
          src={config.streamUrl}
          poster={activePoster}
          controls
          autoPlay={autoplay}
          playsInline
          className="w-full h-full object-contain"
          onError={(e) => {
            console.warn("Video stream load error event fired:", e);
            setVideoLoadError(true);
            onError?.("Video stream failed to load or file not found.");
          }}
          onTimeUpdate={(e) => {
            const curr = e.currentTarget.currentTime;
            const dur = e.currentTarget.duration || knownDuration || 0;
            onTimeUpdate?.(curr);
            if (dur > 0) {
              const percent = Math.min(1, curr / dur);
              onProgress?.({ currentTime: curr, duration: dur, percent });
              if (percent >= completionThreshold && !hasTriggeredCompletionRef.current) {
                hasTriggeredCompletionRef.current = true;
                onAutoCompleted?.();
              }
            }
          }}
          onEnded={() => {
            if (!hasTriggeredCompletionRef.current) {
              hasTriggeredCompletionRef.current = true;
              onAutoCompleted?.();
            }
            onEnded?.();
          }}
        />
      </div>
    );
  }

  // 7. Ready State — Embed Bunny Stream Player iframe
  return (
    <div
      className={`relative w-full h-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ${className}`}
    >
      <iframe
        ref={iframeRef}
        src={resolvedEmbedUrl}
        title={title}
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
});

function safeJsonParse(val: string): any {
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

export default BunnyPlayer;
