import { useState } from 'react';
import { MessageCircle, Repeat2, Heart, Share, BarChart3, MoreHorizontal } from 'lucide-react';
import API from '../api/axios';
import CompactConnectButton from './CompactConnectButton';

export default function PostCard({ post, currentUser }) {
  // Post states
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  // Logic checks
  const isMyPost = currentUser?._id === post.user?._id;
  const isConnected = currentUser?.connections?.some(id => 
    typeof id === 'object' ? id._id === post.user?._id : id === post.user?._id
  );
  const isLikedByMe = currentUser ? likes.includes(currentUser._id) : false;

  // Handle Like/Unlike
  const handleLike = async (e) => {
    e.stopPropagation(); 
    if (isLiking || !currentUser) return;
    setIsLiking(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/like`);
      setLikes(data.likes); 
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsCommenting(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, {
        text: commentText
      });
      // Backend should return populated comments for name display
      setComments(data.comments); 
      setCommentText('');
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="px-4 pt-3 pb-2 hover:bg-white/[0.03] transition flex flex-col border-b border-gray-800">
      
      <div className="flex gap-3 w-full">
        {/* User Avatar */}
        <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white uppercase mt-1">
          {post.user?.name?.[0] || 'U'}
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[15px] flex-wrap">
              <span className="font-bold text-white hover:underline truncate mr-1">
                {post.user?.name || 'User'}
              </span>
              <span className="text-gray-500 truncate mr-1">@{post.user?.handle || 'handle'}</span>
              <span className="text-gray-500 mr-1">·</span>
              <span className="text-gray-500">2h</span>
              
              {/* Connect Button (Hidden on self-posts) */}
              {!isMyPost && (
                <CompactConnectButton 
                  targetUserId={post.user?._id} 
                  isConnected={isConnected} 
                  isPending={false} 
                />
              )}
            </div>
            <div className="text-gray-500 hover:text-[#1d9bf0] transition p-1 hover:bg-[#1d9bf0]/10 rounded-full cursor-pointer">
              <MoreHorizontal size={18} />
            </div>
          </div>
          
          <p className="mt-0.5 text-[15px] text-white leading-normal whitespace-pre-wrap break-words">
            {post.text || post.content}
          </p>
          
          {post.image && (
            <div className="mt-3 rounded-2xl border border-gray-800 overflow-hidden">
              <img src={post.image} className="w-full h-auto object-cover max-h-[512px]" alt="Post media" />
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex justify-between mt-3 text-gray-500 max-w-[425px]">
            <div 
              onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
              className="flex items-center group transition cursor-pointer"
            >
              <div className="p-2 group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] rounded-full transition">
                <MessageCircle size={18} />
              </div>
              <span className="text-[13px] px-1 group-hover:text-[#1d9bf0] transition">{comments.length}</span>
            </div>

            <button onClick={handleLike} disabled={isLiking} className={`flex items-center group transition ${isLikedByMe ? 'text-[#f91880]' : ''}`}>
              <div className={`p-2 rounded-full transition ${isLikedByMe ? '' : 'group-hover:bg-[#f91880]/10 group-hover:text-[#f91880]'}`}>
                <Heart size={18} fill={isLikedByMe ? "currentColor" : "none"} />
              </div>
              <span className={`text-[13px] px-1 transition ${isLikedByMe ? '' : 'group-hover:text-[#f91880]'}`}>{likes.length}</span>
            </button>

            <div className="flex items-center group transition cursor-pointer">
              <div className="p-2 group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] rounded-full transition"><Share size={18} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Section */}
      {showCommentBox && (
        <div className="mt-2 pt-3 border-t border-gray-800 ml-[52px]">
          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Post your reply..."
              className="flex-1 bg-transparent border-b border-gray-700 focus:border-[#1d9bf0] outline-none text-white text-[15px] pb-1 transition-colors"
            />
            <button
              type="submit"
              disabled={isCommenting || !commentText.trim()}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-4 py-1.5 rounded-full text-[14px] disabled:opacity-50"
            >
              Reply
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 mb-2">
            {comments.map((c, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white text-xs uppercase flex-shrink-0 mt-0.5">
                  {c.user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 bg-white/[0.05] p-3 rounded-2xl">
                  <div className="flex items-center gap-1 text-[14px]">
                    <span className="font-bold text-white">{c.user?.name || 'User'}</span>
                    <span className="text-gray-500 text-xs">@{c.user?.handle}</span>
                  </div>
                  <p className="text-[14px] text-gray-200 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}