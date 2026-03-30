import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import API from '../api/axios'; 

import { 
  Camera, UserMinus, Settings2, Github, GraduationCap, 
  Sparkles, Heart, Zap, Award, Flame, MapPin, ArrowLeft, Box, UploadCloud,
  X 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', handle: '', batch: '', github: '', skills: '', interests: '', bio: ''
  });
  
  // File States
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelName, setModelName] = useState('');

  // 👉 NEW: Upload Progress States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skills'); 
  
  const imageInputRef = useRef();
  const modelInputRef = useRef();

  const isOwnProfile = !id; 

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isOwnProfile ? '/users/profile' : `/users/${id}`;
      const { data } = await API.get(endpoint);
      
      setUser(data);
      setConnections(data.connections || []);
      
      if (isOwnProfile) {
        setFormData({ 
          name: data.name || '', 
          handle: data.handle || '',
          batch: data.batch || '',
          github: data.github || '',
          bio: data.bio || '',
          skills: data.skills?.join(', ') || '',
          interests: data.interests?.join(', ') || ''
        });
      }
    } catch (err) {
      console.error("Profile fetch error: ", err);
      if (!isOwnProfile) navigate('/feed');
    } finally {
      setLoading(false);
    }
  }, [id, isOwnProfile, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return; 

    // 👉 START UPLOAD
    setIsUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    if (selectedImage) data.append('avatar', selectedImage); 
    if (selectedModel) data.append('avatar3D', selectedModel);

    try {
      const { data: updatedUser } = await API.put('/users/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // 👉 AXIOS UPLOAD PROGRESS EVENT
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setUser(updatedUser);
      setIsEditing(false);
      setSelectedModel(null);
      setModelName('');
      
      const storedData = JSON.parse(localStorage.getItem('userInfo') || '{}');
      storedData.user = updatedUser;
      localStorage.setItem('userInfo', JSON.stringify(storedData));
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Chota sa delay UX smooth karne ke liye
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        alert("Profile Optimized Successfully! 🚀");
      }, 500);

    } catch (err) {
      console.error("Update error:", err);
      setIsUploading(false);
      setUploadProgress(0);
      alert(err.response?.data?.message || "Optimization failed");
    }
  };

  const handleUnconnect = async (connectionId) => {
    if (!window.confirm("Remove this connection?")) return;
    try {
      await API.post(`/users/unconnect/${connectionId}`);
      setConnections(prev => prev.filter(c => c._id !== connectionId));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 transition-colors duration-500">
      <div className="animate-spin h-12 w-12 border-4 border-[#1d9bf0] border-t-transparent rounded-full shadow-[0_0_15px_rgba(29,155,240,0.5)]" />
      <p className="text-[#1d9bf0] font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Loading Vibes...</p>
    </div>
  );

  return (
    <div className="text-gray-900 dark:text-white selection:bg-[#1d9bf0]/30 font-sans pb-20 transition-colors duration-500 min-h-screen bg-gray-50 dark:bg-[#050505]">
      
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between transition-colors duration-500">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl transition active:scale-75 cursor-pointer text-gray-700 dark:text-white">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-xl font-black tracking-tighter flex items-center gap-2 uppercase">
            {isOwnProfile ? 'MY PROFILE' : 'USER VIBE'} <Sparkles size={16} className="text-[#1d9bf0] fill-[#1d9bf0]" />
          </h2>
        </div>
        {isOwnProfile && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2.5 rounded-2xl transition-all duration-300 active:scale-90 cursor-pointer ${isEditing ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20' : 'bg-blue-50 dark:bg-[#1d9bf0]/10 text-[#1d9bf0] border border-blue-100 dark:border-[#1d9bf0]/20'}`}
          >
            {isEditing ? <ArrowLeft size={20} /> : <Settings2 size={20} />}
          </button>
        )}
      </header>

      <div className="h-44 md:h-64 bg-gray-200 dark:bg-[#0a0a0a] relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1d9bf0]/20 via-purple-600/10 to-pink-600/20 animate-pulse mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-[#1d9bf0]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative -mt-20 md:-mt-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1d9bf0] to-purple-500 rounded-[2.5rem] md:rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative p-1.5 bg-gradient-to-tr from-gray-200 dark:from-white/20 to-transparent rounded-[2.7rem] md:rounded-[3.2rem]">
              <img 
                src={(isOwnProfile && imagePreview) ? imagePreview : (user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'U'}`)} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] md:rounded-[3rem] border-4 md:border-8 border-white dark:border-[#050505] z-10 object-cover bg-gray-100 dark:bg-gray-900 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                alt="Avatar"
              />
            </div>
            {isEditing && isOwnProfile && (
              <div 
                onClick={() => imageInputRef.current.click()} 
                className="absolute inset-1.5 z-20 flex items-center justify-center bg-black/40 dark:bg-black/60 rounded-[2.5rem] md:rounded-[3rem] cursor-pointer backdrop-blur-md transition-all border-4 border-transparent dark:border-black text-white hover:bg-black/50"
              >
                <Camera size={32} />
              </div>
            )}
            {isOwnProfile && (
              <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) { setSelectedImage(file); setImagePreview(URL.createObjectURL(file)); }
              }} />
            )}
          </div>
          
          
        </div>

        {isEditing && isOwnProfile ? (
          <form onSubmit={handleUpdate} className="mt-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] shadow-sm dark:shadow-none backdrop-blur-xl transition-colors duration-500">
              <InputField label="Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Full Name" />
              <InputField label="Handle" value={formData.handle} onChange={v => setFormData({...formData, handle: v})} placeholder="handle" />
              <InputField label="Batch Year" value={formData.batch} onChange={v => setFormData({...formData, batch: v})} placeholder="e.g. 2024" />
              <InputField label="GitHub" value={formData.github} onChange={v => setFormData({...formData, github: v})} placeholder="https://github.com/..." />
              
              <div className="md:col-span-2 bg-gray-50 dark:bg-black/30 border border-dashed border-gray-300 dark:border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300">
                 <Box size={32} className="text-purple-500 mb-2" />
                 <h4 className="font-bold text-sm">Upload 3D Avatar</h4>
                 <p className="text-xs text-gray-500 mb-4 mt-1">Accepts .glb files only (Max 5MB)</p>
                 <button type="button" onClick={() => modelInputRef.current.click()} className="flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-500/20 transition cursor-pointer border border-purple-500/20">
                    <UploadCloud size={16} /> {modelName || 'Select GLB File'}
                 </button>
                 <input type="file" ref={modelInputRef} hidden accept=".glb" onChange={(e) => {
                    const file = e.target.files[0];
                    if(file) {
                        if(file.name.toLowerCase().endsWith('.glb')) {
                            setSelectedModel(file);
                            setModelName(file.name);
                        } else {
                            alert('Please select a valid .glb 3D file.');
                        }
                    }
                 }} />
              </div>

              <div className="md:col-span-2">
                 <TextAreaField label="Bio" value={formData.bio} onChange={v => setFormData({...formData, bio: v})} placeholder="Describe yourself..." />
              </div>
              <div className="md:col-span-2">
                 <TextAreaField label="Skills (Comma Separated)" value={formData.skills} onChange={v => setFormData({...formData, skills: v})} placeholder="React, Node.js, Python..." />
              </div>
              <div className="md:col-span-2">
                 <TextAreaField label="Interests (Comma Separated)" value={formData.interests} onChange={v => setFormData({...formData, interests: v})} placeholder="AI, Web3, Design..." />
              </div>
              
              {/* 👉 NEW: Interactive Progress Bar Button */}
              <button 
                type="submit" 
                disabled={isUploading}
                className={`md:col-span-2 w-full text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] text-lg mt-2 shadow-lg relative overflow-hidden ${isUploading ? 'bg-gray-800 cursor-not-allowed' : 'bg-gradient-to-r from-[#1d9bf0] to-purple-600 hover:opacity-90 cursor-pointer'}`}
              >
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
                     <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                     ></div>
                     <span className="absolute w-full text-center z-10 flex items-center justify-center gap-2 drop-shadow-md">
                        Uploading... {uploadProgress}%
                     </span>
                  </div>
                ) : (
                  "Save Profile ✨"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-10 animate-in fade-in duration-700">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3 text-gray-900 dark:text-white transition-colors duration-500">
                {String(user?.name || 'Loading...')} <span className="inline-block animate-pulse text-[#1d9bf0]">⚡</span>
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-[#1d9bf0] font-mono text-lg md:text-xl font-bold italic">@{String(user?.handle || 'username')}</p>
                <div className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-[10px] font-black tracking-widest text-gray-600 dark:text-gray-400 uppercase transition-colors duration-500">
                  {String(user?.role || 'Student')}
                </div>
              </div>
              <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl font-medium italic transition-colors duration-500">
                {String(user?.bio || 'Building the future of campus life. ✨')}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <BentoCard icon={<Zap size={20} className="text-[#1d9bf0]" />} count={connections.length} label="Connection" color="blue" />
              <BentoCard icon={<Flame size={20} className="text-orange-500" />} count={user?.streak || 0} label="Streak" color="orange" />
              <BentoCard icon={<Heart size={20} className="text-pink-500" />} count={user?.hearts || 0} label="Hearts" color="pink" />
              <BentoCard icon={<Award size={20} className="text-yellow-500" />} count={user?.badgesCount || 0} label="Badges" color="yellow" />
            </div>

            <div className="space-y-6">
              <div className="flex gap-6 md:gap-8 border-b border-gray-200 dark:border-white/5 transition-colors duration-500 overflow-x-auto scrollbar-hide">
                <TabItem active={activeTab === 'skills'} label="Skills" onClick={() => setActiveTab('skills')} />
                <TabItem active={activeTab === 'squad'} label="Connection" onClick={() => setActiveTab('squad')} />
                <TabItem active={activeTab === 'about'} label="About" onClick={() => setActiveTab('about')} />
                <TabItem active={activeTab === '3d'} label="3D Space" onClick={() => setActiveTab('3d')} />
              </div>

              <div className="min-h-[200px]">
                
                {activeTab === 'skills' && (
                  <div className="flex flex-wrap gap-3 animate-in zoom-in-95 duration-500">
                    {user?.skills?.length > 0 ? (
                      user.skills.map((s, i) => (
                        <div key={i} className="px-5 py-3 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl hover:border-[#1d9bf0] dark:hover:border-[#1d9bf0]/50 transition-all group flex items-center gap-3 shadow-sm dark:shadow-none text-gray-900 dark:text-white">
                          <div className="w-2 h-2 bg-[#1d9bf0] rounded-full shadow-[0_0_8px_rgba(29,155,240,0.8)]" />
                          <span className="font-bold text-md tracking-tight">{String(s)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center py-10 bg-gray-50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-300 dark:border-white/10 transition-colors duration-500">
                        <p className="text-gray-500 font-medium mb-3">No skills added yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'squad' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left-6 duration-500">
                    {connections.length > 0 ? (
                      connections.map(c => (
                        <div key={c._id} className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-gray-300 dark:hover:bg-white/[0.06] transition group shadow-sm dark:shadow-none">
                          <div className="flex items-center gap-4">
                            <img src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} className="w-12 h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-gray-900 object-cover transition-colors" alt={String(c.name)} />
                            <div>
                              <p className="font-bold text-md text-gray-900 dark:text-white group-hover:text-[#1d9bf0] transition">{String(c.name)}</p>
                              <p className="text-gray-500 font-mono text-xs uppercase tracking-tighter">@{String(c.handle)}</p>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <button onClick={() => handleUnconnect(c._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer">
                              <UserMinus size={18} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="col-span-1 md:col-span-2 text-center text-gray-500 font-medium py-10">Squad is empty. 🌍</p>
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    {user?.batch ? <InfoRow icon={<GraduationCap size={20} />} label="Batch" value={String(user.batch)} /> : null}
                    {user?.dept ? <InfoRow icon={<MapPin size={20} />} label="Department" value={String(user.dept)} /> : null}
                    {user?.github ? (
                      <a href={user.github} target="_blank" rel="noreferrer" className="block">
                        <InfoRow icon={<Github size={20} />} label="GitHub" value="View Profile" hover />
                      </a>
                    ) : null}

                    <div className="col-span-1 md:col-span-2 bg-white dark:bg-white/[0.02] p-5 rounded-2xl border border-gray-200 dark:border-white/5 mt-2 shadow-sm dark:shadow-none transition-colors duration-500">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Heart size={14} className="text-pink-500" /> Interests
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user?.interests?.length > 0 ? (
                          user.interests.map((interest, i) => (
                            <span key={i} className="px-4 py-2 bg-pink-50 dark:bg-purple-500/10 text-pink-600 dark:text-purple-300 text-sm font-bold rounded-xl border border-pink-100 dark:border-purple-500/20">
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No interests added.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 👉 EPIC 3D VIEWER TAB */}
                {activeTab === '3d' && (
                    <div className="w-full h-[500px] md:h-[600px] bg-[#030005] rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-500">
                        <ThreeDViewer 
                            modelUrl={user?.avatar3D} 
                            skills={user?.skills} 
                            username={user?.handle || 'user'}
                        />
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

// ==========================================
// 👉 ENHANCED 3D VIEWER COMPONENT (CTO OPTIMIZED 🚀)
// ==========================================
const ThreeDViewer = ({ modelUrl, skills, username }) => {
    const mountRef = useRef(null);
    const [activeSkill, setActiveSkill] = useState(null);

    // Convert raw string skills from DB into rich objects for 3D
    const cyberpunkColors = [0x61dafb, 0x339933, 0xa855f7, 0xf91880, 0x00ba7c, 0xfacc15];
    const richSkills = useMemo(() => {
        if (!skills || skills.length === 0) return [];
        return skills.map((skillName, idx) => ({
            id: idx,
            name: skillName,
            category: "Campus Node",
            desc: `Mastered knowledge node for ${skillName}. Integrated into neural network.`,
            percent: Math.floor(Math.random() * 30) + 70, 
            color: cyberpunkColors[idx % cyberpunkColors.length],
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7L12 12L22 7L12 2Z"></path><path d="M2 17L12 22L22 17"></path><path d="M2 12L12 17L22 12"></path></svg>'
        }));
    }, [skills]);

    useEffect(() => {
        if (!mountRef.current) return;
        let isMounted = true; 

        mountRef.current.innerHTML = '';

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030005, 0.05);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0.5, 7.5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace; 
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.5; 

        mountRef.current.appendChild(renderer.domElement);

        // Grid Floor
        const gridHelper = new THREE.GridHelper(40, 60, 0x8b5cf6, 0x3b82f6);
        gridHelper.position.y = -2.5;
        gridHelper.material.opacity = 0.15; 
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); 
        scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3.0); 
        hemiLight.position.set(0, 10, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 3.0); 
        dirLight.position.set(2, 5, 5);
        scene.add(dirLight);

        const rimLight = new THREE.SpotLight(0x3b82f6, 8); 
        rimLight.position.set(-5, 8, -5);
        scene.add(rimLight);
        
        const fillLight = new THREE.SpotLight(0x8b5cf6, 6);
        fillLight.position.set(5, 3, 5);
        scene.add(fillLight);

        const sceneGroup = new THREE.Group();
        scene.add(sceneGroup);
        const centralModelGroup = new THREE.Group();
        sceneGroup.add(centralModelGroup);

        let particles;
        let skillOrbs = [];
        let animationId;
        
        let targetRotation = { x: 0.1, y: Math.PI * 2 + 0.5 };
        let currentRotation = { x: 0, y: 0 };
        let isDragging = false;
        let previousMouse = { x: 0, y: 0 };
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Helpers
        const createGlowTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
            return new THREE.CanvasTexture(canvas);
        };
        const glowTexture = createGlowTexture();

        const createTextSprite = (text, colorValue) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 256; 
            const ctx = canvas.getContext('2d');
            const colorHex = `#${colorValue.toString(16).padStart(6, '0')}`;
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 100px Inter, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowColor = colorHex; ctx.shadowBlur = 25;
            ctx.fillText(text, 256, 128);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1.5, 0.75, 1);
            return sprite;
        };

        const buildDiorama = () => {
            const armorMat = new THREE.MeshStandardMaterial({ color: 0x3a4052, metalness: 0.3, roughness: 0.5 });
            const deskMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.4, roughness: 0.2 });
            const neonMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

            const desk = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.1, 2.5), deskMat);
            desk.position.set(0, 0, 0.5);
            centralModelGroup.add(desk);

            const deskEdge = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.02, 2.55), neonMat);
            deskEdge.position.set(0, 0, 0.5);
            centralModelGroup.add(deskEdge);

            const laptop = new THREE.Group();
            laptop.position.set(0, 0.05, 0.8);
            laptop.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.8), armorMat));
            
            const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), armorMat);
            laptopScreen.position.set(0, 0.4, -0.4);
            laptopScreen.rotation.x = -0.2;
            laptop.add(laptopScreen);

            const screenLight = new THREE.PointLight(0x3b82f6, 5, 4); 
            screenLight.position.set(0, 0, 0.5);
            laptopScreen.add(screenLight);
            centralModelGroup.add(laptop);

            const hacker = new THREE.Group();
            hacker.position.set(0, -0.8, -0.4);
            centralModelGroup.add(hacker);

            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 0.6), armorMat);
            torso.position.set(0, 1.2, 0);
            torso.rotation.x = 0.2;
            hacker.add(torso);

            const spine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 0.65), neonMat);
            spine.position.set(0, 1.2, 0);
            spine.rotation.x = 0.2;
            hacker.add(spine);

            const headGroup = new THREE.Group();
            headGroup.position.set(0, 2.1, 0.2);
            headGroup.rotation.x = -0.1;
            hacker.add(headGroup);
            headGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), armorMat));

            const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.15, 32, 1, false, 0, Math.PI), neonMat);
            visor.rotation.y = Math.PI / 2;
            headGroup.add(visor);

            centralModelGroup.position.y = -0.2; 
            centralModelGroup.scale.set(1.3, 1.3, 1.3); 
        };

        // Create Particles
        const geom = new THREE.BufferGeometry();
        const count = 500;
        const pos = new Float32Array(count * 3);
        for(let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 15;
        geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        particles = new THREE.Points(geom, new THREE.PointsMaterial({ size: 0.02, color: 0x3b82f6, transparent: true, opacity: 0.4 }));
        scene.add(particles);

        // Load Model
        if (modelUrl) {
            const loader = new GLTFLoader();
            loader.load(modelUrl, (gltf) => {
                const model = gltf.scene;
                model.traverse((child) => {
                    if (child.isMesh && child.material && child.material.metalness > 0.5) {
                        child.material.metalness = 0.5; 
                        child.material.needsUpdate = true;
                    }
                });

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                const scale = 4.5 / Math.max(size.x, size.y, size.z);
                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));
                model.position.y -= (size.y * scale) * 0.05;
                
                centralModelGroup.add(model);
            }, undefined, (err) => {
                console.error("3D Load Error:", err);
                buildDiorama(); 
            });
        } else {
            buildDiorama();
        }

        // Build Skill Orbs
        richSkills.forEach((skill, i) => {
            const group = new THREE.Group();
            const orb = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 32, 32),
                new THREE.MeshStandardMaterial({ color: skill.color, emissive: skill.color, emissiveIntensity: 1.5, transparent: true, opacity: 0.9, metalness: 0.2, roughness: 0.2 })
            );
            const wire = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.38, 1),
                new THREE.MeshBasicMaterial({ color: skill.color, wireframe: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
            );
            const glowMat = new THREE.SpriteMaterial({
                map: glowTexture,
                color: skill.color,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const glow = new THREE.Sprite(glowMat);
            glow.scale.set(2.2, 2.2, 2.2);

            const light = new THREE.PointLight(skill.color, 2.0, 5); 
            const label = createTextSprite(skill.name, skill.color);
            label.position.y = 0.7;

            group.add(orb, wire, glow, light, label);

            const angle = (i / richSkills.length) * Math.PI * 2;
            const verticalSpread = Math.min(1.5, 4.0 / richSkills.length); 
            group.userData = { skill, angle, radius: 4.6, offsetY: (i - (richSkills.length - 1) / 2) * verticalSpread };
            
            skillOrbs.push(group);
            sceneGroup.add(group);
        });

        // Events
        const onResize = () => {
            if(!mountRef.current || !renderer) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        const onMouseMove = (e) => {
            if(!mountRef.current) return;
            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            if (isDragging) {
                targetRotation.y += (e.clientX - previousMouse.x) * 0.01;
                targetRotation.x += (e.clientY - previousMouse.y) * 0.01;
                targetRotation.x = Math.max(-0.4, Math.min(0.6, targetRotation.x));
            }
            previousMouse.x = e.clientX;
            previousMouse.y = e.clientY;
        };

        const onMouseDown = () => isDragging = true;
        const onMouseUp = () => isDragging = false;
        
        const onClick = () => {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(sceneGroup.children, true);
            for (let inter of intersects) {
                let o = inter.object;
                while(o.parent && !o.userData.skill) o = o.parent;
                if (o.userData.skill) {
                    setActiveSkill(o.userData.skill);
                    return;
                }
            }
        };

        const canvas = renderer.domElement;
        window.addEventListener('resize', onResize);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('click', onClick);

        // Animation Loop
        const animate = () => {
            if (!isMounted) return; 
            animationId = requestAnimationFrame(animate);
            const time = Date.now() * 0.001;

            if (!isDragging) {
                targetRotation.y += 0.0015;
                targetRotation.x += (0.1 - targetRotation.x) * 0.02;
            }

            currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
            currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

            sceneGroup.rotation.y = currentRotation.y;
            sceneGroup.rotation.x = currentRotation.x;
            sceneGroup.position.y = Math.sin(time) * 0.1;

            if (particles) particles.rotation.y -= 0.0005;

            skillOrbs.forEach((orb, i) => {
                const d = orb.userData;
                d.angle += 0.0025; 
                orb.position.x = Math.cos(d.angle) * d.radius;
                orb.position.z = Math.sin(d.angle) * d.radius;
                orb.position.y = d.offsetY + Math.sin(time * 1.5 + i) * 0.5;
                
                orb.children[0].rotation.y += 0.005; 
                orb.children[1].rotation.y += 0.015;
                orb.children[1].rotation.z += 0.005;
                orb.children[3].intensity = 2.0 + Math.sin(time * 3 + i) * 1.0; 
            });

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            isMounted = false; 
            window.removeEventListener('resize', onResize);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('click', onClick);
            
            if(mountRef.current && mountRef.current.contains(canvas)) {
                mountRef.current.removeChild(canvas);
            }
            
            cancelAnimationFrame(animationId);
            
            scene.traverse((object) => {
                if (!object.isMesh) return;
                object.geometry.dispose();
                if (object.material.isMaterial) {
                    object.material.dispose();
                } else if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                }
            });
            
            renderer.forceContextLoss(); 
            renderer.dispose();
        };
    }, [modelUrl, richSkills]);

    return (
        <div className="w-full h-full relative group">
            <style dangerouslySetInnerHTML={{__html: `
                .glass-panel { background: rgba(10, 15, 30, 0.4); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5); }
            `}} />
            
            <div ref={mountRef} className="w-full h-full cursor-move" />
            
            {/* OVERLAY TEXT */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-10 transition-opacity duration-300 group-hover:opacity-100">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <p className="text-[10px] text-purple-400 uppercase tracking-widest font-black">Metaverse ID</p>
                    <p className="text-white font-bold">@{username}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black hidden md:block">Interactive Orbs</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Drag to Rotate • Click Skills</p>
                </div>
            </div>

            {/* SKILL CLICK MODAL OVERLAY */}
            {activeSkill && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-panel p-6 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border-t border-white/20">
                        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: `#${activeSkill.color.toString(16).padStart(6, '0')}` }}></div>
                        
                        <button onClick={() => setActiveSkill(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 p-1 rounded-full hover:bg-white/20 cursor-pointer pointer-events-auto">
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-black/50 flex items-center justify-center border border-white/10 shadow-inner flex-shrink-0" style={{ color: `#${activeSkill.color.toString(16).padStart(6, '0')}` }} dangerouslySetInnerHTML={{ __html: activeSkill.icon }} />
                            <div>
                                <div className="text-[9px] uppercase font-black tracking-[0.3em] mb-1" style={{ color: `#${activeSkill.color.toString(16).padStart(6, '0')}` }}>{activeSkill.category}</div>
                                <h2 className="text-2xl font-black tracking-tight leading-none uppercase text-white" style={{ textShadow: `0 0 10px #${activeSkill.color.toString(16).padStart(6, '0')}80` }}>{activeSkill.name}</h2>
                            </div>
                        </div>
                        
                        <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">{activeSkill.desc}</p>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">
                                <span>Network Mastery</span>
                                <span style={{ color: `#${activeSkill.color.toString(16).padStart(6, '0')}` }}>{activeSkill.percent}%</span>
                            </div>
                            <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full transition-all duration-1000" style={{ width: `${activeSkill.percent}%`, backgroundColor: `#${activeSkill.color.toString(16).padStart(6, '0')}`, boxShadow: `0 0 10px #${activeSkill.color.toString(16).padStart(6, '0')}` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// Helper Components
// ==========================================
const BentoCard = ({ icon, count, label, color }) => {
  const glows = {
    blue: 'hover:border-[#1d9bf0] dark:hover:border-[#1d9bf0]/30 hover:shadow-[0_0_20px_rgba(29,155,240,0.15)]',
    orange: 'hover:border-orange-500 dark:hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    pink: 'hover:border-pink-500 dark:hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]',
    yellow: 'hover:border-yellow-500 dark:hover:border-yellow-500/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  };
  return (
    <div className={`bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer shadow-sm dark:shadow-none text-gray-900 dark:text-white ${glows[color]}`}>
      <div className="mb-1 md:mb-2">{icon}</div>
      <p className="text-xl md:text-2xl font-black">{count}</p>
      <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
};

const TabItem = ({ active, label, onClick }) => (
  <button onClick={onClick} className={`pb-3 px-2 text-xs md:text-sm font-black uppercase tracking-widest relative transition cursor-pointer whitespace-nowrap ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'}`}>
    {label}
    {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1d9bf0] rounded-t-full shadow-[0_0_10px_rgba(29,155,240,0.5)]" />}
  </button>
);

const InputField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
    <input className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl focus:border-[#1d9bf0] dark:focus:border-[#1d9bf0] focus:bg-white dark:focus:bg-white/5 outline-none text-gray-900 dark:text-white transition-all font-medium text-sm md:text-base shadow-inner dark:shadow-none" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
    <textarea className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl focus:border-[#1d9bf0] dark:focus:border-[#1d9bf0] focus:bg-white dark:focus:bg-white/5 outline-none text-gray-900 dark:text-white resize-none transition-all font-medium text-sm md:text-base shadow-inner dark:shadow-none" rows="3" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const InfoRow = ({ icon, label, value, hover }) => (
  <div className={`flex items-center gap-4 bg-white dark:bg-white/[0.02] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors ${hover ? 'hover:border-[#1d9bf0] dark:hover:bg-white/[0.05] cursor-pointer' : ''}`}>
    <div className="text-[#1d9bf0] bg-blue-50 dark:bg-[#1d9bf0]/10 p-2 rounded-lg">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white">{value}</span>
    </div>
  </div>
);