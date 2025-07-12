// models/Slide.js
const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true, // for faster search
    },
    desc: {
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
      enum: [
        "factories",
        "restaurants",
        "schools",
        "farms",
        "e-commerce-projects",
        "medical-sector",
        "other-projects",
        "administrational-consultations",
        "files-management",
      ], // or customize categories
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Slide", slideSchema);
