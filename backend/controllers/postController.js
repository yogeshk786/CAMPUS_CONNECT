// 🛠️ SDE 2 FIX: Removed the random 'typescript' import. 
// VS Code often auto-adds this by mistake when you hit 'Tab' too fast!
const imagekit = require("../config/imagekit");
const Post = require("../models/Post");

// ==========================================
// CREATE A NEW POST (WITH MEDIA)
// ==========================================
const createPost = async (req, res) => {
  try {
    console.log("Body received:", req.body);
    const { text } = req.body || {};

    if (!text && !req.file) {
      return res.status(400).json({ 
        message: "Post must contain text, an image, or a video" 
      });
    }

    // 🛠️ SDE 2 FIX: Set up our safe variables outside the if-block
    let imageObj = null; 
    let finalVideoUrl = null;

    // Handle ImageKit Upload 
    if (req.file) {
      console.log("Uploading file to imagekit...");
      
      const response = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "campus_connect_posts"
      });

      console.log("ImageKit upload response:", response);

      // 🛠️ SDE 2 FIX: Safely route the data based on fileType
      if (response.fileType === "image") {
        imageObj = {
          url: response.url,
          fileId: response.fileId
        };
      } else {
        finalVideoUrl = response.url;
      }
    }

    // Save to MongoDB
    let newPost = await Post.create({
      user: req.user._id,
      text: text || "",
      // 🛠️ SDE 2 FIX: Pass in our safe variables so it doesn't crash on text-only posts
      image: imageObj,
      video: finalVideoUrl,
    });

    // Populate the user details before sending it back to the frontend
    await newPost.populate("user", "name handle avatar role dept");

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
    const posts = await Post.find({deletedAt : null})
      .sort({ createdAt: -1 })
      .populate("user", "name handle avatar role dept")
      .populate("comments.user", "name handle avatar role dept");

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

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      await post.save();
      return res.status(200).json({ message: 'Unliked', likes: post.likes });
    }

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

    await post.populate('comments.user', 'name handle avatar role dept');

    res.status(200).json({ message: 'Comment added successfully', comments: post.comments });
  } catch (error) {
    console.error("Error commenting on post:", error.message);
    res.status(500).json({ message: "Server Error" });
  }       
};

const editPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    post.text = text;
    await post.save();

    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error("Error editing post:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================================
// DELETE POST
// ==========================================
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id ;
    const userId = req.user._id ;

    const post = await Post.findById(postId) ;

    if (!post) {
      return res.status(404).json({message : 'post not found'})
    }
    
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({message : 'not authorised to delete this post'});
    }

    // 🛠️ SDE 2 FIX: You are filtering by {deletedAt: null} in getAllPosts, 
    // so we must do a SOFT DELETE here instead of post.deleteOne()!
    post.deletedAt = new Date();
    await post.save();

    res.status(200).json({
      message : 'post deleted successfully' ,
      deletedPostId  : postId
    });
  } catch (error) {
    console.error("error deleting post : " , error.message);
    res.status(500).json({message: "server error"});
  }
};

module.exports = { createPost, getAllPosts, likePost, commentPost, deletePost , editPost };