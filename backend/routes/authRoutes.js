const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    googleLogin // 👉 New Controller added
} = require('../controllers/authController');

// Middlewares
const { protect } = require('../middlewares/authMiddleware');

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Standard Email/Password Auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth Auth
router.post('/google', googleLogin); // 👉 Endpoint for Google Sign-In

// Logout
router.post('/logout', logoutUser);

// ==========================================
// PROTECTED ROUTES (Requires JWT Cookie)
// ==========================================

router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: "You made it past the bouncer",
        user: req.user
    });
});

module.exports = router;