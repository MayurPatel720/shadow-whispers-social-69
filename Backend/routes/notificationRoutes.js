
// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

// POST /api/notifications - Send a test notification
router.post("/", protect, async (req, res) => {
	const { title, message, userId } = req.body;

	try {
		// Validate userId
		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		// Enhanced notification data for mobile support
		const notificationData = {
			title: title || "New Notification",
			message: message || "This is a test notification",
			userId,
			createdAt: new Date(),
			// Add mobile-specific metadata
			metadata: {
				platform: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
				timestamp: Date.now(),
				source: 'api'
			}
		};

		// Create notification
		const notification = await Notification.create(notificationData);

		// Enhanced Socket.IO event for mobile compatibility
		if (global.io) {
			const socketData = {
				title: notificationData.title,
				body: notificationData.message,
				// Add mobile-specific options
				badge: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
				icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
				tag: `notification-${notification._id}`,
				timestamp: Date.now(),
			};

			// Emit to user's room
			global.io.to(userId).emit("notification", socketData);
			
			// Also emit to any connected sockets for this user (for multiple device support)
			global.io.emit("user-notification", {
				userId,
				...socketData
			});

			console.log(`Notification sent to user ${userId}:`, socketData);
		} else {
			console.error("Socket.IO not initialized");
		}

		res.status(200).json({ 
			message: "Notification sent successfully", 
			data: {
				id: notification._id,
				title: notification.title,
				message: notification.message,
				timestamp: notification.createdAt,
				platform: notificationData.metadata.platform
			}
		});
	} catch (error) {
		console.error("Error sending notification:", error);
		res.status(500).json({ 
			error: "Failed to send notification",
			details: error.message 
		});
	}
});

// GET /api/notifications - Get user's notifications (for mobile notification history)
router.get("/", protect, async (req, res) => {
	try {
		const { page = 1, limit = 20 } = req.query;
		
		const notifications = await Notification.find({ userId: req.user.id })
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Notification.countDocuments({ userId: req.user.id });

		res.status(200).json({
			notifications,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({ 
			error: "Failed to fetch notifications",
			details: error.message 
		});
	}
});

// POST /api/notifications/mark-read - Mark notifications as read (for mobile)
router.post("/mark-read", protect, async (req, res) => {
	try {
		const { notificationIds } = req.body;
		
		if (!notificationIds || !Array.isArray(notificationIds)) {
			return res.status(400).json({ error: "Notification IDs array is required" });
		}

		await Notification.updateMany(
			{ 
				_id: { $in: notificationIds }, 
				userId: req.user.id 
			},
			{ 
				$set: { 
					read: true, 
					readAt: new Date() 
				} 
			}
		);

		res.status(200).json({ message: "Notifications marked as read" });
	} catch (error) {
		console.error("Error marking notifications as read:", error);
		res.status(500).json({ 
			error: "Failed to mark notifications as read",
			details: error.message 
		});
	}
});

module.exports = router;
