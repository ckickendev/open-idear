"use client";

import { ENV } from "@/api/const";
import React, { useEffect, useState } from "react";
import { BadgePlus, FileText, Clock, X } from "lucide-react";
import { getHeadersToken } from "@/lib/api/axios";
import axios from "axios";
import Logo from "@/components/common/Logo";

interface PostListInterface {
  _id: string;
  title: string;
  createdAt: string;
}

interface PostListPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostListPanel({ isOpen, onClose }: PostListPanelProps) {
  const [allPosts, setAllPosts] = useState<PostListInterface[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        const headers = getHeadersToken();
        try {
          const res = await axios.get(
            `${ENV.ROOT_API}/post/getPostByAuthor`,
            { headers },
          );
          if (res.status === 200) {
            setAllPosts(res.data.posts);
          }
        } catch (err) {
          console.error("Error fetching posts:", err);
        }
      }
    };
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm animate-[fade-in_0.15s_ease-out] lg:bg-background/10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-[var(--color-editor-surface)] border-r border-[var(--color-editor-border)] shadow-2xl flex flex-col animate-slide-in-left"
        role="complementary"
        aria-label="Post list"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-editor-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-editor-accent)]/15 flex items-center justify-center">
              <FileText
                size={16}
                className="text-[var(--color-editor-accent)]"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-editor-text)]">
                My Posts
              </h2>
              <p className="text-[11px] text-[var(--color-editor-muted)]">
                {allPosts.length}{" "}
                {allPosts.length === 1 ? "document" : "documents"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-editor-secondary)] hover:text-[var(--color-editor-text)] hover:bg-[var(--color-editor-elevated)] transition-all duration-150 cursor-pointer"
            aria-label="Close post list"
          >
            <X size={16} />
          </button>
        </div>

        {/* Create new */}
        <div className="px-4 py-3">
          <a
            href="/create"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[var(--color-editor-accent)] hover:bg-[var(--color-editor-accent-hover)] text-white text-sm font-semibold transition-all duration-150 shadow-lg shadow-[var(--color-editor-accent)]/20 active:scale-[0.97]"
          >
            <BadgePlus size={16} />
            Create New Post
          </a>
        </div>

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center gap-2 px-2 mb-2">
            <Clock size={12} className="text-[var(--color-editor-muted)]" />
            <span className="text-[10px] font-semibold text-[var(--color-editor-muted)] uppercase tracking-wider">
              Recent
            </span>
          </div>

          <div className="space-y-0.5">
            {allPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText
                  size={24}
                  className="mx-auto text-[var(--color-editor-muted)] mb-2"
                />
                <p className="text-xs text-[var(--color-editor-muted)]">
                  No posts yet. Start writing!
                </p>
              </div>
            ) : (
              allPosts.map((item) => (
                <a
                  href={`/create?id=${item._id}`}
                  key={item._id}
                  className="block p-3 rounded-xl text-left hover:bg-[var(--color-editor-elevated)] transition-all duration-150 group"
                >
                  <h4 className="text-sm font-medium text-[var(--color-editor-text)] truncate group-hover:text-[var(--color-editor-accent)] transition-colors">
                    {item.title || "Untitled"}
                  </h4>
                  <p className="text-[11px] text-[var(--color-editor-muted)] mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </a>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-editor-border)] px-4 py-3 flex items-center justify-center">
          <Logo className="h-8 opacity-40" />
        </div>
      </aside>
    </>
  );
}
