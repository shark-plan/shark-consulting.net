const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const About = require("../model/aboutPages"); 

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = async (buffer, mimetype) => {
  const base64 = buffer.toString("base64");
  const dataURI = `data:${mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataURI, {
    use_filename: true,
    unique_filename: false,
  });
};

// POST - Create a new previous work
router.post("/", upload.single("img"), async (req, res) => {
  let uploadedImageId = null;

  try {
    const { topTitle, topSubtitle, sectionTitle, description, category } =
      req.body;

    if (
    //   !topTitle ||
    //   !topSubtitle ||
    //   !sectionTitle ||
      !description ||
      !category
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required." });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    uploadedImageId = result.public_id;

    const about = new About({
      topTitle,
      topSubtitle,
      sectionTitle,
      description,
      category,
      imgUrl: result.secure_url,
      imgPublicId: uploadedImageId,
    });

    await about.save();
    res.json(about);
  } catch (err) {
    if (uploadedImageId) await cloudinary.uploader.destroy(uploadedImageId);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update previous work
router.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const { topTitle, topSubtitle, sectionTitle, description, category } =
      req.body;
    const existing = await About.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "About entry not found" });
    }

    const update = {
      topTitle,
      topSubtitle,
      sectionTitle,
      description,
      category,
    };

    if (req.file) {
      if (existing.imgPublicId) {
        await cloudinary.uploader.destroy(existing.imgPublicId);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.mimetype
      );
      update.imgUrl = result.secure_url;
      update.imgPublicId = result.public_id;
    }

    const updatedAbout = await About.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json(updatedAbout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remove previous work
router.delete("/:id", async (req, res) => {
  try {
    const about = await About.findById(req.params.id);
    if (!about) return res.status(404).json({ error: "About not found" });

    try {
      if (about.imgPublicId) {
        await cloudinary.uploader.destroy(about.imgPublicId);
      }
    } catch (err) {
      console.warn("Cloudinary delete failed:", err.message);
    }

    await about.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
