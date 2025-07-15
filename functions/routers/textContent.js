const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const textContent = require("../models/textContent");
const authenticateToken = require("../auth/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// POST - create or update content
router.post(
  "/",
  authenticateToken,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    let uploadedVideoId = null;
    let uploadedImageId = null;

    try {
      console.log(req.body);
      const video = req.files["video"]?.[0];
      const thumbnail = req.files["thumbnail"]?.[0];

      let existing = await textContent.findOne();

      let videoUrl = existing?.videoUrl;
      let videoPublicId = existing?.videoPublicId;
      let thumbnailUrl = existing?.thumbnailUrl;
      let thumbnailPublicId = existing?.thumbnailPublicId;

      if (video) {
        if (videoPublicId) {
          await cloudinary.uploader.destroy(videoPublicId, {
            resource_type: "video",
          });
        }
        const uploadedVideo = await uploadToCloudinary(
          video.buffer,
          video.mimetype
        );
        videoUrl = uploadedVideo.secure_url;
        videoPublicId = uploadedVideo.public_id;
        uploadedVideoId = uploadedVideo.public_id;
      }

      if (thumbnail) {
        if (thumbnailPublicId) {
          await cloudinary.uploader.destroy(thumbnailPublicId, {
            resource_type: "image",
          });
        }
        const uploadedThumb = await uploadToCloudinary(
          thumbnail.buffer,
          thumbnail.mimetype
        );
        thumbnailUrl = uploadedThumb.secure_url;
        thumbnailPublicId = uploadedThumb.public_id;
        uploadedImageId = uploadedThumb.public_id;
      }

      const updateData = {
        ...req.body,
        videoUrl,
        videoPublicId,
        thumbnailUrl,
        thumbnailPublicId,
      };

      if (existing) {
        Object.assign(existing, updateData);
        await existing.save();
        return res.json({ message: "Content updated", content: existing });
      } else {
        const newContent = new textContent(updateData);
        await newContent.save();
        return res
          .status(201)
          .json({ message: "Content created", content: newContent });
      }
    } catch (err) {
      if (uploadedVideoId) {
        await cloudinary.uploader.destroy(uploadedVideoId, {
          resource_type: "video",
        });
      }
      if (uploadedImageId) {
        await cloudinary.uploader.destroy(uploadedImageId, {
          resource_type: "image",
        });
      }
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const existing = await textContent.findOne();

    if (!existing) {
      return res.status(404).json({ message: "No content found" });
    }

    res.json({ data: existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
