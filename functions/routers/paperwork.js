const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Paperwork = require("../models/paperwork");
const router = require("express").Router();
const authenticateToken = require("../auth/auth");

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = async (buffer, mimetype) => {
  const base64 = buffer.toString("base64");
  const dataURI = `data:${mimetype};base64,${base64}`;
  return cloudinary.uploader.upload(dataURI, {
    resource_type: "image",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });
};

router.post(
  "/save",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { text } = req.body;
      let imageUrl = null;
      let publicId = null;

      // Upload to Cloudinary if image is included
      if (req.file) {
        const uploaded = await uploadToCloudinary(
          req.file.buffer,
          req.file.mimetype
        );
        imageUrl = uploaded.secure_url;
        publicId = uploaded.public_id;
      }

      // Check for existing document
      let existing = await Paperwork.findOne();

      if (existing) {
        // Update
        existing.paperworkText = text || existing.paperworkText;
        if (imageUrl) {
          existing.paperworkImage = imageUrl;
          existing.paperworkImagePublicId = publicId;
        }
        await existing.save();
        return res.status(200).json({ message: "Updated successfully" });
      } else {
        // Create
        const newPaperwork = new Paperwork({
          paperworkText: text,
          paperworkImage: imageUrl,
          paperworkImagePublicId: publicId,
        });
        await newPaperwork.save();
        return res.status(201).json({ message: "Created successfully" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save changes" });
    }
  }
);
router.get("/", async (req, res) => {
  try {
    const paperwork = await Paperwork.findOne();

    if (!paperwork) {
      return res.status(404).json({ message: "No paperwork data found" });
    }

    res.status(200).json({ data: paperwork });
  } catch (err) {
    console.error("Error fetching paperwork:", err);
    res.status(500).json({ error: "Failed to retrieve paperwork" });
  }
});

module.exports = router;
