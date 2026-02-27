import { useState } from 'react';
import { MessageCircle, Repeat2, Heart, Share, BarChart3, MoreHorizontal } from 'lucide-react';
import API from '../api/axios';
import CompactConnectButton from './CompactConnectButton';

export default function PostCard({ post, currentUser }) {
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiking, setIsLiking] = useState(false);
  
  const isMyPost = currentUser?._id === post.user?._id;
  
  const isConnected = currentUser?.connections?.some(id => 
    typeof id === 'object' ? id._id === post.user?._id : id === post.user?._id
  );
  
  const isLikedByMe = currentUser ? likes.includes(currentUser._id) : false;

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

  return (
    <div className="px-4 pt-3 pb-2 hover:bg-white/[0.03] transition cursor-pointer flex gap-3 border-b border-gray-800">
      
      <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white uppercase mt-1">
        {post.user?.name?.[0] || 'U'}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-[15px] flex-wrap">
            <span className="font-bold text-white hover:underline truncate mr-1">
              {post.user?.name || 'User'}
            </span>
            <span className="text-gray-500 truncate mr-1">
              @{post.user?.handle || 'handle'}
            </span>
            <span className="text-gray-500 mr-1">·</span>
            <span className="text-gray-500 hover:underline">2h</span>
            
            {!isMyPost && (
              <CompactConnectButton 
                targetUserId={post.user?._id} 
                isConnected={isConnected} 
                isPending={false} 
              />
            )}
          </div>

          <div className="text-gray-500 hover:text-[#1d9bf0] transition p-1 hover:bg-[#1d9bf0]/10 rounded-full">
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

        <div className="flex justify-between mt-3 text-gray-500 max-w-[425px]">
          <div className="flex items-center group transition">
            <div className="p-2 group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] rounded-full transition">
              <MessageCircle size={18} />
            </div>
            <span className="text-[13px] px-1 group-hover:text-[#1d9bf0] transition">{post.comments?.length || 0}</span>
          </div>

          <div className="flex items-center group transition">
            <div className="p-2 group-hover:bg-[#00ba7c]/10 group-hover:text-[#00ba7c] rounded-full transition">
              <Repeat2 size={18} />
            </div>
            <span className="text-[13px] px-1 group-hover:text-[#00ba7c] transition">0</span>
          </div>

          <button onClick={handleLike} disabled={isLiking} className={`flex items-center group transition ${isLikedByMe ? 'text-[#f91880]' : ''}`}>
            <div className={`p-2 rounded-full transition ${isLikedByMe ? '' : 'group-hover:bg-[#f91880]/10 group-hover:text-[#f91880]'}`}>
              <Heart size={18} fill={isLikedByMe ? "currentColor" : "none"} />
            </div>
            <span className={`text-[13px] px-1 transition ${isLikedByMe ? '' : 'group-hover:text-[#f91880]'}`}>{likes.length}</span>
          </button>

          <div className="flex items-center group transition">
            <div className="p-2 group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] rounded-full transition"><BarChart3 size={18} /></div>
          </div>
          <div className="flex items-center group transition">
            <div className="p-2 group-hover:bg-[#1d9bf0]/10 group-hover:text-[#1d9bf0] rounded-full transition"><Share size={18} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}