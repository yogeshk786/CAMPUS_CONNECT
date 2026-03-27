const mongoose = require('mongoose');

/**
 * 🚀 LAUNCHPAD SCHEMA - THE SQUAD EDITION
 * Is schema ko is tarah design kiya gaya hai ki ye poori team (Squad) 
 * aur unke roles ko handle kar sake.
 */
const launchpadSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Project title is mandatory'],
        trim: true 
    },
    tagline: { 
        type: String, 
        required: [true, 'Tagline is required'],
        maxLength: 100 
    },
    description: { 
        type: String, 
        required: [true, 'Description cannot be empty'] 
    },
    category: {
        type: String,
        enum: ['Web', 'AI', 'Hardware', 'Web3', 'Design', 'Other'],
        default: 'Web'
    },

  


    
    // 🚩 THE SQUAD LOGIC
    // Array of users with their roles. Populate() use karke inka avatar aur name mil jayega.
    team: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            default: 'Contributor', // e.g., 'Lead Developer', 'UI/UX', 'Backend'
        }
    }],

    // 👑 FOUNDER
    // Specifically tracking the person who deployed the node.
    founder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // 👍 UPVOTES (Proof of Hype)
    // Storing user IDs in an array to avoid double upvoting.
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // 💰 CAMPUS ECONOMY
    // Total V-Tokens invested in this node.
    tokensRaised: {
        type: Number,
        default: 0
    },

    // 🔗 TECH STACK & LINKS
    tags: [String], // e.g. ['React', 'Node.js']
    github: { type: String, default: "" },
    liveLink: { type: String, default: "" },

    // 🤝 HIRING (FOMO Element)
    // Agar project ko kisi aur teammate ki zaroorat hai.
    hiring: { 
        type: String, 
        default: "" // e.g. "Looking for a Mobile Developer"
    } ,
    
    pitches: [{
        user:{
            type: mongoose.Schema.Types.ObjectId ,
            ref: 'User' ,

            required : true 

        },

        message: {
            type : String ,
            required : true
        },
        status:{
            type: String ,
            enum : ['pending' , 'accepted' , 'rejected'],
            default: "pending"
        },
        createdAt: {
            type : Date ,
            default : Date.now
        }

        
    }]

}, { 
    timestamps: true // Isse 'createdAt' aur 'updatedAt' apne aap ban jayenge
});

// 🔍 PERFORMANCE FIX: Indexing for search
// Jab campus mein 500 projects honge, ye search ko fast rakhega.
launchpadSchema.index({ title: 'text', tagline: 'text', tags: 'text' });

module.exports = mongoose.model('Launchpad', launchpadSchema);