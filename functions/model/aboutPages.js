// models/About.js
const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    topTitle: {
      type: String,
      // required: true,
    },
    topSubtitle: {
      type: String,
      // required: true,
    },
    sectionTitle: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    imgPublicId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["about", "why-us", "previous-works"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("About", aboutSchema);
