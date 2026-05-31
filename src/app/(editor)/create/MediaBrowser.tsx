"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { getHeadersToken } from "@/lib/api/axios";

interface MediaBrowserProps {
  onSelect: (media: any) => void;
  onClose: () => void;
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({ onSelect, onClose }) => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const fetchMedia = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/media/user`,
        {
          headers: getHeadersToken(),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch media");

      const data = await response.json();
      if (data.status === "success") {
        setMediaList(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch media");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/30 backdrop-blur-sm animate-[fade-in_0.15s_ease-out]">
      <div className="w-full max-w-5xl p-6 bg-[var(--color-editor-surface)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-[var(--color-editor-border)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-editor-border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-editor-text)]">
              Media Library
            </h2>
            <p className="text-xs text-[var(--color-editor-muted)] mt-1">
              Select an existing image from your uploads
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] rounded-lg transition-all duration-150 cursor-pointer"
            aria-label="Close media browser"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-8 h-8 border-2 border-[var(--color-editor-accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--color-editor-muted)] font-medium">
                Loading your media...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-sm font-medium text-[var(--color-editor-danger)] bg-[var(--color-editor-danger)]/10 px-4 py-2 rounded-lg">
                {error}
              </p>
              <button
                onClick={fetchMedia}
                className="px-6 py-2 bg-[var(--color-editor-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-editor-accent-hover)] transition-all duration-150 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="p-4 bg-[var(--color-editor-elevated)] rounded-2xl">
                <ImageIcon
                  size={40}
                  className="text-[var(--color-editor-muted)]"
                />
              </div>
              <p className="text-base font-medium text-[var(--color-editor-secondary)]">
                No media found
              </p>
              <p className="text-sm text-[var(--color-editor-muted)]">
                Upload some images first to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
              {mediaList.map((media) => (
                <div
                  key={media._id}
                  onClick={() => onSelect(media)}
                  className="group relative cursor-pointer border border-[var(--color-editor-border)] rounded-xl overflow-hidden hover:border-[var(--color-editor-accent)] hover:shadow-lg hover:shadow-[var(--color-editor-accent)]/10 transition-all duration-300 aspect-square bg-[var(--color-editor-elevated)]"
                >
                  <img
                    src={media.url}
                    alt={media.description || "Media item"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <button className="w-full bg-[var(--color-editor-accent)] text-white text-sm font-medium py-2 rounded-lg shadow-sm">
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaBrowser;
