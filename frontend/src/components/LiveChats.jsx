import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, X, Send, ArrowLeft, Loader2, Sparkles, Zap, Flame, Smile } from 'lucide-react';
import axios from 'axios';

// 👉 Real Context Import
import { useUser } from '../contexts/UserContext'; 

const API_URL = 'http://localhost:5000/api';
const WS_URL = 'ws://localhost:5000'; 

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true 
});

const GENZ_EMOJIS = ['🔥', '💀', '😭', '✨', '🚀', '❤️', '💅', '🤡'];

// 🕒 TIME FORMATTING HELPERS
const getDateLabel = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Aaj';
  if (isYesterday) return 'Kal';

  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }); 
  }

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); 
};

const getMessageTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function LiveChat() {
  const { user, fetchFreshProfile } = useUser(); 
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isFetchingOld, setIsFetchingOld] = useState(false);
  const [chatError, setChatError] = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const chatCacheRef = useRef({}); 
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  
  const [forceUpdate, setForceUpdate] = useState(0); 
  const triggerRender = useCallback(() => setForceUpdate(p => p + 1), []);

  const myId = useMemo(() => user?._id?.toString(), [user?._id]);
  const activeChatId = useMemo(() => activeChat?._id?.toString(), [activeChat?._id]);

  const activeChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const uniqueFriends = useMemo(() => {
    if (!user || !user.connections) return [];
    const seen = new Set();
    const unique = [];
    user.connections.forEach(f => {
      if (!f) return;
      const fObj = typeof f === 'object' ? f : { _id: f, name: 'Dost' };
      const fIdStr = fObj._id?.toString();
      if (fIdStr && !seen.has(fIdStr)) {
        seen.add(fIdStr);
        unique.push(fObj);
      }
    });
    return unique;
  }, [user]);

  const sortedFriends = useMemo(() => {
    const friendsList = [...uniqueFriends];
    
    friendsList.sort((a, b) => {
      const aId = a._id?.toString();
      const bId = b._id?.toString();
      
      const lastMsgA = chatCacheRef.current[aId]?.slice(-1)[0];
      const lastMsgB = chatCacheRef.current[bId]?.slice(-1)[0];

      const timeA = lastMsgA ? new Date(lastMsgA.createdAt).getTime() : 0;
      const timeB = lastMsgB ? new Date(lastMsgB.createdAt).getTime() : 0;

      return timeB - timeA;
    });

    return friendsList;
  }, [uniqueFriends, forceUpdate]); 

  // 🚀 BULLET LATENCY FIX: WebSocket Connection Optimize Kiya
  const connectSocket = useCallback(() => {
    if (!myId) return;
    
    // Agar pehle se connection hai toh dobara mat banao
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
        // Immediate setup bhej do
        ws.send(JSON.stringify({ type: 'setup', payload: myId }));
    };

    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === 'receive_message') {
          const msg = parsedData.payload;
          const sId = (msg.sender?._id || msg.sender)?.toString();
          const rId = (msg.receiver?._id || msg.receiver)?.toString();
          const currentOpenId = activeChatIdRef.current;

          // ⚡ Instant state update function form use karke
          if ((sId === currentOpenId && rId === myId) || (sId === myId && rId === currentOpenId)) {
            setMessages(prev => {
              // Duplicate message rokne ke liye tempId aur _id dono check karein
              if (prev.some(m => m._id === msg._id || (msg.tempId && m.tempId === msg.tempId))) {
                  return prev.map(m => (m.tempId === msg.tempId ? msg : m));
              }
              return [...prev, msg];
            });
            // Scroll turant karo
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
          }

          // Cache update for preview
          const friendId = (sId === myId) ? rId : sId;
          if (friendId) {
            const cached = chatCacheRef.current[friendId] || [];
            if (!cached.find(m => m._id === msg._id)) {
              chatCacheRef.current[friendId] = [...cached, msg];
              triggerRender();
            }
          }
        }
      } catch (error) { console.error('WS Error:', error); }
    };

    ws.onclose = () => {
        // Sirf tabhi reconnect karo jab zaroorat ho
        setTimeout(connectSocket, 1000); // Reconnect faster (1s instead of 2.5s)
    };
    
    ws.onerror = (err) => {
        console.error('WebSocket encountered an error', err);
        ws.close();
    };

  }, [myId, triggerRender]);

  useEffect(() => {
    connectSocket();
    return () => {
      if (socketRef.current) {
          socketRef.current.close();
      }
    };
  }, [connectSocket]);

  const syncAllPreviews = useCallback(async (friends) => {
    if (!friends || friends.length === 0) return;
    
    const toFetch = friends.filter(f => {
      const fId = f._id?.toString();
      return fId && !chatCacheRef.current[fId];
    });

    if (toFetch.length === 0) return;

    setLoadingPreviews(true);
    try {
      await Promise.all(toFetch.map(async (f) => {
        const fId = f._id?.toString();
        try {
          const { data } = await API.get(`/messages/${fId}?page=1&limit=1`);
          if (Array.isArray(data) && data.length > 0) {
            chatCacheRef.current[fId] = data;
          }
        } catch (e) {
        }
      }));
      triggerRender();
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoadingPreviews(false);
    }
  }, [triggerRender]);

  const fetchMessages = useCallback(async (friendId, pageNum = 1) => {
    if (!friendId) return;
    setChatError(null);
    if (pageNum === 1) setLoadingHistory(true);
    else setIsFetchingOld(true);

    try {
      const { data } = await API.get(`/messages/${friendId}?page=${pageNum}&limit=50`);
      const safeData = Array.isArray(data) ? data : [];
      setHasMore(safeData.length === 50);

      if (pageNum === 1) {
        setMessages(safeData);
        chatCacheRef.current[friendId] = safeData;
        triggerRender(); 
      } else {
        setMessages(prev => [...safeData, ...prev]);
        chatCacheRef.current[friendId] = [...safeData, ...(chatCacheRef.current[friendId] || [])];
      }
    } catch (err) { 
      setChatError("Messages sync nahi hue."); 
    } finally {
      setLoadingHistory(false);
      setIsFetchingOld(false);
    }
  }, [triggerRender]);

  useEffect(() => {
    if (isOpen) { 
      fetchFreshProfile(); 
    }
  }, [isOpen, fetchFreshProfile]);

  useEffect(() => {
    if (isOpen && uniqueFriends.length > 0) {
      syncAllPreviews(uniqueFriends);
    }
  }, [isOpen, uniqueFriends, syncAllPreviews]);

  useEffect(() => {
    if (activeChatId) {
      setPage(1);
      setHasMore(true);
      setMessages(chatCacheRef.current[activeChatId] || []);
      fetchMessages(activeChatId, 1);
    }
  }, [activeChatId, fetchMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId || !myId) return;

    const content = newMessage;
    setNewMessage(''); 
    setShowEmojiPicker(false);
    
    // 🚀 BULLET LATENCY FIX: Temp ID banakar turant UI update karo
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMsg = { 
        _id: tempId, 
        tempId: tempId, 
        sender: myId, 
        receiver: activeChatId, 
        content, 
        createdAt: new Date().toISOString(), 
        isSending: true 
    };

    // 1. UI ko turant (Optimistically) update karo
    setMessages(prev => [...prev, tempMsg]);
    
    // 2. Cache ko turant update karo
    const currentCached = chatCacheRef.current[activeChatId] || [];
    chatCacheRef.current[activeChatId] = [...currentCached, tempMsg];
    triggerRender();

    // 3. Turant scroll karo, wait mat karo
    requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    // 4. WebSocket se direct bhej do (Pehle API call thi, ab dono saath chalenge)
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'send_message', payload: tempMsg }));
    } else {
       console.warn("WebSocket not open, message will only go via HTTP");
    }

    // 5. Backend (Database) mein save hone ke liye HTTP request bhejo
    try {
      const { data } = await API.post('/messages', { receiverId: activeChatId, content });
      
      // Jab real data aaye toh temporary message ko replace kardo
      setMessages(prev => prev.map(m => (m.tempId === tempId) ? data : m));
      
      const cached = chatCacheRef.current[activeChatId] || [];
      chatCacheRef.current[activeChatId] = cached.map(m => (m.tempId === tempId) ? data : m);
      triggerRender();
      
    } catch (err) {
      // Agar HTTP fail ho jaye toh message hata do
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
      const cached = chatCacheRef.current[activeChatId] || [];
      chatCacheRef.current[activeChatId] = cached.filter(m => m.tempId !== tempId);
      triggerRender();
      setChatError("Message bhejne mein fail hua.");
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && !isFetchingOld && hasMore && activeChatId) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(activeChatId, nextPage);
    }
  };

  useEffect(() => {
    if (page === 1) {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
    } else if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight - prevScrollHeightRef.current;
    }
  }, [messages.length, page, isOpen]);

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans selection:bg-[#1d9bf0]/30">
      {!isOpen ? (
        <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#1d9bf0] via-purple-600 to-[#FF0080] rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          <button className="relative flex items-center justify-center bg-black p-5 rounded-full text-white shadow-2xl border border-white/10 active:scale-90 transition-all cursor-pointer">
            <MessageCircle size={32} />
          </button>
        </div>
      ) : (
        <div className="w-[360px] sm:w-[390px] h-[580px] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 origin-bottom-right">
          <div className="bg-gradient-to-r from-[#1d9bf0] via-purple-600 to-pink-600 text-white p-6 flex items-center justify-between shadow-xl z-20 relative">
             <div className="flex items-center gap-3 relative z-10">
              {activeChat && (
                <button onClick={() => { setActiveChat(null); setShowEmojiPicker(false); }} className="hover:bg-white/20 p-2.5 rounded-full transition-all active:scale-75 cursor-pointer">
                  <ArrowLeft size={22} />
                </button>
              )}
              <div className="flex flex-col">
                <h3 className="font-black text-xl tracking-tight truncate max-w-[160px]">
                  {activeChat ? activeChat.name : 'VIBE DIRECT'}
                </h3>
                {!activeChat && (
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1">
                    {loadingPreviews ? 'Sync ho raha hai...' : 'Online Squad'} <Zap size={10} fill="currentColor" className={loadingPreviews ? 'animate-spin' : ''} />
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => { setIsOpen(false); setShowEmojiPicker(false); }} className="hover:bg-white/20 p-2.5 rounded-full transition-all active:scale-75 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative bg-transparent">
            {!activeChat ? (
              <div className="p-4 space-y-3 overflow-y-auto h-full scrollbar-hide relative z-10">
                {sortedFriends.length === 0 ? (
                  <div className="text-center py-24 px-6 animate-in fade-in duration-700">
                    <Flame size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="font-black text-xl text-gray-400 italic tracking-tighter">Koi dost nahi hai abhi.</p>
                  </div>
                ) : (
                  sortedFriends.map(f => {
                    const fId = f._id?.toString();
                    const lastMsg = chatCacheRef.current[fId]?.slice(-1)[0];
                    
                    const isLastMsgMine = lastMsg && (lastMsg.sender === myId || lastMsg.sender?._id === myId);

                    return (
                      <div 
                        key={f._id} 
                        onClick={() => setActiveChat(f)} 
                        className="flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-white/[0.04] rounded-3xl cursor-pointer transition-all active:scale-[0.97] group border border-transparent hover:border-gray-200 dark:hover:border-white/5"
                      >
                        <div className="relative flex-shrink-0">
                          <img src={f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name || 'U'}`} className="w-14 h-14 rounded-2xl object-cover bg-gray-100 shadow-sm" alt="" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-[#0a0a0a] rounded-full" />
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                          <div className="flex justify-between items-center mb-0.5">
                            <h4 className="font-black dark:text-white truncate group-hover:text-[#1d9bf0] transition-colors">{f.name}</h4>
                            {lastMsg && (
                              <span className="text-[10px] font-bold text-gray-400">
                                {getDateLabel(lastMsg.createdAt) === 'Aaj' ? getMessageTime(lastMsg.createdAt) : getDateLabel(lastMsg.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className={`text-[13px] truncate ${lastMsg && !isLastMsgMine ? 'text-gray-900 font-bold dark:text-white' : 'text-gray-500 font-semibold dark:text-gray-400'}`}>
                            {lastMsg ? lastMsg.content : 'Ek vibe bhejein... ✨'}
                          </p>
                        </div>
                        {lastMsg && !isLastMsgMine && <div className="w-3 h-3 bg-[#1d9bf0] rounded-full shadow-[0_0_10px_#1d9bf0] animate-pulse" />}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full relative bg-gray-50/20 dark:bg-black/20">
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-purple-500/10 rounded-full blur-[80px] animate-[pulse_6s_ease-in-out_infinite]" />
                  <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-[#1d9bf0]/10 rounded-full blur-[80px] animate-[pulse_8s_ease-in-out_infinite_reverse]" />
                </div>

                <div ref={chatBodyRef} onScroll={handleScroll} className="flex-1 p-6 overflow-y-auto flex flex-col gap-2 pb-28 scrollbar-hide relative z-10">
                  {isFetchingOld && <div className="flex justify-center py-2"><Loader2 className="animate-spin text-[#1d9bf0]" size={20} /></div>}
                  {loadingHistory && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full flex-col gap-4">
                      <div className="animate-spin h-10 w-10 border-4 border-[#1d9bf0] border-t-transparent rounded-full shadow-[0_0_20px_rgba(29,155,240,0.4)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">DM khul raha hai...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center mt-16 px-10">
                       <Sparkles className="mx-auto text-yellow-500 mb-4 animate-bounce" size={40} />
                       <p className="font-black text-lg italic dark:text-white">Say hi to {activeChat.name}!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const sId = (msg.sender?._id || msg.sender)?.toString();
                      const isMe = sId === myId;
                      
                      const showDateDivider = idx === 0 || getDateLabel(msg.createdAt) !== getDateLabel(messages[idx - 1].createdAt);

                      return (
                        <React.Fragment key={msg._id || idx}>
                          
                          {showDateDivider && (
                            <div className="flex justify-center my-3 animate-in fade-in">
                              <span className="bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[11px] font-black tracking-wide px-4 py-1.5 rounded-full shadow-sm backdrop-blur-md">
                                {getDateLabel(msg.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-150`}>
                            <div className={`relative max-w-[85%] px-4 py-2 text-[15px] font-bold shadow-xl transition-all flex items-end gap-3 ${
                              isMe 
                                ? 'bg-gradient-to-br from-[#1d9bf0] via-purple-500 to-pink-500 text-white rounded-[1.5rem] rounded-br-sm' 
                                : 'bg-gray-100 dark:bg-[#202020] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/5 rounded-[1.5rem] rounded-bl-sm'
                            } ${msg.isSending ? 'opacity-60' : 'hover:scale-[1.02]'}`}>
                              
                              <span className="leading-snug pt-1 pb-0.5">{msg.content}</span>
                              
                              <span className={`text-[10px] mb-0.5 whitespace-nowrap font-medium ${isMe ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                                {getMessageTime(msg.createdAt)}
                              </span>

                            </div>
                          </div>

                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </div>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-[85px] left-4 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-3 rounded-2xl shadow-2xl flex gap-3 z-50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                    {GENZ_EMOJIS.map(emoji => (
                      <button 
                        key={emoji} 
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="hover:scale-125 hover:-translate-y-1 transition-all duration-200 text-2xl cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/70 dark:bg-black/60 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
                  <form onSubmit={sendMessage} className="flex items-center gap-2 bg-gray-100 dark:bg-white/[0.04] p-1.5 rounded-[2rem] border border-gray-200 dark:border-white/10 focus-within:ring-2 ring-[#1d9bf0]/50 focus-within:bg-white dark:focus-within:bg-[#0a0a0a] transition-all duration-300">
                    
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                      className={`p-2.5 rounded-full transition-colors cursor-pointer ${showEmojiPicker ? 'text-[#1d9bf0] bg-blue-50 dark:bg-[#1d9bf0]/10' : 'text-gray-400 hover:text-[#1d9bf0]'}`}
                    >
                      <Smile size={22} />
                    </button>

                    <input 
                      type="text" 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      placeholder="Apna vibe type karein..." 
                      className="flex-1 bg-transparent py-3 outline-none dark:text-white text-[15px] font-bold" 
                      autoComplete="off" 
                    />
                    
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim()} 
                      className="bg-[#1d9bf0] text-white p-3 rounded-full shadow-lg shadow-[#1d9bf0]/30 active:scale-75 transition-all cursor-pointer disabled:opacity-50 disabled:scale-100"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                  {chatError && <p className="text-[10px] text-red-500 text-center mt-2 font-black uppercase tracking-widest">{chatError}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}