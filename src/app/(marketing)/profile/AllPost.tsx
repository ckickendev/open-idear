import { ENV } from "@/api/const";
import React, { useEffect } from "react";

import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import PostElement from "./PostElement";
import { PostInterface } from "./[username]/page";
import SeriesElement from "./SeriesElement";
import { Bookmark, FileText, Layers, Pen } from "lucide-react";
import EmptyState from "./EmptyState";
import { getHeadersToken } from "@/lib/api/axios";
import { toast } from "sonner";

const AllPost = ({ profileId }: any) => {
  const [displayPosts, setDisplayPosts] = React.useState<PostInterface[]>([]);
  const [displaySeries, setDisplaySeries] = React.useState<any[]>([]);
  const [onDeleteSeriesing, setOnDeleteSeriesing] = React.useState(false);

  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("posts");

  const changeLoad = loadingStore((state) => state.changeLoad);

  const deleteSeries = async (id: string) => {
    try {
      const response = await axios.delete(
        `${ENV.ROOT_API}/series/delete`,
        {
          data: { seriesId: id },
          headers: getHeadersToken(),
        },
      );

      if (response.status === 200) {
        const resSeries = await axios.get(
          `${ENV.ROOT_API}/series/getSeriesByAuthorId?profileId=${profileId}`,
        );
        if (resSeries.status === 200) {
          setDisplaySeries(resSeries.data.series);
        }

        toast.success("Series deleted successfully.");
        setOnDeleteSeriesing(false);
      } else {
        toast.error("Failed to delete the series.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message);
      toast.error(
        error?.response?.data?.message ||
        "An error occurred while deleting the series.",
      );
    }
  };

  useEffect(() => {
    changeLoad();
    // Fetch all posts from the server
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `${ENV.ROOT_API}/post/getPostByAuthorId?profileId=${profileId}`,
        );
        if (res.status === 200) {
          console.log("posts info:", res.data);
          setDisplayPosts(res.data.posts);
        }

        const resSeries = await axios.get(
          `${ENV.ROOT_API}/series/getSeriesByAuthorId?profileId=${profileId}`,
        );
        if (resSeries.status === 200) {
          console.log("series info:", resSeries.data);
          setDisplaySeries(resSeries.data.series);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
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
    <div className="flex-1 m-l-4 p-6 bg-background rounded-lg shadow-sm">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Pen className="text-blue-600" size={32} />
            My Posts / Series
          </h1>
          <p className="text-muted-foreground">
            All your posts and series belong to you.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-background rounded-xl shadow-sm p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => handleTabChange("posts")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${activeTab === "posts"
              ? "bg-blue-600 text-white shadow-md"
              : "text-muted-foreground hover:bg-muted/30"
              }`}
          >
            <FileText size={18} />
            Posts
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "posts"
                ? "bg-blue-500 text-white"
                : "bg-muted text-muted-foreground"
                }`}
            >
              {displayPosts.length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange("series")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${activeTab === "series"
              ? "bg-purple-600 text-white shadow-md"
              : "text-muted-foreground hover:bg-muted/30"
              }`}
          >
            <Layers size={18} />
            Series
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === "series"
                ? "bg-purple-500 text-white"
                : "bg-muted text-muted-foreground"
                }`}
            >
              {displaySeries.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div
          className={`transition-opacity duration-150 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
        >
          <div className="space-y-6">
            {activeTab === "posts" ? (
              displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <PostElement key={post._id} post={post} />
                ))
              ) : (
                <EmptyState type="marked posts" />
              )
            ) : displaySeries.length > 0 ? (
              displaySeries.map((series) => (
                <SeriesElement
                  key={series._id}
                  series={series}
                  onDeleteSeriesing={onDeleteSeriesing}
                  setOnDeleteSeriesing={setOnDeleteSeriesing}
                  deleteSeries={deleteSeries}
                />
              ))
            ) : (
              <EmptyState type="marked series" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPost;
