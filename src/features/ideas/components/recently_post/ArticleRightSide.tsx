import { PostInterface } from "@/app/(marketing)/profile/[username]/page";
import {
  PostLinkCustom,
  UserLinkCustom,
} from "@/components/common/LinkCustom";
import { useTranslation } from "@/app/hook/useTranslation";
import Image from "next/image";
import Link from "next/link";

const ArticleRightSide = ({ postData }: { postData: PostInterface }) => {
  const { t } = useTranslation();
  const minutesRead = postData.readtime
    ? (typeof postData.readtime === "string" ? parseInt(postData.readtime, 10) : postData.readtime)
    : Math.max(1, Math.ceil((postData.text || "").split(/\s+/).length / 200)) || 5;

  return (
    <div className="col-span-1 h-full flex flex-col bg-card border border-border/50 hover:border-border rounded-xl p-3 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 ease-in-out group cursor-pointer">
      <div className="flex-1">
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
          className="font-bold text-xs leading-snug text-foreground hover:text-primary transition-colors line-clamp-2 mb-1.5 cursor-pointer block hover:underline tracking-tight"
          slug={postData?.slug}
          name={postData?.title || "title"}
        />

        {postData?.text && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {postData.text}
          </p>
        )}
      </div>

      <div className="flex items-center text-[10px] text-muted-foreground/80 mt-auto pt-2.5 border-t border-border/40 font-medium">
        <UserLinkCustom
          className="hover:underline text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          username={postData.author?.username}
          name={postData.author?.username || postData.author?.name || "Unknown"}
        />
        <span className="mx-1 text-muted-foreground/50">•</span>
        <span>
          {minutesRead}{" "}
          {t("component.lastest_feature.minRead") !== "component.lastest_feature.minRead"
            ? t("component.lastest_feature.minRead")
            : "min read"}
        </span>
      </div>
    </div>
  );
};

export default ArticleRightSide;

