import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import { Camera, UserMinus, Settings2 } from 'lucide-react';

export default function Profile() {
  // 1. State Variables
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', handle: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();

  // 2. 👉 THE FIX: Function pehle define kiya taaki hoisting error na aaye
  const fetchProfile = async () => {
    try {
      // Backend se profile aur connections data fetch kar rahe hain
      const { data } = await API.get('/users/profile');
      setUser(data);
      setConnections(data.connections || []);
      setFormData({ name: data.name, handle: data.handle });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Ab useEffect mein function call kiya
  useEffect(() => {
    fetchProfile();
  }, []);

  // Profile Update Handle (Name, Handle, Image)
  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('handle', formData.handle);
    if (selectedFile) data.append('avatar', selectedFile);

    try {
      const { data: updatedUser } = await API.put('/users/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser(updatedUser);
      setIsEditing(false);
      
      // LocalStorage update karo taaki Sidebar par naya naam turant dikhe
      const storedData = JSON.parse(localStorage.getItem('userInfo'));
      storedData.user = updatedUser;
      localStorage.setItem('userInfo', JSON.stringify(storedData));
      
      alert("Profile Updated Successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Profile update failed");
    }
  };

  // Unconnect Logic
  const handleUnconnect = async (id) => {
    if (!window.confirm("Are you sure you want to disconnect?")) return;
    try {
      await API.post(`/users/unconnect/${id}`);
      // UI se turant hata do bina page refresh kiye
      setConnections(connections.filter(c => c._id !== id));
    } catch (err) {
      console.error("Unconnect error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return <div className="min-h-screen bg-black text-white p-10 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1265px] flex justify-between">
        
        {/* Sidebar */}
        <div className="w-[80px] xl:w-[275px]">
          <Sidebar user={user} />
        </div>
        
        {/* Center Content */}
        <main className="w-full max-w-[600px] border-x border-gray-800 min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-gray-800 z-20">
            <h2 className="text-[20px] font-bold">Profile</h2>
          </header>

          {/* Banner & Avatar Area */}
          <div className="h-48 bg-gray-800 relative">
            <div className="absolute -bottom-16 left-4 p-1 bg-black rounded-full">
              <div className="relative group">
                <img 
                  src={preview || user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-black"
                />
                
                {/* Agar edit mode on hai, toh Camera icon dikhao */}
                {isEditing && (
                  <div 
                    onClick={() => fileInputRef.current.click()} 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition hover:bg-black/60"
                  >
                    <Camera size={26} className="text-white" />
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="mt-20 px-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-500 text-[15px]">@{user.handle}</p>
                {user.dept && <p className="text-gray-500 text-[14px] mt-1">🎓 {user.dept}</p>}
              </div>
              <button 
                onClick={() => {
                  setIsEditing(!isEditing);
                  setPreview(null); // Edit cancel karne par preview hata do
                  setSelectedFile(null);
                }}
                className="border border-gray-600 px-4 py-1.5 rounded-full font-bold hover:bg-white/10 transition"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Edit Form */}
            {isEditing ? (
              <form onSubmit={handleUpdate} className="mt-6 space-y-4 border border-gray-800 p-4 rounded-xl bg-white/[0.02]">
                <div>
                  <label className="text-sm text-gray-500 ml-1">Display Name</label>
                  <input 
                    className="w-full bg-transparent border border-gray-700 p-3 rounded-lg focus:border-[#1d9bf0] outline-none mt-1"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Display Name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 ml-1">Handle</label>
                  <input 
                    className="w-full bg-transparent border border-gray-700 p-3 rounded-lg focus:border-[#1d9bf0] outline-none mt-1"
                    value={formData.handle}
                    onChange={e => setFormData({...formData, handle: e.target.value})}
                    placeholder="Handle (without @)"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold p-3 rounded-full transition"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              /* Connections List */
              <div className="mt-10">
                <h3 className="text-lg font-bold border-b border-gray-800 pb-3">
                  Your Connections ({connections.length})
                </h3>
                
                <div className="mt-2">
                  {connections.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                      You haven't connected with anyone yet. Explore the feed!
                    </div>
                  ) : (
                    connections.map(c => (
                      <div key={c._id} className="flex items-center justify-between p-3 hover:bg-white/[0.03] transition border-b border-gray-800/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <img 
                            src={c.avatar || `https://ui-avatars.com/api/?name=${c.name}`} 
                            className="w-12 h-12 rounded-full object-cover" 
                            alt={c.name}
                          />
                          <div>
                            <p className="font-bold text-[15px] hover:underline cursor-pointer">{c.name}</p>
                            <p className="text-[14px] text-gray-500">@{c.handle}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUnconnect(c._id)} 
                          className="text-red-500 p-2 hover:bg-red-500/10 rounded-full transition"
                          title="Remove Connection"
                        >
                          <UserMinus size={20} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-[350px] pl-8 py-3">
          <RightSidebar />
        </div>
        
      </div>
    </div>
  );
}