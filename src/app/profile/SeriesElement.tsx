import { useState } from "react";
import { Bookmark } from "lucide-react";

const SeriesElement = (data: any) => {
    console.log("data series", data);
    
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
                    {data.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">"{data.description}"</p>
                    )}
                </div>

                {/* Author */}
                {data.user?._id && (
                    <div className="flex items-center mt-2">
                        {data.user.avatar && (
                            <img
                                src={data.user.avatar}
                                alt={data.user.name}
                                className="w-10 h-10 rounded-full mr-2"
                            />
                        )}
                        <div className="flex items-center">
                            <span className="text-sm font-medium">{data.user.name}</span>
                            {data.user.verified && (
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

export default SeriesElement;