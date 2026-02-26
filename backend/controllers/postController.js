const imagekit = require('../config/imagekit');
const Post = require('../models/Post');

// ==========================================
// CREATE A NEW POST (WITH MEDIA)
// ==========================================
const createPost = async (req, res) => {
    try {
        console.log("Body received:", req.body);
        console.log("File received:", req.file);

        const { text } = req.body || {};
        
        // 👉 FIXED: Declared imageUrl and videoUrl properly
        let imageUrl = null;
        let videoUrl = null;

        if (req.file) {
            const response = await imagekit.upload({
                file: req.file.buffer,
                fileName: req.file.originalname,
                folder: "campus_connect_posts"
            });

            // 👉 FIXED: Changed 'videos' to 'video' (mimetypes are singular, like 'video/mp4')
            if (req.file.mimetype.includes('video')) {
                videoUrl = response.url;
            } else {
                imageUrl = response.url;
            }
        }

        // Ensure the post isn't completely empty
        if (!text && !imageUrl && !videoUrl) {
            return res.status(400).json({ message: 'Post must contain text, an image, or a video' });
        }

        const newPost = await Post.create({
            user: req.user._id,
            text: text || "",
            image: imageUrl || "",
            video: videoUrl || "",
        });

        res.status(201).json(newPost);

    } catch (error) {
        console.error("Error Detail :", error);
        res.status(500).json({ message: "Server Error"  , error : error.message});
    }
};

// ==========================================
// GET ALL POSTS (TIMELINE)
// ==========================================
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name handle avatar role dept'); 

        res.status(200).json(posts);

    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// LIKE OR UNLIKE A POST
// ==========================================
const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;    

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }   

        // Note: I kept your logic where a user can only 'like' and not 'unlike'. 
        // If you want a toggle, let me know!
        if (post.likes.includes(userId)) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }           
        
        post.likes.push(userId);
        await post.save();
        res.status(200).json({ message: 'Post liked successfully', likes: post.likes });
    } catch (error) {
        console.error("Error liking post:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// ADD A COMMENT
// ==========================================
const commentPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;    
        const { text } = req.body;
        
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }               
        
        const comment = {
            user: userId,
            text: text
        }
        
        post.comments.push(comment);
        await post.save();
        res.status(200).json({ message: 'Comment added successfully', comments: post.comments });
    } catch (error) {
        console.error("Error commenting on post:", error.message);
        res.status(500).json({ message: "Server Error" });
    }       
};      

// 👉 FIXED: Exporting exactly what the routes file is looking for!
module.exports = { createPost, getAllPosts, likePost, commentPost };