const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, required: false }, // 👉 FIX 1: Set to false so manual login works
    avatar: { type: String },
    handle: { type: String, required: true, unique: true },
     // Only required for manual registration
    role: {
        type: String,
        enum: ['student', 'alumni', 'admin'],
        default: 'student'
    },
    bio: { type: String, maxLength: 160 },
    dept: { type: String },
    batch: { type: String, default: "" }, // e.g., "2024" or "2021-2025"
    github: { type: String, default: "" }, // GitHub profile link
    skills: { type: [String], default: [] }, // Array of strings for skills
    interests: { type: [String], default: [] }, // Array of strings for interests

    // networking array
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    skill: [String],
}, { timestamps: true }); // 👉 FIX 2: Added the missing "s" to timestamps

module.exports = mongoose.model('User', userSchema);