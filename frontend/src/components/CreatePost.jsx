import { useState, useRef, useEffect } from 'react';
import { Image, Smile, Calendar, MapPin, X, Loader2, BarChart2, Plus } from 'lucide-react'; 
import EmojiPicker from 'emoji-picker-react';
import API from '../api/axios';

export default function CreatePost({ onPostCreated, user }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState(null);
  
  // 📊 Poll States
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]); 

  // 🏷️ SDE 2 FIX: Tag State & Definitions
  const [selectedTag, setSelectedTag] = useState('General');

  const AVAILABLE_TAGS = [
    { id: 'General', label: '💬 General', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-transparent' },
    { id: 'Academics', label: '📚 Academics', color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
    { id: 'Placements', label: '💼 Placements', color: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20' },
    { id: 'Events', label: '🎉 Events', color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' },
    { id: 'Memes', label: '😹 Memes', color: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' },
    { id: 'Urgent', label: '🚨 Urgent', color: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' }
  ];

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = async (e) => {
    e?.preventDefault(); // Handle both standard clicks and keyboard shortcuts
    
    const validPollOptions = pollOptions.filter(opt => opt.trim() !== "");
    const hasValidPoll = showPoll && validPollOptions.length >= 2;

    if (!text && !image && !hasValidPoll) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('text', text); 
    formData.append('tag', selectedTag); // 👈 Send the tag to Node.js!
    
    if (image) formData.append('media', image);
    if (location) formData.append('location', JSON.stringify(location));
    if (hasValidPoll) formData.append('pollOptions', JSON.stringify(validPollOptions));

    try {
      const { data } = await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPostCreated(data);
      
      // Reset everything after success
      setText('');
      setImage(null);
      setPreview(null);
      setLocation(null);
      setShowPoll(false);
      setPollOptions(["", ""]);
      setSelectedTag('General'); // 👈 Reset the tag to default
    } catch (err) {
      console.error("Post creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ SDE 2 FIX: Keyboard Shortcut for Power Users (Ctrl + Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); 

      const validPollOptions = pollOptions.filter(opt => opt.trim() !== "");
      const hasValidPoll = showPoll && validPollOptions.length >= 2;
      const canSubmit = !loading && (text || image || hasValidPoll);

      if (canSubmit) {
        handleSubmit(e); 
      }
    }
  };

  const onEmojiClick = (emojiObject) => setText(text + emojiObject.emoji);
  const addDate = () => setText(text + ` 📅 ${new Date().toLocaleDateString()}`);

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  const addPollOption = () => { if (pollOptions.length < 4) setPollOptions([...pollOptions, ""]); };
  const removePollOption = (index) => setPollOptions(pollOptions.filter((_, i) => i !== index));
  const clearPoll = () => { setShowPoll(false); setPollOptions(["", ""]); };

  const addLocation = async () => {
    // ... (Location logic remains exactly the same)
    setLocationLoading(true);
    if (!navigator.geolocation) { alert('Geolocation is not supported'); setLocationLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || '';
          const state = data.address.state || '';
          const country = data.address.country || '';
          let locationString = city && state ? `${city}, ${state}` : city ? city : state ? `${state}, ${country}` : country;
          
          setLocation({ latitude, longitude, name: locationString, full: data.display_name });
          setText(text + ` 📍 ${locationString}`);
        } catch (error) {
          setLocation({ latitude, longitude, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
          setText(text + ` 📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally { setLocationLoading(false); }
      },
      (error) => { console.error(error); setLocationLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="p-6 flex gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
      <div className="w-10 h-10 flex-shrink-0 mt-1 cursor-pointer transition-transform active:scale-95">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1d9bf0] to-purple-500 p-[2px]">
          <img 
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'U'}`}
            alt={user?.name || 'User'}
            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-transparent border-none text-[20px] outline-none resize-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 min-h-[50px] pt-1"
            placeholder={showPoll ? "Ask a question..." : "What's happening in Campus?"}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKeyDown} // 👈 Added Keyboard Listener!
          />

          {showPoll && (
            <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4 relative animate-in fade-in slide-in-from-top-2">
              <button type="button" onClick={clearPoll} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded-full transition-colors">
                <X size={18} />
              </button>
              
              <div className="space-y-3 mt-2 pr-6">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" placeholder={`Choice ${index + 1}`} value={option} onChange={(e) => handlePollOptionChange(index, e.target.value)} maxLength={25} className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-2.5 rounded-lg focus:border-[#1d9bf0] outline-none text-gray-900 dark:text-white text-[15px] transition-all" />
                    {pollOptions.length > 2 && (
                      <button type="button" onClick={() => removePollOption(index)} className="text-gray-400 hover:text-red-500 p-2"><X size={16} /></button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 4 && (
                <button type="button" onClick={addPollOption} className="mt-3 flex items-center gap-1 text-[#1d9bf0] font-medium text-[14px] hover:bg-[#1d9bf0]/10 px-3 py-1.5 rounded-full transition-colors">
                  <Plus size={16} /> Add option
                </button>
              )}
            </div>
          )}
          
          {/* 🏷️ SDE 2 FIX: Horizontal Scrollable Tags UI */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 select-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`::-webkit-scrollbar { display: none; }`}</style>
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTag === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(tag.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-bold border transition-all duration-200 
                    ${isSelected 
                      ? `${tag.color} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-current opacity-100 scale-105 shadow-sm` 
                      : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 opacity-70 hover:opacity-100'
                    }
                  `}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>

          {location && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg w-max">
              <MapPin size={16} className="text-[#1d9bf0]" />
              <span>{location.name}</span>
              <button type="button" onClick={() => setLocation(null)} className="ml-2 text-gray-400 hover:text-red-500 transition"><X size={16} /></button>
            </div>
          )}

          {preview && (
            <div className="relative mb-3 mt-3">
              <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 left-2 bg-black/70 p-1.5 rounded-full hover:bg-black/90 transition backdrop-blur-sm">
                <X size={18} className="text-white" />
              </button>
              <img src={preview} alt="Preview" className="rounded-2xl w-full max-h-[500px] object-cover border border-gray-300 dark:border-gray-700" />
            </div>
          )}
          
          <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100 dark:border-gray-800 relative">
            <div className="flex text-[#1d9bf0] relative gap-1">
              <button type="button" onClick={() => fileInputRef.current.click()} disabled={showPoll} className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed" title="Add image"><Image size={20} /></button>
              <button type="button" onClick={() => { setShowPoll(!showPoll); if (preview) { setImage(null); setPreview(null); } }} className={`p-2 rounded-full transition hidden sm:block ${showPoll ? 'bg-[#1d9bf0]/20 text-[#1d9bf0]' : 'hover:bg-[#1d9bf0]/10'}`} title="Create poll"><BarChart2 size={20} /></button>
              
              <div className="relative" ref={emojiPickerRef}>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition hidden sm:block" title="Add emoji"><Smile size={20} /></button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" width={350} height={450} previewConfig={{ showPreview: false }} />
                  </div>
                )}
              </div>
              <button type="button" onClick={addDate} className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition hidden sm:block" title="Add date"><Calendar size={20} /></button>
              <button type="button" onClick={addLocation} disabled={locationLoading} className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition hidden sm:block disabled:opacity-50" title="Add location">
                {locationLoading ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files[0]; if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setShowPoll(false); } }} className="hidden" accept="image/*" />
            </div>

            <div className="flex flex-col items-end">
              <button
                type="submit"
                disabled={loading || (!text && !image && !(showPoll && pollOptions.filter(o=>o.trim()).length >= 2))}
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-5 py-1.5 rounded-full transition disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
              {/* ⌨️ SDE 2 FIX: Keyboard hint for power users */}
              <span className="text-[10px] text-gray-400 hidden sm:block font-medium pr-1 pt-1 opacity-70">
                Ctrl + Enter to post
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}