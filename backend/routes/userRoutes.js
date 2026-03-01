const express = require('express');
const router = express.Router();

// 🛡️ Middlewares
const { protect } = require('../middlewares/authMiddleware');   

// 👉 Upload Middleware
const upload = require('../middlewares/uploadMiddleware'); 

// 🎮 Controllers
const { 
    getUserProfile,
    getOtherUserProfile, // 👉 ADDED: Naya controller import kiya
    updateProfile,
    sendConnectionRequest, 
    acceptConnectionRequest, 
    rejectConnectionRequest,
    unconnectUser
} = require('../controllers/userController');

// ==========================================
// 👤 PROFILE ROUTES
// ==========================================
// Get current logged-in user's profile
router.get('/profile', protect, getUserProfile);

// 👉 ADDED: Get OTHER user's profile by their ID (Ye naya route add kiya hai)
router.get('/:id', protect, getOtherUserProfile);

// Update route par upload.single('avatar') laga diya hai
router.put('/update', protect, upload.single('avatar'), updateProfile); 

// ==========================================
// 🤝 CONNECTION ROUTES
// ==========================================
// Send a new connection request
router.post('/connect/:id', protect, sendConnectionRequest);    

// Accept or Reject a pending request 
router.post('/:id/accept', protect, acceptConnectionRequest);
router.post('/:id/reject', protect, rejectConnectionRequest);

// Remove an existing connection (Unconnect)
router.post('/unconnect/:id', protect, unconnectUser);

module.exports = router;