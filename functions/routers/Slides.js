const express = require("express");
const cloudinary = require("cloudinary").v2;
const Slide = require("../models/slides");
const multer = require("multer");

const router = express.Router();

// Use memory storage so image is kept in memory buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload buffer to Cloudinary using base64 data URI
const uploadToCloudinary = async (buffer, mimetype) => {
  const base64 = buffer.toString("base64");
  const dataURI = `data:${mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataURI, {
    use_filename: true,
    unique_filename: false,
  });
};
// POST - Create slide
router.post("/", upload.single("img"), async (req, res) => {
  let uploadedImageId = null;

  try {
    const { title, desc, category } = req.body;

    if (!req.file || !title || !desc || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    uploadedImageId = result.public_id;

    const slide = new Slide({
      title,
      desc,
      imgUrl: result.secure_url,
      imgPublicId: result.public_id,
      category,
    });

    await slide.save();
    res.json(slide);
  } catch (err) {
    if (uploadedImageId) {
      await cloudinary.uploader.destroy(uploadedImageId);
    }
    res.status(500).json({ error: err.message });
  }
});

// GET - Get slides by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const slides = await Slide.find({ category });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update slide
router.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const { title, desc, category } = req.body;
    let update = { title, desc, category };

    const existingSlide = await Slide.findById(req.params.id);
    if (!existingSlide) {
      return res.status(404).json({ message: "Slide not found." });
    }

    if (req.file) {
      if (existingSlide.imgPublicId) {
        await cloudinary.uploader.destroy(existingSlide.imgPublicId);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype
      );
      update.imgUrl = result.secure_url;
      update.imgPublicId = result.public_id;
    }

    const updatedSlide = await Slide.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    res.json(updatedSlide);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err.message);
  }
});

// DELETE - Delete slide
router.delete("/:id", async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ error: "Slide not found" });

    try {
      await cloudinary.uploader.destroy(slide.imgPublicId);
    } catch (err) {
      console.warn("Cloudinary delete failed:", err.message);
    }

    await Slide.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
