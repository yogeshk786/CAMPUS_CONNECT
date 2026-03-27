const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    // 👉 CHANGE: Required false for Google Auth compatibility
    password: { 
        type: String, 
        required: function() {
            return !this.googleId; // Agar googleId nahi hai, toh password zaroori hai
        }
    },
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true // Taaki null values duplicate error na dein
    },
    handle: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        index: true // 👉 Faster profile lookups
    },
    avatar: { 
        type: String,
        default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' 
    },
    avatar3D: { 
        type: String, 
        default: '' 
    },
    role: {
        type: String,
        enum: ['student', 'alumni', 'admin'],
        default: 'student'
    },
    // 👉 NEW: Headline (Jaise LinkedIn par hota hai)
    headline: {
        type: String,
        default: 'Campus Connect Member'
    },
    bio: { 
        type: String, 
        maxLength: 160 
    },
    dept: { 
        type: String 
    },
    batch: { 
        type: String, 
        default: "" 
    },
    // 👉 NEW: Portfolio/Website link
    website: { 
        type: String, 
        default: "" 
    },
    github: { 
        type: String, 
        default: "" 
    },
    skills: { 
        type: [String], 
        default: [] 
    },
    interests: { 
        type: [String], 
        default: [] 
    },

    // 🚀 GENZ STATS
    vTokens: { // 👉 V-Tokens balance for Launchpad/Confessions
        type: Number,
        default: 1000 
    },
    streak: { type: Number, default: 0 },
    hearts: { type: Number, default: 0 },
    badgesCount: { type: Number, default: 0 },

    // 🌐 NETWORKING
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);