"use client";

import React, { useEffect } from "react";
import { Loader2, AlertCircle, RefreshCw, Send } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { usePublishing } from "../hooks/usePublishing";
import { PublishingScore } from "./PublishingScore";
import { PublishingChecklist } from "./PublishingChecklist";
import { PublishingSuggestions } from "./PublishingSuggestions";

interface PublishingPanelProps {
  readonly postId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onPublishSuccess?: () => void;
}

export function PublishingPanel({
  postId,
  isOpen,
  onClose,
  onPublishSuccess,
}: PublishingPanelProps) {
  const {
    runPreflight,
    publish,
    isLoading,
    isPublishing,
    error,
    taskResults,
    score,
    isReady,
  } = usePublishing({
    postId,
    onPublishSuccess: () => {
      toast.success("Article published successfully!");
      onPublishSuccess?.();
      onClose();
    },
  });

  // Run validation checks when panel is opened
  useEffect(() => {
    if (isOpen && postId) {
      runPreflight();
    }
  }, [isOpen, postId, runPreflight]);

  const handlePublish = async () => {
    // Extract metadata values generated during the preflight tasks (like SEO meta desc/slug)
    const seoData = taskResults.seo?.outputData || {};
    const categoryData = taskResults.category?.outputData || {};

    const updates = {
      slug: seoData.slug,
      description: seoData.metaDescription,
      category: categoryData.suggestedCategory,
    };

    await publish(updates);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full h-full flex flex-col p-0 border-l border-border bg-background shadow-lg">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border flex-shrink-0">
          <SheetTitle className="text-lg font-bold text-foreground">
            Publish Article
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Run quality checklist diagnostics and optimize SEO before publishing.
          </SheetDescription>
        </SheetHeader>

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 p-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Running preflight validation checks...</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-6 flex flex-col gap-6">
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive text-xs">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* score ring */}
                {Object.keys(taskResults).length > 0 && (
                  <PublishingScore score={score} />
                )}

                {/* checklists */}
                {Object.keys(taskResults).length > 0 && (
                  <PublishingChecklist taskResults={taskResults} />
                )}

                {/* suggestions */}
                {Object.keys(taskResults).length > 0 && (
                  <PublishingSuggestions taskResults={taskResults} />
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Action Footer */}
        <SheetFooter className="p-6 border-t border-border flex flex-col gap-2.5 flex-shrink-0 bg-background">
          <button
            type="button"
            onClick={runPreflight}
            disabled={isLoading || isPublishing}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-border text-foreground hover:bg-accent text-sm font-semibold cursor-pointer disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Re-run Checks
          </button>
          
          <button
            type="button"
            onClick={handlePublish}
            disabled={isLoading || isPublishing || !isReady}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Publish Post
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
