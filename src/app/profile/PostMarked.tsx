import React, { useEffect } from "react";
import { getHeadersToken } from "@/api/authentication";
import axios from "axios";
import loadingStore from "@/store/LoadingStore";
import authenticationStore from "@/store/AuthenticationStore";
import PostElement from "./PostElement";
import { PostInterface } from "./[profileId]/page";

const PostMarked = () => {
    const [markedPosts, setMarkedPosts] = React.useState<PostInterface[]>([]);

    const currentUser = authenticationStore((state) => state.currentUser);
    const changeLoad = loadingStore((state) => state.changeLoad);

    useEffect(() => {
        // Fetch all posts from the server
        const fetchPosts = async () => {
            try {
                changeLoad();
                const token = localStorage.getItem("access_token");
                if (token) {
                    const resMarked = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getMarkedByUser/${currentUser._id}`);
                    if (resMarked.status === 200) {
                        setMarkedPosts(resMarked.data.posts);
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

    return (
        <div className="flex-1 m-l-4 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">Marked Post</h1>
            </div>

            <div className="h-full">
                <div className="space-y-4 h-full m-4 p-2">
                    {markedPosts.length == 0 && <h1 className='text-xxl h-full font-semibold mb-4 flex justify-center items-center'>No record</h1>}
                    {markedPosts.map((post, index) => (
                        <PostElement
                            _id={post._id}
                            key={index}
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

export default PostMarked;