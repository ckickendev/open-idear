import React, { useEffect } from "react";
import { getHeadersToken } from "@/api/authentication";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import authenticationStore from "@/store/AuthenticationStore";
import PostElement from "./PostElement";
import { PostInterface } from "./[profileId]/page";
import alertStore from "@/store/AlertStore";
import SeriesElement from "./SeriesElement";

const MarkedList = () => {
    const [markedPosts, setMarkedPosts] = React.useState<PostInterface[]>([]);
    const [titlePost, setTitlePost] = React.useState<string>("Posts");
    const [postType, setPostType] = React.useState<number>(1);
    const [markedSeries, setMarkedSeries] = React.useState<any[]>([]);

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

    const handlePostTypeClick = (postTypeId: number) => {
    setPostType(postTypeId);
    if (postTypeId === 1) {
      setTitlePost("Posts");
    }
    if (postTypeId === 2) {
      setTitlePost("Series");
    }
  };

    return (
        <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between rounded-xl ">
                <div className={`text-xl cursor-pointer font-bold ${postType == 2 ? "bg-gray-300 rounded-r-lg" : ''} w-1/2 p-4 text-center`} onClick={() => handlePostTypeClick(1)}>All Posts</div>
                <div className={`text-xl cursor-pointer font-bold ${postType == 1 ? "bg-gray-300 rounded-l-lg" : ''} w-1/2 p-4 text-center`} onClick={() => handlePostTypeClick(2)}>All Series</div>
            </div>


            <div className="h-full">
                <div className="space-y-4 h-full m-4 p-2">
                    {markedPosts.length == 0 && <h1 className='text-xxl h-full font-semibold mb-4 flex justify-center items-center'>No record</h1>}
                    {postType == 1 ? markedPosts.map((post, index) => (
                        <PostElement
                            key={index}
                            _id={post._id}
                            image={post.image}
                            category={post.category}
                            title={post.title}
                            content={post.text}
                            author={post.author}
                            readtime={post.readtime}
                            marked={post.marked}
                        />
                    )) : markedSeries.map((series, index) => (
                        <SeriesElement
                            key={index}
                            _id={series._id}
                            image={series.image}
                            title={series.title}
                            description={series.description}
                            user={series.user}
                            posts={series.posts}
                            marked={series.marked}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MarkedList;