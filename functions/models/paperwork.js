const mongoose = require("mongoose");

const paperworkSchema = new mongoose.Schema(
  {
    paperworkText: {
      type: String,
      required: true,
      default: "نعرض عليكم اكثر الاسئلة شيوعاً من عملائنا الكرام",
    },
    paperworkImage: {
      type: String, // Cloudinary secure URL
      required: true,
    },
    paperworkImagePublicId: {
      type: String, // optional, useful if you want to delete/update the image
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paperwork", paperworkSchema);
