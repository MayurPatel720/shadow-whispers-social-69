const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const OneSignal = require('onesignal-node');

// Initialize OneSignal client
const client = new OneSignal.Client(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);

const notificationTypes = {
  WHISPER_MESSAGE: 'whisper',
  POST_COMMENT: 'comment',
  COMMENT_REPLY: 'comment',
  LIKES_SUMMARY: 'like',
  GENERAL: 'general'
};

/**
 * Send comprehensive notification (database + push + socket)
 */
async function sendNotification({
  userId,
  type,
  title,
  message,
  data = {},
  sendPush = true,
  sendSocket = true,
  io = null
}) {
  try {
    // 1. Save notification to database
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      read: false
    });
    
    await notification.save();

    // 2. Send push notification via OneSignal
    if (sendPush && process.env.ONESIGNAL_APP_ID) {
      try {
        const user = await User.findById(userId);
        if (user && user.oneSignalPlayerId) {
          console.log(`🔔 Sending push notification to user ${userId} with player ID: ${user.oneSignalPlayerId}`);
          
          // Validate OneSignal configuration
          if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
            console.error('❌ OneSignal configuration missing: APP_ID or REST_API_KEY not found');
            return;
          }
          
          const pushNotification = {
            contents: { en: message },
            headings: { en: title },
            include_player_ids: [user.oneSignalPlayerId],
            data: {
              type,
              notificationId: notification._id,
              ...data
            }
          };
          
          const result = await client.createNotification(pushNotification);
          console.log(`✅ Push notification sent successfully to user ${userId}:`, result.id);
        } else {
          console.log(`⚠️ User ${userId} has no OneSignal player ID, skipping push notification`);
        }
      } catch (pushError) {
        console.error('❌ Push notification error:', pushError.message || pushError);
        // Log detailed error for debugging
        if (pushError.response) {
          console.error('❌ OneSignal API response:', pushError.response.data);
        }
        // Log specific OneSignal errors
        if (pushError.statusCode === 400) {
          console.error('❌ OneSignal 400 error - Invalid player ID or request format');
        } else if (pushError.statusCode === 429) {
          console.error('❌ OneSignal 429 error - Rate limit exceeded');
        }
      }
    }

    // 3. Send real-time socket notification
    if (sendSocket && io) {
      io.to(`user_${userId}`).emit('newNotification', {
        id: notification._id,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: notification.createdAt
      });
      console.log(`✅ Socket notification sent to user ${userId}`);
    }

    return notification;
  } catch (error) {
    console.error('❌ Notification service error:', error);
    throw error;
  }
}

/**
 * Send whisper message notification
 */
async function sendWhisperNotification({ senderId, receiverId, content, senderAlias, io }) {
  const title = `New message from ${senderAlias}`;
  const message = content.length > 50 ? `${content.substring(0, 47)}...` : content;
  
  return await sendNotification({
    userId: receiverId,
    type: notificationTypes.WHISPER_MESSAGE,
    title,
    message,
    data: {
      senderId,
      senderAlias,
      conversationId: `${senderId}_${receiverId}`
    },
    io
  });
}

/**
 * Send comment notification to post author
 */
async function sendCommentNotification({ postId, postAuthorId, commenterId, commenterAlias, content, io }) {
  // Don't notify if user comments on their own post
  if (postAuthorId.toString() === commenterId.toString()) return;

  const title = `${commenterAlias} commented on your post`;
  const message = content.length > 50 ? `${content.substring(0, 47)}...` : content;
  
  return await sendNotification({
    userId: postAuthorId,
    type: notificationTypes.POST_COMMENT,
    title,
    message,
    data: {
      postId,
      commenterId,
      commenterAlias
    },
    io
  });
}

/**
 * Send reply notification to comment author
 */
async function sendReplyNotification({ postId, commentAuthorId, replierId, replierAlias, content, io }) {
  // Don't notify if user replies to their own comment
  if (commentAuthorId.toString() === replierId.toString()) return;

  const title = `${replierAlias} replied to your comment`;
  const message = content.length > 50 ? `${content.substring(0, 47)}...` : content;
  
  return await sendNotification({
    userId: commentAuthorId,
    type: notificationTypes.COMMENT_REPLY,
    title,
    message,
    data: {
      postId,
      replierId,
      replierAlias
    },
    io
  });
}

/**
 * Send likes summary notification
 */
async function sendLikesSummaryNotification({ userId, likeCount, postCount, io }) {
  let title, message;
  
  if (postCount === 1) {
    title = 'Your post got new likes!';
    message = `Your post received ${likeCount} new ${likeCount === 1 ? 'like' : 'likes'}`;
  } else {
    title = 'Your posts got new likes!';
    message = `Your ${postCount} posts received ${likeCount} new ${likeCount === 1 ? 'like' : 'likes'}`;
  }
  
  return await sendNotification({
    userId,
    type: notificationTypes.LIKES_SUMMARY,
    title,
    message,
    data: {
      likeCount,
      postCount
    },
    io
  });
}

module.exports = {
  sendNotification,
  sendWhisperNotification,
  sendCommentNotification,
  sendReplyNotification,
  sendLikesSummaryNotification,
  notificationTypes
};