// routes/notificationRoutes.js
require("dotenv").config("../.env");
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");
const webpush = require("web-push");

// Store subscriptions in memory (in production, use a database)
const pushSubscriptions = new Map();

const vapidKeys = {
	publicKey:
		"BIW1fqapVHYJS_j_vQWr32lMj0mlE-KBdRrgCMCODxRgYdH-kncIF3cPT5NPuvwlqfHEFLZ6Smmc38y2T2aAqGo",
	privateKey: process.env.PRIVATE_VAPID,
};

// Set VAPID details
webpush.setVapidDetails(
	"mailto:admin@underkover.in",
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

console.log("VAPID configured with public key:", vapidKeys.publicKey);

// POST /api/notifications/subscribe - Subscribe to push notifications
router.post("/subscribe", protect, async (req, res) => {
	const { userId, subscription } = req.body;

	try {
		if (!userId || !subscription) {
			return res
				.status(400)
				.json({ error: "User ID and subscription are required" });
		}

		console.log("Storing subscription for user:", userId);
		console.log("Subscription data:", subscription);

		// Store subscription
		pushSubscriptions.set(userId, subscription);

		console.log("Total subscriptions stored:", pushSubscriptions.size);

		res.status(200).json({
			message: "Subscription saved successfully",
			userId,
		});
	} catch (error) {
		console.error("Error saving subscription:", error);
		res.status(500).json({
			error: "Failed to save subscription",
			details: error.message,
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

		console.log("Sending push notification to user:", userId);
		console.log("Available subscriptions:", Array.from(pushSubscriptions.keys()));

		// Create notification record
		const notificationData = {
			title: title || "New Notification",
			message: message || "This is a test notification",
			userId,
			createdAt: new Date(),
		};

		const notification = await Notification.create(notificationData);
		console.log("Notification record created:", notification._id);

		// Get subscription for user
		const subscription = pushSubscriptions.get(userId);
		console.log("Found subscription for user:", !!subscription);

		let pushSent = false;
		if (subscription) {
			try {
				const payload = JSON.stringify({
					title: notificationData.title,
					body: notificationData.message,
					message: notificationData.message,
					icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
					badge: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
					tag: `notification-${notification._id}`,
					data: {
						notificationId: notification._id,
						userId: userId,
						timestamp: Date.now(),
					},
				});

				console.log("Sending push with payload:", payload);
				console.log("To subscription:", subscription);

				const result = await webpush.sendNotification(subscription, payload);
				console.log("Push notification sent successfully:", result);
				pushSent = true;
			} catch (pushError) {
				console.error("Push notification failed:", pushError);
				console.error("Error details:", pushError.body);
				
				// If push fails, remove invalid subscription
				if (pushError.statusCode === 410 || pushError.statusCode === 413) {
					pushSubscriptions.delete(userId);
					console.log(`Removed invalid subscription for user ${userId}`);
				}
			}
		} else {
			console.log("No subscription found for user:", userId);
		}

		// Fallback to Socket.IO for in-app notifications
		if (global.io) {
			const socketData = {
				title: notificationData.title,
				body: notificationData.message,
				icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
				tag: `notification-${notification._id}`,
				timestamp: Date.now(),
			};

			global.io.to(userId).emit("notification", socketData);
			console.log(`Socket notification sent to user ${userId}`);
		}

		res.status(200).json({
			message: pushSent
				? "Push notification sent successfully"
				: "Notification created (push failed or no subscription)",
			data: {
				id: notification._id,
				title: notification.title,
				message: notification.message,
				timestamp: notification.createdAt,
				pushSent: pushSent,
				subscriptionExists: !!subscription,
			},
		});
	} catch (error) {
		console.error("Error sending push notification:", error);
		res.status(500).json({
			error: "Failed to send notification",
			details: error.message,
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
			total,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({
			error: "Failed to fetch notifications",
			details: error.message,
		});
	}
});

// POST /api/notifications/mark-read - Mark notifications as read (for mobile)
router.post("/mark-read", protect, async (req, res) => {
	try {
		const { notificationIds } = req.body;

		if (!notificationIds || !Array.isArray(notificationIds)) {
			return res
				.status(400)
				.json({ error: "Notification IDs array is required" });
		}

		await Notification.updateMany(
			{
				_id: { $in: notificationIds },
				userId: req.user.id,
			},
			{
				$set: {
					read: true,
					readAt: new Date(),
				},
			}
		);

		res.status(200).json({ message: "Notifications marked as read" });
	} catch (error) {
		console.error("Error marking notifications as read:", error);
		res.status(500).json({
			error: "Failed to mark notifications as read",
			details: error.message,
		});
	}
});

module.exports = router;
