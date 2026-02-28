const express = require('express');
const router = express.Router();

// 🛡️ Middlewares
const { protect } = require('../middlewares/authMiddleware');   

// 👉 1. THE FIX: Multer ko UNCOMMENT kar diya hai
const upload = require('../middlewares/uploadMiddleware'); 

// 🎮 Controllers
const { 
    getUserProfile,
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

// 👉 2. THE FIX: Update route par upload.single('avatar') laga diya hai
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