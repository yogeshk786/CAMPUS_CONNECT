import { useState, useEffect } from 'react';
import { 
  MessageCircle, Heart, Share, MoreHorizontal, Sparkles, Send, 
  CheckCircle2, Clock, UserPlus, Loader2, Trash2, Pencil, X 
} from 'lucide-react'; 

import API from '../api/axios';
import { useNavigate } from 'react-router-dom'; 



// 🏷️ TAG CONFIGURATION (Must be outside the component)
const TAG_CONFIG = {
  'General': { label: '💬 General', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-transparent' },
  'Academics': { label: '📚 Academics', color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  'Placements': { label: '💼 Placements', color: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20' },
  'Events': { label: '🎉 Events', color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
  'Memes': { label: '😹 Memes', color: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' },
  'Urgent': { label: '🚨 Urgent', color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' }
};

function CompactConnectButton({ targetUserId, isConnected, initialIsPending }) {
  const [loading, setLoading] = useState(false);
  const [optimisticPending, setOptimisticPending] = useState(false);
  const finalConnected = isConnected;
  const finalPending = initialIsPending || optimisticPending;

  const handleConnect = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!targetUserId || finalConnected || finalPending || loading) return;
    setLoading(true);
    try {
      await API.post(`/users/connect/${targetUserId}`);
      setOptimisticPending(true); 
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) { setOptimisticPending(true); } 
    finally { setLoading(false); }
  };

  if (finalConnected) return <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 text-[11px] font-bold rounded-full border border-green-500/20 shadow-sm"><CheckCircle2 size={12} /> Connected</div>;
  if (finalPending) return <div className="flex items-center gap-1 px-3 py-1 bg-gray-500/10 text-gray-500 text-[11px] font-bold rounded-full border border-gray-500/20 shadow-sm"><Clock size={12} /> Requested</div>;

  return (
    <button onClick={handleConnect} disabled={loading} className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white text-black rounded-full text-[12px] font-black hover:bg-gray-200 transition-all active:scale-95 shadow-md">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Connect
    </button>
  );
}

export default function PostCard({ post, currentUser, onDelete }) {
  const navigate = useNavigate(); 

  // --- 1. STATES ---
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [poll, setPoll] = useState(post.poll);
  const [isLiking, setIsLiking] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(post.text || '');
  const [editText, setEditText] = useState(post.text || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // --- 2. SYNC & DERIVED DATA ---
  useEffect(() => {
    setLikes(post.likes || []);
    setComments(post.comments || []);
    setPoll(post.poll);
    setCurrentText(post.text || '');
    setEditText(post.text || '');
  }, [post]);

  const myId = String(currentUser?._id || '');
  const postUserId = typeof post.user === 'object' ? String(post.user?._id) : String(post.user);
  const isMyPost = myId === postUserId;
  const isLikedByMe = currentUser ? likes.some(id => String(id) === myId) : false;
  
  // 🏷️ Tag logic for visibility
  const postTag = post.tag || 'General';
  const tagData = TAG_CONFIG[postTag] || TAG_CONFIG['General'];

  const formatTime = (date) => {
    if (!date) return "";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return new Date(date).toLocaleDateString();
  };

  // --- 3. HANDLERS ---
  const handleLike = async (e) => {
    e.stopPropagation(); if (isLiking || !currentUser) return;
    setIsLiking(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/like`);
      setLikes(data.likes); 
    } catch (err) { console.error(err); } 
    finally { setIsLiking(false); }
  };

  const handleVote = async (e, optionId) => {
    e.stopPropagation(); if (!currentUser || isVoting) return;
    setIsVoting(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/vote`, { optionId });
      setPoll(data.poll); 
    } catch (err) { alert("Voting failed."); } 
    finally { setIsVoting(false); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(data.comments); 
      setCommentText('');
    } catch (err) { console.error(err); alert("Comment failed."); } 
    finally { setIsCommenting(false); }
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation(); if (!editText.trim()) return;
    setIsSavingEdit(true);
    try {
      await API.put(`/posts/${post._id}`, { text: editText });
      setCurrentText(editText); setIsEditing(false);      
    } catch (err) { alert("Edit failed."); } 
    finally { setIsSavingEdit(false); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); if (!window.confirm("Delete post permanently?")) return;
    setIsDeleting(true);
    try {
      await API.delete(`/posts/${post._id}`);
      if (onDelete) onDelete(post._id); 
    } catch (err) { setIsDeleting(false); }
  };

  // --- 4. RENDER ---
  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 p-5 md:p-6 rounded-[2rem] transition-all duration-300 group mb-4 shadow-sm">
      <div className="flex gap-3 md:gap-4 w-full">
        {/* Avatar */}
        <div className="w-12 h-12 flex-shrink-0 mt-1 cursor-pointer" onClick={() => navigate(isMyPost ? '/profile' : `/user/${postUserId}`)}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1d9bf0] to-purple-500 p-[2px]">
            <img src={post.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.name || 'U'}`} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#050505]" alt="Avatar" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Header (Name/Time/Menu) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[15px] flex-wrap gap-1.5 font-bold">
              <span className="text-gray-900 dark:text-white truncate">{post.user?.name || 'User'}</span>
              <span className="text-gray-500 font-medium text-[14px]">@{post.user?.handle || 'handle'}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-[14px] font-medium">{formatTime(post.createdAt)}</span>
              {!isMyPost && <CompactConnectButton targetUserId={postUserId} />}
            </div>
            
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-gray-400 hover:text-[#1d9bf0] p-2 hover:bg-blue-50 dark:hover:bg-[#1d9bf0]/10 rounded-full transition-colors">
                <MoreHorizontal size={18} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#16181c] border dark:border-gray-800 rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in slide-in-from-top-1">
                  {isMyPost && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-[14px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"><Pencil size={16} /> Edit</button>
                      <button onClick={handleDelete} className="w-full flex items-center gap-2 px-4 py-3 text-[14px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-white/5">{isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete</button>
                    </>
                  )}
                  {!isMyPost && <button className="w-full px-4 py-3 text-[14px] font-bold dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5">Report</button>}
                </div>
              )}
            </div>
          </div>
          
          {/* 🏷️ TAG BADGE (Positioned correctly above content) */}
          {postTag && postTag !== 'General' && (
            <div className="mt-2 mb-1.5 animate-in fade-in zoom-in duration-500">
              <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border tracking-wide shadow-sm ${tagData.color}`}>
                {tagData.label}
              </span>
            </div>
          )}

          {/* Text Content */}
          {isEditing ? (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-[#1d9bf0]/50 p-3 rounded-xl outline-none text-[16px] dark:text-white min-h-[80px] resize-none" autoFocus />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => { setIsEditing(false); setEditText(currentText); }} className="px-4 py-1.5 text-gray-600 dark:text-gray-300 font-bold hover:underline">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isSavingEdit} className="bg-[#1d9bf0] text-white px-4 py-1.5 rounded-full text-[13px] font-bold disabled:opacity-50">{isSavingEdit ? <Loader2 size={14} className="animate-spin" /> : 'Save'}</button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 text-lg md:text-[17px] text-gray-800 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">{currentText}</p>
          )}
          
          {/* Media */}
          {post.image?.url && <div className="mt-4 rounded-[1.5rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm"><img src={post.image.url} className="w-full h-auto object-cover max-h-[512px] hover:scale-[1.01] transition-transform duration-500" alt="Post media" /></div>}
          {post.video && <div className="mt-4 rounded-[1.5rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm bg-black"><video src={post.video} controls className="w-full h-auto max-h-[512px]" /></div>}

          {/* Poll */}
          {poll?.options?.length > 0 && (
            <div className="mt-4 space-y-2.5 w-full max-w-[500px]" onClick={(e) => e.stopPropagation()}>
              {poll.options.map((option) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                const percentage = totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100);
                const myVote = currentUser ? option.votes.includes(myId) : false;
                const hasVotedAny = currentUser ? poll.options.some(opt => opt.votes.includes(myId)) : false;
                return (
                  <button key={option._id} onClick={(e) => handleVote(e, option._id)} disabled={isVoting} className={`relative w-full overflow-hidden rounded-xl border p-0 text-left transition-all duration-300 ${myVote ? 'border-[#1d9bf0] ring-1 ring-[#1d9bf0]/50' : 'border-gray-200 dark:border-white/10 hover:border-[#1d9bf0]/60 hover:bg-[#1d9bf0]/5'}`}>
                    {hasVotedAny && <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${myVote ? 'bg-[#1d9bf0]/20' : 'bg-gray-100 dark:bg-white/5'}`} style={{ width: `${percentage}%` }} />}
                    <div className="relative z-10 flex justify-between items-center p-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-all ${myVote ? 'border-[#1d9bf0] bg-[#1d9bf0]' : 'border-gray-300 dark:border-gray-600'}`}><div className={`w-2 h-2 bg-white rounded-full transition-transform ${myVote ? 'scale-100' : 'scale-0'}`} /></div>
                        <span className={`text-[15px] font-semibold ${myVote ? 'text-[#1d9bf0]' : 'text-gray-800 dark:text-gray-200'}`}>{option.text}</span>
                      </div>
                      {hasVotedAny && <span className={`text-[15px] font-bold ${myVote ? 'text-[#1d9bf0]' : 'text-gray-500'}`}>{percentage}%</span>}
                    </div>
                  </button>
                );
              })}
              <div className="text-[13px] text-gray-500 font-medium px-1 flex justify-between"><span>{poll.options.reduce((sum, opt) => sum + opt.votes.length, 0)} votes</span></div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex justify-between mt-4 text-gray-500 max-w-[425px]">
            <div onClick={(e) => { e.stopPropagation(); setShowCommentBox(!showCommentBox); }} className="flex items-center cursor-pointer group hover:text-[#1d9bf0] transition-colors"><div className="p-2.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-[#1d9bf0]/10 transition-colors"><MessageCircle size={20} /></div><span className="text-[14px] font-bold px-1">{comments.length}</span></div>
            <button onClick={handleLike} disabled={isLiking} className={`flex items-center group transition ${isLikedByMe ? 'text-[#f91880]' : ''}`}><div className={`p-2.5 rounded-full transition-colors ${isLikedByMe ? '' : 'group-hover:bg-pink-50 dark:group-hover:bg-[#f91880]/10'}`}><Heart size={20} fill={isLikedByMe ? "currentColor" : "none"} className={isLikedByMe ? "animate-heart-pop" : ""} /></div><span className="text-[14px] font-bold px-1">{likes.length}</span></button>
            <div className="flex items-center cursor-pointer hover:text-[#00ba7c] transition-colors"><div className="p-2.5 rounded-full hover:bg-green-50 dark:hover:bg-[#00ba7c]/10 transition-colors"><Share size={20} /></div></div>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      {showCommentBox && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 ml-0 md:ml-[60px] animate-in slide-in-from-top-2">
          <form onSubmit={handleCommentSubmit} className="flex gap-3 items-center mb-6">
            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="What's your take? ✨" className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-3 rounded-2xl outline-none dark:text-white" />
            <button type="submit" disabled={isCommenting || !commentText.trim()} className="bg-[#1d9bf0] text-white font-bold px-5 py-3 rounded-2xl text-[14px] flex items-center gap-2">Reply <Send size={14} /></button>
          </form>
          <div className="space-y-4">
            {comments.map((c, index) => (
              <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border dark:border-white/5">
                <img src={c.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.name || 'User'}`} className="w-10 h-10 rounded-full object-cover" alt="User" />
                <div>
                  <div className="flex items-center gap-2 text-[14px] font-bold"><span className="dark:text-white">{c.user?.name || 'User'}</span><span className="text-gray-500 font-medium">@{c.user?.handle || 'handle'}</span></div>
                  <p className="text-[15px] dark:text-gray-300 mt-1 font-medium">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}