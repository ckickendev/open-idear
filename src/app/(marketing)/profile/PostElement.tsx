import { ENV } from "@/api/const";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { PostInterface } from "./[username]/page";
import authenticationStore from "@/store/AuthenticationStore";
import axios from "axios";
import { toast } from "sonner";
import { getHeadersToken } from "@/lib/api/axios";
import { CategoryLinkCustom } from "@/components/common/LinkCustom";
import Link from "next/link";

const PostElement = ({ post }: { post: PostInterface }) => {
  const currentUser = authenticationStore((state) => state.currentUser);
  const [bookmarked, setBookmarked] = useState(
    post.marked?.includes(currentUser?._id),
  );

  const onMarkedPost = async () => {
    try {
      const response = await axios.patch(
        `${ENV.ROOT_API}/post/markPost`,
        {
          postId: post._id,
        },
        {
          headers: getHeadersToken(),
        },
      );

      if (response.status === 200) {
        toast.success(
          response.data.isMarked
            ? "Post marked successfully."
            : "Post unmarked successfully.",
        );
        setBookmarked(!bookmarked);
      } else {
        toast.error("Failed to mark the post.");
      }
    } catch (error: any) {
      toast.error(
        error.response.data.message ||
        "An error occurred while marking the post.",
      );
    }
  };

  const minutesRead = post.readtime
    ? (typeof post.readtime === "string" ? parseInt(post.readtime, 10) : post.readtime)
    : Math.max(1, Math.ceil((post.text || "").split(/\s+/).length / 200)) || 5;

  return (
    <div className="flex w-full rounded-xl overflow-hidden bg-background shadow-sm border border-border/80 hover:border-border transition-all duration-300 hover:shadow-md group">
      {/* Left side - Image */}
      <div className="w-1/3 h-40 relative bg-muted overflow-hidden flex-shrink-0">
        <Link href={`/post/${post.slug}`} className="block h-full w-full">
          <img
            src={post?.image?.url || "/default-post-image.jpg"}
            alt={post.title}
            className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-102"
          />
        </Link>
      </div>

      {/* Right side - Content */}
      <div className="w-2/3 p-5 flex flex-col justify-between">
        <div>
          <Link href={`/post/${post.slug}`} className="block group/title">
            <h2 className="text-lg font-bold leading-snug mb-2 text-foreground group-hover/title:text-blue-600 transition-colors line-clamp-2">
              {post.title}
            </h2>
          </Link>
          {post.text && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
              {post.text}
            </p>
          )}
        </div>

        {/* Footer info: Author, readtime, and Bookmark */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
          <div className="flex items-center space-x-2">
            {post.author?._id && (
              <Link
                className="flex items-center justify-start text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                href={`/profile/${post.author.username}`}
              >
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full mr-2 object-cover"
                  />
                )}
                <span>{post.author.name || post.author.username}</span>
                {post.author.verified && (
                  <span className="ml-1 text-blue-500">
                    <svg
                      className="w-3.5 h-3.5 inline-block"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </span>
                )}
              </Link>
            )}
            <span className="text-xs text-muted-foreground/50">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {minutesRead} phút đọc
            </span>
          </div>

          <button
            onClick={onMarkedPost}
            className="text-muted-foreground hover:text-blue-600 cursor-pointer p-1 rounded-full hover:bg-muted/50 transition-colors"
          >
            <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostElement;
