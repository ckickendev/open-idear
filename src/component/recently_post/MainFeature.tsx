import { useTranslation } from "@/app/hook/useTranslation";
import Logo from "../common/Logo";
import { PostInterface } from "@/app/profile/[profileId]/page";
import { calculateGapTime } from "@/common/datetime";

const MainFeature = ({ postData }: { postData: PostInterface }) => {
    const { t } = useTranslation();
    return <div className="flex w-4/5 border rounded border-gray-300 p-4 h-[400px]">
        <div className="h-full w-3/5 bg-blue-400 rounded overflow-hidden relative group">
            <div className="absolute top-2 right-2 p-1 rounded">
                <Logo />
            </div>
            <img
                src={postData?.image?.url || "anh.jpg"}
                alt={postData?.title || "Main feature image"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        </div>
        <div className="m-8 w-2/5">
            <div className="flex items-center mb-2">
                <Logo />
                <span className="font-semibold">{t('component.lastest_feature.newest')}</span>
            </div>

            <div className="text-blue-600 font-semibold text-sm mb-2 cursor-pointer hover:underline">
                <a href={`/category/${postData?.category?.slug}`}>
                    {postData?.category?.name || "Uncategorized"}
                </a>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2 cursor-pointer hover:underline">
                <a href={`/post/${postData?.slug}`}>
                    {postData?.title}
                </a>
            </h2>

            <div className="flex items-center text-sm text-gray-600 mb-4">
                <span className="font-medium cursor-pointer hover:underline">
                    {postData?.author?.username}
                </span>
                <span className="mx-2">•</span>
                <span>{calculateGapTime(postData?.createdAt)}</span>
            </div>

            <p className="text-gray-700 line-height: 4 line-clamp-4">
                {postData?.text}
            </p>
        </div>
    </div>;
}

export default MainFeature;