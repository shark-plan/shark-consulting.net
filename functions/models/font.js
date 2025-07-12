const mongoose = require("mongoose");

const FontSchema = new mongoose.Schema({
  fontFamily: { type: String, required: true },
  fontStyles: {
    regular: String,
    bold: String,
    extraBold: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Font", FontSchema);
