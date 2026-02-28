import { useEffect, useState } from 'react';
import API from '../api/axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

// 👉 THE FIX: 'user' prop direct App.jsx se aa raha hai
export default function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // 👉 THE FIX: Outer divs, Sidebar, aur RightSidebar hata diye hain.
  // Ab ye sirf center ka content return karega.
  return (
    <>
      <header className="sticky top-0 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-gray-800/60 z-20 cursor-pointer">
        <h2 className="text-[20px] font-bold">Home</h2>
      </header>

      <div className="border-b border-gray-800/60">
        <CreatePost 
          user={user} 
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
              currentUser={user} 
            />
          ))
        )}
      </div>
    </>
  );
}