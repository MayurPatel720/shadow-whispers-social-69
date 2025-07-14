

const Post = require("../models/postModel");
const mongoose = require("mongoose");
const { getRandomFakeUsers, initializeFakeUsers } = require("./fakeUserGenerator");

// Import generator functions from the generators file
const { generateAnonymousAlias, generateAvatar } = require("./generators");

// Generate random color from our theme
const getRandomColor = () => {
  const colors = [
    "#8B5CF6", // Primary purple
    "#9b87f5", // Light purple
    "#7E69AB", // Medium purple
    "#6E59A5", // Deep purple
    "#D6BCFA", // Soft purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Create generateIdentity function locally using the correct backend functions
const generateIdentity = () => {
  return {
    nickname: generateAnonymousAlias(),
    emoji: generateAvatar(),
    color: getRandomColor(),
  };
};

// Diverse seed post content across different themes
const seedPostsData = [
  // Secrets & Confessions
  {
    content: "I've been pretending to be happy for so long that I forgot what genuine happiness feels like. Sometimes I wonder if anyone would notice if I just disappeared for a while.",
    theme: "confession",
    likes: 24,
    comments: 7
  },
  {
    content: "I'm 28 and still sleep with a stuffed animal. My boyfriend doesn't know and I'm too embarrassed to tell him. It's the only way I can fall asleep.",
    theme: "secret",
    likes: 18,
    comments: 12
  },
  {
    content: "I purposely take the long route home from work just to avoid going back to my empty apartment. The silence is deafening.",
    theme: "loneliness",
    likes: 31,
    comments: 9
  },
  
  // Love & Relationships
  {
    content: "I'm still in love with my best friend from college. It's been 5 years and I think about them every single day. They're getting married next month.",
    theme: "love",
    likes: 42,
    comments: 15
  },
  {
    content: "My partner thinks I'm working late, but I'm actually sitting in my car in the parking lot crying. I don't know how to tell them I'm struggling.",
    theme: "relationship",
    likes: 28,
    comments: 11
  },
  {
    content: "I matched with my ex on a dating app and we've been secretly talking for weeks. I know it's toxic but I can't stop.",
    theme: "love",
    likes: 19,
    comments: 8
  },

  // Work & Career
  {
    content: "I got promoted but I have no idea what I'm doing. Everyone thinks I'm competent but I'm just really good at pretending and googling everything.",
    theme: "work",
    likes: 35,
    comments: 13
  },
  {
    content: "I quit my dream job because my boss was a nightmare. Now I tell everyone I left for 'better opportunities' but I'm actually bartending and barely paying rent.",
    theme: "career",
    likes: 26,
    comments: 10
  },
  {
    content: "I accidentally sent a message complaining about my coworker TO that coworker. I've been avoiding them for 3 weeks now.",
    theme: "work",
    likes: 22,
    comments: 6
  },

  // Family & Past
  {
    content: "I haven't talked to my parents in 2 years and I don't miss them. Everyone expects me to feel guilty but I've never been happier.",
    theme: "family",
    likes: 38,
    comments: 17
  },
  {
    content: "I found my dad's old diary and discovered he wanted to be a musician. He gave up his dreams for us and I never knew. Now I understand why he seemed so sad sometimes.",
    theme: "family",
    likes: 45,
    comments: 12
  },
  {
    content: "My siblings think I'm the successful one, but I'm drowning in debt and too proud to ask for help. The family group chat is torture.",
    theme: "family",
    likes: 29,
    comments: 8
  },

  // Deep Thoughts & Philosophy
  {
    content: "Does anyone else feel like they're just acting their way through life? Like everyone else got a script and you're just improvising?",
    theme: "existential",
    likes: 51,
    comments: 21
  },
  {
    content: "I think about death every day, not in a sad way, but in a curious way. Like, what happens to our consciousness? It keeps me up at night.",
    theme: "philosophy",
    likes: 33,
    comments: 14
  },
  {
    content: "Sometimes I wonder if I'm living my life or just surviving it. When did existing become so exhausting?",
    theme: "existential",
    likes: 47,
    comments: 18
  },

  // Funny & Light
  {
    content: "I've been using the same password for 10 years and it's embarrassing. It's my high school crush's name with '123'. I'm 30.",
    theme: "funny",
    likes: 16,
    comments: 9
  },
  {
    content: "I pretend to be a morning person at work but I literally set 15 alarms and drink 4 cups of coffee before I can function like a human.",
    theme: "funny",
    likes: 24,
    comments: 7
  },
  {
    content: "I have full conversations with my plants and I'm pretty sure my neighbors think I'm talking to someone on the phone. I'm not.",
    theme: "quirky",
    likes: 21,
    comments: 11
  },

  // Regrets & Mistakes
  {
    content: "I chose the safe college major instead of following my passion. Now I'm 5 years into a career I hate and feel trapped by my student loans.",
    theme: "regret",
    likes: 39,
    comments: 16
  },
  {
    content: "I said something cruel to my best friend when I was angry and they never spoke to me again. It's been 3 years and I think about it every week.",
    theme: "regret",
    likes: 34,
    comments: 13
  },
  {
    content: "I didn't visit my grandmother before she passed because I was 'too busy' with work. I would give anything for one more conversation with her.",
    theme: "regret",
    likes: 58,
    comments: 22
  },

  // Current Struggles
  {
    content: "I'm 26 and still don't know what I want to do with my life. Everyone else seems to have it figured out and I'm just floating.",
    theme: "struggle",
    likes: 41,
    comments: 19
  }
];

// Generate timestamps spread across the last 7 days
const generateTimestamp = (daysAgo, hoursRange = [9, 22]) => {
  const now = new Date();
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  
  const randomHour = Math.floor(Math.random() * (hoursRange[1] - hoursRange[0])) + hoursRange[0];
  const randomMinute = Math.floor(Math.random() * 60);
  
  date.setHours(randomHour, randomMinute, 0, 0);
  return date;
};

// Generate expiry date (30 days from now for seed posts)
const generateExpiryDate = () => {
  const now = new Date();
  return new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
};

const createSeedPosts = async () => {
  try {
    // Initialize fake users first
    await initializeFakeUsers();
    
    // Check if valid seed posts already exist (not expired)
    const existingPosts = await Post.countDocuments({ 
      isSeedPost: true, 
      expiresAt: { $gt: new Date() } 
    });
    
    if (existingPosts >= seedPostsData.length * 0.8) { // Keep creating if less than 80% remain
      console.log(`${existingPosts} valid seed posts already exist. Skipping creation.`);
      return;
    }

    console.log("Starting seed posts creation...");
    
    // Get fake users for posts
    const fakeUsers = await getRandomFakeUsers(seedPostsData.length * 2); // Get more users than needed for variety
    if (fakeUsers.length === 0) {
      throw new Error("No fake users available for seed posts");
    }
    
    const posts = [];
    
    for (let i = 0; i < seedPostsData.length; i++) {
      const postData = seedPostsData[i];
      
      // Use a random fake user for this post
      const fakeUser = fakeUsers[i % fakeUsers.length];
      
      // Create timestamp (spread across last 7 days, with some recent ones)
      const daysAgo = Math.floor(Math.random() * 7); // More randomness in timing
      const createdAt = generateTimestamp(daysAgo);
      
      // Set expiry to 30 days from now (much longer for seed posts)
      const expiresAt = generateExpiryDate();
      
      // Get additional fake users for likes and comments
      const interactionUsers = await getRandomFakeUsers(Math.max(postData.likes + postData.comments, 10));
      
      // Generate fake likes
      const fakeLikes = [];
      for (let j = 0; j < postData.likes; j++) {
        const likeUser = interactionUsers[j % interactionUsers.length];
        fakeLikes.push({
          user: likeUser._id,
          anonymousAlias: likeUser.anonymousAlias,
          createdAt: new Date(createdAt.getTime() + (j * 1000 * 60 * Math.random() * 120))
        });
      }
      
      // Generate fake comments with more realistic content
      const commentTexts = [
        "I felt this in my soul 💭",
        "Thank you for sharing this, you're not alone",
        "This made me think differently about things",
        "Same here, glad I'm not the only one",
        "Your honesty is refreshing in a world of facades",
        "This hits different when you're going through it",
        "Sending virtual hugs 🤗",
        "The vulnerability here is beautiful",
        "I needed to read this today",
        "You put into words what I couldn't express",
        "This resonates so deeply with me",
        "Brave of you to share this truth",
        "Your words give me comfort",
        "I see myself in this post",
        "Thank you for being real with us"
      ];
      
      const fakeComments = [];
      for (let k = 0; k < postData.comments; k++) {
        const commentUser = interactionUsers[(postData.likes + k) % interactionUsers.length];
        fakeComments.push({
          _id: new mongoose.Types.ObjectId(),
          user: commentUser._id,
          anonymousAlias: commentUser.anonymousAlias,
          avatarEmoji: commentUser.avatarEmoji,
          content: commentTexts[k % commentTexts.length],
          createdAt: new Date(createdAt.getTime() + (k * 1000 * 60 * Math.random() * 180)),
          replies: []
        });
      }
      
      const post = {
        user: fakeUser._id,
        content: postData.content,
        anonymousAlias: fakeUser.anonymousAlias,
        avatarEmoji: fakeUser.avatarEmoji,
        likes: fakeLikes,
        comments: fakeComments,
        expiresAt: expiresAt,
        isSeedPost: true,
        theme: postData.theme,
        shareCount: Math.floor(Math.random() * 8), // Random share count 0-7
        createdAt: createdAt,
        updatedAt: createdAt
      };

      posts.push(post);
    }

    // Insert all posts at once
    const insertedPosts = await Post.insertMany(posts);
    console.log(`Successfully created ${insertedPosts.length} seed posts`);
    
    // Update fake users with their posts
    for (let i = 0; i < insertedPosts.length; i++) {
      const post = insertedPosts[i];
      const fakeUser = fakeUsers[i % fakeUsers.length];
      await require('../models/fakeUserModel').findByIdAndUpdate(
        fakeUser._id,
        { $push: { posts: post._id } }
      );
    }
    
    return insertedPosts;
  } catch (error) {
    console.error("Error creating seed posts:", error);
    throw error;
  }
};

// Automatically initialize seed posts when this module is loaded
const autoInitializeSeedPosts = async () => {
  try {
    await require('./fakeUserGenerator').initializeFakeUsers();
    await createSeedPosts();
  } catch (error) {
    console.error("Failed to auto-initialize seed posts:", error);
  }
};

// Clean up expired seed posts and create new ones
const maintainSeedPosts = async () => {
  try {
    // Remove expired seed posts
    const deletedResult = await Post.deleteMany({
      isSeedPost: true,
      expiresAt: { $lt: new Date() }
    });
    
    if (deletedResult.deletedCount > 0) {
      console.log(`Removed ${deletedResult.deletedCount} expired seed posts`);
    }
    
    // Check if we need to create more
    const currentCount = await Post.countDocuments({
      isSeedPost: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (currentCount < seedPostsData.length * 0.8) {
      console.log(`Only ${currentCount} valid seed posts remaining, refreshing...`);
      await createSeedPosts();
    }
  } catch (error) {
    console.error("Error maintaining seed posts:", error);
  }
};

const removeSeedPosts = async () => {
  try {
    const result = await Post.deleteMany({ isSeedPost: true });
    console.log(`Removed ${result.deletedCount} seed posts`);
    return result;
  } catch (error) {
    console.error("Error removing seed posts:", error);
    throw error;
  }
};

module.exports = {
  createSeedPosts,
  removeSeedPosts,
  seedPostsData,
  autoInitializeSeedPosts,
  maintainSeedPosts
};

