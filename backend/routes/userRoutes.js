const express = require('express');
const router = express.Router();
const { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest , getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');   



// @route   POST /api/users/connect/:id
// @desc    Send a connection request to another user
// @access  Private
router.post('/connect/:id', protect, sendConnectionRequest);    
router.post('/accept/:id', protect, acceptConnectionRequest);
router.post('/reject/:id', protect, rejectConnectionRequest);
router.get('/profile', protect, getUserProfile);

module.exports = router;