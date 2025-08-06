
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Add index for better query performance
    },
    type: {
      type: String,
      enum: ['whisper', 'post', 'comment', 'like', 'friend_request', 'general'],
      default: 'general',
      index: true // Add index for filtering by type
    },
    read: {
      type: Boolean,
      default: false,
      index: true // Add index for read status queries
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1 });

// Add a method to log notification creation
notificationSchema.post('save', function(doc) {
  console.log(`📝 Notification saved successfully: ${doc._id} for user ${doc.userId}`);
});

module.exports = mongoose.model('Notification', notificationSchema);
