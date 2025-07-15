const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
  slide1_desc: {
    type: String,
    required: true,
  },
  slide1_title: {
    type: String,
    required: true,
  },
  // Card 1
  slide2_title: {
    type: String,
    required: true,
  },
  slide2_desc: {
    type: String,
    required: true,
  },

  // Card 2
  slide3_title: {
    type: String,
    required: true,
  },
  slide3_desc: {
    type: String,
    required: true,
  },
  bg_videoUrl: {
    type: String,
  },
  bg_videoPublicId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("hero", heroSchema);
