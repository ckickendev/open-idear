import "@styles/globals.css";
import Logo from "../common/Logo";
import { PostInterface } from "@/app/profile/[profileId]/page";
import { calculateGapTime } from "@/common/datetime";
import { CategoryLinkCustom, PostLinkCustom } from "../common/LinkCustom";

import Image from "next/image";

const Article = ({ postData }: { postData: PostInterface }) => {

  return (
    <>
      <div className="col-span-1 h-full border-b-1 border-gray-300 pt-4 pb-4">
        <div className="h-32 bg-gray-200 rounded overflow-hidden relative group">
          <div className="absolute top-2 right-2 p-1 rounded z-10">
            <Logo />
          </div>
          <Image
            src={postData?.image?.url || "/banner/banner_standard.png"}
            alt={postData?.title || "Article image"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="mt-2 flex flex-col justify-between h-20">
          <div className="flex flex-col">
            <CategoryLinkCustom className={'text-green-600 font-semibold text-sm cursor-pointer hover:underline'}
              slug={postData?.category?.slug}
              name={postData?.category?.name || " "}
            />
            <PostLinkCustom className={'font-bold text-sm/5 cursor-pointer hover:underline line-height: 2 line-clamp-2'}
              slug={postData?.slug}
              name={postData?.title || 'title'}
            />
          </div>
          <div className="flex items-center text-xs text-gray-600 dark:text-white mt-1 float-bottom">
            <span className="font-medium cursor-pointer hover:underline">{postData.author.username}</span>
            <span className="mx-1">•</span>
            <span>{calculateGapTime(postData.createdAt)}</span>
          </div>
        </div>
      </div >
    </>
  );
};

export default Article;
