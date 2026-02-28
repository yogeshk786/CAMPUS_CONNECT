const User = require('../models/User');
const imagekit = require("../config/imagekit"); 

// ==========================================
// 1. UPDATE USER PROFILE (Name, Handle, Avatar, Skills, etc.)
// ==========================================
const updateProfile = async (req, res) => {
    try {
        const { name, handle, batch, github, skills, interests } = req.body;
        const userId = req.user._id;
        
        // Comma-separated strings ko arrays mein badle, empty aane par safe rahe
        const parsedSkills = skills ? skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const parsedInterests = interests ? interests.split(',').map(i => i.trim()).filter(i => i) : [];
        
        // Saara data ek object mein pack karein
        let updateData = {
            name, 
            handle, 
            batch,
            github,
            skills: parsedSkills,
            interests: parsedInterests
        };

        // Handle unique check: Ensure the new handle isn't taken by someone else
        if (handle) {
            const existingUser = await User.findOne({ handle, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: "Handle already taken by another user" });
            }
        }

        // ImageKit Upload: Agar nayi file aayi hai toh process karein
        if (req.file) {
            const response = await imagekit.upload({
                file: req.file.buffer,
                fileName: `avatar_${userId}_${Date.now()}`,
                folder: "campus_connect_avatars"
            });
            // Naya Image URL updateData mein jod dein
            updateData.avatar = response.url;
        }

        // Database ko naye data ke saath update karein
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update Profile Error:", error.message);
        res.status(500).json({ message: "Server Error during profile update" });
    }
};

// ==========================================
// 2. UNCONNECT (Remove Mutual Connection)
// ==========================================
const unconnectUser = async (req, res) => {
    try {
        const targetId = req.params.id; 
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
            .populate('connections', 'name handle avatar role dept batch skills') 
            .populate('pendingRequests', 'name handle avatar role dept batch');

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
        console.error("Send Request Error:", error.message);
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
        console.error("Accept Request Error:", error.message);
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
        console.error("Reject Request Error:", error.message);
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