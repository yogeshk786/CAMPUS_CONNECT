const Post = require('../models/Post');

// ==========================================
// CREATE A NEW POST
// ==========================================
const createPost = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Post text is required' });
        }

        const newPost = await Post.create({
            user: req.user._id, // 👉 The Bouncer provides this!
            text: text
        });

        res.status(201).json(newPost);

    } catch (error) {
        console.error("Error creating post:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// GET ALL POSTS (TIMELINE)
// ==========================================
const getAllPosts = async (req, res) => {
    try {
        // Find all posts, sort by newest (-1), and populate the user data!
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name handle avatar role dept'); 

        res.status(200).json(posts);

    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { createPost, getAllPosts };