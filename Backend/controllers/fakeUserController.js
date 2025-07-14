const FakeUser = require('../models/fakeUserModel');
const Post = require('../models/postModel');

// Get fake user profile (for when users click on seed post authors)
const getFakeUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if this is a fake user
    const fakeUser = await FakeUser.findById(id).lean();
    
    if (!fakeUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts (seed posts only)
    const userPosts = await Post.find({ 
      user: id, 
      isSeedPost: true,
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    // Return safe fake user data
    const safeUserData = {
      _id: fakeUser._id,
      username: fakeUser.username,
      fullName: fakeUser.fullName,
      anonymousAlias: fakeUser.anonymousAlias,
      avatarEmoji: fakeUser.avatarEmoji,
      bio: fakeUser.bio,
      isFakeUser: true,
      isInteractable: false,
      postsCount: userPosts.length,
      posts: userPosts,
      // Fake stats to make profile look realistic
      stats: {
        postsCount: userPosts.length,
        recognizedCount: Math.floor(Math.random() * 15) + 5, // 5-20
        successfulRecognitions: Math.floor(Math.random() * 10) + 2, // 2-12
      },
      // Prevent interaction
      canSendMessage: false,
      canAddFriend: false,
      canRecognize: false
    };

    res.status(200).json(safeUserData);
  } catch (error) {
    console.error('Error fetching fake user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is fake (used by other controllers)
const isFakeUser = async (userId) => {
  try {
    const fakeUser = await FakeUser.findById(userId).lean();
    return !!fakeUser;
  } catch (error) {
    return false;
  }
};

module.exports = {
  getFakeUserProfile,
  isFakeUser
};