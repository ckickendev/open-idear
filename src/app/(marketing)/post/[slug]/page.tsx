import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ENV } from "@/api/const";
import HotPost from "@/features/ideas/components/hot_post/HotPost";
import CommentSection from "./CommentSection";
import PostSidebarActions from "./PostSideBarActions";
import ArticleLocaleSync from "@/components/ArticleLocaleSync";
import {
  ArticleRenderer,
  EditorialLayout,
  ArticleMeta,
  ArticleVersionAction,
} from "@/features/article";
import TableOfContents from "@/features/article/components/TableOfContents";
import ReadingProgress from "@/features/article/components/ReadingProgress";
import { buildTableOfContents } from "@/features/article/utils/buildTableOfContents";
import { calculateReadingTime } from "@/features/article/utils/calculateReadingTime";
import { ReadingTrackerWrapper } from "@/features/reading";
import { buildPostMetadata, getPostStructuredData, JsonLd } from "@/features/seo";
import "@/styles/editorial.css";

// ─── Post Fetcher ────────────────────────────────────────────────────────────

async function getPost(slug: string) {
  try {
    const res = await fetch(`${ENV.ROOT_API}/post/getPostBySlug/${slug}?locale=en`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.post;
  } catch (error) {
    console.error("Error fetching post for metadata/render:", error);
    return null;
  }
}

// ─── Server-Side Metadata Generator ──────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPost(slug);

  if (!postData) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPostMetadata(postData);
}


export default async function PostLists({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await params before destructuring
  const { slug } = await params;

  const getRandomTopic = async () => {
    try {
      const res = await fetch(
        `${ENV.ROOT_API}/category/getRandomTopic?limit=5&page=1`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      return data.topic;
    } catch (error) {
      console.error("Error fetching random topic:", error);
    }
  };

  const postData = await getPost(slug);
  const randomTopic = await getRandomTopic();

  if (!postData || postData.published === false) {
    notFound();
  }

  // Canonical locale routing guard: if the post is in Vietnamese, redirect to canonical /vi/post/ URL
  if (postData.activeLocale === "vi" && postData.alternateUrls?.vi) {
    redirect(postData.alternateUrls.vi);
  }

  // Build TOC items server-side from structured blocks.
  // Returns [] for html-v1 posts or posts with no headings.
  const tocItems = buildTableOfContents(postData.blocks ?? null);
  const hasToc = tocItems.length > 0;

  // Calculate reading time from structured blocks.
  // Prefer the AI-generated estimate stored in aiContext when present;
  // fall back to our deterministic calculation for all other cases.
  const calculatedReadingTime = calculateReadingTime(postData.blocks ?? null);
  const displayReadingTime:
    | number
    | undefined =
    postData.aiContext?.writerOutput?.estimatedReadingTime ??
    (calculatedReadingTime.readingTimeMinutes > 0
      ? calculatedReadingTime.readingTimeMinutes
      : undefined);

  // Generate server-side Schema.org JSON-LD structured data objects
  const structuredData = getPostStructuredData(postData);

  return (
    <>
      {/* ── Synchronize active locale and alternate URLs to client state ── */}
      <ArticleLocaleSync activeLocale="en" alternateUrls={postData.alternateUrls} />

      {/* ── Schema.org Structured Data (JSON-LD) ── */}
      <JsonLd data={structuredData.article} />
      <JsonLd data={structuredData.breadcrumb} />
      {structuredData.faq && <JsonLd data={structuredData.faq} />}

      {/* ── Reading Progress Bar — fixed at viewport top, zero layout shift ── */}
      <ReadingProgress />

      {/* ── Reading Progress Tracker & Resume Toast ── */}
      <ReadingTrackerWrapper articleId={postData._id} slug={slug} />

      {/* ── Editorial Layout wraps the entire article reading experience ── */}
      <EditorialLayout
        hasToc={hasToc}
        hero={
          <div
            className={`ed-hero ${postData.background ? "ed-hero--custom-bg rounded-2xl p-6 md:p-8 my-4" : ""}`}
            style={
              postData.background
                ? postData.background.startsWith("http") || postData.background.startsWith("/")
                  ? {
                      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.65)), url(${postData.background})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : { background: postData.background }
                : undefined
            }
          >
            {/* Article Metadata Header with Eyebrow, Title, Author & Actions, and Framed Cover Image */}
            <ArticleMeta
              category={postData.category?.name}
              title={postData.title}
              description={postData.description}
              author={
                postData.author
                  ? {
                      name:
                        postData.author.name ||
                        postData.author.username ||
                        "Anonymous",
                      avatarUrl:
                        postData.author.avatar ||
                        postData.author.avatarUrl,
                      role: postData.author.role,
                    }
                  : undefined
              }
              publishedAt={postData.createdAt}
              updatedAt={postData.updatedAt}
              readingTimeMinutes={displayReadingTime}
              tags={postData.tags}
              coverImage={{
                url: postData.image?.url || "/banner/openidear3.webp",
                description: postData.image?.description,
              }}
              versionAction={
                <ArticleVersionAction
                  slug={slug}
                  postId={postData._id}
                  currentVersion={postData.latestVersion || postData.currentVersionId?.version || "1.0"}
                  currentContent={postData.content || postData.text || ""}
                  authorId={postData.author?._id || postData.author}
                  variant="badge"
                />
              }
              actions={<PostSidebarActions postData={postData} variant="inline" />}
              locale="en"
            />

            {/* Desktop Floating Actions on scroll */}
            <PostSidebarActions postData={postData} variant="floating" />
          </div>
        }
        toc={
          hasToc ? (
            <TableOfContents items={tocItems} variant="desktop" />
          ) : undefined
        }
        tocMobile={
          hasToc ? (
            <TableOfContents items={tocItems} variant="mobile" />
          ) : undefined
        }
      >
        {/* ── Article Body — version-aware rendering ── */}
        <ArticleRenderer
          contentVersion={postData.contentVersion ?? "html-v1"}
          blocks={postData.blocks ?? null}
          htmlContent={postData.content}
          isDark={false}
        />

        {/* ── Related Topics ── */}
        <div style={{ marginTop: "var(--ed-space-12)", borderTop: "1px solid var(--ed-border)", paddingTop: "var(--ed-space-8)" }}>
          <p style={{ fontSize: "var(--ed-text-xl)", marginBottom: "var(--ed-space-6)", fontWeight: "var(--ed-weight-bold)", color: "var(--ed-text-primary)" }}>
            Related Topics
          </p>
          {randomTopic && randomTopic.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ed-space-3)" }}>
              {randomTopic.map((topic: { _id: string; slug: string; name: string }) => (
                <a
                  key={topic._id}
                  href={`/category/${topic.slug}`}
                  className="ed-badge"
                >
                  {topic.name}
                </a>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--ed-text-tertiary)" }}>No related topics available.</p>
          )}
        </div>
      </EditorialLayout>

      {/* ── Below-the-fold content (outside the reading column) ── */}
      <div className="max-w-full mx-auto px-4 py-8 bg-background">
        <HotPost />
      </div>

      <div id="comments" className="max-w-4xl mx-auto px-4 py-8 bg-background">
        <CommentSection postId={postData._id} />
      </div>
    </>
  );
}
