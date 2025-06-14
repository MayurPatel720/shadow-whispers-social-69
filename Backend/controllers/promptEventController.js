
// controllers/promptEventController.js
const asyncHandler = require("express-async-handler");
const PromptEvent = require("../models/promptEventModel");

const getCurrentWeekNumber = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};

// GET /api/prompts/current - Get current week's prompt
const getCurrentPrompt = asyncHandler(async (_req, res) => {
  const week = getCurrentWeekNumber();
  let prompt = await PromptEvent.findOne({ weekNumber: week });

  if (!prompt) {
    // Default prompt if none exists
    prompt = await PromptEvent.create({
      promptText: "Share your most mysterious moment.",
      weekNumber: week,
      active: true,
    });
  }
  res.json(prompt);
});

// POST /api/prompts - Admin creates/sets this week's prompt
const setWeeklyPrompt = asyncHandler(async (req, res) => {
  const { promptText } = req.body;
  const week = getCurrentWeekNumber();

  // Deactivate previous
  await PromptEvent.updateMany({ active: true }, { active: false });
  const prompt = await PromptEvent.create({
    promptText,
    weekNumber: week,
    active: true,
    createdBy: req.user?._id,
  });

  res.status(201).json(prompt);
});

module.exports = {
  getCurrentPrompt,
  setWeeklyPrompt,
};

