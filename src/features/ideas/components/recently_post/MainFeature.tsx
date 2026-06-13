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
    <div className="flex flex-col md:flex-row w-full lg:w-4/5 border border-border bg-card p-4 h-auto md:h-[400px] rounded-2xl hover:border-border/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ease-in-out group cursor-pointer">
      <div className="h-48 md:h-full w-full md:w-3/5 bg-muted rounded-xl overflow-hidden relative">
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
      <div className="p-4 md:py-6 md:px-8 w-full md:w-2/5 flex flex-col justify-center">
        <div className="flex items-center mb-3">
          <Logo />
          <span className="font-bold text-[10px] text-primary tracking-widest uppercase ml-1.5">
            {t("component.lastest_feature.newest")}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 leading-snug tracking-tight">
          <PostLinkCustom
            className="hover:text-primary transition-colors line-clamp-2 hover:underline cursor-pointer block"
            slug={postData?.slug}
            name={postData?.title || "title"}
          />
        </h2>

        {postData?.text && (
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-5 font-normal">
            {postData.text}
          </p>
        )}

        <div className="flex items-center text-xs text-muted-foreground/80 font-medium mt-auto pt-3 border-t border-border/40">
          <UserLinkCustom
            className="hover:underline text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            username={postData?.author?.username}
            name={postData?.author?.username || postData?.author?.name || "Unknown"}
          />
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span>
            {minutesRead}{" "}
            {t("component.lastest_feature.minRead") !== "component.lastest_feature.minRead"
              ? t("component.lastest_feature.minRead")
              : "min read"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MainFeature;
