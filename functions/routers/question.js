const express = require("express");
const router = express.Router();
const Question = require("../models/question");

// Create a new question
router.post("/", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newQuestion = new Question({ question, answer });
    const saved = await newQuestion.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err.message);
  }
});

// Update a question by ID
router.put("/:id", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a question by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
