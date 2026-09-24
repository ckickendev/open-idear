import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ENV } from "@/api/const";
import {
  ArticleRenderer,
  EditorialLayout,
  ArticleMeta,
} from "@/features/article";
import { VersionSnapshotHeader } from "./VersionSnapshotHeader";
import "@/styles/editorial.css";

// ─── Fetch Version Snapshot ──────────────────────────────────────────────────

async function getArticleVersion(slug: string, version: string) {
  try {
    const res = await fetch(
      `${ENV.ROOT_API}/articles/${encodeURIComponent(slug)}/version/${encodeURIComponent(version)}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching historical version snapshot:", error);
    return null;
  }
}

// ─── Fetch Head Post for Diff / Canonical ────────────────────────────────────

async function getHeadPost(slug: string) {
  try {
    const res = await fetch(`${ENV.ROOT_API}/post/getPostBySlug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post;
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}): Promise<Metadata> {
  const { slug, version } = await params;
  const data = await getArticleVersion(slug, version);

  if (!data || !data.version) {
    return {
      title: "Version Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `Archive v${version}: ${data.article?.title || slug}`;
  return {
    title,
    description: data.version.changelog || `Historical snapshot of ${data.article?.title}`,
    robots: {
      index: false, // Prevent search engines from indexing historical duplicate versions
      follow: true,
    },
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default async function ArticleVersionPage({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  const { slug, version } = await params;
  const versionData = await getArticleVersion(slug, version);
  const headPost = await getHeadPost(slug);

  if (!versionData || !versionData.version) {
    notFound();
  }

  const currentVersion = versionData.version;
  const articleMeta = versionData.article;
  const isCurrentHead = currentVersion.isCurrent || currentVersion.version === articleMeta.latestVersion;

  return (
    <>
      {/* ─── Archive Snapshot Banner & Controls ─────────────────────────── */}
      <VersionSnapshotHeader
        slug={slug}
        postId={articleMeta.id}
        version={currentVersion.version}
        latestVersion={articleMeta.latestVersion}
        isCurrentHead={isCurrentHead}
        changelog={currentVersion.changelog}
        createdAt={currentVersion.createdAt}
        author={currentVersion.author}
        oldContent={currentVersion.html || currentVersion.markdown || ""}
        currentContent={headPost?.content || headPost?.text || ""}
        authorId={articleMeta.authorId || headPost?.author?._id || headPost?.author}
      />

      {/* ─── Editorial Article Layout ─── */}
      <EditorialLayout
        hasToc={false}
        hero={
          <div className="ed-hero">
            {/* Historical Version Notice Pill */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Snapshot Archive: v{currentVersion.version}
              </span>
            </div>

            {/* Article Metadata */}
            <ArticleMeta
              category={headPost?.category?.name}
              title={articleMeta.title}
              description={headPost?.description}
              author={
                currentVersion.author
                  ? {
                      name: currentVersion.author.username || "Anonymous",
                      avatarUrl: currentVersion.author.avatar,
                    }
                  : undefined
              }
              publishedAt={currentVersion.createdAt}
              tags={headPost?.tags}
            />
          </div>
        }
      >
        {/* ─── Render Historical Article Content ─── */}
        <ArticleRenderer
          contentVersion={
            currentVersion.blocks && currentVersion.blocks.length > 0
              ? "blocks-v1"
              : "html-v1"
          }
          blocks={currentVersion.blocks ?? null}
          htmlContent={currentVersion.html || currentVersion.markdown || ""}
          isDark={false}
        />

        {/* ─── Return to Current Head Link ─── */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <Link
            href={`/post/${slug}`}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1.5"
          >
            ← View current version of this article (v{articleMeta.latestVersion})
          </Link>
          <span className="text-[11px] text-muted-foreground font-mono">
            Archived Snapshot v{currentVersion.version}
          </span>
        </div>
      </EditorialLayout>
    </>
  );
}
