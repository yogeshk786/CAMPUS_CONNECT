const imagekit = require("../config/imagekit");
const Post = require("../models/Post");

// ==========================================
// CREATE A NEW POST (WITH MEDIA)
// ==========================================
// 👉 FIXED: Added 'async' back to the function
const createPost = async (req, res) => {
  try {
    console.log("Body received:", req.body);
    const { text } = req.body || {};

    if (!text && !req.file) {
      return res.status(400).json({ 
        message: "Post must contain text, an image, or a video" 
      });
    }

    let imageUrl = null;
    let videoUrl = null;

    // Handle ImageKit Upload
    if (req.file) {
      console.log("Uploading file to imagekit...");
      
      const response = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "campus_connect_posts"
      });

      console.log("ImageKit upload response:", response);

      if (response.fileType === "image") {
        imageUrl = response.url;
      } else {
        videoUrl = response.url;
      }
    }

    // Save to MongoDB
    const newPost = await Post.create({
      user: req.user._id,
      text: text || "",
      image: imageUrl,
      video: videoUrl,
    });

    // Send Success Response
    res.status(201).json(newPost);

  } catch (error) {
    console.error("Error Detail :", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message 
    });
  }
};

// ==========================================
// GET ALL POSTS (TIMELINE)
// ==========================================
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "name handle avatar role dept");

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
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Agar pehle se liked hai toh hata do (Unlike)
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      await post.save();
      return res.status(200).json({ message: 'Unliked', likes: post.likes });
    }

    // Nahi toh add karo (Like)
    post.likes.push(userId);
    await post.save();
    res.status(200).json({ message: 'Liked', likes: post.likes });
  } catch (error) {
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
    };
    
    post.comments.push(comment);
    await post.save();
    res.status(200).json({ message: 'Comment added successfully', comments: post.comments });
  } catch (error) {
    console.error("Error commenting on post:", error.message);
    res.status(500).json({ message: "Server Error" });
  }       
};      

module.exports = { createPost, getAllPosts, likePost, commentPost };