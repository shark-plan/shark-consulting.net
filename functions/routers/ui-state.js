// routes/uiStateRoutes.js
const express = require("express");
const router = express.Router();
const UiState = require("../models/ui-state");

// GET UI state
router.get("/", async (req, res) => {
  try {
    let state = await UiState.findOne();
    if (!state) {
      state = await UiState.create({ showFeedback: true });
    }
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: "Failed to get UI state" });
  }
});

// PUT (Update) showFeedback
router.put("/", async (req, res) => {
  try {
    const { showFeedback } = req.body;
    let state = await UiState.findOne();

    if (!state) {
      state = new UiState({ showFeedback });
    } else {
      state.showFeedback = showFeedback;
    }

    await state.save();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: "Failed to update UI state" });
  }
});

module.exports = router;
