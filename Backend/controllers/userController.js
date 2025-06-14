// controllers/userController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utils/jwtHelper");
const { generateAnonymousAlias, generateAvatar } = require("../utils/generators");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
	const { username, fullName, email, password, referralCode } = req.body;

	if (!username || !fullName || !email || !password) {
		res.status(400);
		throw new Error("Please fill in all fields");
	}

	// Check if user exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}

	// Generate anonymous alias and avatar
	const anonymousAlias = generateAnonymousAlias();
	const avatarEmoji = generateAvatar();

	// Create user
	const user = await User.create({
		username,
		fullName,
		email,
		password,
		anonymousAlias,
		avatarEmoji,
		referralCode,
	});

	if (user) {
		res.status(201).json({
			_id: user._id,
			username: user.username,
			fullName: user.fullName,
			email: user.email,
			anonymousAlias: user.anonymousAlias,
			avatarEmoji: user.avatarEmoji,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error("Invalid user data");
	}
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	console.log("LOGIN ATTEMPT: email ->", email);

	try {
		// Check for user email
		const user = await User.findOne({ email });

		if (!user) {
			console.error("Login error: User not found for email:", email);
			res.status(400);
			throw new Error("No account with this email. Please sign up first.");
		}

		const validPassword = await user.matchPassword(password);

		if (!validPassword) {
			console.error("Login error: Wrong password for email:", email);
			res.status(400);
			throw new Error("Incorrect password. Please try again.");
		}

		console.log("Login successful:", user.username, user._id);

		res.json({
			_id: user._id,
			username: user.username,
			fullName: user.fullName,
			email: user.email,
			anonymousAlias: user.anonymousAlias,
			avatarEmoji: user.avatarEmoji,
			token: generateToken(user._id),
		});
	} catch (err) {
		console.error("Critical error in loginUser:", err.message, err.stack);
		res.status(500).json({
			message: "An unexpected error occurred while logging in.",
			error: err.message
		});
	}
});

// @desc    Get user profile data
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select("-password");

	if (user) {
		res.json({
			_id: user._id,
			username: user.username,
			fullName: user.fullName,
			email: user.email,
			anonymousAlias: user.anonymousAlias,
			avatarEmoji: user.avatarEmoji,
			friends: user.friends,
			recognizedUsers: user.recognizedUsers,
			referralCode: user.referralCode,
			oneSignalPlayerId: user.oneSignalPlayerId,
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	user.username = req.body.username || user.username;
	user.fullName = req.body.fullName || user.fullName;
	user.email = req.body.email || user.email;
	user.avatarEmoji = req.body.avatarEmoji || user.avatarEmoji;

	if (req.body.password) {
		user.password = req.body.password;
	}

	const updatedUser = await user.save();

	res.json({
		_id: updatedUser._id,
		username: updatedUser.username,
		fullName: updatedUser.fullName,
		email: updatedUser.email,
		anonymousAlias: updatedUser.anonymousAlias,
		avatarEmoji: updatedUser.avatarEmoji,
		token: generateToken(updatedUser._id),
	});
});

// @desc    Add a friend to user's friend list
// @route   POST /api/users/friends
// @access  Private
const addFriend = asyncHandler(async (req, res) => {
	const { friendUsername } = req.body;

	if (!friendUsername) {
		res.status(400);
		throw new Error("Please provide a username to add as a friend");
	}

	const friend = await User.findOne({ username: friendUsername });

	if (!friend) {
		res.status(404);
		throw new Error("User not found");
	}

	if (friend._id.toString() === req.user._id.toString()) {
		res.status(400);
		throw new Error("Cannot add yourself as a friend");
	}

	const user = await User.findById(req.user._id);

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	if (user.friends.includes(friend._id)) {
		res.status(400);
		throw new Error("User is already your friend");
	}

	user.friends.push(friend._id);
	await user.save();

	res.json({ message: "Friend added successfully" });
});

// @desc    Get all friends for current user
// @route   GET /api/users/friends
// @access  Private
const getMyFriends = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).populate("friends", "_id username fullName email anonymousAlias avatarEmoji");

	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	res.json(user.friends);
});

