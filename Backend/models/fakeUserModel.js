const mongoose = require('mongoose');

const fakeUserSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  anonymousAlias: {
    type: String,
    required: true
  },
  avatarEmoji: {
    type: String,
    required: true,
    default: '🎭'
  },
  bio: {
    type: String,
    default: 'Living authentically behind the mask 🎭'
  },
  isFakeUser: {
    type: Boolean,
    default: true
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  // Prevent interaction attempts
  isInteractable: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FakeUser', fakeUserSchema);