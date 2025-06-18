import React, { useEffect } from "react";
import { PostElement, PostInterface } from "./page";
import { getHeadersToken } from "@/api/authentication";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";

const PostInformation = () => {
  const [displayPost, setDisplayPost] = React.useState<PostInterface[]>([]);
  // 1: All posts, 2: Series
  const [postType, setPostType] = React.useState<number>(1);
  const [titlePost, setTitlePost] = React.useState<string>("Posts");

  const changeLoad = loadingStore((state) => state.changeLoad);

  useEffect(() => {
    // Fetch all posts from the server
    const fetchPosts = async () => {
      try {
        changeLoad();
        const token = localStorage.getItem("access_token");
        if (token) {
          const headers = getHeadersToken();

          const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByAuthor`, { headers });
          if (res.status === 200) {
            console.log("posts info: ", res.data);
            setDisplayPost(res.data.posts);
          }
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
          {displayPost.map((post, index) => (
            <PostElement key={index}
              image={post.image}
              category={post.category}
              title={post.title}
              content={post.text}
              author={post.author}
              readTime="5 phut"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostInformation;