"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Heart, Bookmark, MessageCircle, Share2, User } from "lucide-react";

export default function PostSidebarActions() {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(26);
  const [commentCount] = useState(24);
  const [display, setDisplay] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

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

  useEffect(() => {
    loadDataInSideBar
  }, []);

  const loadDataInSideBar = async () => {
    
  };

  return (
    <>
      {display && (
        <div className="fixed left-12 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-6 z-10">
          {/* Like Button with Heart */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLike}
              className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
                isLiked
                  ? "bg-red-100 text-red-500 hover:bg-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
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
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                alt="Author avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Small plus icon for follow */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
              <User size={12} className="text-white" />
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`p-3 rounded-full transition-all duration-200 hover:scale-110 ${
              isBookmarked
                ? "bg-blue-100 text-blue-500 hover:bg-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Bookmark
              size={20}
              className={isBookmarked ? "fill-current" : ""}
            />
          </button>

          {/* Comments */}
          <div className="flex flex-col items-center">
            <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-110">
              <MessageCircle size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 mt-1">
              {commentCount}
            </span>
          </div>

          {/* Share Button */}
          <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-110">
            <Share2 size={20} />
          </button>
        </div>
      )}
    </>
  );
}
