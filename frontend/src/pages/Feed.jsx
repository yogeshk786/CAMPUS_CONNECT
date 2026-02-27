import { useEffect, useState } from 'react';
import API from '../api/axios';
import PostCard from '../components/PostCard'; // Jo aapne pehle se banaya hua hai

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await API.get('/posts'); // Backend se posts mangwayenge
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
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', color: '#1a1a1b' }}>Campus Feed</h2>
        
        {/* Yahan hum 'Create Post' ka component baad mein lagayenge */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#878a8c' }}>What's on your mind, CampusConnect user?</p>
        </div>

        {loading ? (
          <p>Loading campus stories...</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}