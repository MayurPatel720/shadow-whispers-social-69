
const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');
const User = require('../models/userModel');

// Admin middleware to check credentials
const adminAuth = (req, res, next) => {
  const { authorization } = req.headers;
  
  // For demo purposes, we'll use a simple check
  // In production, you'd want proper JWT validation
  if (authorization && authorization.includes('admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Admin access required' });
  }
};

// GET /api/admin/posts - Get all posts with user details
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username email fullName anonymousAlias')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/posts/:id - Delete any post
router.delete('/posts/:id', adminAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/posts/:id - Edit any post
router.put('/posts/:id', adminAuth, async (req, res) => {
  try {
    const { content, images, videos } = req.body;
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { content, images: images || [], videos: videos || [] },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('posts');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
