import { PostInterface } from "@/app/(marketing)/profile/[username]/page";
import {
  PostLinkCustom,
  UserLinkCustom,
} from "@/components/common/LinkCustom";
import Image from "next/image";
import Link from "next/link";

const ArticleRightSide = ({ postData }: { postData: PostInterface }) => {
  const minutesRead = postData.readtime
    ? (typeof postData.readtime === "string" ? parseInt(postData.readtime, 10) : postData.readtime)
    : Math.max(1, Math.ceil((postData.text || "").split(/\s+/).length / 200)) || 5;

  return (
    <div className="col-span-1 h-full flex flex-col justify-between group cursor-pointer border-b border-border/50 pb-4">
      <div>
        <Link
          href={`/post/${postData?.slug}`}
          className="block relative aspect-[16/10] bg-muted rounded-lg overflow-hidden mb-3"
        >
          <Image
            src={postData?.image?.url || "/banner/banner_standard.png"}
            alt={postData?.title || "Article image"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 20vw"
          />
        </Link>

        <PostLinkCustom
          className="font-bold text-sm leading-snug text-foreground hover:text-blue-600 transition-colors line-clamp-2 mb-1 cursor-pointer block hover:underline"
          slug={postData?.slug}
          name={postData?.title || "title"}
        />

        {postData?.text && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {postData.text}
          </p>
        )}
      </div>

      <div className="flex items-center text-[11px] text-muted-foreground/80 mt-auto font-medium">
        <UserLinkCustom
          className="hover:underline text-muted-foreground hover:text-foreground cursor-pointer"
          username={postData.author?.username}
          name={postData.author?.username || postData.author?.name || "Unknown"}
        />
        <span className="mx-1.5 text-muted-foreground/50">•</span>
        <span>{minutesRead} phút đọc</span>
      </div>
    </div>
  );
};

export default ArticleRightSide;

