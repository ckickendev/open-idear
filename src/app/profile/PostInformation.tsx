import React, { useEffect } from "react";
import { getHeadersToken } from "@/api/authentication";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import PostElement from "./PostElement";
import { PostInterface } from "./[profileId]/page";
import SeriesElement from "./SeriesElement";

const PostInformation = ({ profileId }: any) => {
  const [displayPost, setDisplayPost] = React.useState<PostInterface[]>([]);
  const [displaySeries, setDisplaySeries] = React.useState<any[]>([]);
  // 1: All posts, 2: Series
  const [postType, setPostType] = React.useState<number>(1);
  const [titlePost, setTitlePost] = React.useState<string>("Posts");

  const changeLoad = loadingStore((state) => state.changeLoad);

  useEffect(() => {
    // Fetch all posts from the server
    const fetchPosts = async () => {
      try {
        changeLoad();

        const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthorId?profileId=${profileId}`);
        if (res.status === 200) {
          
          console.log("posts info: ", res.data);
          setDisplayPost(res.data.posts);
        }

        const resSeries = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getSeriesByAuthorId?profileId=${profileId}`);
        if (resSeries.status === 200) {
          //console.log("series info: ", resSeries.data);
          setDisplaySeries(resSeries.data.series);
        }

      } catch (error) {
        console.error('Error fetching posts:', error);
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
    <div className="flex-1 m-l-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between rounded-xl ">
        <div className={`text-xl cursor-pointer font-bold ${postType == 2 ? "bg-gray-300 rounded-r-lg" : ''} w-1/2 p-4 text-center`} onClick={() => handlePostTypeClick(1)}>All Posts</div>
        <div className={`text-xl cursor-pointer font-bold ${postType == 1 ? "bg-gray-300 rounded-l-lg" : ''} w-1/2 p-4 text-center`} onClick={() => handlePostTypeClick(2)}>All Series</div>
      </div>

      <div className="h-full">
        <div className="space-y-4 h-full m-4 p-2">
          {displayPost.length == 0 && <h1 className='text-xxl h-full font-semibold mb-4 flex justify-center items-center'>No record</h1>}
          {postType == 1 ? displayPost.map((post, index) => (
            <PostElement
              key={index}
              _id={post._id}
              image={post.image}
              category={post.category}
              title={post.title}
              content={post.text}
              author={post.author}
              readTime="5 phut"
            />
          )) : displaySeries.map((series, index) => (
            <SeriesElement
              key={index}
              _id={series._id}
              image={series.image}
              title={series.title}
              description={series.description}
              user={series.user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostInformation;