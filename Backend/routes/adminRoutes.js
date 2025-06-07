
const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');
const User = require('../models/userModel');

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

// PUT /api/admin/users/:id/ban - Ban/unban a user
router.put('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    console.log('Toggling user ban status:', req.params.id);
    const { banned } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banned: banned },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`User ${banned ? 'banned' : 'unbanned'} successfully`);
    res.json({ 
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user 
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

// DELETE /api/admin/users/:id - Delete a user (soft delete by banning)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    console.log('Deleting user:', req.params.id);
    
    // Instead of actual deletion, we ban the user to preserve data integrity
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banned: true, deletedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User soft-deleted (banned) successfully');
    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
