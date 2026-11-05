"use client";

import React from "react";
import Link from "next/link";
import { SearchPostItem } from "../types/search.types";
import { Clock, Eye, FileText, User } from "lucide-react";
import { HighlightedText } from "./HighlightedText";

interface SearchPostCardProps {
  post: SearchPostItem;
  viewMode?: "grid" | "list";
  searchQuery?: string;
}

export const SearchPostCard: React.FC<SearchPostCardProps> = ({
  post,
  viewMode = "grid",
  searchQuery,
}) => {
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  if (viewMode === "list") {
    return (
      <Link
        href={`/post/${post.slug}`}
        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div className="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden bg-muted shrink-0">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-zinc-900 text-muted-foreground">
              <FileText className="w-10 h-10 opacity-50" />
            </div>
          )}
          <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-sm">
            Bài viết
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {post.category && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground">
                  {post.category.name}
                </span>
              )}
              {formattedDate && (
                <span className="text-[11px] text-muted-foreground">
                  {formattedDate}
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
              <HighlightedText text={post.title} query={searchQuery} />
            </h3>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              <HighlightedText
                text={post.description}
                query={searchQuery}
                asSnippet
                maxLength={160}
              />
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[140px]">
                <HighlightedText text={post.author.name} query={searchQuery} />
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{post.readtime} phút đọc</span>
              </div>
              {post.views > 0 && (
                <div className="hidden sm:flex items-center gap-1">
                  <Eye size={12} />
                  <span>{post.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid Card View
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex flex-col rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900/40 via-teal-900/40 to-zinc-900 text-muted-foreground">
            <FileText className="w-12 h-12 opacity-50" />
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-md backdrop-blur-sm">
          Bài viết
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.category && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-secondary-foreground">
                {post.category.name}
              </span>
            )}
            {formattedDate && (
              <span className="text-[10px] text-muted-foreground">
                {formattedDate}
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
            <HighlightedText text={post.title} query={searchQuery} />
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            <HighlightedText
              text={post.description}
              query={searchQuery}
              asSnippet
              maxLength={160}
            />
          </p>
        </div>

        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate font-medium">
              <HighlightedText text={post.author.name} query={searchQuery} />
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Clock size={12} />
            <span>{post.readtime}m</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
