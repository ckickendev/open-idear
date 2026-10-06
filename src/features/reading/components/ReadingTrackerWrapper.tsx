"use client";

// =============================================================================
//  READING TRACKER WRAPPER
//  src/features/reading/components/ReadingTrackerWrapper.tsx
//
//  Design Decisions:
//  - Client boundary component placed on the Article page.
//  - Mounts useReadingTracker to monitor reading progress and heading positions.
//  - Mounts ResumeReadingToast to present one-click resume capability.
// =============================================================================

import React from "react";
import { useReadingTracker } from "../hooks/useReadingTracker";
import ResumeReadingToast from "./ResumeReadingToast";

interface ReadingTrackerWrapperProps {
  articleId: string;
  slug: string;
}

export default function ReadingTrackerWrapper({
  articleId,
  slug,
}: ReadingTrackerWrapperProps) {
  const { savedProgress } = useReadingTracker({
    articleId,
    slug,
  });

  return <ResumeReadingToast savedProgress={savedProgress} />;
}
