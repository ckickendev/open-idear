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
  },
  ref
) {
  const [playerState, setPlayerState] = useState<PlayerState>("loading");
  const [config, setConfig] = useState<BunnyPlaybackConfigResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasTriggeredCompletionRef = useRef(false);

  // Reset completion trigger state when lessonId changes
  useEffect(() => {
    hasTriggeredCompletionRef.current = false;
  }, [lessonId]);

  useImperativeHandle(ref, () => ({
    seek: (seconds: number) => {
      try {
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
        } else if (data.status === "failed") {
          setPlayerState("failed");
          setErrorMessage(data.message || "Video processing failed on provider.");
          onError?.(data.message || "Video processing failed.");
        } else if (!data.isReady || data.status === "processing" || data.status === "uploaded") {
          setPlayerState("processing");
          setErrorMessage(data.message || "Video is currently encoding. Please check back shortly.");
        } else if (data.embedUrl) {
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
  }, [onTimeUpdate, onProgress, onAutoCompleted, onEnded, completionThreshold, knownDuration]);

  // Construct active embed URL
  let resolvedEmbedUrl = propEmbedUrl || config?.embedUrl || "";
  if (resolvedEmbedUrl && autoplay && !resolvedEmbedUrl.includes("autoplay=")) {
    resolvedEmbedUrl += (resolvedEmbedUrl.includes("?") ? "&" : "?") + "autoplay=true";
  }

  const activePoster = propPosterUrl || config?.thumbnailUrl || "";

  // ── Render States ──────────────────────────────────────────────────────────

  // 1. Loading State
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

  // 2. Processing State (Video is encoding on Bunny)
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

  // 3. Failed State
  if (playerState === "failed") {
    return (
      <div
        className={`relative w-full h-full min-h-[220px] aspect-video bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-100 rounded-xl overflow-hidden border border-rose-900/40 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-100 mb-1">Playback Unavailable</h4>
        <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
          {errorMessage || "Could not play this video. Please contact course support or re-upload."}
        </p>
        <button
          type="button"
          onClick={() => fetchPlaybackConfig(true)}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors border border-zinc-700 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 4. Locked / Unauthorized State
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

  // 5. Empty State
  if (playerState === "empty" || !resolvedEmbedUrl) {
    return (
      <div
        className={`relative w-full h-full min-h-[220px] aspect-video bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-400 rounded-xl overflow-hidden border border-zinc-800 ${className}`}
      >
        <Video className="w-8 h-8 opacity-40 mb-2" />
        <p className="text-xs">No video stream source attached to this lesson.</p>
      </div>
    );
  }

  // 6. Ready State — Embed Bunny Stream Player iframe
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
