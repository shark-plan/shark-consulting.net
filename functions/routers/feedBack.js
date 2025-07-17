const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedBack"); // Adjust path if needed
const authenticateToken = require("../auth/auth");

// POST: Create new feedback
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { text, name, job } = req.body;

    if (!text || !name || !job) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const newFeedback = new Feedback({ text, name, job });
    await newFeedback.save();

    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء التعليق" });
  }
});

// GET: Get all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب التعليقات" });
  }
});

// PUT: Update a feedback by ID
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { text, name, job } = req.body;
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { text, name, job },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ error: "لم يتم العثور على التعليق" });
    }

    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء تحديث التعليق" });
  }
});

// DELETE: Delete a feedback by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "لم يتم العثور على التعليق" });
    }

    res.json({ message: "تم حذف التعليق بنجاح" });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء حذف التعليق" });
  }
});

module.exports = router;
