
const mongoose = require('mongoose');

// Define a comment schema to be reused in both comments and replies
const commentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  anonymousAlias: {
    type: String,
    required: true,
  },
  avatarEmoji: {
    type: String,
    default: '🎭',
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      type: mongoose.Schema.Types.Mixed, // Will recursively use the same schema
      default: [],
    }
  ]
});

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    images: [{
      type: String,
      default: [],
    }],
    videos: [{
      url: {
        type: String,
        required: true
      },
      thumbnail: {
        type: String,
        default: ''
      },
      duration: {
        type: Number,
        default: 0
      },
      size: {
        type: Number,
        default: 0
      }
    }],
    anonymousAlias: {
      type: String,
      required: true,
    },
    avatarEmoji: {
      type: String,
      required: true,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        anonymousAlias: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [commentSchema],
    ghostCircle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GhostCircle',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    // Add college and area fields
    college: {
      type: String,
    },
    area: {
      type: String,
    },
    // Add seed post fields
    isSeedPost: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ['confession', 'secret', 'loneliness', 'love', 'relationship', 'work', 'career', 'family', 'existential', 'philosophy', 'funny', 'quirky', 'regret', 'struggle'],
    },
    // Add tags field
    tags: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    // Track hashtags separately for auto-detection
    hashtags: [{
      type: String,
      lowercase: true,
      trim: true
    }]
  },
  {
    timestamps: true,
  }
);

// Index for tag queries
postSchema.index({ tags: 1 });
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema);
