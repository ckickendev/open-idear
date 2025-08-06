import { useState } from "react";

const commentData = {
  comments: [
    {
      _id: "commentId1",
      content: "Thằng bạn mình cũng làm video editor, nó còn chẳng được đi học giống bạn...",
      author: {
        _id: "userId1",
        username: "hhoafcaww",
        avatar: "avatar-url"
      },
      post: "postId1",
      parentComment: null,
      level: 0,
      score: 3,
      upvotes: ["user1", "user2", "user3"],
      downvotes: [],
      createdAt: "2024-08-04T10:00:00Z",
      replies: [
        {
          _id: "commentId2",
          content: "Quan điểm làm việc của bạn ấy rất là thực tế, do mình mơ mộng nhiều nên dễ thất vọng hơn.",
          author: {
            _id: "userId2",
            username: "ThángNK",
            avatar: "avatar-url"
          },
          post: "postId1",
          parentComment: "commentId1",
          level: 1,
          score: 1,
          upvotes: ["user4"],
          downvotes: [],
          createdAt: "2024-08-04T10:30:00Z",
          replies: []
        }
      ]
    },
    {
      _id: "commentId3",
      content: "cảm ơn bạn vì bài viết, nó giúp mình nhận ra được vài điều và trân trọng cuộc sống hiện có hơn...",
      author: {
        _id: "userId3",
        username: "WandererGuy",
        avatar: "avatar-url"
      },
      post: "postId1",
      parentComment: null,
      level: 0,
      score: 2,
      upvotes: ["user5", "user6"],
      downvotes: [],
      createdAt: "2024-06-04T15:00:00Z",
      replies: []
    }
  ],
  page: 1,
  totalPages: 1
};

// TypeScript interfaces for comment and props
interface Author {
  _id: string;
  username: string;
  avatar: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: Author;
  post: string;
  parentComment: string | null;
  level: number;
  score: number;
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
  replies: Comment[];
}

interface CommentComponentProps {
  comment: Comment;
  onReply: (commentId: string, replyContent: string) => Promise<void>;
  onVote: (commentId: string, type: 'up' | 'down') => void;
  currentUser: any;
}

// React component example for rendering comments
function CommentComponent({ comment, onReply, onVote, currentUser }: CommentComponentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  const handleReply = async () => {
    if (replyContent.trim()) {
      await onReply(comment._id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };
  
  const timeAgo = getTimeAgo(comment.createdAt);
  
  return (
    <div className={`comment ${comment.level > 0 ? 'ml-8' : ''}`}>
      <div className="comment-header flex items-center gap-2">
        <img 
          src={comment.author.avatar} 
          alt={comment.author.username}
          className="w-8 h-8 rounded-full"
        />
        <span className="font-semibold">{comment.author.username}</span>
        <span className="text-gray-500 text-sm">{timeAgo}</span>
      </div>
      
      <div className="comment-content mt-2">
        {comment.content}
      </div>
      
      <div className="comment-actions flex items-center gap-4 mt-2">
        <button 
          onClick={() => onVote(comment._id, 'up')}
          className="flex items-center gap-1"
        >
          ▲ {comment.score}
        </button>
        <button 
          onClick={() => onVote(comment._id, 'down')}
          className="flex items-center gap-1"
        >
          ▼
        </button>
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-blue-500 text-sm"
        >
          Trả lời
        </button>
      </div>
      
      {showReplyForm && (
        <div className="reply-form mt-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Viết phản hồi..."
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleReply}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Gửi
            </button>
            <button 
              onClick={() => setShowReplyForm(false)}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
      
      {/* Render replies recursively */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies mt-4">
          {comment.replies.map((reply: any) => (
            <CommentComponent
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onVote={onVote}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateString: string | number | Date) {
  const now = new Date();
  const commentDate = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "vừa xong";
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} tháng trước`;
}