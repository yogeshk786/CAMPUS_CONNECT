import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { 
  Camera, UserMinus, Settings2, Github, GraduationCap, 
  Code, Sparkles, Link as LinkIcon, Briefcase 
} from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', handle: '', batch: '', github: '', skills: '', interests: '' 
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();

  // 1. Fetch Profile Data
  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/users/profile');
      setUser(data);
      setConnections(data.connections || []);
      setFormData({ 
        name: data.name || '', 
        handle: data.handle || '',
        batch: data.batch || '',
        github: data.github || '',
        skills: data.skills?.join(', ') || '',
        interests: data.interests?.join(', ') || ''
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Update Profile Handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('handle', formData.handle);
    data.append('batch', formData.batch);
    data.append('github', formData.github);
    data.append('skills', formData.skills);
    data.append('interests', formData.interests);

    if (selectedFile) {
      data.append('avatar', selectedFile); 
      console.log("File appended:", selectedFile.name); 
    }
    try {
      const { data: updatedUser } = await API.put('/users/update', data);
      
      setUser(updatedUser);
      setIsEditing(false);
      
      const storedData = JSON.parse(localStorage.getItem('userInfo'));
      storedData.user = updatedUser;
      localStorage.setItem('userInfo', JSON.stringify(storedData));
      window.dispatchEvent(new Event('profileUpdated'));
      
      
      alert("Profile Optimized Successfully! 🚀");
    
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Optimization failed");
    }
  };

  const handleUnconnect = async (id) => {
    if (!window.confirm("Remove this connection?")) return;
    try {
      await API.post(`/users/unconnect/${id}`);
      setConnections(connections.filter(c => c._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin h-8 w-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full"></div>
    </div>
  );

  // 👉 THE FIX: Removed Sidebar, RightSidebar, and outer layout divs.
  // Directly returning the center content!
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 bg-black/70 backdrop-blur-xl px-4 py-3 border-b border-gray-800/60 z-20 cursor-pointer">
        <h2 className="text-xl font-bold tracking-tight">Portfolio</h2>
      </header>

      {/* Ultra Modern Banner Section */}
      <div className="h-44 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
        <div className="absolute -bottom-16 left-4 p-1.5 bg-black rounded-full shadow-2xl">
          <div className="relative group">
            <img 
              src={preview || user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
              className="w-32 h-32 rounded-full object-cover border-4 border-black bg-gray-900 transition-transform duration-300 group-hover:scale-105"
              alt="Avatar"
            />
            {isEditing && (
              <div 
                onClick={() => fileInputRef.current.click()} 
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
              >
                <Camera size={26} />
              </div>
            )}
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) { setSelectedFile(file); setPreview(URL.createObjectURL(file)); }
            }} />
          </div>
        </div>
      </div>

      <div className="mt-20 px-5 pb-20">
        {/* Action Buttons */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{user.name}</h2>
            <p className="text-gray-400 font-medium">@{user.handle}</p>
            
            {/* Modern Badges Section */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {user.batch && (
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm text-gray-300">
                  <GraduationCap size={16} className="text-purple-400" />
                  <span>Class of {user.batch}</span>
                </div>
              )}
              {user.github && (
                <a href={user.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-sm text-blue-400 hover:bg-blue-500/20 transition">
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-gray-200 transition active:scale-95"
          >
            {isEditing ? 'Cancel' : <><Settings2 size={18} /> Edit Profile</>}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="mt-6 space-y-5 bg-white/[0.03] border border-gray-800 p-6 rounded-2xl backdrop-blur-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Name</label>
                <input className="w-full bg-black/50 border border-gray-700 p-3 rounded-xl focus:border-[#1d9bf0] outline-none transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Handle</label>
                <input className="w-full bg-black/50 border border-gray-700 p-3 rounded-xl focus:border-[#1d9bf0] outline-none transition" value={formData.handle} onChange={e => setFormData({...formData, handle: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Batch (Year)</label>
                <input className="w-full bg-black/50 border border-gray-700 p-3 rounded-xl focus:border-purple-500 outline-none transition" value={formData.batch} placeholder="e.g. 2024" onChange={e => setFormData({...formData, batch: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">GitHub URL</label>
                <input className="w-full bg-black/50 border border-gray-700 p-3 rounded-xl focus:border-[#1d9bf0] outline-none transition" value={formData.github} placeholder="https://github.com/..." onChange={e => setFormData({...formData, github: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Top Skills (Comma Separated)</label>
              <textarea className="w-full bg-black/50 border border-gray-700 p-3 rounded-xl focus:border-[#1d9bf0] outline-none transition resize-none" rows="2" value={formData.skills} placeholder="React, Node.js, Python..." onChange={e => setFormData({...formData, skills: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Interests</label>
              <textarea className="w-full bg-black/50 border border-gray-700 p-3 rounded-xl focus:border-[#1d9bf0] outline-none transition resize-none" rows="2" value={formData.interests} placeholder="AI, UI/UX, Open Source..." onChange={e => setFormData({...formData, interests: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-blue-600/20">
              Update Portfolio
            </button>
          </form>
        ) : (
          <div className="mt-10 space-y-10">
            {/* Tech Stack / Skills Section */}
            {user.skills?.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <Code size={18} className="text-[#1d9bf0]" /> Technology Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-500/5 text-blue-400 text-sm font-semibold rounded-xl border border-blue-500/10 hover:border-blue-500/40 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests Section */}
            {user.interests?.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-purple-500" /> Core Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, i) => (
                    <span key={i} className="px-4 py-2 bg-purple-500/5 text-purple-400 text-sm font-semibold rounded-xl border border-purple-500/10 hover:border-purple-500/40 transition-colors cursor-default">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Connections Section */}
            <div className="pt-8 border-t border-gray-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Network <span className="text-gray-500 text-sm font-normal">({connections.length})</span>
              </h3>
              {connections.length === 0 ? (
                <p className="text-gray-500 text-center py-10 italic">No connections yet. Start exploring the campus! 🌍</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {connections.map(c => (
                    <div key={c._id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-gray-800/50 rounded-2xl hover:bg-white/[0.04] transition group">
                      <div className="flex items-center gap-4">
                        <img src={c.avatar || `https://ui-avatars.com/api/?name=${c.name}`} className="w-12 h-12 rounded-full object-cover" alt={c.name} />
                        <div>
                          <p className="font-bold group-hover:text-[#1d9bf0] transition">{c.name}</p>
                          <p className="text-xs text-gray-500">@{c.handle}</p>
                        </div>
                      </div>
                      <button onClick={() => handleUnconnect(c._id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition" title="Unconnect">
                        <UserMinus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}