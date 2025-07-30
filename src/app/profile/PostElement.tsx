import { useState } from "react";
import { PostInterface } from "./page";
import { Bookmark } from "lucide-react";

const PostElement = (data: PostInterface) => {
    const [bookmarked, setBookmarked] = useState(false);

    return (
        <div className="flex w-full rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
            {/* Left side - Image */}
            <div className="w-1/3">
                <img
                    src={data.image?.url}
                    alt={data.title}
                    className="object-cover h-full w-full"
                />
            </div>

            {/* Right side - Content */}
            <div className="w-2/3 p-4 flex flex-col justify-between">
                <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold ${data.category === 'primary' ? 'text-green-800' : 'text-blue-600'
                                }`}>
                                {data.category}
                            </span>
                            <span className="text-xs text-gray-500">{data.readTime}</span>
                        </div>
                        <button
                            onClick={() => setBookmarked(!bookmarked)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Bookmark
                                size={18}
                                fill={bookmarked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    <a href={`./post/${data._id}`} className="block hover:underline">
                        <h2 className="text-lg font-bold leading-tight mb-2">{data.title}</h2>
                    </a>
                    {data.content && (
                        <p className="text-sm text-gray-600 line-clamp-2">"{data.content}"</p>
                    )}
                </div>

                {/* Author */}
                {data.author && (
                    <div className="flex items-center mt-2">
                        {data.author.avatarUrl && (
                            <img
                                src={data.author.avatarUrl}
                                alt={data.author.name}
                                className="w-6 h-6 rounded-full mr-2"
                            />
                        )}
                        <div className="flex items-center">
                            <span className="text-sm font-medium">{data.author.name}</span>
                            {data.author.verified && (
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostElement;