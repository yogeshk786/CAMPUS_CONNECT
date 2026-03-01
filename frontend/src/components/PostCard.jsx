import { useState } from 'react';
import { MessageCircle, Heart, Share, MoreHorizontal, Sparkles, Send, CheckCircle2, Clock } from 'lucide-react'; // 👉 ADDED: Clock icon for "Requested" state
import API from '../api/axios';
import CompactConnectButton from './CompactConnectButton';
import { useNavigate } from 'react-router-dom'; 

export default function PostCard({ post, currentUser }) {
  const navigate = useNavigate(); 

  // 1. Post States
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  // 2. Logic Checks
  const isMyPost = currentUser?._id === post.user?._id;
  
  // 👉 CHECK 1: Kya user already connected hai?
  const isConnected = currentUser?.connections?.some(connection => {
    const connectionId = typeof connection === 'object' ? connection._id : connection;
    return connectionId === post.user?._id;
  });

  // 👉 CHECK 2: Kya user ko already request bhej chuke hain?
  // Note: Aapke backend API se currentUser mein `sentRequests` ya us jaisa koi array aana chahiye
  const isRequested = currentUser?.sentRequests?.some(req => {
    const reqId = typeof req === 'object' ? req._id : req;
    return reqId === post.user?._id;
  });

  const isLikedByMe = currentUser ? likes.includes(currentUser._id) : false;

  // 3. Time Formatter Logic
  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(date).toLocaleDateString();
  };

  // 4. Handle Profile Click Navigation
  const handleProfileClick = (e) => {
    e.stopPropagation(); 
    if (!post.user?._id) return;

    if (isMyPost) {
      navigate('/profile'); 
    } else {
      navigate(`/user/${post.user._id}`); 
    }
  };

  // 5. Interaction Handlers
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
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-5 md:p-6 rounded-[2rem] shadow-sm hover:shadow-md dark:shadow-none dark:hover:border-white/10 transition-all duration-300 group mb-4">
      <div className="flex gap-3 md:gap-4 w-full">
        
        {/* Avatar Section */}
        <div 
          className="w-12 h-12 flex-shrink-0 mt-1 cursor-pointer transition-transform active:scale-95"
          onClick={handleProfileClick}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1d9bf0] to-purple-500 p-[2px]">
            <img 
              src={post.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.name || 'U'}`} 
              alt={post.user?.name}
              className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#050505] bg-gray-100 dark:bg-gray-900"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[15px] flex-wrap gap-1.5">
              
              {/* Username */}
              <span 
                onClick={handleProfileClick}
                className="font-black text-gray-900 dark:text-white hover:text-[#1d9bf0] dark:hover:text-[#1d9bf0] transition-colors cursor-pointer truncate flex items-center gap-1 hover:underline"
              >
                {post.user?.name || 'User'}
                {post.likes?.length > 100 && <Sparkles size={14} className="text-yellow-500" />}
              </span>
              
              {/* Handle */}
              <span 
                onClick={handleProfileClick}
                className="text-gray-500 dark:text-gray-500 font-medium truncate text-[14px] cursor-pointer hover:underline"
              >
                @{post.user?.handle || 'handle'}
              </span>
              
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <span className="text-gray-500 dark:text-gray-500 text-[14px] font-medium">{formatTime(post.createdAt)}</span>
              
              {/* 👉 UPDATE: 3-Way Condition (Connected / Requested / Connect Button) */}
              {!isMyPost && (
                <div className="ml-2 flex items-center">
                  {isConnected ? (
                    // 1. Agar Connected hai toh GREEN BADGE
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-bold rounded-full border border-green-200 dark:border-green-500/20">
                      <CheckCircle2 size={12} />
                      Connected
                    </div>
                  ) : isRequested ? (
                    // 2. Agar Request Bheji hui hai toh GRAY/PENDING BADGE
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[11px] font-bold rounded-full border border-gray-200 dark:border-white/10">
                      <Clock size={12} />
                      Requested
                    </div>
                  ) : (
                    // 3. Kuch nahi hai toh CONNECT BUTTON
                    <CompactConnectButton 
                      targetUserId={post.user?._id} 
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Options Menu Icon */}
            <div className="text-gray-400 hover:text-[#1d9bf0] transition p-2 hover:bg-blue-50 dark:hover:bg-[#1d9bf0]/10 rounded-full cursor-pointer">
              <MoreHorizontal size={18} />
            </div>
          </div>
          
          {/* Post Text Body */}
          <p className="mt-2 text-lg md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words font-medium">
            {post.text || post.content}
          </p>
          
          {/* Post Image Container */}
          {post.image && (
            <div className="mt-4 rounded-[1.5rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
              <img src={post.image} className="w-full h-auto object-cover max-h-[512px] hover:scale-[1.02] transition-transform duration-500" alt="Post media" />
            </div>
          )}

          {/* Interaction Buttons Area */}
          <div className="flex justify-between mt-4 text-gray-500 dark:text-gray-500 max-w-[425px]">
            
            {/* Comment Icon Button */}
            <div 
              onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }}
              className="flex items-center group transition cursor-pointer"
            >
              <div className="p-2.5 group-hover:bg-blue-50 dark:group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] rounded-full transition-colors">
                <MessageCircle size={20} />
              </div>
              <span className="text-[14px] font-bold px-1 group-hover:text-[#1d9bf0] transition-colors">{comments.length}</span>
            </div>

            {/* Like Icon Button */}
            <button onClick={handleLike} disabled={isLiking} className={`flex items-center group transition ${isLikedByMe ? 'text-[#f91880]' : ''}`}>
              <div className={`p-2.5 rounded-full transition-colors ${isLikedByMe ? '' : 'group-hover:bg-pink-50 dark:group-hover:bg-[#f91880]/10 group-hover:text-[#f91880]'}`}>
                <Heart size={20} fill={isLikedByMe ? "currentColor" : "none"} className={isLikedByMe ? "animate-pulse" : ""} />
              </div>
              <span className={`text-[14px] font-bold px-1 transition-colors ${isLikedByMe ? '' : 'group-hover:text-[#f91880]'}`}>{likes.length}</span>
            </button>

            {/* Share Icon Button */}
            <div className="flex items-center group transition cursor-pointer">
              <div className="p-2.5 group-hover:bg-green-50 dark:group-hover:bg-[#00ba7c]/10 group-hover:text-[#00ba7c] rounded-full transition-colors"><Share size={20} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Section */}
      {showCommentBox && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 ml-0 md:ml-[60px] animate-in slide-in-from-top-2 duration-300">
          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center mb-6">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What's your take? ✨"
              className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-3 rounded-2xl focus:border-[#1d9bf0] dark:focus:border-[#1d9bf0] focus:bg-white dark:focus:bg-white/5 outline-none text-gray-900 dark:text-white text-[15px] transition-all font-medium shadow-inner dark:shadow-none"
            />
            <button
              type="submit"
              disabled={isCommenting || !commentText.trim()}
              className="bg-gradient-to-r from-[#1d9bf0] to-blue-600 hover:opacity-90 text-white font-bold px-5 py-3 rounded-2xl text-[14px] disabled:opacity-50 transition-all active:scale-95 shadow-md flex items-center gap-2"
            >
              Reply <Send size={14} />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 mb-2">
            {comments.map((c, index) => (
              <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                <div 
                  className="w-10 h-10 flex-shrink-0 mt-0.5 cursor-pointer active:scale-95 transition-transform"
                  onClick={() => {
                    if (c.user?._id === currentUser?._id) navigate('/profile');
                    else navigate(`/user/${c.user?._id}`);
                  }}
                >
                  <img 
                    src={c.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.name || 'U'}`} 
                    className="w-full h-full rounded-full object-cover border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900"
                    alt={c.user?.name}
                  />
                </div>
                
                <div className="flex-1 bg-gray-50 dark:bg-white/[0.03] p-4 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/[0.05]">
                  <div className="flex items-center gap-2 text-[14px]">
                    <span 
                      onClick={() => {
                        if (c.user?._id === currentUser?._id) navigate('/profile');
                        else navigate(`/user/${c.user?._id}`);
                      }}
                      className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer hover:text-[#1d9bf0] dark:hover:text-[#1d9bf0] transition-colors"
                    >
                      {c.user?.name || 'User'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500 font-medium text-xs">@{c.user?.handle}</span>
                  </div>
                  <p className="text-[15px] text-gray-800 dark:text-gray-300 mt-1.5 leading-relaxed font-medium">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}