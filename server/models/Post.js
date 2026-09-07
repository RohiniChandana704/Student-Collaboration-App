const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
  type: String,
  required: true,
  trim: true,
  maxlength: 150,
},

content: {
  type: String,
  required: true,
  maxlength: 5000,
},

category: {
  type: String,
  required: true,
  trim: true,
  maxlength: 50,
},

tags: {
  type: [String],
  default: [],
},
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);