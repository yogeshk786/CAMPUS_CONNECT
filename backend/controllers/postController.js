const imagekit = require("../config/imagekit");
const Post = require("../models/Post");
const sanitizeText = require("../utils/profanityFilter");

// ==========================================
// CREATE A NEW POST (WITH MEDIA & POLLS)
// ==========================================
const createPost = async (req, res) => {
  try {
    console.log("Body received:", req.body);
    // 🛠️ SDE 2 UPDATE: Extract pollOptions from the request
    const { text, pollOptions } = req.body || {};
    

    // 🧼 1. Scrub the text before doing anything else!
    const cleanText = sanitizeText(text);

    // 🚨 Check: If they didn't send text, media, OR a poll, reject it!
    if (!cleanText && !req.file && (!pollOptions || pollOptions.length === 0)) {
      return res.status(400).json({ 
        message: "Post must contain text, an image, a video, or a poll" 
      });
    }

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

      if (response.fileType === "image") {
        imageObj = {
          url: response.url,
          fileId: response.fileId
        };
      } else {
        finalVideoUrl = response.url;
      }
    }

    // 📊 Format the Poll Options for MongoDB
    let formattedPoll = undefined;
    
    if (pollOptions) {
        // Handle both standard JSON arrays and FormData stringified arrays
        let parsedOptions = Array.isArray(pollOptions) ? pollOptions : JSON.parse(pollOptions);
        
        if (parsedOptions.length >= 2) {
            formattedPoll = {
                options: parsedOptions.map(optionText => ({
                    text: sanitizeText(optionText), // 🧼 Scrub the poll options too!
                    votes: [] // Starts with zero votes
                }))
            };
        }
    }

    // Save to MongoDB
    let newPost = await Post.create({
      user: req.user._id,
      text: cleanText || "", 
      image: imageObj,
      video: finalVideoUrl,
      poll: formattedPoll // 👈 Attach the poll to the database!
    });

    await newPost.populate("user", "name handle avatar role dept");

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
// 🚀 GET ALL POSTS (LEVEL 1: SMART FEED ALGORITHM)
// ==========================================
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ deletedAt: null })
      .populate("user", "name handle avatar role dept")
      .populate("comments.user", "name handle avatar role dept")
      .lean();

    const scoredPosts = posts.map(post => {
        // Poll votes count as engagement! Let's add them to the math.
        let pollVotes = 0;
        if (post.poll && post.poll.options) {
            post.poll.options.forEach(opt => { pollVotes += opt.votes.length; });
        }

        const likeScore = (post.likes?.length || 0) * 2;
        const commentScore = (post.comments?.length || 0) * 3;
        const voteScore = pollVotes * 1.5; // +1.5 points per vote!
        
        const totalEngagement = likeScore + commentScore + voteScore;

        const hoursAlive = Math.abs(new Date() - new Date(post.createdAt)) / 36e5;
        const gravityPenalty = hoursAlive * 1.5;

        const hotScore = totalEngagement - gravityPenalty;

        return { ...post, hotScore };
    });

    scoredPosts.sort((a, b) => b.hotScore - a.hotScore);

    res.status(200).json(scoredPosts);
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
      text: sanitizeText(text) // 🧼 3. Scrub comments too!
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

// ==========================================
// EDIT POST
// ==========================================
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

    post.text = sanitizeText(text); // 🧼 4. Scrub edited text!
    await post.save();

    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error("Error editing post:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================================
// DELETE POST (BULLETPROOF SOFT DELETE)
// ==========================================
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message : 'post not found' })
    }
    
    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ message : 'not authorised to delete this post' });
    }

    await Post.findByIdAndUpdate(postId, {
        $set: { deletedAt: new Date() }
    });

    res.status(200).json({
      message : 'post deleted successfully',
      deletedPostId  : postId
    });
  } catch (error) {
    console.error("error deleting post : ", error.message);
    res.status(500).json({ message: "server error" });
  }
};

// ==========================================
// 🗳️ VOTE ON A POLL
// ==========================================
const votePoll = async (req, res) => {
    try {
        const postId = req.params.id;
        const { optionId } = req.body; // The ID of the specific option they clicked
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post || !post.poll || post.poll.options.length === 0) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // 1. Scrub the user's previous vote from ALL options (prevents double voting)
        post.poll.options.forEach(option => {
            option.votes = option.votes.filter(id => id.toString() !== userId.toString());
        });

        // 2. Find the specific option they just clicked
        const targetOption = post.poll.options.find(opt => opt._id.toString() === optionId.toString());

        if (!targetOption) {
            return res.status(400).json({ message: "Invalid poll option" });
        }

        // 3. Add their vote to the new option
        targetOption.votes.push(userId);

        await post.save();

        res.status(200).json({ 
            message: "Vote recorded successfully", 
            poll: post.poll 
        });

    } catch (error) {
        console.error("Voting Error:", error.message);
        res.status(500).json({ message: "Server Error while voting" });
    }
};

module.exports = { createPost, getAllPosts, likePost, commentPost, deletePost, editPost, votePoll };