const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
  type: String,
  required: true,
  trim: true,
  maxlength: 60,
},

email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
  maxlength: 100,
},

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

   
bio: {
  type: String,
  default: "",
  maxlength: 300,
},

skills: {
  type: [String],
  default: [],
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);