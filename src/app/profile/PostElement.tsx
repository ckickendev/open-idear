import { useState } from "react";
import { Bookmark } from "lucide-react";
import { PostInterface } from "./[profileId]/page";
import authenticationStore from "@/store/AuthenticationStore";
import axios from "axios";
import alertStore from "@/store/AlertStore";
import { getHeadersToken } from "@/api/authentication";

const PostElement = ({post}: {post: PostInterface}) => {
    const currentUser = authenticationStore((state) => state.currentUser);
    const [bookmarked, setBookmarked] = useState(post.marked?.includes(currentUser?._id));
    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);

    const onMarkedPost = async () => {
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/markPost`, {
                postId: post._id,
            }, {
                headers: getHeadersToken()
            });

            if (response.status === 200) {
                setType("success");
                setMessage(response.data.isMarked ? "Post marked successfully." : "Post unmarked successfully.");
                setBookmarked(!bookmarked);
            } else {
                setType("error");
                setMessage("Failed to mark the post.");
            }
        } catch (error: any) {
            setType("error");
            setMessage(error.response.data.message || "An error occurred while marking the post.");

        }
    };

    return (
        <div className="flex w-full rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
            {/* Left side - Image */}
            <div className="w-1/3 h-40">
                <img
                    src={post.image?.url}
                    alt={post.title}
                    className="object-cover h-full w-full"
                />
            </div>

            {/* Right side - Content */}
            <div className="w-2/3 p-4 flex flex-col justify-between">
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold ${post.category === 'primary' ? 'text-green-800' : 'text-blue-600'
                                }`}>
                                {post.category}
                            </span>
                            <span className="text-xs text-gray-500">{post.readtime} phút đọc</span>
                        </div>
                        <button
                            onClick={onMarkedPost}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <Bookmark
                                size={18}
                                fill={bookmarked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    <a href={`/post/${post._id}`} className="block hover:underline">
                        <h2 className="text-lg font-bold leading-tight mb-2">{post.title}</h2>
                    </a>
                    {post.content && (
                        <p className="text-sm text-gray-600 line-clamp-2">"{post.content}"</p>
                    )}
                </div>

                {/* Author */}
                {post.author?._id && (
                    <a className="flex items-center justify-start mt-2" href={`./${post.author._id}`}>
                        {post.author.avatar && (
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-10 h-10 rounded-full mr-2"
                            />
                        )}
                        <div className="flex items-center">
                            <span className="text-sm font-medium">{post.author.name}</span>
                            {post.author.verified && (
                                <span className="ml-1 text-blue-500">
                                    <svg
                                        className="w-4 h-4 inline-block"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                </span>
                            )}
                        </div>
                    </a>
                )}
            </div>
        </div>
    );
}

export default PostElement;