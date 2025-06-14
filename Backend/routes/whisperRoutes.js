// routes/whisperRoutes.js
const express = require("express");
const router = express.Router();
const {
	sendWhisper,
	getMyWhispers,
	getWhisperConversation,
	markWhisperAsRead,
	deleteConversation,
	editWhisperMessage,
	deleteWhisperMessage,
} = require("../controllers/whisperController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes
router
	.route("/")
	.post(protect, sendWhisper) // Send a new whisper (REST)
	.get(protect, getMyWhispers); // Get all user conversations

router.get("/:userId", protect, getWhisperConversation); // Get conversation with a specific user

router.put("/:whisperId/read", protect, markWhisperAsRead); // Mark a whisper as read

router.delete("/conversation/:userId", protect, deleteConversation); // Delete conversation with a user

// New routes for editing and deleting a single whisper message:
router.put("/message/:messageId", protect, editWhisperMessage); // Edit a single message
router.delete("/message/:messageId", protect, deleteWhisperMessage); // Delete a single message

module.exports = router;
