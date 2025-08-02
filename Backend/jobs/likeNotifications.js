const cron = require('node-cron');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const { sendLikesSummaryNotification } = require('../utils/notificationService');

/**
 * Batch job that runs every 2 hours to send like summary notifications
 */
function initializeLikeNotificationJob(io) {
  // Run every 2 hours: 0 */2 * * *
  cron.schedule('0 */2 * * *', async () => {
    console.log('🔄 Running likes summary notification job...');
    
    try {
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

      // Send notifications to users with recent likes
      for (const userLikes of recentLikes) {
        try {
          // Check if user was already notified recently
          const user = await User.findById(userLikes.userId);
          if (!user) continue;

          const lastNotification = user.lastLikeNotification || new Date(0);
          if (lastNotification > twoHoursAgo) {
            console.log(`⏭️ Skipping user ${userLikes.userId} - already notified recently`);
            continue;
          }

          // Send likes summary notification
          await sendLikesSummaryNotification({
            userId: userLikes.userId,
            likeCount: userLikes.likeCount,
            postCount: userLikes.postCount,
            io
          });

          // Update user's last notification timestamp
          await User.findByIdAndUpdate(userLikes.userId, {
            lastLikeNotification: new Date()
          });

          console.log(`✅ Sent likes summary to user ${userLikes.userId}: ${userLikes.likeCount} likes on ${userLikes.postCount} posts`);
        } catch (userError) {
          console.error(`❌ Error sending likes summary to user ${userLikes.userId}:`, userError);
        }
      }

      console.log('✅ Likes summary notification job completed');
    } catch (error) {
      console.error('❌ Error in likes summary notification job:', error);
    }
  });

  console.log('⏰ Likes summary notification job scheduled (every 2 hours)');
}

module.exports = { initializeLikeNotificationJob };