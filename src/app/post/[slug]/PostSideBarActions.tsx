"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Heart , MessageCircle, Share2, User, Plus, Bookmark, Check } from "lucide-react";
import authenticationStore from "@/store/AuthenticationStore";
import { getHeadersToken } from "@/api/authentication";
import { REACT_APP_ROOT_BACKEND } from "@/component/authen/authentication";
import axios from "axios";
import alertStore from "@/store/AlertStore";
import Notification from "@/component/common/Notification";
import Link from "next/link";

export default function PostSidebarActions({postData}: any) {
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [likeCount, setLikeCount] = useState(postData?.likes?.length);
  const [commentCount, setCommentCount] = useState(postData?.comments?.length);
  const [display, setDisplay] = useState(false);

  const setType = alertStore((state) => state.setType);
  const setMessage = alertStore((state) => state.setMessage);

  const handleLike = async () => {
    try {
      const res = await axios.post(`${REACT_APP_ROOT_BACKEND}/comments/voteLike/${postData._id}`, {headers: getHeadersToken()});

      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      console.log("data.post.postlike: ", res.data.postLike);
      const { postLike } = res.data;
      if(postLike) {
        setIsLiked(true);
        setLikeCount(likeCount+1);
      } else { 
        setIsLiked(false);
        setLikeCount(likeCount-1);
      }
    } catch (error) {
      setType('error');
      setMessage("Error when like post");
    }
  };

  const handleBookmark = async () => {
    try {
      // Using native fetch with Next.js optimizations
      const res = await axios.post(`${REACT_APP_ROOT_BACKEND}/post/marked?postId=${postData._id}`, {headers: getHeadersToken()});

      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      console.log("data.post.postlike: ", res.data.isMarked);
      const { isMarked } = res.data;
      if(isMarked) {
        setType('info');
        setMessage("Post bookmarked successfully");
      } else {
        setType('info');
        setMessage("Post unbookmarked successfully");
      }
      setIsBookmarked(isMarked);
    } catch (error) {
      setType('error');
      setMessage("Error when like post");
    }
  };

  const handleFollow = async () => {
    try {
      // Using native fetch with Next.js optimizations
      const res = await axios.patch(`${REACT_APP_ROOT_BACKEND}/post/followUser?postId=${postData._id}`, {headers: getHeadersToken()});

      if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      console.log("data.post.postlike: ", res.data.isFollowed);
      const { isFollowed } = res.data;
      if(isFollowed) {
        setType('info');
        setMessage("User followed successfully");
      } else {
        setType('info');
        setMessage("User unfollowed successfully");
      }
      setIsFollowed(isFollowed);
    } catch (error) {
      setType('error');
      setMessage("Error when follow user");
    }
  };

  useEffect(() => {
    const getStatus = async () => {
      try {
        const res = await axios.get(`${REACT_APP_ROOT_BACKEND}/post/getSideInformation?postId=${postData._id}`, { headers: getHeadersToken()});

        if (res.status !== 200) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        console.log("data.post.postlike: ", res.data);
        const { isLiked, isBookmarked, isFollowed } = res.data;
        setIsLiked(isLiked);
        setIsBookmarked(isBookmarked);
        setIsFollowed(isFollowed);
      } catch (error) {
        setType('error');
        setMessage("Error when fetching post status");
      }
    };

    getStatus();
  }, [])

  const handleScroll = useCallback(() => {
    console.log("Scrolled!", window.scrollY);

    if (window.scrollY > 600) {
      setDisplay(true);
    } else {
      setDisplay(false);
    }

    if(window.scrollY > 3000) {
      setDisplay(false);
    }
  }, []); // Empty dependency array means this function is memoized and won't re-create on every render

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]); // Dependency array includes handleScroll to ensure the listener is updated if handleScroll changes

  return (
    <>
      <Notification />
      {display && (
        <div className="hidden md:block fixed left-12 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-6 z-10">
          {/* Like Button with Heart */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLike}
              className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                isLiked
                  ? "bg-red-100 text-red-500 hover:bg-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } cursor-pointer`}
            >
              <Heart size={20} className={isLiked ? "fill-current" : ""} />
            </button>
            <span className="text-sm font-medium text-gray-700 mt-1">
              {likeCount}
            </span>
          </div>

          {/* Author Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
              <Link href={`/profile/${postData.author._id}`}><img
                src={postData.author.avatar}
                alt="Author avatar image"
                className="w-full h-full object-cover"
              /></Link>
              
            </div>
            {/* Small plus icon for follow */}
            { isFollowed ? (
              <div onClick={handleFollow} className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                <Check size={12} className="text-white" />
              </div>
            ) : (
              <div onClick={handleFollow} className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                <Plus size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
              isBookmarked
                ? "bg-blue-100 text-blue-500 hover:bg-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } cursor-pointer`}
          >
            <Bookmark 
              size={20}
              className={isBookmarked ? "fill-current" : ""}
            />
          </button>

          {/* Comments */}
          <div className="flex flex-col items-center">
            <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-110 cursor-pointer">
              <MessageCircle size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 mt-1">
              {commentCount}
            </span>
          </div>

          {/* Share Button */}
          <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-110 cursor-pointer">
            <Share2 size={20} />
          </button>
        </div>
      )}
    </>
  );
}
