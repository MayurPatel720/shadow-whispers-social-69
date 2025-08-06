const Notification = require('../models/notificationModel');

/**
 * Get user notifications with pagination
 */
const getUserNotifications = async (req, res) => {
  try {
    // Fix user ID extraction - try both _id and id
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      console.error('❌ No user ID found in request. req.user:', req.user);
      return res.status(401).json({ message: 'User authentication required' });
    }

    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    console.log(`📡 Fetching notifications for user ${userId}`);
    console.log(`📡 Query params:`, { limit, skip, unreadOnly });
    console.log(`📡 Full req.user object:`, req.user);

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    console.log(`📡 Database query:`, query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean(); // Use lean for better performance

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    console.log(`📨 Found ${notifications.length} notifications for user ${userId}`);
    console.log(`📨 Unread count: ${unreadCount}`);
    console.log(`📨 Sample notification IDs:`, notifications.slice(0, 3).map(n => n._id));

    // Additional debugging - check total notifications for user
    const totalCount = await Notification.countDocuments({ userId });
    console.log(`📊 Total notifications in database for user ${userId}: ${totalCount}`);

    // If we have unread count but no notifications returned, something is wrong with the query
    if (unreadCount > 0 && notifications.length === 0) {
      console.warn(`⚠️ QUERY ISSUE: unreadCount is ${unreadCount} but notifications array is empty`);
      console.warn(`⚠️ This suggests a database query or indexing problem`);
      
      // Try a direct query to debug
      const debugNotifications = await Notification.find({ userId }).limit(5);
      console.log(`🔍 Debug query found ${debugNotifications.length} notifications:`, 
        debugNotifications.map(n => ({ id: n._id, read: n.read, createdAt: n.createdAt })));
    }

    res.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === parseInt(limit)
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    console.error('❌ Full error stack:', error.stack);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log(`✅ Notification ${notificationId} marked as read for user ${userId}`);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log(`✅ Notification ${notificationId} deleted for user ${userId}`);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      console.error('❌ No user ID found in unread count request. req.user:', req.user);
      return res.status(401).json({ message: 'User authentication required' });
    }
    
    console.log(`🔢 Getting unread count for user ${userId}`);
    
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    console.log(`🔢 Unread count result: ${unreadCount}`);

    // Additional debugging
    const totalCount = await Notification.countDocuments({ userId });
    console.log(`🔢 Total notifications for user: ${totalCount}`);

    res.json({ unreadCount });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};

/**
 * Delete all notifications for user
 */
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const result = await Notification.deleteMany({ userId });

    console.log(`✅ Deleted ${result.deletedCount} notifications for user ${userId}`);
    res.json({ 
      message: 'All notifications deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ message: 'Failed to delete all notifications' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  deleteAllNotifications
};
