
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 50
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  postCount: {
    type: Number,
    default: 0
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for trending queries
tagSchema.index({ trendingScore: -1 });
tagSchema.index({ postCount: -1 });
tagSchema.index({ name: 1 });

// Predefined tags
const PREDEFINED_TAGS = [
  { name: 'confession', displayName: 'Confession' },
  { name: 'crush', displayName: 'Crush' },
  { name: 'secret', displayName: 'Secret' },
  { name: 'controversy', displayName: 'Controversy' },
  { name: 'rumor', displayName: 'Rumor' },
  { name: 'advice', displayName: 'Advice' },
  { name: 'vent', displayName: 'Vent' },
  { name: 'mentalhealth', displayName: 'MentalHealth' },
  { name: 'relationship', displayName: 'Relationship' },
  { name: 'campuslife', displayName: 'CampusLife' }
];

// Initialize predefined tags
tagSchema.statics.initializePredefinedTags = async function() {
  try {
    for (const tag of PREDEFINED_TAGS) {
      await this.findOneAndUpdate(
        { name: tag.name },
        { 
          name: tag.name, 
          displayName: tag.displayName,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }
    console.log('Predefined tags initialized');
  } catch (error) {
    console.error('Error initializing predefined tags:', error);
  }
};

module.exports = mongoose.model('Tag', tagSchema);
