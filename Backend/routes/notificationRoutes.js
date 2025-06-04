
// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

// Mock subscription storage (in production, use a database)
const pushSubscriptions = new Map();

// POST /api/notifications/subscribe - Subscribe to push notifications
router.post("/subscribe", protect, async (req, res) => {
	const { userId, subscription } = req.body;

	try {
		if (!userId || !subscription) {
			return res.status(400).json({ error: "User ID and subscription are required" });
		}

		// Store subscription (in production, save to database)
		pushSubscriptions.set(userId, subscription);
		
		console.log(`Push subscription saved for user ${userId}`);

		res.status(200).json({ 
			message: "Subscription saved successfully",
			userId 
		});
	} catch (error) {
		console.error("Error saving subscription:", error);
		res.status(500).json({ 
			error: "Failed to save subscription",
			details: error.message 
		});
	}
});

// POST /api/notifications/send-push - Send push notification
router.post("/send-push", protect, async (req, res) => {
	const { userId, title, message } = req.body;

	try {
		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		// Create notification record
		const notificationData = {
			title: title || "New Notification",
			message: message || "This is a test notification",
			userId,
			createdAt: new Date(),
			metadata: {
				platform: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
				timestamp: Date.now(),
				source: 'push'
			}
		};

		const notification = await Notification.create(notificationData);

		// Get subscription for user
		const subscription = pushSubscriptions.get(userId);
		
		if (subscription) {
			// In a real implementation, you would use the web-push library here
			// const webpush = require('web-push');
			// await webpush.sendNotification(subscription, JSON.stringify({
			//   title: notificationData.title,
			//   body: notificationData.message,
			//   icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
			//   tag: `notification-${notification._id}`
			// }));
			
			console.log(`Push notification would be sent to user ${userId}`);
		}

		// Fallback to Socket.IO
		if (global.io) {
			const socketData = {
				title: notificationData.title,
				body: notificationData.message,
				icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
				tag: `notification-${notification._id}`,
				timestamp: Date.now(),
			};

			global.io.to(userId).emit("notification", socketData);
			console.log(`Socket notification sent to user ${userId}:`, socketData);
		}

		res.status(200).json({ 
			message: "Notification sent successfully", 
			data: {
				id: notification._id,
				title: notification.title,
				message: notification.message,
				timestamp: notification.createdAt,
				platform: notificationData.metadata.platform,
				pushSent: !!subscription
			}
		});
	} catch (error) {
		console.error("Error sending push notification:", error);
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
