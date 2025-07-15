const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const Hero = require("../models/hero");
const authenticateToken = require("../auth/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Cloudinary upload helper
const uploadToCloudinary = async (buffer, mimetype) => {
  const base64 = buffer.toString("base64");
  const dataURI = `data:${mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataURI, {
    resource_type: mimetype.startsWith("video") ? "video" : "image",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
};

// POST - Create or Update Hero Content
router.post(
  "/",
  authenticateToken,
  upload.fields([{ name: "bg_video", maxCount: 1 }]),
  async (req, res) => {
    let uploadedVideoId = null;

    try {
      const video = req.files["bg_video"]?.[0];
      const {
        slide1_desc,
        slide1_title,
        slide2_title,
        slide2_desc,
        slide3_title,
        slide3_desc,
      } = req.body;

      // Validate required fields
      if (
        !slide1_desc ||
        !slide1_title||
        !slide2_title ||
        !slide2_desc ||
        !slide3_title ||
        !slide3_desc
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // Get existing document (singleton)
      const existing = await Hero.findOne();
      let bg_videoUrl = existing?.bg_videoUrl || null;
      let bg_videoPublicId = existing?.bg_videoPublicId || null;

      // Upload video if provided
      if (video && video.mimetype.startsWith("video")) {
        if (bg_videoPublicId) {
          try {
            await cloudinary.uploader.destroy(bg_videoPublicId, {
              resource_type: "video",
            });
          } catch (err) {
            console.warn(`Failed to delete old video (${bg_videoPublicId})`);
            console.warn(err.message);
          }
        }

        const uploadedVideo = await uploadToCloudinary(
          video.buffer,
          video.mimetype
        );

        bg_videoUrl = uploadedVideo.secure_url;
        bg_videoPublicId = uploadedVideo.public_id;
        uploadedVideoId = uploadedVideo.public_id;
      }

      // Final data to update/create
      const updateData = {
        slide1_desc,
        slide1_title,
        slide2_title,
        slide2_desc,
        slide3_title,
        slide3_desc,
        bg_videoUrl,
        bg_videoPublicId,
      };

      // Create or Update one single document
      const updated = await Hero.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true, // create if not exists
      });

      return res.json({
        message: existing ? "Hero content updated" : "Hero content created",
        content: updated,
      });
    } catch (err) {
      // Cleanup uploaded video on failure
      if (uploadedVideoId) {
        await cloudinary.uploader.destroy(uploadedVideoId, {
          resource_type: "video",
        });
      }

      console.error("Hero Upload Error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

// GET - Retrieve Hero Content
router.get("/", async (req, res) => {
  try {
    const existing = await Hero.findOne();

    if (!existing) {
      return res.status(404).json({ message: "No hero content found" });
    }

    res.json({ data: existing });
  } catch (err) {
    console.error("Hero Fetch Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
