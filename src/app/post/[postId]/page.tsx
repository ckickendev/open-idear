import HotPost from "@/component/hot_post/HotPost";
import { Mail, Link } from "lucide-react";
import CommentSection from "./CommentSection";
import PostSidebarActions from "./PostSideBarActions";
import Image from "next/image";

export default async function PostLists({
  params,
}: {
  params: { postId: string };
}) {
  const { postId } = params;

  const getPost = async (id: string) => {
    try {
      // Using native fetch with Next.js optimizations
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByID/${id}`,
        {
          // Next.js 13+ fetch options
          next: { revalidate: 3600 }, // Cache for 1 hour
          // or use: cache: 'no-store' for always fresh data
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("data.post: ", data.post);

      return data.post;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw new Error(`Failed to fetch post with ID: ${id}`);
    }
  };

  const getRandomTopic = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/category/getRandomTopic?limit=5&page=1`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      } 
      const data = await res.json();
      
      return data.topic;
    } catch (error) {
      console.error("Error fetching random topic:", error);
    }
  };

  const postData = await getPost(postId);
  const randomTopic = await getRandomTopic();

  if (!postData) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <div className="relative mb-6">
        {/* <Image
          src={postData?.image?.url || "/banner/openidear3.webp"} // adjust field name
          alt={postData?.title || "Post banner"}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
          className="w-full h-80 object-cover rounded-lg"
        /> */}
        <img
          src={postData.image?.url || "/banner/openidear3.webp"}
          alt={postData.title}
          className="w-full h-80 object-cover rounded-lg"
        />

        {/* Image Caption */}
        <div className="max-w-4xl mx-auto px-4 py-2 bg-white text-sm text-gray-600 leading-relaxed">
          <span className="text-yellow-600 font-medium">|</span> {postData.image?.description || "No description available"}
        </div>
      </div>  
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white">
        <PostSidebarActions />

        {/* Article Content */}
        <article className="max-w-4xl">
          {/* Category Tag */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded uppercase tracking-wide">
              {postData.category ? postData.category.name : "Uncategorized"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {postData.title}
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            {postData.description}
          </p>

          {/* Author and Date Info */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">By <a href={`/profile/${postData.author.id}`} className="hover:underline">{postData.author.username}</a></p>
              <p className="text-sm text-gray-600">Created date: {new Date(postData.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Social Share Icons */}
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                <Mail size={16} />
              </button>
              <button className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors">
                <Link size={16} />
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: postData.content }} />
          </div>

          <div className="mb-4">
            <h1 className="text-2xl mb-6 font-bold text-red-700">Related Topics</h1>

            {randomTopic && randomTopic.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {randomTopic.map((topic: any) => (
                  <a
                    key={topic._id}
                    href={`/category/${topic.slug}`}
                    className="inline-block px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded uppercase tracking-wide hover:bg-gray-300 transition-colors"
                  >
                    {topic.name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No related topics available.</p>
            )}
          </div>

          
        </article>
      </div>
      <div className="max-w-full mx-auto px-4 py-8 bg-white">
        <HotPost />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 bg-white">
        <CommentSection postId={postId} />
      </div>
    </>
    
    
  );
}
