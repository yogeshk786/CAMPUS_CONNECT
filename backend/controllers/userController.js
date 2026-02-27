const User = require('../models/User');
const imagekit = require("../config/imagekit"); // Ensure ImageKit is configured

// ==========================================
// 1. UPDATE USER PROFILE (Name, Handle, Avatar)
// ==========================================
const updateProfile = async (req, res) => {
    try {
        const { name, handle } = req.body;
        const userId = req.user._id;
        let avatarUrl = req.user.avatar; // Existing avatar default

        // Handle unique check: Ensure the new handle isn't taken by someone else
        if (handle) {
            const existingUser = await User.findOne({ handle, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: "Handle already taken" });
            }
        }

        // ImageKit Upload: If a new file is sent via Multer
        if (req.file) {
            const response = await imagekit.upload({
                file: req.file.buffer,
                fileName: `avatar_${userId}_${Date.now()}`,
                folder: "campus_connect_avatars"
            });
            avatarUrl = response.url;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { name, handle, avatar: avatarUrl } },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update Profile Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 2. UNCONNECT (Remove Mutual Connection)
// ==========================================
const unconnectUser = async (req, res) => {
    try {
        const targetId = req.params.id; // The user to remove
        const myId = req.user._id;

        // Mutual removal from both users' connection lists
        await User.findByIdAndUpdate(myId, { $pull: { connections: targetId } });
        await User.findByIdAndUpdate(targetId, { $pull: { connections: myId } });

        res.status(200).json({ message: "Disconnected successfully" });
    } catch (error) {
        console.error("Unconnect Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 3. GET USER PROFILE (With Full Population)
// ==========================================
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('connections', 'name handle avatar role dept') 
            .populate('pendingRequests', 'name handle avatar role dept');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Fetch Profile Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 4. SEND CONNECTION REQUEST
// ==========================================
const sendConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: "User not found" });

        // Check if already connected or request pending
        if (targetUser.connections.includes(currentUserId)) {
            return res.status(400).json({ message: "Already connected" });
        }
        if (targetUser.pendingRequests.includes(currentUserId)) {
            return res.status(400).json({ message: "Request already sent" });
        }

        targetUser.pendingRequests.push(currentUserId);
        await targetUser.save();

        res.status(200).json({ message: "Connection request sent!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 5. ACCEPT CONNECTION REQUEST
// ==========================================
const acceptConnectionRequest = async (req, res) => {
    try {
        const requesterId = req.params.id; 
        const currentUserId = req.user._id;

        const currentUser = await User.findById(currentUserId);
        const requesterUser = await User.findById(requesterId);

        if (!currentUser.pendingRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No pending request" });
        }

        // Move from pending to connections
        currentUser.pendingRequests = currentUser.pendingRequests.filter(
            (id) => id.toString() !== requesterId
        );

        currentUser.connections.push(requesterId);
        requesterUser.connections.push(currentUserId);

        await currentUser.save();
        await requesterUser.save();

        res.status(200).json({ message: "Request accepted!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// 6. REJECT CONNECTION REQUEST
// ==========================================
const rejectConnectionRequest = async (req, res) => {
    try {
        const requesterId = req.params.id; 
        const currentUserId = req.user._id;         

        const currentUser = await User.findById(currentUserId);

        if (!currentUser.pendingRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No pending request" });
        }                      

        currentUser.pendingRequests = currentUser.pendingRequests.filter(
            (id) => id.toString() !== requesterId
        );  
        await currentUser.save();
        res.status(200).json({ message: "Request rejected!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }       
};

module.exports = { 
    updateProfile,
    unconnectUser,
    getUserProfile,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest
};