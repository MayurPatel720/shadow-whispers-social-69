const express = require("express");
const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const { botPersonas, getRandomBotPersona } = require("../utils/seed/botPersonas");
const { getRandomTemplate, getRandomComment } = require("../utils/seed/postTemplates");
const { generateAnonymousAlias, generateAvatar } = require("../utils/generators");
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Admin auth middleware
const adminAuth = (req, res, next) => {
  console.log("Admin auth check, authorization:", req.headers.authorization);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer admin-')) {
    console.log("Admin auth failed: Invalid authorization header");
    return res.status(401).json({ message: "Admin access denied" });
  }
  
  const token = authHeader.replace('Bearer admin-', '');
  if (token !== 'token' && token !== 'true') {
    console.log("Admin auth failed: Invalid token");
    return res.status(401).json({ message: "Admin access denied" });
  }
  
  console.log("Admin access granted");
  next();
};

// Generate valid email for bot
const generateBotEmail = (persona, index) => {
  const domains = ['botmail.com', 'aiuser.net', 'ghostbot.io', 'whisperbot.dev'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = persona.anonymousAlias.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${username}${index}@${domain}`;
};

// Generate phone number for bot
const generateBotPhone = () => {
  return '+1' + Math.floor(1000000000 + Math.random() * 9000000000);
};

// Create comprehensive bot user with all required fields
const createBotUser = async (persona, index, feedType, college, area) => {
  const email = generateBotEmail(persona, index);
  const phone = generateBotPhone();
  
  const botData = {
    username: `bot_${persona.anonymousAlias.toLowerCase()}_${Date.now()}_${index}`,
    fullName: persona.name,
    email: email,
    phone: phone,
    password: 'BotUser123!', // This will be hashed
    anonymousAlias: persona.anonymousAlias,
    avatarEmoji: persona.avatarEmoji,
    bio: persona.bio,
    interests: persona.interests,
    isBot: true,
    isActive: true,
    isEmailVerified: true,
    onboardingComplete: true,
    
    // Bot-specific profile
    botProfile: {
      personality: persona.personality,
      activityLevel: Math.random() > 0.3 ? 'medium' : 'high',
      feedFocus: feedType,
      lastActivity: new Date(),
      responsePatterns: persona.interests.slice(0, 3)
    },
    
    // Matching and whisper capabilities
    gender: Math.random() > 0.5 ? 'male' : 'female',
    lookingFor: Math.random() > 0.5 ? 'male' : 'female',
    ageRange: { min: 18, max: 25 },
    
    // Location data based on feed type
    ...(feedType === 'college' && college && { college }),
    ...(feedType === 'area' && area && { area }),
    
    // Social features
    posts: [],
    friends: [],
    ghostCircles: [],
    recognizedUsers: [],
    identityRecognizers: [],
    recognitionAttempts: 0,
    successfulRecognitions: 0,
    
    // Referral system
    referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    referralCount: 0,
    claimedRewards: [],
    
    // Timestamps
    createdAt: new Date(),
    lastSeen: new Date(),
    isOnline: Math.random() > 0.5
  };
  
  try {
    const bot = new User(botData);
    const savedBot = await bot.save();
    console.log(`✅ Created bot: ${savedBot.anonymousAlias} (${savedBot.email})`);
    return savedBot;
  } catch (error) {
    console.error(`❌ Failed to create bot ${persona.name}:`, error.message);
    throw error;
  }
};

// POST /api/admin/seed/bots - Create bot users
router.post("/seed/bots", adminAuth, asyncHandler(async (req, res) => {
  try {
    const { count = 10, feedType = 'global', college, area } = req.body;
    console.log(`Creating ${count} bot users for feed type: ${feedType}`);
    
    const createdBots = [];
    
    for (let i = 0; i < count; i++) {
      const persona = getRandomBotPersona(feedType);
      try {
        const bot = await createBotUser(persona, i, feedType, college, area);
        createdBots.push({
          id: bot._id,
          name: bot.fullName,
          alias: bot.anonymousAlias,
          email: bot.email,
          personality: bot.botProfile.personality
        });
      } catch (error) {
        console.error(`Failed to create bot ${i + 1}:`, error.message);
        continue; // Continue with next bot
      }
    }
    
    console.log(`✅ Successfully created ${createdBots.length} bot users`);
    res.status(201).json({
      success: true,
      message: `Created ${createdBots.length} bot users`,
      bots: createdBots
    });
  } catch (error) {
    console.error("Error creating bot users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bot users",
      error: error.message
    });
  }
}));

// POST /api/admin/seed/posts - Create seed posts
router.post("/seed/posts", adminAuth, asyncHandler(async (req, res) => {
  try {
    const { count = 20, feedType = 'global', college, area } = req.body;
    
    // Get available bots for this feed type
    const botQuery = { isBot: true };
    if (feedType === 'college' && college) {
      botQuery.$or = [
        { 'botProfile.feedFocus': 'global' },
        { 'botProfile.feedFocus': 'college', college: college }
      ];
    } else if (feedType === 'area' && area) {
      botQuery.$or = [
        { 'botProfile.feedFocus': 'global' },
        { 'botProfile.feedFocus': 'area', area: area }
      ];
    }
    
    const availableBots = await User.find(botQuery);
    
    if (availableBots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No bots available for this feed type. Create bots first."
      });
    }
    
    const createdPosts = [];
    
    for (let i = 0; i < count; i++) {
      const bot = availableBots[Math.floor(Math.random() * availableBots.length)];
      const content = getRandomTemplate(feedType);
      
      if (!content) continue;
      
      const postData = {
        user: bot._id,
        content,
        anonymousAlias: bot.anonymousAlias,
        avatarEmoji: bot.avatarEmoji,
        isSeedPost: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        likes: [],
        comments: [],
        shareCount: 0
      };
      
      // Add feed-specific data
      if (feedType === 'college' && college) {
        postData.college = college;
      } else if (feedType === 'area' && area) {
        postData.area = area;
      }
      
      try {
        const post = new Post(postData);
        const savedPost = await post.save();
        
        // Update bot's posts array
        await User.findByIdAndUpdate(bot._id, {
          $push: { posts: savedPost._id },
          'botProfile.lastActivity': new Date()
        });
        
        createdPosts.push(savedPost._id);
      } catch (error) {
        console.error(`Failed to create post ${i + 1}:`, error.message);
      }
    }
    
    console.log(`✅ Successfully created ${createdPosts.length} posts`);
    res.status(201).json({
      success: true,
      message: `Created ${createdPosts.length} posts`,
      posts: createdPosts.length
    });
  } catch (error) {
    console.error("Error creating posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create posts",
      error: error.message
    });
  }
}));

// POST /api/admin/seed/interactions - Add interactions to posts
router.post("/seed/interactions", adminAuth, asyncHandler(async (req, res) => {
  try {
    const { postCount = 50, likesPerPost = 5, commentsPerPost = 2 } = req.body;
    
    // Get recent posts
    const recentPosts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 4 * 60 * 60 * 1000) }
    }).limit(postCount);
    
    // Get available bots
    const availableBots = await User.find({ isBot: true });
    
    if (availableBots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No bots available for interactions"
      });
    }
    
    let totalLikes = 0;
    let totalComments = 0;
    
    for (const post of recentPosts) {
      const shuffledBots = [...availableBots].sort(() => 0.5 - Math.random());
      
      // Add likes
      const numLikes = Math.min(likesPerPost, shuffledBots.length);
      for (let i = 0; i < numLikes; i++) {
        const bot = shuffledBots[i];
        
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
      
      // Add comments
      const numComments = Math.min(commentsPerPost, Math.max(0, shuffledBots.length - numLikes));
      for (let i = 0; i < numComments; i++) {
        if (shuffledBots[numLikes + i]) {
          const bot = shuffledBots[numLikes + i];
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
      }
      
      await post.save();
    }
    
    console.log(`✅ Added ${totalLikes} likes and ${totalComments} comments`);
    res.status(200).json({
      success: true,
      message: `Added ${totalLikes} likes and ${totalComments} comments`,
      totalLikes,
      totalComments
    });
  } catch (error) {
    console.error("Error adding interactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add interactions",
      error: error.message
    });
  }
}));

// POST /api/admin/seed/complete - Comprehensive seeding
router.post("/seed/complete", adminAuth, asyncHandler(async (req, res) => {
  try {
    const { 
      colleges = [], 
      areas = [], 
      botsPerFeed = 5, 
      postsPerFeed = 15,
      interactionsEnabled = true 
    } = req.body;
    
    const results = {
      botsCreated: 0,
      postsCreated: 0,
      interactionsAdded: { likes: 0, comments: 0 }
    };
    
    // Create global bots and posts
    console.log("Creating global feed content...");
    const globalBots = [];
    for (let i = 0; i < botsPerFeed; i++) {
      const persona = getRandomBotPersona('global');
      try {
        const bot = await createBotUser(persona, i, 'global');
        globalBots.push(bot);
        results.botsCreated++;
      } catch (error) {
        console.error(`Failed to create global bot ${i + 1}:`, error.message);
      }
    }
    
    // Create global posts
    for (let i = 0; i < postsPerFeed && globalBots.length > 0; i++) {
      const bot = globalBots[Math.floor(Math.random() * globalBots.length)];
      const content = getRandomTemplate('global');
      
      if (content) {
        try {
            const post = new Post({
              user: bot._id,
              content,
              anonymousAlias: bot.anonymousAlias,
              avatarEmoji: bot.avatarEmoji,
              isSeedPost: true,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              likes: [],
              comments: []
            });
          
          const savedPost = await post.save();
          await User.findByIdAndUpdate(bot._id, { $push: { posts: savedPost._id } });
          results.postsCreated++;
        } catch (error) {
          console.error(`Failed to create global post ${i + 1}:`, error.message);
        }
      }
    }
    
    // Create college-specific content
    for (const college of colleges) {
      console.log(`Creating content for college: ${college}`);
      const collegeBots = [];
      
      for (let i = 0; i < botsPerFeed; i++) {
        const persona = getRandomBotPersona('college');
        try {
          const bot = await createBotUser(persona, i, 'college', college);
          collegeBots.push(bot);
          results.botsCreated++;
        } catch (error) {
          console.error(`Failed to create college bot ${i + 1} for ${college}:`, error.message);
        }
      }
      
      // Create college posts
      for (let i = 0; i < postsPerFeed && collegeBots.length > 0; i++) {
        const bot = collegeBots[Math.floor(Math.random() * collegeBots.length)];
        const content = getRandomTemplate('college');
        
        if (content) {
          try {
              const post = new Post({
                user: bot._id,
                content,
                anonymousAlias: bot.anonymousAlias,
                avatarEmoji: bot.avatarEmoji,
                college: college,
                isSeedPost: true,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                likes: [],
                comments: []
              });
            
            const savedPost = await post.save();
            await User.findByIdAndUpdate(bot._id, { $push: { posts: savedPost._id } });
            results.postsCreated++;
          } catch (error) {
            console.error(`Failed to create college post ${i + 1} for ${college}:`, error.message);
          }
        }
      }
    }
    
    // Create area-specific content
    for (const area of areas) {
      console.log(`Creating content for area: ${area}`);
      const areaBots = [];
      
      for (let i = 0; i < botsPerFeed; i++) {
        const persona = getRandomBotPersona('area');
        try {
          const bot = await createBotUser(persona, i, 'area', null, area);
          areaBots.push(bot);
          results.botsCreated++;
        } catch (error) {
          console.error(`Failed to create area bot ${i + 1} for ${area}:`, error.message);
        }
      }
      
      // Create area posts
      for (let i = 0; i < postsPerFeed && areaBots.length > 0; i++) {
        const bot = areaBots[Math.floor(Math.random() * areaBots.length)];
        const content = getRandomTemplate('area');
        
        if (content) {
          try {
            const post = new Post({
              user: bot._id,
              content,
              anonymousAlias: bot.anonymousAlias,
              avatarEmoji: bot.avatarEmoji,
              area: area,
              isSeedPost: true,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              likes: [],
              comments: []
            });
            
            const savedPost = await post.save();
            await User.findByIdAndUpdate(bot._id, { $push: { posts: savedPost._id } });
            results.postsCreated++;
          } catch (error) {
            console.error(`Failed to create area post ${i + 1} for ${area}:`, error.message);
          }
        }
      }
    }
    
    // Add interactions if enabled
    if (interactionsEnabled && results.postsCreated > 0) {
      console.log("Adding interactions to posts...");
      
      const recentPosts = await Post.find({
        createdAt: { $gte: new Date(Date.now() - 1 * 60 * 60 * 1000) }
      }).limit(50);
      
      const allBots = await User.find({ isBot: true });
      
      for (const post of recentPosts) {
        const shuffledBots = [...allBots].sort(() => 0.5 - Math.random());
        
        // Add 1-3 likes
        const numLikes = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < Math.min(numLikes, shuffledBots.length); i++) {
          const bot = shuffledBots[i];
          
          const alreadyLiked = post.likes.some(
            like => like.user.toString() === bot._id.toString()
          );
          
          if (!alreadyLiked) {
            post.likes.push({
              user: bot._id,
              anonymousAlias: bot.anonymousAlias,
              createdAt: new Date()
            });
            results.interactionsAdded.likes++;
          }
        }
        
        // Maybe add a comment (30% chance)
        if (Math.random() < 0.3 && shuffledBots.length > numLikes) {
          const bot = shuffledBots[numLikes];
          const commentContent = getRandomComment();
          
          post.comments.push({
            user: bot._id,
            content: commentContent,
            anonymousAlias: bot.anonymousAlias,
            avatarEmoji: bot.avatarEmoji,
            createdAt: new Date(),
            replies: []
          });
          results.interactionsAdded.comments++;
        }
        
        await post.save();
      }
    }
    
    console.log("✅ Comprehensive seeding completed:", results);
    res.status(201).json({
      success: true,
      message: "Comprehensive seeding completed successfully",
      results
    });
  } catch (error) {
    console.error("Error in comprehensive seeding:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete comprehensive seeding",
      error: error.message
    });
  }
}));

// POST /api/admin/seed/csv-posts - Import posts from CSV
router.post("/seed/csv-posts", adminAuth, upload.single('csvFile'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded"
      });
    }
    
    const { feedType = 'global', college, area } = req.body;
    const posts = [];
    
    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        if (row.content && row.content.trim()) {
          posts.push({
            content: row.content.trim(),
            category: row.category || 'general',
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
            imageUrl: row.imageUrl && row.imageUrl.trim() ? row.imageUrl.trim() : '',
            images: row.images ? row.images.split(',').map(img => img.trim()).filter(img => img) : []
          });
        }
      })
      .on('end', async () => {
        try {
          // Get available bots
          const botQuery = { isBot: true };
          if (feedType === 'college' && college) {
            botQuery.$or = [
              { 'botProfile.feedFocus': 'global' },
              { 'botProfile.feedFocus': 'college', college: college }
            ];
          } else if (feedType === 'area' && area) {
            botQuery.$or = [
              { 'botProfile.feedFocus': 'global' },
              { 'botProfile.feedFocus': 'area', area: area }
            ];
          }
          
          const availableBots = await User.find(botQuery);
          
          if (availableBots.length === 0) {
            return res.status(400).json({
              success: false,
              message: "No bots available for this feed type"
            });
          }
          
          const createdPosts = [];
          
          for (const postData of posts) {
            const bot = availableBots[Math.floor(Math.random() * availableBots.length)];
            
            const newPostData = {
              user: bot._id,
              content: postData.content,
              imageUrl: postData.imageUrl || '',
              images: postData.images || [],
              anonymousAlias: bot.anonymousAlias,
              avatarEmoji: bot.avatarEmoji,
              isSeedPost: true,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              likes: [],
              comments: [],
              tags: postData.tags
            };
            
            if (feedType === 'college' && college) {
              newPostData.college = college;
            } else if (feedType === 'area' && area) {
              newPostData.area = area;
            }
            
            try {
              const post = new Post(newPostData);
              const savedPost = await post.save();
              
              await User.findByIdAndUpdate(bot._id, {
                $push: { posts: savedPost._id }
              });
              
              createdPosts.push(savedPost._id);
            } catch (error) {
              console.error("Error creating post from CSV:", error.message);
            }
          }
          
          // Clean up uploaded file
          fs.unlinkSync(req.file.path);
          
          res.status(201).json({
            success: true,
            message: `Created ${createdPosts.length} posts from CSV`,
            postsCreated: createdPosts.length,
            totalRowsProcessed: posts.length
          });
        } catch (error) {
          console.error("Error processing CSV posts:", error);
          res.status(500).json({
            success: false,
            message: "Failed to process CSV posts",
            error: error.message
          });
        }
      });
  } catch (error) {
    console.error("Error uploading CSV:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload CSV",
      error: error.message
    });
  }
}));

// Get all posts
router.get("/posts", adminAuth, asyncHandler(async (req, res) => {
  const posts = await Post.find({})
    .populate('user', 'username email fullName anonymousAlias avatarEmoji')
    .populate('ghostCircle', 'name')
    .sort({ createdAt: -1 });
  
  // Add notification acceptance info and feed type
  const postsWithDetails = posts.map(post => {
    let feedType = 'Global';
    if (post.college) feedType = `College: ${post.college}`;
    if (post.area) feedType = `Area: ${post.area}`;
    if (post.ghostCircle) feedType = `Ghost Circle: ${post.ghostCircle.name}`;
    
    return {
      ...post.toObject(),
      feedType,
      notificationAccepts: post.likes?.length || 0 // Using likes as proxy for engagement
    };
  });
  
  res.json(postsWithDetails);
}));

// Get all users
router.get("/users", adminAuth, asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
}));

// Delete a post
router.delete("/posts/:id", adminAuth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post removed" });
}));

// Update a post
router.put("/posts/:id", adminAuth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    post.content = req.body.content || post.content;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
}));

// Ban a user
router.put("/users/:id/ban", adminAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.banned = req.body.banned;
    const updatedUser = await user.save();
    res.json({ message: "User ban status updated" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
}));

module.exports = router;
