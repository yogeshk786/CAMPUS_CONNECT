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
      type: String,
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
    }]
}, { timestamps: true }); // Gives us createdAt and updatedAt automatically!

module.exports = mongoose.model("Post", postSchema);
