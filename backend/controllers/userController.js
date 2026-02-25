const User = require('../models/User');

// ==========================================
// SEND CONNECTION REQUEST
// ==========================================
const sendConnectionRequest = async (req, res) => {
    try {
        // req.params.id is the person we want to connect with
        const targetUserId = req.params.id;
        const currentUserId = req.user._id; // We get this from the 'protect' bouncer!

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already connected or request already sent
        if (targetUser.connections.includes(currentUserId)) {
            return res.status(400).json({ message: "You are already connected" });
        }
        if (targetUser.pendingRequests.includes(currentUserId)) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Add our ID to their pending requests
        targetUser.pendingRequests.push(currentUserId);
        await targetUser.save();

        res.status(200).json({ message: "Connection request sent successfully!" });

    } catch (error) {
        console.error("Error sending request:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// ACCEPT CONNECTION REQUEST
// ==========================================
const acceptConnectionRequest = async (req, res) => {
    try {
        // req.params.id is the person who sent us the request
        const requesterId = req.params.id; 
        const currentUserId = req.user._id;

        const currentUser = await User.findById(currentUserId);
        const requesterUser = await User.findById(requesterId);

        // Make sure the request actually exists
        if (!currentUser.pendingRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No pending request from this user" });
        }

        // 1. Remove them from our pendingRequests array
        currentUser.pendingRequests = currentUser.pendingRequests.filter(
            (id) => id.toString() !== requesterId
        );

        // 2. Add each other to the connections arrays
        currentUser.connections.push(requesterId);
        requesterUser.connections.push(currentUserId);

        // 3. Save both users
        await currentUser.save();
        await requesterUser.save();

        res.status(200).json({ message: "Connection request accepted!" });

    } catch (error) {
        console.error("Error accepting request:", error.message);
        res.status(500).json({ message: "Server Error" });
    }

};

const rejectConnectionRequest = async (req, res) => {
    try {
        // req.params.id is the person who sent us the request
        const requesterId = req.params.id; 
        const currentUserId = req.user._id;         

        const currentUser = await User.findById(currentUserId);

        // Make sure the request actually exists
        if (!currentUser.pendingRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No pending request from this user" });
        }                       

        // Remove them from our pendingRequests array
        currentUser.pendingRequests = currentUser.pendingRequests.filter(
            (id) => id.toString() !== requesterId
        );  
        await currentUser.save();
        res.status(200).json({ message: "Connection request rejected!" });

    } catch (error) {
        console.error("Error rejecting request:", error.message);
        res.status(500).json({ message: "Server Error" });
    }       
};

const getUserProfile = async (req, res) => {
    try {
        // req.user._id comes directly from our Bouncer (protect middleware)
        const user = await User.findById(req.user._id)
            .select('-password') // Keep the password hidden!
            .populate('connections', 'name email handle avatar role dept') // 👉 Fetch real data for connections
            .populate('pendingRequests', 'name email handle avatar role dept'); // 👉 Fetch real data for requests

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, getUserProfile };