import { useTranslation } from "@/app/hook/useTranslation";
import Logo from "@/components/common/Logo";
import { PostInterface } from "@/app/(marketing)/profile/[username]/page";
import { calculateGapTime } from "@/common/datetime";
import {
  CategoryLinkCustom,
  PostLinkCustom,
  UserLinkCustom,
} from "@/components/common/LinkCustom";

import Image from "next/image";
import Link from "next/link";

const MainFeature = ({ postData }: { postData: PostInterface }) => {
  const { t } = useTranslation();
  const minutesRead = postData?.readtime
    ? (typeof postData.readtime === "string" ? parseInt(postData.readtime, 10) : postData.readtime)
    : Math.max(1, Math.ceil((postData?.text || "").split(/\s+/).length / 200)) || 5;

  return (
    <div className="flex w-4/5 border rounded-xl border-border/60 bg-card p-4 h-[400px] hover:border-border transition-all duration-300 hover:shadow-md group">
      <div className="h-full w-3/5 bg-muted rounded-lg overflow-hidden relative">
        <div className="absolute top-2 right-2 p-1 rounded z-10">
          <Logo />
        </div>
        <Image
          src={postData?.image?.url || "/banner/banner_standard.png"}
          alt={postData?.title || "Main feature image"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-102"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      </div>
      <div className="m-8 w-2/5 flex flex-col justify-center">
        <div className="flex items-center mb-3">
          <Logo />
          <span className="font-semibold text-xs text-muted-foreground tracking-wider uppercase ml-1">
            {t("component.lastest_feature.newest")}
          </span>
        </div>

        <h2 className="text-2xl font-black text-foreground mb-3 leading-snug">
          <PostLinkCustom
            className="hover:text-blue-600 transition-colors line-clamp-2 hover:underline cursor-pointer block"
            slug={postData?.slug}
            name={postData?.title || "title"}
          />
        </h2>

        {postData?.text && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {postData.text}
          </p>
        )}

        <div className="flex items-center text-xs text-muted-foreground/80 font-medium mt-auto pt-2 border-t border-border/40">
          <UserLinkCustom
            className="hover:underline text-muted-foreground hover:text-foreground cursor-pointer"
            username={postData?.author?.username}
            name={postData?.author?.username || postData?.author?.name || "Unknown"}
          />
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span>{minutesRead} phút đọc</span>
        </div>
      </div>
    </div>
  );
};

export default MainFeature;
