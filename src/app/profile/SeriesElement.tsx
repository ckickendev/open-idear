import { useState } from "react";
import { Bookmark } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { getHeadersToken } from "@/api/authentication";
import axios from "axios";
import alertStore from "@/store/AlertStore";

const SeriesElement = (data: any) => {
    console.log("data series", data);
    const currentUser = authenticationStore((state) => state.currentUser);
    const [bookmarked, setBookmarked] = useState(data.marked?.includes(currentUser?._id));

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);

    const onMarkedSeries = async () => {
        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/markSeries`, {
                seriesId: data._id,
            }, {
                headers: getHeadersToken()
            });

            if (response.status === 200) {
                setType("success");
                setMessage(response.data.isMarked ? "Series marked successfully." : "Series unmarked successfully.");
                setBookmarked(!bookmarked);
            } else {
                setType("error");
                setMessage("Failed to mark the series.");
            }
        } catch (error: any) {
            console.log(error.response.data);
            setType("error");
            setMessage(error.response.data.message || "An error occurred while marking the series.");
        }
    };

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
                        <a href={`./post/${data._id}`} className="block hover:underline">
                            <h2 className="text-lg font-bold leading-tight mb-2">{data.title}</h2>
                        </a>
                        <button
                            onClick={onMarkedSeries}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <Bookmark
                                size={18}
                                fill={bookmarked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">Series includes {data.posts.length > 0 ? data.posts.length + " posts" : "No posts available"}</p>
                    {data.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">"{data.description}"</p>
                    )}
                </div>

                {/* Author */}
                {data.user?._id && (
                    <div className="flex justify-between align-center">
                        <a className="flex items-center mt-2" href={`./${data.user._id}`}>
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
                        </a>

                        <div className="flex items-center">
                            <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 cursor-pointer">
                                View Series
                            </button>
                        </div>
                    </div>

                )}
            </div>
        </div>
    );
}

export default SeriesElement;