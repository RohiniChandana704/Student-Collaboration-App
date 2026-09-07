const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
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
      maxlength: 3000,
    },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
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
  maxlength: 200,
},

description: {
  type: String,
  required: true,
  trim: true,
  maxlength: 5000,
},

category: {
  type: String,
  required: true,
  trim: true,
  maxlength: 50,
},
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    answers: [answerSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);