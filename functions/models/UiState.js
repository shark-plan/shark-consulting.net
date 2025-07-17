// models/UiState.js
const mongoose = require("mongoose");

const uiStateSchema = new mongoose.Schema(
  {
    showFeedback: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UiState", uiStateSchema);
