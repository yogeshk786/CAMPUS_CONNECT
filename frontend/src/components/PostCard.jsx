import { useState } from 'react';
import { MessageCircle, Heart, Share, MoreHorizontal, UserMinus } from 'lucide-react';
import API from '../api/axios';
import CompactConnectButton from './CompactConnectButton';

export default function PostCard({ post, currentUser }) {
  // 1. Post States
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  // 2. Logic Checks
  const isMyPost = currentUser?._id === post.user?._id;
  const isConnected = currentUser?.connections?.some(id => 
    typeof id === 'object' ? id._id === post.user?._id : id === post.user?._id
  );
  const isLikedByMe = currentUser ? likes.includes(currentUser._id) : false;

  // 3. Time Formatter Logic
  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(date).toLocaleDateString();
  };

  // 4. Interaction Handlers
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsCommenting(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(data.comments); 
      setCommentText('');
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="px-4 pt-3 pb-2 hover:bg-white/[0.03] transition-all duration-200 flex flex-col border-b border-gray-800">
      <div className="flex gap-3 w-full">
        
        {/* 👉 THE FIX: Profile Photo for Post Creator */}
        <div className="w-10 h-10 flex-shrink-0 mt-1">
          <img 
            src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name || 'U'}&background=random`} 
            alt={post.user?.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-800 bg-gray-900"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[15px] flex-wrap gap-1">
              <span className="font-bold text-white hover:underline cursor-pointer truncate">
                {post.user?.name || 'User'}
              </span>
              <span className="text-gray-500 truncate text-[14px]">@{post.user?.handle || 'handle'}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-[14px]">{formatTime(post.createdAt)}</span>
              
              {/* Connect Button */}
              {!isMyPost && (
                <div className="ml-2">
                  <CompactConnectButton 
                    targetUserId={post.user?._id} 
                    isConnected={isConnected} 
                  />
                </div>
              )}
            </div>
            <div className="text-gray-500 hover:text-[#1d9bf0] transition p-2 hover:bg-[#1d9bf0]/10 rounded-full cursor-pointer">
              <MoreHorizontal size={18} />
            </div>
          </div>
          
          <p className="mt-1 text-[15px] text-gray-100 leading-normal whitespace-pre-wrap break-words font-normal">
            {post.text || post.content}
          </p>
          
          {post.image && (
            <div className="mt-3 rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
              <img src={post.image} className="w-full h-auto object-cover max-h-[512px] hover:scale-[1.01] transition-transform duration-300" alt="Post media" />
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex justify-between mt-3 text-gray-500 max-w-[425px]">
            {/* Comment Icon */}
            <div 
              onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
              className="flex items-center group transition cursor-pointer"
            >
              <div className="p-2 group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] rounded-full transition">
                <MessageCircle size={18} />
              </div>
              <span className="text-[13px] px-1 group-hover:text-[#1d9bf0] transition">{comments.length}</span>
            </div>

            {/* Like Icon */}
            <button onClick={handleLike} disabled={isLiking} className={`flex items-center group transition ${isLikedByMe ? 'text-[#f91880]' : ''}`}>
              <div className={`p-2 rounded-full transition ${isLikedByMe ? '' : 'group-hover:bg-[#f91880]/10 group-hover:text-[#f91880]'}`}>
                <Heart size={18} fill={isLikedByMe ? "currentColor" : "none"} className={isLikedByMe ? "animate-pulse" : ""} />
              </div>
              <span className={`text-[13px] px-1 transition ${isLikedByMe ? '' : 'group-hover:text-[#f91880]'}`}>{likes.length}</span>
            </button>

            {/* Share Icon */}
            <div className="flex items-center group transition cursor-pointer">
              <div className="p-2 group-hover:bg-[#00ba7c]/10 group-hover:text-[#00ba7c] rounded-full transition"><Share size={18} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Section */}
      {showCommentBox && (
        <div className="mt-2 pt-3 border-t border-gray-800 ml-[52px] animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center mb-6">
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
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-4 py-1.5 rounded-full text-[14px] disabled:opacity-50 transition"
            >
              Reply
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-5 mb-4">
            {comments.map((c, index) => (
              <div key={index} className="flex gap-3 items-start">
                {/* 👉 THE FIX: Profile Photo for Commenter */}
                <div className="w-8 h-8 flex-shrink-0 mt-0.5">
                  <img 
                    src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.name || 'U'}&background=random`} 
                    className="w-8 h-8 rounded-full object-cover border border-gray-800 bg-gray-900"
                    alt={c.user?.name}
                  />
                </div>
                <div className="flex-1 bg-white/[0.04] p-3 rounded-2xl border border-white/[0.05]">
                  <div className="flex items-center gap-2 text-[14px]">
                    <span className="font-bold text-white hover:underline cursor-pointer">{c.user?.name || 'User'}</span>
                    <span className="text-gray-500 text-xs">@{c.user?.handle}</span>
                  </div>
                  <p className="text-[14px] text-gray-200 mt-1 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}