const express = require("express");
const router = express.Router();
const {
	createPost,
	getPosts,
	getPost,
	updatePost,
	deletePost,
	editComment,
	addReply,
	deleteReply,
	updateReply,
	getPaginatedPosts,
	sharePost,
	seedDatabase,
	clearSeedPosts,
	addComment,
	likePost,
	deleteComment,
	replyToComment,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

// @desc Create a new post
router.post("/", protect, createPost);

// @desc Get paginated posts for global feed
router.get("/global", getPaginatedPosts);

// @desc Get all posts
router.get("/", getPosts);

// @desc Get single post
router.get("/:id", getPost);

// @desc Update post
router.put("/:id", protect, updatePost);

// @desc Delete post
router.delete("/:id", protect, deletePost);

// @desc Like/unlike a post
router.put("/:id/like", protect, likePost);

// @desc Add comment to post
router.post("/:id/comments", protect, addComment);

// @desc Delete comment
router.delete("/:postId/comments/:commentId", protect, deleteComment);

// @desc Update comment
router.put("/:postId/comments/:commentId", protect, editComment);

// @desc Add reply to comment
router.post("/:postId/comments/:commentId/reply", protect, replyToComment);

// @desc Delete reply
// router.delete(
// 	"/:postId/comments/:commentId/replies/:replyId",
// 	protect,
// 	deleteReply
// );

// // @desc Update reply
// router.put(
// 	"/:postId/comments/:commentId/replies/:replyId",
// 	protect,
// 	updateReply
// );

// @desc Share post
// router.post("/:id/share", protect, sharePost);

// @desc Seed database with sample posts
router.post("/seed", seedDatabase);

// @desc Clear seed posts
router.delete("/seed", clearSeedPosts);

module.exports = router;
