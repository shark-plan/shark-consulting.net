const express = require("express");
const router = express.Router();
const EditableText = require("../models/menu");

// POST /editable-text/save
// Save or update the editable text document
router.post("/save", async (req, res) => {
  try {
    const data = req.body; // expect all fields here, e.g. { home: "...", aboutLabel: "...", ... }

    // Option 1: If you only want to have a single document, update the first one or create new
    const existing = await EditableText.findOne();

    if (existing) {
      // Update existing document
      Object.assign(existing, data);
      await existing.save();
      return res
        .status(200)
        .json({ message: "Editable text updated", editableText: existing });
    } else {
      // Create new document
      const newEditableText = new EditableText(data);
      await newEditableText.save();
      return res.status(201).json({
        message: "Editable text saved",
        editableText: newEditableText,
      });
    }
  } catch (error) {
    console.error("Error saving editable text:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const menu = await EditableText.findOne();

    if (!menu) {
      return res.status(404).json({ message: "No editable text found" });
    }

    res.status(200).json({ menu });
  } catch (error) {
    console.error("Error fetching editable text:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;
