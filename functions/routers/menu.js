const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const EditableText = require("../models/menu");
const authenticateToken = require("../auth/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// helper to upload buffer to Cloudinary as data URI
const uploadToCloudinary = async (buffer, mimetype) => {
  const base64 = buffer.toString("base64");
  const dataURI = `data:${mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataURI, {
    resource_type: mimetype.startsWith("video") ? "video" : "image",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    folder: "logos",
  });
};

// POST /menu/save
router.post(
  "/save",
  authenticateToken,
  upload.single("logo"),
  async (req, res) => {
    try {
      const data = req.body;
      const logoFile = req.file;

      let existing = await EditableText.findOne();

      // ✅ If a new logo file is uploaded
      if (logoFile) {
        // Delete previous logo from Cloudinary
        if (existing?.logoPublicId) {
          await cloudinary.uploader.destroy(existing.logoPublicId);
        }

        const uploadResult = await uploadToCloudinary(
          logoFile.buffer,
          logoFile.mimetype
        );

        // Add to request body
        data.logoUrl = uploadResult.secure_url;
        data.logoPublicId = uploadResult.public_id;
      }

      if (existing) {
        Object.assign(existing, data);
        await existing.save();
        return res.status(200).json({
          message: "Editable text updated",
          editableText: existing,
        });
      } else {
        const newDoc = new EditableText(data);
        await newDoc.save();
        return res.status(201).json({
          message: "Editable text saved",
          editableText: newDoc,
        });
      }
    } catch (error) {
      console.error("Error saving editable text:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }
);

// GET /menu
router.get("/", async (req, res) => {
  try {
    const menu = await EditableText.findOne();
    if (!menu)
      return res.status(404).json({ message: "No editable text found" });
    res.status(200).json({ menu });
  } catch (error) {
    console.error("Error fetching editable text:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
