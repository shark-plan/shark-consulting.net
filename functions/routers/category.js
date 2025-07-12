const express = require("express");
const About = require("../models/aboutPages"); // adjust path as needed

const router = express.Router();

router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const slides = await About.find({ category });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
