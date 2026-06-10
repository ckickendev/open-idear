"use client";

import { ENV } from "@/api/const";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  ThumbsUp,
  MessageSquare,
  Eye,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
} from "lucide-react";
import convertDate from "@/common/datetime";

/* ── Types ───────────────────────────────────────────── */
interface Author {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}
interface Category {
  _id: string;
  name: string;
  slug: string;
}
interface Tag {
  name: string;
  slug: string;
}
interface TopPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: { url: string; description?: string };
  author: Author;
  category?: Category;
  tags: Tag[];
  likes: string[];
  comments: string[];
  views: number;
  readtime: number;
  createdAt: string;
  rank: number;
  engagementScore: number;
  relativeScore: number;
  likesCount: number;
  commentsCount: number;
}
interface Period {
  month: number;
  year: number;
  label: string;
}

/* ── Rank Badge ──────────────────────────────────────── */
const RANK_COLORS: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: "from-yellow-400 to-amber-500", text: "text-amber-900", border: "border-yellow-400", label: "Gold" },
  2: { bg: "from-slate-300 to-slate-400", text: "text-slate-800", border: "border-slate-400", label: "Silver" },
  3: { bg: "from-orange-400 to-amber-600", text: "text-orange-900", border: "border-orange-400", label: "Bronze" },
};

const RankBadge = ({ rank }: { rank: number }) => {
  const cfg = RANK_COLORS[rank];
  if (cfg) {
    return (
      <span
        className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${cfg.bg} ${cfg.text} font-black text-sm shadow-md flex-shrink-0`}
      >
        #{rank}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground font-bold text-sm flex-shrink-0">
      #{rank}
    </span>
  );
};

/* ── Score Bar ───────────────────────────────────────── */
const ScoreBar = ({ score, rank }: { score: number; rank: number }) => {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.width = `${score}%`;
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [score]);

  const color =
    rank === 1
      ? "bg-gradient-to-r from-yellow-400 to-amber-500"
      : rank === 2
      ? "bg-gradient-to-r from-slate-300 to-slate-500"
      : rank === 3
      ? "bg-gradient-to-r from-orange-400 to-amber-600"
      : "bg-gradient-to-r from-primary/60 to-primary";

  return (
    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
      <div
        ref={barRef}
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: "0%" }}
      />
    </div>
  );
};

/* ── Stat Chip ───────────────────────────────────────── */
const StatChip = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
}) => (
  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
    <Icon size={12} />
    <span className="tabular-nums">{value.toLocaleString()}</span>
    <span className="sr-only">{label}</span>
  </span>
);

/* ── Hero Card (#1) ──────────────────────────────────── */
const HeroCard = ({ post }: { post: TopPost }) => (
  <article className="group relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
    <div className="grid md:grid-cols-2 min-h-[420px]">
      {/* Image side */}
      <div className="relative min-h-[260px] md:min-h-full overflow-hidden">
        <Image
          src={post.image?.url || "/banner/banner_standard.png"}
          alt={post.image?.description || post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-card/60" />

        {/* Rank badge floating on image */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full px-4 py-2 shadow-lg">
            <Award size={16} className="text-amber-900" />
            <span className="font-black text-amber-900 text-sm">#1 THIS MONTH</span>
          </div>
        </div>
      </div>

      {/* Content side */}
      <div className="flex flex-col justify-between p-8">
        {/* Category + tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.category && (
            <Link
              href={`/category/${post.category.slug}`}
              className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag.slug}
              className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <div>
          <Link href={`/post/${post.slug}`}>
            <h2 className="text-2xl md:text-3xl font-black leading-tight text-card-foreground group-hover:text-primary transition-colors duration-200 mb-4 line-clamp-3">
              {post.title}
            </h2>
          </Link>
          <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
            {post.description}
          </p>
        </div>

        {/* Author row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
              <Image
                src={post.author?.avatar || "/banner/banner_standard.png"}
                alt={post.author?.name || "Author"}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <Link
                href={`/profile/${post.author?.username}`}
                className="text-sm font-semibold text-card-foreground hover:text-primary transition-colors"
              >
                {post.author?.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {convertDate(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StatChip icon={ThumbsUp} value={post.likesCount ?? post.likes?.length ?? 0} label="likes" />
            <StatChip icon={MessageSquare} value={post.commentsCount ?? post.comments?.length ?? 0} label="comments" />
            <StatChip icon={Eye} value={post.views ?? 0} label="views" />
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <TrendingUp size={11} /> Engagement Score
            </span>
            <span className="font-bold text-yellow-500">{post.relativeScore}%</span>
          </div>
          <ScoreBar score={post.relativeScore} rank={post.rank} />
        </div>

        <Link
          href={`/post/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
        >
          Read full idea <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  </article>
);

/* ── Featured Card (#2–#4) ───────────────────────────── */
const FeaturedCard = ({ post }: { post: TopPost }) => (
  <article className="group flex flex-col rounded-xl overflow-hidden border border-border bg-card shadow-md hover:shadow-xl transition-shadow duration-300 h-full">
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <Image
        src={post.image?.url || "/banner/banner_standard.png"}
        alt={post.image?.description || post.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute top-3 left-3">
        <RankBadge rank={post.rank} />
      </div>
      {post.category && (
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            {post.category.name}
          </span>
        </div>
      )}
    </div>

    {/* Content */}
    <div className="flex flex-col flex-1 p-5">
      <Link href={`/post/${post.slug}`}>
        <h3 className="font-bold text-base leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-3 mb-3">
          {post.title}
        </h3>
      </Link>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
        {post.description}
      </p>

      {/* Score bar */}
      <div className="mb-4">
        <ScoreBar score={post.relativeScore} rank={post.rank} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={post.author?.avatar || "/banner/banner_standard.png"}
              alt={post.author?.name || "Author"}
              fill
              className="object-cover"
              sizes="24px"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
            {post.author?.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatChip icon={ThumbsUp} value={post.likesCount ?? post.likes?.length ?? 0} label="likes" />
          <StatChip icon={Eye} value={post.views ?? 0} label="views" />
        </div>
      </div>
    </div>
  </article>
);

/* ── List Row (#5–#10) ───────────────────────────────── */
const ListRow = ({ post, index }: { post: TopPost; index: number }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-4");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className="opacity-0 translate-y-4 transition-all duration-500"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <article className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200">
        {/* Rank */}
        <RankBadge rank={post.rank} />

        {/* Thumbnail */}
        <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={post.image?.url || "/banner/banner_standard.png"}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="80px"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {post.category && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {post.category.name}
              </span>
            )}
            {post.readtime > 0 && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock size={10} />
                {post.readtime}m
              </span>
            )}
          </div>
          <Link href={`/post/${post.slug}`}>
            <h3 className="font-semibold text-sm leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
              {post.title}
            </h3>
          </Link>
          <ScoreBar score={post.relativeScore} rank={post.rank} />
        </div>

        {/* Stats */}
        <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
          <StatChip icon={ThumbsUp} value={post.likesCount ?? post.likes?.length ?? 0} label="likes" />
          <StatChip icon={MessageSquare} value={post.commentsCount ?? post.comments?.length ?? 0} label="comments" />
          <StatChip icon={Eye} value={post.views ?? 0} label="views" />
        </div>
      </article>
    </div>
  );
};

/* ── Section Divider ─────────────────────────────────── */
const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 my-8">
    <div className="flex-1 h-px bg-border" />
    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3">
      {label}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

/* ── Skeleton ────────────────────────────────────────── */
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-muted animate-pulse rounded ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
    <Skeleton className="h-[420px] w-full rounded-2xl" />
    <div className="grid grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-80 rounded-xl" />
      ))}
    </div>
    <div className="space-y-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  </div>
);

