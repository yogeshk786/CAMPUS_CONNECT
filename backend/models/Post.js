const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    // Who created the post?
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxLength: 500,
    },
    // Image and video urls
    image: {
      url:{
        type: String,
      },
      fileId : {
        type : String 
      }
    },
    video: {
      type: String,
    },
    // Array of user IDs who liked the post
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Array of comment objects
    comments: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    
    poll: {
        options: [{
            text: { type: String, required: true },
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Tracks who voted for this specific option
        }]
    },
    tag: {
        type: String,
        default: 'General' // If they don't pick one, it defaults to General
    },

    // 🛠️ SDE 2 FIX: Moved deletedAt to the ROOT of the Post object
    deletedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true }); // Gives us createdAt and updatedAt automatically!

module.exports = mongoose.model("Post", postSchema);