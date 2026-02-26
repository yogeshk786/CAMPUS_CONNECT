const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, likePost, commentPost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware'); 
const upload = require('../middlewares/uploadMiddleware');

// ==========================================
// POST ROUTES
// ==========================================

// 1. Create a new post (With Media)
// 👉 FIXED: Sirf ek baar rakha hai Multer ke saath
router.post('/',  upload.single('media'), createPost);

// 2. Get all posts
router.get('/', protect, getAllPosts);

// 3. Like and Comment (Future tasks)
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);

module.exports = router;