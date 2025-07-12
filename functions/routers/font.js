const express = require("express");
const router = express.Router();
const Font = require("../models/font");

router.post("/set", async (req, res) => {
  try {
    const updatedFont = await Font.findOneAndUpdate(
      {}, // match any existing document
      req.body,
      { new: true, upsert: true } // create if not exists, return the new document
    );
    res.status(200).json({ message: "Font updated", font: updatedFont });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/fonts/latest
router.get("/latest", async (req, res) => {
  try {
    const font = await Font.findOne().sort({ createdAt: -1 });
    if (!font) return res.status(404).json({ message: "No font found" });
    res.json(font);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