// @desc    Recognize a user's identity
// @route   POST /api/users/recognize
// @access  Private
const recognizeUser = asyncHandler(async (req, res) => {
	const { targetUserId, guessedIdentity } = req.body;

	if (!targetUserId || !guessedIdentity) {
		res.status(400);
		throw new Error("Please provide the target user ID and your guess");
	}

	const targetUser = await User.findById(targetUserId);
	if (!targetUser) {
		res.status(404);
		throw new Error("Target user not found");
	}

	if (guessedIdentity.toLowerCase() === targetUser.username.toLowerCase()) {
		const user = await User.findById(req.user._id);
		if (!user) {
			res.status(404);
			throw new Error("User not found");
		}

		if (user.recognizedUsers.includes(targetUserId)) {
			res.status(400);
			throw new Error("You have already recognized this user");
		}

		user.recognizedUsers.push(targetUserId);
		await user.save();

		res.json({ message: "Recognition successful" });
	} else {
		res.status(400);
		throw new Error("Incorrect identity guess");
	}
});

// @desc    Get recognitions for current user
// @route   GET /api/users/recognitions
// @access  Private
const getRecognitions = asyncHandler(async (req, res) => {
	const { type, filter } = req.query;
	const userId = req.user._id;

	let user = await User.findById(userId);
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	let recognizedUsers = user.recognizedUsers || [];

	if (type === "received") {
		user = await User.findOne({ _id: userId }).populate({
			path: "referralCode",
			select: "_id username fullName email anonymousAlias avatarEmoji",
		});
		if (!user) {
			res.status(404);
			throw new Error("Referred user not found");
		}
		recognizedUsers = user.referralCode ? [user.referralCode] : [];
	} else if (type === "given") {
		user = await User.findById(userId).populate({
			path: "recognizedUsers",
			select: "_id username fullName email anonymousAlias avatarEmoji",
		});
		if (!user) {
			res.status(404);
			throw new Error("User not found");
		}
		recognizedUsers = user.recognizedUsers || [];
	} else {
		user = await User.findById(userId).populate({
			path: "recognizedUsers",
			select: "_id username fullName email anonymousAlias avatarEmoji",
		});

		if (!user) {
			res.status(404);
			throw new Error("User not found");
		}
		recognizedUsers = user.recognizedUsers || [];
	}

	if (filter === "pending") {
		// Logic to filter pending recognitions
	}

	res.json(recognizedUsers);
});

// @desc    Revoke recognition for a user
// @route   POST /api/users/revoke-recognition
// @access  Private
const revokeRecognition = asyncHandler(async (req, res) => {
	const { targetUserId } = req.body;

	if (!targetUserId) {
		res.status(400);
		throw new Error("Please provide the target user ID to revoke recognition");
	}

	const user = await User.findById(req.user._id);
	if (!user) {
		res.status(404);
		throw new Error("User not found");
	}

	if (!user.recognizedUsers.includes(targetUserId)) {
		res.status(400);
		throw new Error("You have not recognized this user");
	}

	user.recognizedUsers = user.recognizedUsers.filter(
		(id) => id.toString() !== targetUserId
	);
	await user.save();

	res.json({ message: "Recognition revoked successfully" });
});

// @desc    Get user by ID
// @route   GET /api/users/profile/:userId
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.userId).select("-password");

	if (user) {
		res.json({
			_id: user._id,
			username: user.username,
			fullName: user.fullName,
			email: user.email,
			anonymousAlias: user.anonymousAlias,
			avatarEmoji: user.avatarEmoji,
			friends: user.friends,
			recognizedUsers: user.recognizedUsers,
			referralCode: user.referralCode,
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

// @desc    Update user's OneSignal player ID
// @route   POST /api/users/onesignal-player-id
// @access  Private
const updateOneSignalPlayerId = asyncHandler(async (req, res) => {
	const { playerId } = req.body;

	if (!playerId) {
		res.status(400);
		throw new Error("Player ID is required");
	}

	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			res.status(404);
			throw new Error("User not found");
		}

		user.oneSignalPlayerId = playerId;
		await user.save();

		console.log(`OneSignal player ID updated for user ${user._id}: ${playerId}`);

		res.json({
			message: "OneSignal player ID updated successfully",
			playerId: user.oneSignalPlayerId,
		});
	} catch (error) {
		console.error("Error updating OneSignal player ID:", error);
		res.status(500);
		throw new Error("Failed to update OneSignal player ID");
	}
});

module.exports = {
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
};
