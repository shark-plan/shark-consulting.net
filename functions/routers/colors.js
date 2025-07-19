const express = require("express");
const router = express.Router();
const ColorTheme = require("../models/colors");
const authenticateToken = require("../auth/auth");

// GET latest saved theme
router.get("/", async (req, res) => {
  try {
    const theme = await ColorTheme.findOne().sort({ updatedAt: -1 });
    if (!theme) return res.status(404).json({ message: "No theme found" });

    res.status(200).json(theme);
  } catch (err) {
    console.error("Failed to get theme:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Save or update a single color or all colors
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { colors } = req.body;
    if (!colors || typeof colors !== "object") {
      return res.status(400).json({ error: "Invalid colors object" });
    }

    let theme = await ColorTheme.findOne();
    if (theme) {
      theme.colors = { ...theme.colors.toObject(), ...colors };
      theme.updatedAt = new Date();
      await theme.save();
      return res.status(200).json({ message: "Colors updated", theme });
    } else {
      theme = new ColorTheme({ colors });
      await theme.save();
      return res.status(201).json({ message: "Colors created", theme });
    }
  } catch (err) {
    console.error("Failed to save/update theme:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
