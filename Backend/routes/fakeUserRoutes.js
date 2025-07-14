const express = require('express');
const router = express.Router();
const { getFakeUserProfile } = require('../controllers/fakeUserController');

// @desc Get fake user profile
router.get('/:id', getFakeUserProfile);

module.exports = router;