/* ── Main Component ──────────────────────────────────── */
const Top10IdeasClient = () => {
  const [posts, setPosts] = useState<TopPost[]>([]);
  const [period, setPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${ENV.ROOT_API}/post/getTop10IdeasMonth`);
        if (res.data.success) {
          setPosts(res.data.posts || []);
          setPeriod(res.data.period || null);
        }
      } catch (err) {
        console.error("Error fetching top10 ideas:", err);
        setError("Failed to load top ideas. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <TrendingUp size={28} className="text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Oops!</h3>
        <p className="text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Award size={28} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No ideas yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Be the first to share an idea this month!
        </p>
        <Link
          href="/recently-post"
          className="mt-2 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Browse ideas
        </Link>
      </div>
    );
  }

  const [first, ...rest] = posts;
  const featured = rest.slice(0, 3); // #2–#4
  const ranked = rest.slice(3);      // #5–#10

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Period badge */}
      {period && (
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-primary" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Monthly Leaderboard
              </p>
              <h2 className="text-xl font-black text-foreground">{period.label}</h2>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            {posts.length} ideas ranked
          </span>
        </div>
      )}

      {/* #1 Hero */}
      <HeroCard post={first} />

      {/* #2–#4 Featured Grid */}
      {featured.length > 0 && (
        <>
          <SectionDivider label="Rising Stars" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((post) => (
              <FeaturedCard key={post._id} post={post} />
            ))}
          </div>
        </>
      )}

      {/* #5–#10 Ranked List */}
      {ranked.length > 0 && (
        <>
          <SectionDivider label="Also Trending" />
          <div className="space-y-3">
            {ranked.map((post, idx) => (
              <ListRow key={post._id} post={post} index={idx} />
            ))}
          </div>
        </>
      )}

      {/* Footer CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 border border-border p-8 text-center">
        <h3 className="text-xl font-black text-foreground mb-2">
          Want to make the list next month?
        </h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
          Share your best ideas, engage with the community, and earn your spot in the top 10.
        </p>
        <Link
          href="/recently-post"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
        >
          Explore all ideas <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default Top10IdeasClient;
