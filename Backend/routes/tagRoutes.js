
const express = require("express");
const router = express.Router();
const {
  getTrendingTags,
  getAllTags,
  searchTags,
  getPostsByTag
} = require("../controllers/tagController");

// @desc Get all available tags
router.get("/", getAllTags);

// @desc Get trending tags
router.get("/trending", getTrendingTags);

// @desc Search tags
router.get("/search", searchTags);

// @desc Get posts by tag
router.get("/:tagName/posts", getPostsByTag);

module.exports = router;
