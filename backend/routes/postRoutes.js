const express = require('express');
const router = express.Router();
const { createPost, getAllPosts } = require('../controllers/postController');

// I noticed your folder is named 'middlewares' with an 's' based on your last error message!
const { protect } = require('../middlewares/authMiddleware'); 

// Both routes are protected so only logged-in users can post or read the timeline
router.post('/', protect, createPost);
router.get('/', protect, getAllPosts);

module.exports = router;