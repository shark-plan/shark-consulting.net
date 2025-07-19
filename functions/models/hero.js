const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
  // Slide 1
  slide1_title: {
    type: String,
    required: true,
  },
  slide1_desc: {
    type: String,
    required: true,
  },
  slide1_imageUrl: {
    type: String,
  },
  slide1_imagePublicId: {
    type: String,
  },
  slide1_visible: {
    type: Boolean,
    default: true,
  },

  // Slide 2
  slide2_title: {
    type: String,
    required: true,
  },
  slide2_desc: {
    type: String,
    required: true,
  },
  slide2_imageUrl: {
    type: String,
  },
  slide2_imagePublicId: {
    type: String,
  },
  slide2_visible: {
    type: Boolean,
    default: true,
  },

  // Slide 3
  slide3_title: {
    type: String,
    required: true,
  },
  slide3_desc: {
    type: String,
    required: true,
  },
  slide3_imageUrl: {
    type: String,
  },
  slide3_imagePublicId: {
    type: String,
  },
  slide3_visible: {
    type: Boolean,
    default: true,
  },

  // Background Video
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
