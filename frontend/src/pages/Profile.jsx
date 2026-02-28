import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios'; 
import { 
  Camera, UserMinus, Settings2, Github, GraduationCap, 
  Code, Sparkles, Link as LinkIcon, Briefcase, MapPin, 
  Calendar, ArrowLeft, Grid, Heart, Bookmark, MessageSquare,
  Zap, Share2, Award, Flame, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  // 👉 ESLINT FIX: Hook hamesha top level par bina kisi if/try-catch ke hona chahiye.
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', handle: '', batch: '', github: '', skills: '', interests: '', bio: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tab ko default 'skills' par set kiya hai
  const [activeTab, setActiveTab] = useState('skills'); 
  const fileInputRef = useRef();

  // 👉 Fetch Profile Data
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await API.get('/users/profile');
      setUser(data);
      setConnections(data.connections || []);
      
      setFormData({ 
        name: data.name || '', 
        handle: data.handle || '',
        batch: data.batch || '',
        github: data.github || '',
        bio: data.bio || '',
        skills: data.skills?.join(', ') || '',
        interests: data.interests?.join(', ') || ''
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 👉 Update Profile Handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    if (selectedFile) {
      data.append('avatar', selectedFile); 
    }

    try {
      const { data: updatedUser } = await API.put('/users/update', data);
      setUser(updatedUser);
      setIsEditing(false);
      
      const storedData = JSON.parse(localStorage.getItem('userInfo') || '{}');
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
      setConnections(prev => prev.filter(c => c._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
      <div className="animate-spin h-12 w-12 border-4 border-[#1d9bf0] border-t-transparent rounded-full shadow-[0_0_15px_rgba(29,155,240,0.5)]" />
      <p className="text-[#1d9bf0] font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Loading Vibes...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#1d9bf0]/30 font-sans pb-20">
      
      {/* 🚀 STICKY GLASS NAV */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-2xl transition active:scale-75 cursor-pointer">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-xl font-black tracking-tighter flex items-center gap-2">
            PROFILE <Sparkles size={16} className="text-[#1d9bf0] fill-[#1d9bf0]" />
          </h2>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2.5 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${isEditing ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#1d9bf0]/10 text-[#1d9bf0] border border-[#1d9bf0]/20'}`}
        >
          {isEditing ? <ArrowLeft size={20} /> : <Settings2 size={20} />}
        </button>
      </header>

      {/* 🎨 NEON MESH BANNER */}
      <div className="h-44 md:h-64 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1d9bf0]/20 via-purple-600/10 to-pink-600/20 animate-pulse" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-[#1d9bf0]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative -mt-20 md:-mt-28">
        {/* 👤 AVATAR & EDIT BUTTON */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1d9bf0] to-purple-500 rounded-[2.5rem] md:rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative p-1.5 bg-gradient-to-tr from-white/20 to-transparent rounded-[2.7rem] md:rounded-[3.2rem]">
              <img 
                src={preview || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'U'}`} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[3rem] border-4 md:border-8 border-black z-10 object-cover bg-gray-900 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                alt="Avatar"
              />
            </div>
            {isEditing && (
              <div 
                onClick={() => fileInputRef.current.click()} 
                className="absolute inset-1.5 z-20 flex items-center justify-center bg-black/60 rounded-[2.5rem] md:rounded-[3rem] cursor-pointer backdrop-blur-md transition-all border-4 border-black"
              >
                <Camera size={32} />
              </div>
            )}
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) { setSelectedFile(file); setPreview(URL.createObjectURL(file)); }
            }} />
          </div>
          
          <div className="flex gap-3 mb-2">
             {!isEditing && (
               <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition active:scale-95 shadow-xl cursor-pointer">
                 Edit Identity
               </button>
             )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="mt-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
              <InputField label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Full Name" />
              <InputField label="Handle" value={formData.handle} onChange={v => setFormData({...formData, handle: v})} placeholder="handle" />
              <InputField label="Batch Year" value={formData.batch} onChange={v => setFormData({...formData, batch: v})} placeholder="e.g. 2024" />
              <InputField label="GitHub" value={formData.github} onChange={v => setFormData({...formData, github: v})} placeholder="https://github.com/..." />
              <div className="md:col-span-2">
                 <TextAreaField label="Bio" value={formData.bio} onChange={v => setFormData({...formData, bio: v})} placeholder="Describe yourself..." />
              </div>
              <div className="md:col-span-2">
                 <TextAreaField label="Skills (Comma Separated)" value={formData.skills} onChange={v => setFormData({...formData, skills: v})} placeholder="React, Node.js, Python..." />
              </div>
              <div className="md:col-span-2">
                 <TextAreaField label="Interests (Comma Separated)" value={formData.interests} onChange={v => setFormData({...formData, interests: v})} placeholder="AI, Web3, Design..." />
              </div>
              <button type="submit" className="md:col-span-2 w-full bg-gradient-to-r from-[#1d9bf0] to-purple-600 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer text-lg mt-2">
                Save Profile ✨
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-10 animate-in fade-in duration-700">
            {/* NAME & BIO */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3">
                {String(user?.name || 'Loading...')} <span className="inline-block animate-pulse text-[#1d9bf0]">⚡</span>
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-[#1d9bf0] font-mono text-lg md:text-xl font-bold italic">@{String(user?.handle || 'username')}</p>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  {String(user?.role || 'Student')}
                </div>
              </div>
              <p className="mt-6 text-gray-300 text-lg leading-relaxed max-w-2xl font-medium italic">
                {String(user?.bio || 'Building the future of campus life. ✨')}
              </p>
            </div>

            {/* 📊 STATS CARDS */}
            <div className="grid grid-cols-4 gap-3">
              <BentoCard icon={<Zap size={20} className="text-[#1d9bf0]" />} count={connections.length} label="Connection" color="blue" />
              <BentoCard icon={<Flame size={20} className="text-orange-500" />} count={user?.streak || 0} label="Streak" color="orange" />
              <BentoCard icon={<Heart size={20} className="text-pink-500" />} count={user?.hearts || 0} label="Hearts" color="pink" />
              <BentoCard icon={<Award size={20} className="text-yellow-500" />} count={user?.badgesCount || 0} label="Badges" color="yellow" />
            </div>

            {/* 📑 TABS SECTION (Renamed for clarity) */}
            <div className="space-y-6">
              <div className="flex gap-6 md:gap-8 border-b border-white/5">
                <TabItem active={activeTab === 'skills'} label="Skills" onClick={() => setActiveTab('skills')} />
                <TabItem active={activeTab === 'squad'} label="Connection" onClick={() => setActiveTab('squad')} />
                <TabItem active={activeTab === 'about'} label="About" onClick={() => setActiveTab('about')} />
              </div>

              <div className="min-h-[200px]">
                
                {/* SKILLS TAB */}
                {activeTab === 'skills' && (
                  <div className="flex flex-wrap gap-3 animate-in zoom-in-95 duration-500">
                    {user?.skills?.length > 0 ? (
                      user.skills.map((s, i) => (
                        <div key={i} className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-[#1d9bf0]/50 transition-all group flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#1d9bf0] rounded-full shadow-[0_0_8px_rgba(29,155,240,0.8)]" />
                          <span className="font-bold text-md tracking-tight">{String(s)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center py-10 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 font-medium mb-3">No skills added yet.</p>
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition">
                          Add Skills +
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* SQUAD TAB */}
                {activeTab === 'Connection' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left-6 duration-500">
                    {connections.length > 0 ? (
                      connections.map(c => (
                        <div key={c._id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition group">
                          <div className="flex items-center gap-4">
                            <img src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} className="w-12 h-12 rounded-xl border border-white/10 bg-gray-900 object-cover" alt={String(c.name)} />
                            <div>
                              <p className="font-bold text-md group-hover:text-[#1d9bf0] transition">{String(c.name)}</p>
                              <p className="text-gray-500 font-mono text-xs uppercase tracking-tighter">@{String(c.handle)}</p>
                            </div>
                          </div>
                          <button onClick={() => handleUnconnect(c._id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer">
                            <UserMinus size={18} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-1 md:col-span-2 text-center text-gray-500 font-medium py-10">Your squad is empty. Start connecting! 🌍</p>
                    )}
                  </div>
                )}

                {/* ABOUT TAB (Interests, Batch, GitHub) */}
                {activeTab === 'about' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    {/* Only show these if they have values, otherwise show edit prompt */}
                    {user?.batch ? <InfoRow icon={<GraduationCap size={20} />} label="Batch" value={String(user.batch)} /> : null}
                    {user?.dept ? <InfoRow icon={<MapPin size={20} />} label="Department" value={String(user.dept)} /> : null}
                    {user?.github ? (
                      <a href={user.github} target="_blank" rel="noreferrer" className="block">
                        <InfoRow icon={<Github size={20} />} label="GitHub" value="View Profile" hover />
                      </a>
                    ) : null}

                    {/* Interests Block */}
                    <div className="col-span-1 md:col-span-2 bg-white/[0.02] p-5 rounded-2xl border border-white/5 mt-2">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
                        <Heart size={14} className="text-pink-500" /> Interests
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {user?.interests?.length > 0 ? (
                          user.interests.map((interest, i) => (
                            <span key={i} className="px-4 py-2 bg-purple-500/10 text-purple-300 text-sm font-bold rounded-xl border border-purple-500/20">
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600 text-sm">No interests added.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

const BentoCard = ({ icon, count, label, color }) => {
  const glows = {
    blue: 'hover:border-[#1d9bf0]/30 hover:shadow-[0_0_20px_rgba(29,155,240,0.15)]',
    orange: 'hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    pink: 'hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]',
    yellow: 'hover:border-yellow-500/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  };
  return (
    <div className={`bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${glows[color]}`}>
      <div className="mb-1 md:mb-2">{icon}</div>
      <p className="text-xl md:text-2xl font-black">{count}</p>
      <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
};

const TabItem = ({ active, label, onClick }) => (
  <button onClick={onClick} className={`pb-3 px-2 text-xs md:text-sm font-black uppercase tracking-widest relative transition cursor-pointer ${active ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}>
    {label}
    {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1d9bf0] rounded-t-full shadow-[0_0_10px_rgba(29,155,240,0.5)]" />}
  </button>
);

const InputField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
    <input className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl focus:border-[#1d9bf0] focus:bg-white/5 outline-none text-white transition-all font-medium text-sm md:text-base" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
    <textarea className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl focus:border-[#1d9bf0] focus:bg-white/5 outline-none text-white resize-none transition-all font-medium text-sm md:text-base" rows="3" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const InfoRow = ({ icon, label, value, hover }) => (
  <div className={`flex items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5 transition-colors ${hover ? 'hover:bg-white/[0.05] cursor-pointer' : ''}`}>
    <div className="text-[#1d9bf0] bg-[#1d9bf0]/10 p-2 rounded-lg">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="font-bold text-sm md:text-base">{value}</span>
    </div>
  </div>
);