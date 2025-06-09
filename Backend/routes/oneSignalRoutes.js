
// routes/oneSignalRoutes.js
require("dotenv").config("../.env");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// In-memory storage for player IDs (in production, use your database)
const playerIdStorage = new Map();

// OneSignal configuration
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
  console.warn("OneSignal credentials not configured. Please set ONESIGNAL_APP_ID and ONESIGNAL_API_KEY in your .env file");
}

// Helper function to send OneSignal API requests
const sendOneSignalRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`https://onesignal.com/api/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OneSignal API error: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error('OneSignal API request failed:', error);
    throw error;
  }
};

// POST /api/notifications/save-player-id - Save OneSignal player ID
router.post("/save-player-id", protect, async (req, res) => {
  const { playerId, platform } = req.body;
  const userId = req.user.id;

  try {
    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }

    // Store player ID mapping (in production, save to your database)
    playerIdStorage.set(userId, {
      playerId,
      platform: platform || 'web',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`Player ID saved for user ${userId}: ${playerId}`);
    
    res.status(200).json({
      message: "Player ID saved successfully",
      userId,
      playerId,
      platform,
    });
  } catch (error) {
    console.error("Error saving player ID:", error);
    res.status(500).json({
      error: "Failed to save player ID",
      details: error.message,
    });
  }
});

// GET /api/notifications/subscription-status - Get user's subscription status
router.get("/subscription-status", protect, async (req, res) => {
  const userId = req.user.id;

  try {
    const subscription = playerIdStorage.get(userId);
    
    res.status(200).json({
      isSubscribed: !!subscription,
      playerId: subscription?.playerId,
      platform: subscription?.platform,
      subscribedAt: subscription?.createdAt,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({
      error: "Failed to fetch subscription status",
      details: error.message,
    });
  }
});

// Admin routes
// GET /api/admin/notifications/stats - Get notification statistics
router.get("/admin/stats", protect, async (req, res) => {
  try {
    // Calculate stats from stored player IDs
    const allSubscriptions = Array.from(playerIdStorage.values());
    const webSubscribers = allSubscriptions.filter(sub => sub.platform === 'web').length;
    const mobileSubscribers = allSubscriptions.filter(sub => 
      sub.platform === 'android' || sub.platform === 'ios'
    ).length;

    // For demo purposes, using mock data for some stats
    const stats = {
      totalSubscribers: allSubscriptions.length,
      webSubscribers,
      mobileSubscribers,
      sentToday: 0, // This would come from your notification log
      successRate: 95, // This would be calculated from delivery reports
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({
      error: "Failed to fetch notification stats",
      details: error.message,
    });
  }
});

// GET /api/admin/notifications/history - Get notification history
router.get("/admin/history", protect, async (req, res) => {
  try {
    // In production, this would come from your database
    // For now, returning empty array as placeholder
    const history = [];

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching notification history:", error);
    res.status(500).json({
      error: "Failed to fetch notification history",
      details: error.message,
    });
  }
});

// POST /api/admin/notifications/send - Send notification to all users
router.post("/admin/send", protect, async (req, res) => {
  const { title, message, imageUrl, actionUrl, platform, targetSegment } = req.body;

  try {
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      return res.status(500).json({ error: "OneSignal not configured" });
    }

    // Prepare notification data
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      included_segments: ["All"], // Send to all subscribed users
    };

    // Add optional fields
    if (imageUrl) {
      notificationData.big_picture = imageUrl;
      notificationData.chrome_web_image = imageUrl;
    }

    if (actionUrl) {
      notificationData.url = actionUrl;
    }

    // Filter by platform if specified
    if (platform && platform !== 'all') {
      delete notificationData.included_segments;
      
      // Get player IDs for the specified platform
      const subscriptions = Array.from(playerIdStorage.values());
      let filteredSubscriptions = subscriptions;

      if (platform === 'web') {
        filteredSubscriptions = subscriptions.filter(sub => sub.platform === 'web');
      } else if (platform === 'mobile') {
        filteredSubscriptions = subscriptions.filter(sub => 
          sub.platform === 'android' || sub.platform === 'ios'
        );
      }

      if (filteredSubscriptions.length === 0) {
        return res.status(400).json({ error: "No subscribers found for the specified platform" });
      }

      notificationData.include_player_ids = filteredSubscriptions.map(sub => sub.playerId);
    }

    console.log('Sending OneSignal notification:', notificationData);

    // Send notification via OneSignal API
    const result = await sendOneSignalRequest('notifications', notificationData);

    console.log('OneSignal notification sent successfully:', result);

    res.status(200).json({
      message: "Notification sent successfully",
      notificationId: result.id,
      targetCount: result.recipients || 0,
      data: {
        title,
        message,
        platform,
        targetSegment,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      error: "Failed to send notification",
      details: error.message,
    });
  }
});

// POST /api/admin/notifications/test - Send test notification
router.post("/admin/test", protect, async (req, res) => {
  const { title, message, imageUrl, actionUrl } = req.body;
  const userId = req.user.id;

  try {
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      return res.status(500).json({ error: "OneSignal not configured" });
    }

    // Get admin's player ID
    const adminSubscription = playerIdStorage.get(userId);
    if (!adminSubscription) {
      return res.status(400).json({ error: "Admin not subscribed to notifications" });
    }

    // Prepare test notification data
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      include_player_ids: [adminSubscription.playerId],
    };

    // Add optional fields
    if (imageUrl) {
      notificationData.big_picture = imageUrl;
      notificationData.chrome_web_image = imageUrl;
    }

    if (actionUrl) {
      notificationData.url = actionUrl;
    }

    console.log('Sending OneSignal test notification:', notificationData);

    // Send test notification via OneSignal API
    const result = await sendOneSignalRequest('notifications', notificationData);

    console.log('OneSignal test notification sent successfully:', result);

    res.status(200).json({
      message: "Test notification sent successfully",
      notificationId: result.id,
      targetCount: 1,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      error: "Failed to send test notification",
      details: error.message,
    });
  }
});

module.exports = router;
