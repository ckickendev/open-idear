import { ChevronUp } from "lucide-react";
import "@styles/globals.css";
import Logo from "../common/Logo";
import { PostInterface } from "@/app/profile/[profileId]/page";
import { calculateGapTime } from "@/common/datetime";

const Article = ({ postData }: { postData: PostInterface }) => {

  return (
    <>
      <div className="col-span-1 h-full border-b-1 border-gray-300 pt-4 pb-4">
        <div className="h-32 bg-gray-200 rounded overflow-hidden relative">
          <div className="absolute top-2 right-2 p-1 rounded">
            <Logo />
          </div>
          <img
            src={postData?.image?.url || "idea.jpg"}
            alt="Roulette wheel"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-2 flex flex-col justify-between h-20">
          <div className="flex flex-col">
            <div className="text-blue-600 font-semibold text-sm cursor-pointer hover:underline">
              <a href={`/posts/category/${postData?.category?.slug}`}>
                {postData?.category?.name || "Uncategorized"}
              </a>
            </div>
            <h3 className="font-bold text-sm/5 cursor-pointer hover:underline line-height: 2 line-clamp-2">\
              <a href={`/post/${postData?.slug}`}>
                {postData.title}
              </a>
            </h3>
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
