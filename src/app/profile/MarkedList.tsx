import React, { useEffect, useState } from "react";
import { getHeadersToken } from "@/api/authentication";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import authenticationStore from "@/store/AuthenticationStore";
import PostElement from "./PostElement";
import { PostInterface } from "./[profileId]/page";
import alertStore from "@/store/AlertStore";
import SeriesElement from "./SeriesElement";
import { Bookmark, FileText, Layers } from "lucide-react";
import EmptyState from "./EmptyState";

const MarkedList = () => {
    const [markedPosts, setMarkedPosts] = React.useState<PostInterface[]>([]);
    const [markedSeries, setMarkedSeries] = React.useState<any[]>([]);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    const currentUser = authenticationStore((state) => state.currentUser);
    const changeLoad = loadingStore((state) => state.changeLoad);

    const setType = alertStore((state) => state.setType);
    const setMessage = alertStore((state) => state.setMessage);

    useEffect(() => {
        // Fetch all posts from the server
        const fetchPosts = async () => {
            try {
                changeLoad();
                const token = localStorage.getItem("access_token");
                if (token) {
                    const resPostMarked = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getMarkedByUser?profileId=${currentUser._id}`);
                    if (resPostMarked.status === 200) {
                        setMarkedPosts(resPostMarked.data.markedPost);
                    }

                    const resSeriesMarked = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/series/getMarkedByUser?profileId=${currentUser._id}`);
                    if (resSeriesMarked.status === 200) {
                        setMarkedSeries(resSeriesMarked.data.markedSeries);
                    }
                }
            } catch (error: any) {
                setType('error');
                setMessage(error.response?.data?.message || 'Failed to fetch marked posts');
            } finally {
                changeLoad();
            }
        };
        fetchPosts();
    }, []);

    const handleTabChange = (tab: any) => {
        if (tab === activeTab) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsTransitioning(false);
        }, 150);
    };

    return (
        <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Bookmark className="text-blue-600" size={32} />
                        My Bookmarks
                    </h1>
                    <p className="text-gray-600">All your saved posts and series in one place</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm p-2 mb-8 inline-flex gap-2">
                    <button
                        onClick={() => handleTabChange("posts")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${activeTab === "posts" 
                                ? "bg-blue-600 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <FileText size={18} />
                        Posts
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "posts"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}>
                            {markedPosts.length}
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabChange("series")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${activeTab === "series"
                                ? "bg-purple-600 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <Layers size={18} />
                        Series
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "series"
                                ? "bg-purple-500 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}>
                            {markedSeries.length}
                        </span>
                    </button>
                </div>

                {/* Content Area */}
                <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="space-y-6">
                        {activeTab === "posts" ? (
                            markedPosts.length > 0 ? (
                                markedPosts.map((post) => <PostElement key={post._id} post={post} />)
                            ) : (
                                <EmptyState type="marked posts" />
                            )
                        ) : (
                            markedSeries.length > 0 ? (
                                markedSeries.map((series) => <SeriesElement key={series._id} series={series} />)
                            ) : (
                                <EmptyState type="marked series" />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MarkedList;