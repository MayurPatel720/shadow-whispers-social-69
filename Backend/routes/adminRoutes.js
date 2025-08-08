const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');
const User = require('../models/userModel');
const { botPersonas, getRandomBotPersona } = require('../utils/seed/botPersonas');
const { getRandomTemplate, getRandomComment } = require('../utils/seed/postTemplates');
const { generateAnonymousAlias, generateAvatar } = require('../utils/generators');
const colleges = require('../data/colleges');
const cities = require('../data/cities');

// Admin middleware to check credentials
const adminAuth = (req, res, next) => {
  const { authorization } = req.headers;
  
  console.log('Admin auth check, authorization:', authorization);
  
  // Check for admin token in different formats
  if (authorization && (
    authorization.includes('admin') || 
    authorization.includes('Bearer admin-true') ||
    authorization === 'Bearer admin-true' ||
    authorization.includes('admin-true')
  )) {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied, authorization:', authorization);
    res.status(401).json({ message: 'Admin access required' });
  }
};

// GET /api/admin/posts - Get all posts with user details
router.get('/posts', adminAuth, async (req, res) => {
  try {
    console.log('Fetching admin posts...');
    const posts = await Post.find()
      .populate('user', 'username email fullName anonymousAlias')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    console.log('Fetching admin users...');
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/posts/:id - Delete any post
router.delete('/posts/:id', adminAuth, async (req, res) => {
  try {
    console.log('Deleting post:', req.params.id);
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log('Post deleted successfully');
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/posts/:id - Edit any post
router.put('/posts/:id', adminAuth, async (req, res) => {
  try {
    console.log('Updating post:', req.params.id);
    const { content, images, videos } = req.body;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { content, images: images || [], videos: videos || [] },
      { new: true }
    ).populate('user', 'username email fullName anonymousAlias');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log('Post updated successfully');
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    console.log('Fetching user details:', req.params.id);
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('posts');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/users/:id/ban - Ban/unban a user with proper persistence
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    console.log('Toggling user ban status:', req.params.id);
    const { banned } = req.body;
    
    // Ensure the banned field is properly set and saved
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.banned = banned;
    if (banned) {
      user.bannedAt = new Date();
    } else {
      user.bannedAt = null;
    }
    
    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(req.params.id).select('-password');
    
    console.log(`User ${banned ? 'banned' : 'unbanned'} successfully, new status:`, updatedUser.banned);
    res.json({ 
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/stats - Get admin statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const bannedUsers = await User.countDocuments({ banned: true });
    const activeUsers = totalUsers - bannedUsers;
    
    // Posts created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const postsToday = await Post.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    const stats = {
      totalUsers,
      totalPosts,
      activeUsers,
      bannedUsers,
      postsToday
    };
    
    console.log('Admin stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Soft delete a user (ban them permanently)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    console.log('Soft deleting user:', req.params.id);
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.banned = true;
    user.bannedAt = new Date();
    user.deletedAt = new Date();
    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    
    console.log('User soft-deleted (banned) successfully');
    res.json({ message: 'User deleted successfully', user: updatedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE BOT USERS
router.post('/seed/bots', adminAuth, async (req, res) => {
  try {
    const { count = 10, feedType } = req.body;
    console.log(`Creating ${count} bot users for feed type: ${feedType || 'mixed'}`);
    
    const createdBots = [];
    
    for (let i = 0; i < count; i++) {
      const persona = getRandomBotPersona(feedType);
      
      // Generate unique bot username
      const botUsername = `bot_${persona.name.replace(/\s+/g, '').toLowerCase()}_${Date.now()}_${i}`;
      
      let college, area;
      if (feedType === 'college') {
        college = colleges[Math.floor(Math.random() * colleges.length)];
      } else if (feedType === 'area') {
        area = cities[Math.floor(Math.random() * cities.length)];
      }
      
      const botUser = new User({
        username: botUsername,
        fullName: persona.name,
        email: `${botUsername}@botuser.local`,
        password: 'botpassword123',
        anonymousAlias: persona.anonymousAlias + Math.floor(Math.random() * 1000),
        avatarEmoji: persona.avatarEmoji,
        bio: persona.bio,
        interests: persona.interests,
        college,
        area,
        isBot: true,
        onboardingComplete: true,
        isEmailVerified: true,
        botProfile: {
          personality: persona.personality,
          feedFocus: feedType || (persona.globalFocused ? 'global' : persona.collegeFocused ? 'college' : 'area'),
          activityLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        }
      });
      
      await botUser.save();
      createdBots.push(botUser);
    }
    
    console.log(`Created ${createdBots.length} bot users`);
    res.json({ 
      message: `Created ${createdBots.length} bot users`,
      bots: createdBots.map(bot => ({
        id: bot._id,
        username: bot.username,
        anonymousAlias: bot.anonymousAlias,
        personality: bot.botProfile.personality
      }))
    });
  } catch (error) {
    console.error('Error creating bot users:', error);
    res.status(500).json({ message: 'Error creating bot users', error: error.message });
  }
});

// CREATE SEED POSTS
router.post('/seed/posts', adminAuth, async (req, res) => {
  try {
    const { count = 20, feedType = 'global', college, area } = req.body;
    console.log(`Creating ${count} seed posts for ${feedType} feed`);
    
    // Get bot users for the specified feed type
    const query = { isBot: true };
    if (feedType === 'college' && college) {
      query.college = college;
    } else if (feedType === 'area' && area) {
      query.area = area;
    } else if (feedType === 'global') {
      query.$or = [
        { college: { $exists: false } },
        { area: { $exists: false } }
      ];
    }
    
    const bots = await User.find(query);
    if (bots.length === 0) {
      return res.status(400).json({ 
        message: 'No bot users found for this feed type. Create bots first.' 
      });
    }
    
    const createdPosts = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const content = getRandomTemplate(feedType);
      
      if (!content) continue;
      
      // Create post with proper expiration (24 hours from now)
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
      if (feedType === 'college' && (college || bot.college)) {
        postData.college = college || bot.college;
      } else if (feedType === 'area' && (area || bot.area)) {
        postData.area = area || bot.area;
      }
      
      const post = new Post(postData);
      await post.save();
      
      // Update bot's posts array
      await User.findByIdAndUpdate(bot._id, {
        $push: { posts: post._id }
      });
      
      createdPosts.push(post);
    }
    
    console.log(`Created ${createdPosts.length} seed posts`);
    res.json({ 
      message: `Created ${createdPosts.length} seed posts`,
      posts: createdPosts.length
    });
  } catch (error) {
    console.error('Error creating seed posts:', error);
    res.status(500).json({ message: 'Error creating seed posts', error: error.message });
  }
});

// ADD BOT INTERACTIONS (likes and comments)
router.post('/seed/interactions', adminAuth, async (req, res) => {
  try {
    const { postCount = 50, likesPerPost = 5, commentsPerPost = 2 } = req.body;
    console.log(`Adding bot interactions to ${postCount} posts`);
    
    // Get recent posts that need interactions
    const posts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(postCount).sort({ createdAt: -1 });
    
    // Get all bot users
    const bots = await User.find({ isBot: true });
    if (bots.length === 0) {
      return res.status(400).json({ message: 'No bot users found' });
    }
    
    let totalLikes = 0;
    let totalComments = 0;
    
    for (const post of posts) {
      // Add random likes
      const numLikes = Math.floor(Math.random() * likesPerPost) + 1;
      const shuffledBots = [...bots].sort(() => 0.5 - Math.random());
      
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
          totalLikes++;
        }
      }
      
      // Add random comments
      const numComments = Math.floor(Math.random() * commentsPerPost) + 1;
      const commentBots = shuffledBots.slice(numLikes);
      
      for (let i = 0; i < numComments && i < commentBots.length; i++) {
        const bot = commentBots[i];
        const commentContent = getRandomComment();
        
        post.comments.push({
          user: bot._id,
          content: commentContent,
          anonymousAlias: bot.anonymousAlias,
          avatarEmoji: bot.avatarEmoji,
          createdAt: new Date(),
          replies: []
        });
        totalComments++;
      }
      
      await post.save();
    }
    
    console.log(`Added ${totalLikes} likes and ${totalComments} comments`);
    res.json({ 
      message: `Added interactions to ${posts.length} posts`,
      totalLikes,
      totalComments
    });
  } catch (error) {
    console.error('Error adding bot interactions:', error);
    res.status(500).json({ message: 'Error adding bot interactions', error: error.message });
  }
});

// COMPREHENSIVE SEEDING ENDPOINT
router.post('/seed/complete', adminAuth, async (req, res) => {
  try {
    const { 
      colleges: targetColleges = [], 
      areas: targetAreas = [],
      botsPerFeed = 5,
      postsPerFeed = 15,
      interactionsEnabled = true
    } = req.body;
    
    console.log('Starting comprehensive seeding...');
    const results = {
      bots: { global: 0, college: 0, area: 0 },
      posts: { global: 0, college: 0, area: 0 },
      interactions: { likes: 0, comments: 0 }
    };
    
    // 1. Create global bots
    const globalBotsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/admin/seed/bots`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({ count: botsPerFeed, feedType: 'global' })
    });
    const globalBotsData = await globalBotsResponse.json();
    results.bots.global = globalBotsData.bots?.length || 0;
    
    // 2. Create college-specific bots
    for (const college of targetColleges) {
      const collegeBotsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/admin/seed/bots`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify({ count: botsPerFeed, feedType: 'college' })
      });
      const collegeBotsData = await collegeBotsResponse.json();
      results.bots.college += collegeBotsData.bots?.length || 0;
    }
    
    // 3. Create area-specific bots
    for (const area of targetAreas) {
      const areaBotsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/admin/seed/bots`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify({ count: botsPerFeed, feedType: 'area' })
      });
      const areaBotsData = await areaBotsResponse.json();
      results.bots.area += areaBotsData.bots?.length || 0;
    }
    
    // Wait a bit for bots to be created
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Create posts for each feed type
    const feedTypes = [
      { type: 'global', count: postsPerFeed },
      ...targetColleges.map(college => ({ type: 'college', college, count: postsPerFeed })),
      ...targetAreas.map(area => ({ type: 'area', area, count: postsPerFeed }))
    ];
    
    for (const feed of feedTypes) {
      const postsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/admin/seed/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify(feed)
      });
      const postsData = await postsResponse.json();
      results.posts[feed.type] += postsData.posts || 0;
    }
    
    // 5. Add interactions if enabled
    if (interactionsEnabled) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const interactionsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/admin/seed/interactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify({ 
          postCount: 100,
          likesPerPost: 8,
          commentsPerPost: 3
        })
      });
      const interactionsData = await interactionsResponse.json();
      results.interactions = {
        likes: interactionsData.totalLikes || 0,
        comments: interactionsData.totalComments || 0
      };
    }
    
    console.log('Comprehensive seeding completed:', results);
    res.json({ 
      message: 'Comprehensive seeding completed',
      results
    });
  } catch (error) {
    console.error('Error in comprehensive seeding:', error);
    res.status(500).json({ message: 'Error in comprehensive seeding', error: error.message });
  }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    console.log('Fetching user details:', req.params.id);
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('posts');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/users/:id/ban - Ban/unban a user with proper persistence
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    console.log('Toggling user ban status:', req.params.id);
    const { banned } = req.body;
    
    // Ensure the banned field is properly set and saved
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.banned = banned;
    if (banned) {
      user.bannedAt = new Date();
    } else {
      user.bannedAt = null;
    }
    
    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(req.params.id).select('-password');
    
    console.log(`User ${banned ? 'banned' : 'unbanned'} successfully, new status:`, updatedUser.banned);
    res.json({ 
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/stats - Get admin statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const bannedUsers = await User.countDocuments({ banned: true });
    const activeUsers = totalUsers - bannedUsers;
    
    // Posts created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const postsToday = await Post.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    const stats = {
      totalUsers,
      totalPosts,
      activeUsers,
      bannedUsers,
      postsToday
    };
    
    console.log('Admin stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Soft delete a user (ban them permanently)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    console.log('Soft deleting user:', req.params.id);
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.banned = true;
    user.bannedAt = new Date();
    user.deletedAt = new Date();
    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    
    console.log('User soft-deleted (banned) successfully');
    res.json({ message: 'User deleted successfully', user: updatedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
