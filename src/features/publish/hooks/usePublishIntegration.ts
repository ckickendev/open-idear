// =============================================================================
//  AI PUBLISHING FEATURE — PUBLISH INTEGRATION HOOK
//  src/features/publish/hooks/usePublishIntegration.ts
//
//  Design Decisions:
//  - Integrates Editor content, AI Review outcomes, Media state, and Metadata.
//  - Computes the checklist items locally by reusing editor content parsing,
//    preventing duplicate validation runs.
//  - Seamlessly merges AI peer review scores and warnings into the pre-flight checklist.
//  - Returns strongly-typed ChecklistItem lists for the UI.
// =============================================================================

import { useMemo } from "react";
import type { Editor } from "@tiptap/react";
import type { ChecklistItem } from "../components/PublishChecklist";
import type { PublishMetadata } from "../components/MetadataManager";
import type { FeaturedImageState } from "../components/FeaturedImageManager";

interface AIReviewData {
  readonly score: number;
  readonly suggestions: readonly string[];
  readonly warnings: readonly string[];
}

interface UsePublishIntegrationProps {
  readonly editor: Editor | null;
  readonly metadata: PublishMetadata;
  readonly featuredImage: FeaturedImageState | null;
  readonly aiReview: AIReviewData | null;
  readonly title: string;
}

export function usePublishIntegration({
  editor,
  metadata,
  featuredImage,
  aiReview,
  title,
}: UsePublishIntegrationProps) {
  
  const checklistItems = useMemo<ChecklistItem[]>(() => {
    const items: ChecklistItem[] = [];
    const html = editor ? editor.getHTML() : "";
    const text = editor ? editor.getText() : "";

    // 1. Title Validation
    const cleanTitle = title.trim();
    const isTitleValid = cleanTitle.length >= 5 && cleanTitle.length <= 60;
    items.push({
      id: "title",
      name: "Title Check",
      status: !cleanTitle ? "failed" : isTitleValid ? "passed" : "warning",
      severity: "error",
      message: !cleanTitle 
        ? "Title is missing." 
        : `Title length (${cleanTitle.length}) is outside recommended 5-60 character range.`,
      fixActionDescription: "Update the post title input header.",
      hasAutoFix: false,
    });

    // 2. SEO Meta Description Validation
    const cleanDesc = metadata.seoDescription.trim();
    const isDescValid = cleanDesc.length >= 20 && cleanDesc.length <= 160;
    items.push({
      id: "description",
      name: "Meta Description Check",
      status: !cleanDesc ? "failed" : isDescValid ? "passed" : "warning",
      severity: "warning",
      message: !cleanDesc
        ? "Meta description is missing."
        : `Meta description length (${cleanDesc.length}) is outside recommended 20-160 range.`,
      fixActionDescription: "Add/edit description tag under the SEO tab.",
      hasAutoFix: true,
    });

    // 3. Category Validation
    items.push({
      id: "category",
      name: "Category Check",
      status: metadata.slug && !metadata.slug.includes("general") && metadata.seoTitle ? "passed" : "failed",
      severity: "error",
      message: !metadata.seoTitle ? "Category selection is missing." : undefined,
      fixActionDescription: "Select category classification in publish settings.",
      hasAutoFix: false,
    });

    // 4. URL Slug Validation
    const isSlugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug.trim());
    items.push({
      id: "slug",
      name: "URL Slug Check",
      status: !metadata.slug.trim() ? "failed" : isSlugValid ? "passed" : "failed",
      severity: "error",
      message: !metadata.slug.trim()
        ? "Slug is missing."
        : !isSlugValid
        ? "Slug contains invalid characters."
        : undefined,
      fixActionDescription: "Sanitize URL slug name under the SEO tab.",
      hasAutoFix: true,
    });

    // 5. Tags Validation
    const hasTags = metadata.keywords && metadata.keywords.length > 0;
    items.push({
      id: "tags",
      name: "Tags Check",
      status: hasTags ? "passed" : "warning",
      severity: "warning",
      message: !hasTags ? "No tags assigned to this post." : undefined,
      fixActionDescription: "Add tag keywords in publish settings.",
      hasAutoFix: false,
    });

    // 6. Cover Image Validation
    items.push({
      id: "cover-image",
      name: "Cover Image Check",
      status: featuredImage && featuredImage.url ? "passed" : "warning",
      severity: "warning",
      message: (!featuredImage || !featuredImage.url) ? "Featured banner image is missing." : undefined,
      fixActionDescription: "Select a cover banner in the Featured Image tab.",
      hasAutoFix: false,
    });

    // 7. Headings Outline Validation
    const hasH1 = html.includes("<h1>") || html.includes("# ");
    items.push({
      id: "headings",
      name: "Headings Order Check",
      status: hasH1 ? "failed" : "passed",
      severity: "warning",
      message: hasH1 ? "H1 header tag detected inside content body." : undefined,
      fixActionDescription: "Change internal H1 blocks to H2 (##) anchors.",
      hasAutoFix: false,
    });

    // 8. Image ALTs Validation
    let imagesAltValid = true;
    const mdImageRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    while ((match = mdImageRegex.exec(text)) !== null) {
      if (!match[1] || match[1].trim() === "") {
        imagesAltValid = false;
      }
    }
    items.push({
      id: "images-alt",
      name: "Image ALT Tags Check",
      status: imagesAltValid ? "passed" : "warning",
      severity: "warning",
      message: !imagesAltValid ? "One or more images lack ALT descriptions." : undefined,
      fixActionDescription: "Open images properties and provide Alt descriptions.",
      hasAutoFix: false,
    });

    // 9. Unsecure Links Validation
    const hasUnsecure = /href=["']http:\/\/|\[.*?\]\(http:\/\//.test(html);
    items.push({
      id: "links",
      name: "Secure Links Check",
      status: hasUnsecure ? "failed" : "passed",
      severity: "warning",
      message: hasUnsecure ? "Found insecure external URLs (http://)." : undefined,
      fixActionDescription: "Upgrade link protocols to HTTPS or trigger Auto-Fix.",
      hasAutoFix: true,
    });

    // 10. AI Peer Review Audit integration
    if (aiReview) {
      items.push({
        id: "ai-review",
        name: "AI Peer Review Grade",
        status: aiReview.score >= 80 ? "passed" : "warning",
        severity: "info",
        message: `AI quality review score: ${aiReview.score}/100. ${
          aiReview.warnings.length > 0 ? `Found ${aiReview.warnings.length} layout warnings.` : ""
        }`,
        fixActionDescription: "Check AI Assist recommendations inside editor bubble menu.",
        hasAutoFix: false,
      });
    }

    return items;
  }, [editor, metadata, featuredImage, aiReview, title]);

  return { checklistItems };
}
