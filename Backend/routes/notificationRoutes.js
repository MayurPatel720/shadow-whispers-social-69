// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware"); // Assuming you want auth

// POST /api/notifications - Send a test notification
router.post("/", protect, async (req, res) => {
	const { title, message, userId } = req.body;

	try {
		// Validate userId
		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		// Create notification
		const notification = await Notification.create({
			title: title || "New Notification",
			message: message || "This is a test notification",
			userId,
		});

		// Emit Socket.IO event
		if (global.io) {
			global.io.to(userId).emit("notification", {
				title: title || "New Notification",
				body: message || "This is a test notification",
			});
		} else {
			console.error("Socket.IO not initialized");
		}

		res.status(200).json({ message: "Notification sent", data: notification });
	} catch (error) {
		console.error("Error sending notification:", error);
		res.status(500).json({ error: "Failed to send notification" });
	}
});

module.exports = router;
