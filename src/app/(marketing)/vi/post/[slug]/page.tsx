import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENV } from "@/api/const";
import HotPost from "@/features/ideas/components/hot_post/HotPost";
import CommentSection from "@/app/(marketing)/post/[slug]/CommentSection";
import PostSidebarActions from "@/app/(marketing)/post/[slug]/PostSideBarActions";
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
    const res = await fetch(`${ENV.ROOT_API}/post/getPostBySlug/${slug}?locale=vi`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.post;
  } catch (error) {
    console.error("Error fetching Vietnamese post for metadata/render:", error);
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

  if (!postData || postData.published === false) {
    return {
      title: "Bài viết không tìm thấy | OpenIdear",
      robots: { index: false, follow: false },
    };
  }

  // Detect fallback status: if returned activeLocale is not 'vi', post is an untranslated fallback
  const isFallback = postData.activeLocale !== "vi";

  return buildPostMetadata({
    ...postData,
    activeLocale: isFallback ? "en" : "vi",
    isFallback,
  });
}

export default async function ViPostLists({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const getRandomTopic = async () => {
    try {
      const res = await fetch(
        `${ENV.ROOT_API}/category/getRandomTopic?limit=5&page=1`,
        {
          next: { revalidate: 3600 },
        },
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return data.topic;
    } catch (error) {
      console.error("Error fetching random topic:", error);
      return [];
    }
  };

  const postData = await getPost(slug);
  const randomTopic = await getRandomTopic();

  // Hide unpublished content and drafts from public viewers
  if (!postData || postData.published === false) {
    notFound();
  }

  // Fallback detection: if activeLocale is not 'vi', English fallback is being served
  const isFallback = postData.activeLocale !== "vi";

  // Build TOC items server-side from structured blocks
  const tocItems = buildTableOfContents(postData.blocks ?? null);
  const hasToc = tocItems.length > 0;

  // Calculate reading time from structured blocks
  const calculatedReadingTime = calculateReadingTime(postData.blocks ?? null);
  const displayReadingTime: number | undefined =
    postData.aiContext?.writerOutput?.estimatedReadingTime ??
    (calculatedReadingTime.readingTimeMinutes > 0
      ? calculatedReadingTime.readingTimeMinutes
      : undefined);

  // Generate server-side Schema.org JSON-LD structured data objects
  const structuredData = getPostStructuredData(postData);

  return (
    <>
      {/* ── Synchronize active locale and alternate URLs to client state ── */}
      <ArticleLocaleSync activeLocale={isFallback ? "vi" : postData.activeLocale} alternateUrls={postData.alternateUrls} />

      {/* ── Schema.org Structured Data (JSON-LD) ── */}
      <JsonLd data={structuredData.article} />
      <JsonLd data={structuredData.breadcrumb} />
      {structuredData.faq && <JsonLd data={structuredData.faq} />}

      {/* ── Translation Fallback Notice ── */}
      {isFallback && (
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl" aria-hidden="true">🌐</span>
              <div>
                <p className="font-semibold text-sm">Chưa có bản dịch tiếng Việt</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bài viết này chưa được dịch sang tiếng Việt và đang hiển thị nội dung tiếng Anh gốc.
                </p>
              </div>
            </div>
            <a
              href={`/post/${postData.slug}`}
              className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
            >
              Xem trang gốc &rarr;
            </a>
          </div>
        </div>
      )}

      {/* ── Reading Progress Bar — fixed at viewport top, zero layout shift ── */}
      <ReadingProgress />

      {/* ── Reading Progress Tracker & Resume Toast ── */}
      <ReadingTrackerWrapper articleId={postData._id} slug={slug} />

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
                        "Tác giả",
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

            {/* Version History Action Button */}
            <div className="flex items-center gap-3 my-4">
              <ArticleVersionAction
                slug={slug}
                postId={postData._id}
                currentVersion={postData.latestVersion || postData.currentVersionId?.version || "1.0"}
                currentContent={postData.content || postData.text || ""}
                authorId={postData.author?._id || postData.author}
                variant="button"
              />
            </div>

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
            Chủ đề liên quan
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
            <p style={{ color: "var(--ed-text-tertiary)" }}>Không có chủ đề liên quan.</p>
          )}
        </div>
      </EditorialLayout>

      {/* ── Below-the-fold content ── */}
      <div className="max-w-full mx-auto px-4 py-8 bg-background">
        <HotPost />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 bg-background">
        <CommentSection postId={postData._id} />
      </div>
    </>
  );
}
