const mongoose = require("mongoose");

const textContentSchema = new mongoose.Schema({
  headerTitle: {
    type: String,
    required: true,
  },
  headerDesc: {
    type: String,
    required: true,
  },

  card1Desc: {
    type: String,
    required: true,
  },

  card2Desc: {
    type: String,
    required: true,
  },

  card3Desc: {
    type: String,
    required: true,
  },

  videoUrl: {
    type: String,
  },
  videoPublicId: {
    type: String,
  },
  thumbnailUrl: { type: String },
  thumbnailPublicId: { type: String },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TextContent", textContentSchema);
