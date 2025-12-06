'use client';
// React component example using parsed comment data
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getHeadersToken } from '@/api/authentication';
import { Heart } from 'lucide-react';
import authenticationStore from '@/store/AuthenticationStore';
import Link from 'next/link';
import Image from 'next/image';

type Comment = {
  _id: string;
  author: {
    _id: string,
    avatar?: string;
    username: string;
  };
  content: string;
  timeAgo: string;
  isEdited?: boolean;
  voteCount: number;
  upvotes: String[];
  replies: Comment[];
  hasMoreReplies?: boolean;
  totalReplies: number;
  level: number;
  [key: string]: any; // for any extra fields
};

function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('hot');

  // Load comments
  useEffect(() => {
    loadComments();
  }, [postId, sortBy]);

  const loadComments = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/comments/getPostComments?postId=${postId}`, {
        params: {
          method: 'paginated', // Use paginated method for performance
          page: pageNum,
          limit: 10,
          sort: sortBy
        }
      });
      
      const { data } = response.data;

      console.log("Load data comment", response.data.data.comments);

      
      if (pageNum === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more replies for a specific comment
  const loadMoreReplies = async (commentId: string, currentRepliesCount: number) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/comments/${commentId}/replies`, {
        params: {
          skip: currentRepliesCount,
          limit: 5
        }
      });

      const { replies, hasMore } = response.data.data;
      
      // Update the specific comment's replies
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, ...replies],
            hasMoreReplies: hasMore
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error loading more replies:', error);
    }
  };

  // Add new comment
  const addComment = async (content: string, parentCommentId: string | null = null) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/comments/createComment/`, {
        content,
        postId,
        parentCommentId,
        headers: getHeadersToken(),
      });

      const newComment = response.data.data;
      console.log("new comment", newComment);
      
      if (parentCommentId) {
        // Add as reply to existing comment
        setComments(prev => prev.map(comment => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: [...comment.replies, newComment],
              totalReplies: comment.totalReplies + 1
            };
          }
          return comment;
        }));
      } else {
        // Add as new top-level comment
        setComments(prev => [newComment, ...prev]);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Vote on comment
  const voteComment = async (commentId: string) => {
    try {
        // Remove vote
        const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/comments/vote/${commentId}`, {
          headers: getHeadersToken()
        });
        console.log("response.data", response.data);
        
        const { userVote, score, upvotes } = response.data;
        setComments(prev => updateCommentScore(prev, commentId, userVote, score, upvotes));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Helper function to update comment score recursively
  const updateCommentScore = (
    comments: Comment[],
    commentId: string,
    userVote: boolean,
    score: number,
    upvotes: string[]
  ): Comment[] => {
    return comments.map((comment: Comment) => {
      if (comment._id === commentId) {
        return { ...comment, userVote: userVote, voteCount: score, upvotes };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentScore(comment.replies, commentId, userVote, score, upvotes)
        };
      }
      return comment;
    });
  };

  return (
    <div className="comment-section">
      {/* Sort controls */}
      <div className="comment-controls flex gap-4 mb-4">
        <span className="font-semibold">Sắp xếp theo:</span>
        <button 
          onClick={() => setSortBy('hot')}
          className={`px-3 cursor-pointer py-1 rounded ${sortBy === 'hot' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Hot nhất
        </button>
        <button 
          onClick={() => setSortBy('new')}
          className={`px-3 cursor-pointer py-1 rounded ${sortBy === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Mới nhất
        </button>
      </div>

      {/* Comment form */}
      <CommentForm onSubmit={(content: string) => addComment(content)} />

      {/* Comments list */}
      <div className="comments-list">
        {comments.map(comment => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onReply={addComment}
            onVote={voteComment}
            onLoadMoreReplies={loadMoreReplies}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <button 
          onClick={() => loadComments(page + 1)}
          disabled={loading}
          className="load-more-btn mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Tải thêm bình luận'}
        </button>
      )}
    </div>
  );
}

// Individual comment component
type CommentItemProps = {
  comment: Comment;
  onReply: (content: string, parentCommentId: string) => void;
  onVote: (commentId: string) => void;
  onLoadMoreReplies: (commentId: string, currentRepliesCount: number) => void;
};

function CommentItem({ comment, onReply, onVote, onLoadMoreReplies }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const currentUser = authenticationStore((state) => state.currentUser);

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent, comment._id);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className={`comment-item border-l-2 border-gray-200 pl-4 mb-4 ${comment.level > 0 ? 'ml-8' : ''}`}>
      {/* Comment header */}
      <div className="comment-header flex items-center gap-3 mb-2">
        <Image src={comment.author.avatar || '/default-avatar.png'} alt={comment.author.username} width={32} height={32} className="w-8 h-8 rounded-full" />
        <span className="font-semibold text-gray-800">
          <Link href={`/profile/${comment?.author?._id}`}>
            {comment.author.username}
          </Link>
        </span>
        <span className="text-gray-500 text-sm">
          {comment.timeAgo}
        </span>
        {comment.isEdited && (
          <span className="text-gray-400 text-xs">(đã chỉnh sửa)</span>
        )}
      </div>

      {/* Comment content */}
      <div className="comment-content text-gray-700 mb-3">
        {comment.content}
      </div>

      <div className="comment-actions flex items-center gap-4 text-sm">
        <div className="vote-buttons flex items-center gap-1">
          <Heart className='cursor-pointer' fill={comment.upvotes.includes(currentUser?._id) ? "red" : "transparent"} size={20} color="red" onClick={() => onVote(comment._id)} />
          <span className="vote-count font-medium">
            {comment.voteCount}
          </span>
        </div>

        {/* Reply button */}
        {comment.level < 10 && (
          <button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-blue-500 hover:text-blue-600"
          >
            Trả lời
          </button>
        )}

        {/* Report button */}
        <button className="text-gray-500 hover:text-gray-600">
          Báo cáo
        </button>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="reply-form mt-3 p-3 bg-gray-50 rounded">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Viết phản hồi của bạn..."
            className="w-full p-2 border border-gray-300 rounded resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleReply}
              disabled={!replyContent.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Gửi
            </button>
            <button 
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies mt-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onVote={onVote}
              onLoadMoreReplies={onLoadMoreReplies}
            />
          ))}
          
          {/* Load more replies button */}
          {comment.hasMoreReplies && (
            <button 
              onClick={() => onLoadMoreReplies(comment._id, comment.replies.length)}
              className="load-more-replies mt-2 text-blue-500 hover:text-blue-600 text-sm"
            >
              Xem thêm {comment.totalReplies - comment.replies.length} phản hồi
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Comment form component
function CommentForm({
  onSubmit,
  placeholder = "Viết bình luận của bạn..."
}: {
  onSubmit: (content: string) => Promise<void> | void;
  placeholder?: string;
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form mb-6">
      <div className="form-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {content.length}/2000 ký tự
          </span>
          <button 
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default CommentSection;