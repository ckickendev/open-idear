import type { Metadata } from "next";
import { ENV } from "@/api/const";
import HotPost from "@/features/ideas/components/hot_post/HotPost";
import CommentSection from "./CommentSection";
import PostSidebarActions from "./PostSideBarActions";
import {
  ArticleRenderer,
  EditorialLayout,
  ArticleMeta,
} from "@/features/article";
import TableOfContents from "@/features/article/components/TableOfContents";
import ReadingProgress from "@/features/article/components/ReadingProgress";
import { buildTableOfContents } from "@/features/article/utils/buildTableOfContents";
import { calculateReadingTime } from "@/features/article/utils/calculateReadingTime";
import { buildPostMetadata, getPostStructuredData, JsonLd } from "@/features/seo";
import "@/styles/editorial.css";

// ─── Post Fetcher ────────────────────────────────────────────────────────────

async function getPost(slug: string) {
  try {
    const res = await fetch(`${ENV.ROOT_API}/post/getPostBySlug/${slug}`, {
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

  if (!postData) {
    return <div>Post not found</div>;
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
      {/* ── Schema.org Structured Data (JSON-LD) ── */}
      <JsonLd data={structuredData.article} />
      <JsonLd data={structuredData.breadcrumb} />
      {structuredData.faq && <JsonLd data={structuredData.faq} />}

      {/* ── Reading Progress Bar — fixed at viewport top, zero layout shift ── */}
      <ReadingProgress />

      {/* ── Editorial Layout wraps the entire article reading experience ── */}
      <EditorialLayout
        hasToc={hasToc}
        hero={
          <div className="ed-hero">
            {/* Hero Image */}
            <div className="ed-hero__image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={postData.image?.url || "/banner/openidear3.webp"}
                alt={postData.title}
                className="ed-hero__image"
              />
            </div>
            {postData.image?.description && (
              <p className="ed-hero__caption">
                {postData.image.description}
              </p>
            )}

            {/* Article Metadata Header */}
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
            />

            {/* Sidebar reaction actions */}
            <PostSidebarActions postData={postData} />
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

      <div className="max-w-4xl mx-auto px-4 py-8 bg-background">
        <CommentSection postId={postData._id} />
      </div>
    </>
  );
}
