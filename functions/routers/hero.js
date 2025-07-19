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
  upload.fields([
    { name: "bg_video", maxCount: 1 },
    { name: "slide1_image", maxCount: 1 },
    { name: "slide2_image", maxCount: 1 },
    { name: "slide3_image", maxCount: 1 },
  ]),
  async (req, res) => {
    let uploadedVideoId = null;
    const uploadedImagePublicIds = [];
    console.log(req.body);
    try {
      const files = req.files;
      const {
        slide1_desc,
        slide1_title,
        slide1_visible,
        slide2_title,
        slide2_desc,
        slide2_visible,
        slide3_title,
        slide3_desc,
        slide3_visible,
      } = req.body;

      if (
        !slide1_desc ||
        !slide1_title ||
        !slide2_title ||
        !slide2_desc ||
        !slide3_title ||
        !slide3_desc
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const existing = await Hero.findOne();

      // Extract previous public IDs for image/video cleanup
      const prev = {
        bg_videoPublicId: existing?.bg_videoPublicId,
        slide1_imagePublicId: existing?.slide1_imagePublicId,
        slide2_imagePublicId: existing?.slide2_imagePublicId,
        slide3_imagePublicId: existing?.slide3_imagePublicId,
      };

      let bg_videoUrl = existing?.bg_videoUrl || null;
      let bg_videoPublicId = existing?.bg_videoPublicId || null;

      // VIDEO Upload
      if (files["bg_video"]?.[0]) {
        const video = files["bg_video"][0];
        if (prev.bg_videoPublicId) {
          await cloudinary.uploader.destroy(prev.bg_videoPublicId, {
            resource_type: "video",
          });
        }
        const uploaded = await uploadToCloudinary(video.buffer, video.mimetype);
        bg_videoUrl = uploaded.secure_url;
        bg_videoPublicId = uploaded.public_id;
        uploadedVideoId = uploaded.public_id;
      }

      // IMAGE Uploads
      const handleImageUpload = async (fieldName, oldPublicId) => {
        const file = files[fieldName]?.[0];
        if (!file) return {};

        if (oldPublicId) {
          await cloudinary.uploader.destroy(oldPublicId);
        }

        const uploaded = await uploadToCloudinary(file.buffer, file.mimetype);
        uploadedImagePublicIds.push(uploaded.public_id);

        return {
          [`${fieldName}Url`]: uploaded.secure_url,
          [`${fieldName}PublicId`]: uploaded.public_id,
        };
      };

      const slide1Image = await handleImageUpload(
        "slide1_image",
        prev.slide1_imagePublicId
      );
      const slide2Image = await handleImageUpload(
        "slide2_image",
        prev.slide2_imagePublicId
      );
      const slide3Image = await handleImageUpload(
        "slide3_image",
        prev.slide3_imagePublicId
      );

      const updateData = {
        slide1_desc,
        slide1_title,
        slide1_visible: slide1_visible,
        slide2_title,
        slide2_desc,
        slide2_visible: slide2_visible,
        slide3_title,
        slide3_desc,
        slide3_visible: slide3_visible,
        bg_videoUrl,
        bg_videoPublicId,
        slide1_imageUrl:
          slide1Image.slide1_imageUrl || existing?.slide1_imageUrl,
        slide1_imagePublicId:
          slide1Image.slide1_imagePublicId || existing?.slide1_imagePublicId,
        slide2_imageUrl:
          slide2Image.slide2_imageUrl || existing?.slide2_imageUrl,
        slide2_imagePublicId:
          slide2Image.slide2_imagePublicId || existing?.slide2_imagePublicId,
        slide3_imageUrl:
          slide3Image.slide3_imageUrl || existing?.slide3_imageUrl,
        slide3_imagePublicId:
          slide3Image.slide3_imagePublicId || existing?.slide3_imagePublicId,
      };

      const updated = await Hero.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true,
      });

      return res.json({
        message: existing ? "Hero content updated" : "Hero content created",
        content: updated,
      });
    } catch (err) {
      if (uploadedVideoId) {
        await cloudinary.uploader.destroy(uploadedVideoId, {
          resource_type: "video",
        });
      }

      for (const publicId of uploadedImagePublicIds) {
        await cloudinary.uploader.destroy(publicId);
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
