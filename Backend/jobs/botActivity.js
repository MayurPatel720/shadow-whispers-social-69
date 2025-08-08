
const cron = require('node-cron');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const { getRandomTemplate, getRandomComment } = require('../utils/seed/postTemplates');

class BotActivityService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Bot activity service is already running');
      return;
    }

    console.log('Starting bot activity service...');
    this.isRunning = true;

    // Run every hour to create new posts and interactions
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly bot activity...');
      await this.hourlyActivity();
    });

    // Run every 15 minutes to add interactions to recent posts
    cron.schedule('*/15 * * * *', async () => {
      console.log('Running bot interactions...');
      await this.addInteractions();
    });

    // Clean up expired posts daily at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Cleaning up expired posts...');
      await this.cleanupExpiredPosts();
    });

    console.log('Bot activity service started successfully');
  }

  async hourlyActivity() {
    try {
      // Get active bots
      const bots = await User.find({ 
        isBot: true,
        'botProfile.activityLevel': { $in: ['medium', 'high'] }
      });

      if (bots.length === 0) {
        console.log('No active bots found');
        return;
      }

      // Create 2-5 new posts per hour across all feeds
      const numPosts = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < numPosts; i++) {
        const bot = bots[Math.floor(Math.random() * bots.length)];
        await this.createBotPost(bot);
      }

      console.log(`Created ${numPosts} bot posts`);
    } catch (error) {
      console.error('Error in hourly bot activity:', error);
    }
  }

  async createBotPost(bot) {
    try {
      const feedType = bot.botProfile.feedFocus || 'global';
      const content = getRandomTemplate(feedType);
      
      if (!content) return;

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const postData = {
        user: bot._id,
        content,
        anonymousAlias: bot.anonymousAlias,
        avatarEmoji: bot.avatarEmoji,
        isSeedPost: true,
        expiresAt,
        likes: [],
        comments: []
      };

      // Add feed-specific fields
      if (feedType === 'college' && bot.college) {
        postData.college = bot.college;
      } else if (feedType === 'area' && bot.area) {
        postData.area = bot.area;
      }

      const post = new Post(postData);
      await post.save();

      // Update bot's posts array and last activity
      await User.findByIdAndUpdate(bot._id, {
        $push: { posts: post._id },
        'botProfile.lastActivity': now
      });

      console.log(`Bot ${bot.anonymousAlias} created post: ${content.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error creating bot post:', error);
    }
  }

  async addInteractions() {
    try {
      // Get recent posts (last 4 hours) that don't have many interactions
      const recentPosts = await Post.find({
        createdAt: { $gte: new Date(Date.now() - 4 * 60 * 60 * 1000) },
        $expr: { 
          $lt: [
            { $add: [{ $size: "$likes" }, { $size: "$comments" }] }, 
            10  // Posts with fewer than 10 total interactions
          ] 
        }
      }).limit(20);

      if (recentPosts.length === 0) {
        console.log('No posts need interactions');
        return;
      }

      // Get active bots
      const bots = await User.find({ 
        isBot: true,
        'botProfile.activityLevel': { $in: ['medium', 'high'] }
      });

      if (bots.length === 0) return;

      let addedLikes = 0;
      let addedComments = 0;

      for (const post of recentPosts) {
        // Randomly decide to add interactions (60% chance)
        if (Math.random() < 0.6) {
          const shuffledBots = [...bots].sort(() => 0.5 - Math.random());
          
          // Add 1-3 likes
          const numLikes = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numLikes && i < shuffledBots.length; i++) {
            const bot = shuffledBots[i];
            
            // Check if bot already liked this post
            const alreadyLiked = post.likes.some(
              like => like.user.toString() === bot._id.toString()
            );
            
            if (!alreadyLiked) {
              post.likes.push({
                user: bot._id,
                anonymousAlias: bot.anonymousAlias,
                createdAt: new Date()
              });
              addedLikes++;
            }
          }

          // Maybe add a comment (30% chance)
          if (Math.random() < 0.3 && shuffledBots.length > numLikes) {
            const commentBot = shuffledBots[numLikes];
            const commentContent = getRandomComment();
            
            post.comments.push({
              user: commentBot._id,
              content: commentContent,
              anonymousAlias: commentBot.anonymousAlias,
              avatarEmoji: commentBot.avatarEmoji,
              createdAt: new Date(),
              replies: []
            });
            addedComments++;
          }

          await post.save();
        }
      }

      console.log(`Added ${addedLikes} likes and ${addedComments} comments to recent posts`);
    } catch (error) {
      console.error('Error adding bot interactions:', error);
    }
  }

  async cleanupExpiredPosts() {
    try {
      const now = new Date();
      const result = await Post.deleteMany({
        expiresAt: { $lt: now },
        isSeedPost: true
      });

      console.log(`Cleaned up ${result.deletedCount} expired seed posts`);
    } catch (error) {
      console.error('Error cleaning up expired posts:', error);
    }
  }

  stop() {
    this.isRunning = false;
    console.log('Bot activity service stopped');
  }
}

const botActivityService = new BotActivityService();

module.exports = botActivityService;
