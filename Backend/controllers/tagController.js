
const asyncHandler = require("express-async-handler");
const Tag = require("../models/tagModel");
const Post = require("../models/postModel");

// @desc Get trending tags
// @route GET /api/tags/trending
// @access Public
const getTrendingTags = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 20);
  const timeFilter = req.query.timeFilter || 'all';

  try {
    let dateFilter = {};
    const now = new Date();
    
    switch (timeFilter) {
      case 'today':
        dateFilter = { updatedAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        dateFilter = { updatedAt: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = { updatedAt: { $gte: monthAgo } };
        break;
      default:
        break;
    }

    const tags = await Tag.find({
      isActive: true,
      ...dateFilter
    })
    .sort({ trendingScore: -1, postCount: -1 })
    .limit(limit)
    .lean();

    res.json({
      tags,
      timeFilter,
      count: tags.length
    });
  } catch (error) {
    console.error("Error fetching trending tags:", error);
    res.status(500).json({
      message: "Failed to fetch trending tags",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @desc Get all available tags
// @route GET /api/tags
// @access Public
const getAllTags = asyncHandler(async (req, res) => {
  try {
    const tags = await Tag.find({ isActive: true })
      .sort({ displayName: 1 })
      .lean();

    res.json({ tags });
  } catch (error) {
    console.error("Error fetching all tags:", error);
    res.status(500).json({
      message: "Failed to fetch tags",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @desc Search tags
// @route GET /api/tags/search
// @access Public
const searchTags = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ message: "Search query must be at least 2 characters" });
  }

  try {
    const tags = await Tag.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .sort({ postCount: -1 })
    .limit(10)
    .lean();

    res.json({ tags });
  } catch (error) {
    console.error("Error searching tags:", error);
    res.status(500).json({
      message: "Failed to search tags",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @desc Get posts by tag
// @route GET /api/tags/:tagName/posts
// @access Public
const getPostsByTag = asyncHandler(async (req, res) => {
  const { tagName } = req.params;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const after = req.query.after;

  try {
    const query = {
      tags: { $in: [tagName.toLowerCase()] },
      expiresAt: { $gt: new Date() },
      ghostCircle: { $exists: false }
    };

    if (after) {
      query._id = { $lt: after };
    }

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const hasMore = posts.length === limit;

    res.json({
      posts,
      hasMore,
      tag: tagName
    });
  } catch (error) {
    console.error("Error fetching posts by tag:", error);
    res.status(500).json({
      message: "Failed to fetch posts",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

// @desc Update tag post counts and trending scores
const updateTagCounts = asyncHandler(async (tagNames) => {
  try {
    for (const tagName of tagNames) {
      const postCount = await Post.countDocuments({
        tags: { $in: [tagName.toLowerCase()] },
        expiresAt: { $gt: new Date() }
      });

      // Calculate trending score based on recent activity
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const recentPosts = await Post.countDocuments({
        tags: { $in: [tagName.toLowerCase()] },
        createdAt: { $gte: oneDayAgo },
        expiresAt: { $gt: new Date() }
      });

      const weeklyPosts = await Post.countDocuments({
        tags: { $in: [tagName.toLowerCase()] },
        createdAt: { $gte: oneWeekAgo },
        expiresAt: { $gt: new Date() }
      });

      const trendingScore = (recentPosts * 3) + weeklyPosts;

      await Tag.findOneAndUpdate(
        { name: tagName.toLowerCase() },
        { 
          postCount,
          trendingScore,
          lastUpdated: new Date()
        },
        { upsert: false }
      );
    }
  } catch (error) {
    console.error("Error updating tag counts:", error);
  }
});

module.exports = {
  getTrendingTags,
  getAllTags,
  searchTags,
  getPostsByTag,
  updateTagCounts
};
