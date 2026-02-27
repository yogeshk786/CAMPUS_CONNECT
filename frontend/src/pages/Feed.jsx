import { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import RightSidebar from '../components/RightSidebar';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
   
  // 👇 FIXED: Removed setCurrentUser to clear the unused variable warning
  const [currentUser] = useState(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      const parsedData = JSON.parse(storedUser);
      return parsedData.user || parsedData;
    }
    return null;
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await API.get('/posts');
        setPosts(data);
        setLoading(false);
      } catch (err) {
        console.error("Posts load nahi ho payi:", err);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
      <div className="w-full max-w-[1265px] flex justify-between">
        
        {/* Left Sidebar */}
        <div className="w-[80px] xl:w-[275px]">
          <Sidebar user={currentUser} />
        </div>

        {/* Center Feed */}
        <main className="w-full max-w-[600px] border-x border-gray-800 min-h-screen">
          <header className="sticky top-0 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-gray-800 z-20 cursor-pointer">
            <h2 className="text-[20px] font-bold">Home</h2>
          </header>

          <div className="border-b border-gray-800">
            <CreatePost 
              user={currentUser} 
              onPostCreated={(newPost) => setPosts([newPost, ...posts])} 
            />
          </div>

          <div className="pb-20">
            {loading ? (
              <div className="flex justify-center p-10">
                <div className="animate-spin h-8 w-8 border-4 border-[#1d9bf0] border-t-transparent rounded-full"></div>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  currentUser={currentUser} 
                />
              ))
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