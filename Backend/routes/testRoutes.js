const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require('../models/userModel');
const Post = require('../models/postModel');
const { sendLikesSummaryNotification, sendWhisperNotification } = require('../utils/notificationService');

// Test OneSignal notification
router.post("/test-onesignal", protect, async (req, res) => {
  try {
    console.log("🧪 Testing OneSignal notification...");
    
    // Send a test notification to the current user
    await sendWhisperNotification({
      senderId: req.user._id,
      receiverId: req.user._id,
      content: "This is a test OneSignal notification!",
      senderAlias: "Test System",
      io: global.io
    });
    
    res.json({ message: "Test notification sent successfully" });
  } catch (error) {
    console.error("❌ Test notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to manually trigger like notification job
router.post("/trigger-like-notifications", protect, async (req, res) => {
  try {
    console.log('🧪 Manual trigger: Running likes summary notification job...');
    
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    // Find all users who had posts liked in the last 2 hours
    const recentLikes = await Post.aggregate([
      {
        $match: {
          'likes.createdAt': { $gte: twoHoursAgo }
        }
      },
      {
        $unwind: '$likes'
      },
      {
        $match: {
          'likes.createdAt': { $gte: twoHoursAgo }
        }
      },
      {
        $group: {
          _id: '$user',
          likeCount: { $sum: 1 },
          postCount: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          userId: '$_id',
          likeCount: 1,
          postCount: { $size: '$postCount' }
        }
      }
    ]);

    console.log(`📊 Found ${recentLikes.length} users with recent likes`);
    
    const results = [];

    // Send notifications to users with recent likes
    for (const userLikes of recentLikes) {
      try {
        // Check if user was already notified recently
        const user = await User.findById(userLikes.userId);
        if (!user) {
          console.log(`⚠️ User ${userLikes.userId} not found, skipping`);
          continue;
        }

        const lastNotification = user.lastLikeNotification || new Date(0);
        if (lastNotification > twoHoursAgo) {
          console.log(`⏭️ Skipping user ${userLikes.userId} - already notified recently`);
          results.push({
            userId: userLikes.userId,
            username: user.username,
            status: 'skipped',
            reason: 'recently_notified'
          });
          continue;
        }

        // Send likes summary notification
        await sendLikesSummaryNotification({
          userId: userLikes.userId,
          likeCount: userLikes.likeCount,
          postCount: userLikes.postCount,
          io: req.app.get('socketio')
        });

        // Update user's last notification timestamp
        await User.findByIdAndUpdate(userLikes.userId, {
          lastLikeNotification: new Date()
        });

        console.log(`✅ Sent likes summary to user ${userLikes.userId}: ${userLikes.likeCount} likes on ${userLikes.postCount} posts`);
        results.push({
          userId: userLikes.userId,
          username: user.username,
          likeCount: userLikes.likeCount,
          postCount: userLikes.postCount,
          status: 'sent'
        });
      } catch (userError) {
        console.error(`❌ Error sending likes summary to user ${userLikes.userId}:`, userError);
        results.push({
          userId: userLikes.userId,
          status: 'error',
          error: userError.message
        });
      }
    }

    console.log('✅ Manual likes summary notification job completed');
    
    res.json({
      success: true,
      message: "Like notifications job triggered successfully",
      usersProcessed: recentLikes.length,
      results
    });
  } catch (error) {
    console.error('❌ Error in manual likes summary notification job:', error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger like notifications",
      error: error.message
    });
  }
});

module.exports = router;