
// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { isFakeUser } = require('../controllers/fakeUserController');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addFriend,
  getMyFriends,
  recognizeUser,
  getRecognitions,
  revokeRecognition,
  getUserById,
  updateOneSignalPlayerId,
  getUserPosts,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getReferralLeaderboard,
  processReferral,
  claimReward
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resettoken", resetPassword);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.get("/profile/:userId", protect, getUserById);
router.put("/profile", protect, updateUserProfile);
router.post("/friends", protect, addFriend);
router.get("/friends", protect, getMyFriends);
router.post("/recognize", protect, recognizeUser);
router.get("/recognitions", protect, getRecognitions);
router.post("/revoke-recognition", protect, revokeRecognition);
router.post("/onesignal-player-id", protect, updateOneSignalPlayerId);
router.get("/userposts/:userId", protect, getUserPosts);

// Referral routes
router.get("/referral-leaderboard", protect, getReferralLeaderboard);
router.post("/process-referral", protect, processReferral);
router.post("/claim-reward", protect, claimReward);

// @desc    Get user profile (handles both real and fake users)
// @route   GET /api/users/:id
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    // Check if this is a fake user first
    if (await isFakeUser(req.params.id)) {
      // Redirect to fake user controller
      const fakeUserController = require('../controllers/fakeUserController');
      return fakeUserController.getFakeUserProfile(req, res);
    }
    // Otherwise handle as normal user
    return getUserProfile(req, res, next);
  } catch (error) {
    console.error('Error in user profile route:', error);
    return getUserProfile(req, res, next);
  }
});

module.exports = router;
