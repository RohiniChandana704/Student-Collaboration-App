const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
  type: String,
  required: true,
  trim: true,
  maxlength: 100,
},

description: {
  type: String,
  default: "",
  maxlength: 1000,
},

category: {
  type: String,
  default: "general",
  trim: true,
  maxlength: 50,
},

    technologies: {
  type: [String],
  default: [],
},

maxMembers: {
  type: Number,
  default: null, // null = no cap
},

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);