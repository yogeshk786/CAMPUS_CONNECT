import { useState, useRef } from 'react';
import { Image, Smile, Calendar, MapPin, X } from 'lucide-react';
import API from '../api/axios';

export default function CreatePost({ onPostCreated, user }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('text', text); 
    
    // 👉 THE FIX: 'image' ki jagah 'media' kar diya gaya hai taaki backend se match ho sake
    if (image) formData.append('media', image);

    try {
      const { data } = await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPostCreated(data);
      setText('');
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error("Post creation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white uppercase mt-1">
        {user?.name?.[0] || 'U'}
      </div>

      <div className="flex-1">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full bg-transparent border-none text-[20px] outline-none resize-none placeholder-gray-500 text-white min-h-[50px] pt-1"
            placeholder="What's happening in Campus?"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />

          {preview && (
            <div className="relative mb-3 mt-2">
              <button 
                type="button"
                onClick={() => { setImage(null); setPreview(null); }}
                className="absolute top-2 left-2 bg-black/70 p-1.5 rounded-full hover:bg-black/90 transition backdrop-blur-sm"
              >
                <X size={18} className="text-white" />
              </button>
              <img src={preview} alt="Preview" className="rounded-2xl w-full max-h-[500px] object-cover border border-gray-800" />
            </div>
          )}

          <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-800">
            <div className="flex text-[#1d9bf0]">
              <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition"><Image size={20} /></button>
              <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition hidden sm:block"><Smile size={20} /></button>
              <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition hidden sm:block"><Calendar size={20} /></button>
              <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition hidden sm:block"><MapPin size={20} /></button>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files[0];
                if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
              }} className="hidden" accept="image/*" />
            </div>

            <button
              type="submit"
              disabled={loading || (!text && !image)}
              className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-5 py-1.5 rounded-full transition disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}