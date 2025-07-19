const mongoose = require("mongoose");

const ColorThemeSchema = new mongoose.Schema(
  {
    colors: {
      type: Map,
      of: String, // All CSS variables as strings
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "colorThemes" }
);

module.exports = mongoose.model("ColorTheme", ColorThemeSchema);
