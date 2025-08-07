
// configs/socket.js
const { socketAuth } = require("../middleware/authMiddleware");
const asyncHandler = require("express-async-handler");
const { saveWhisper } = require("../controllers/whisperController");
const User = require("../models/userModel");

module.exports = (io) => {
	io.use(socketAuth);

	io.on("connection", async (socket) => {
		console.log(`User connected: ${socket.user._id}, Socket ID: ${socket.id}`);

		// Update user's online status and last seen
		try {
			await User.findByIdAndUpdate(socket.user._id, {
				isOnline: true,
				lastSeen: new Date()
			});
			
			// Emit to all users that this user is now online
			socket.broadcast.emit("userOnline", socket.user._id.toString());
		} catch (error) {
			console.error("Error updating user online status:", error);
		}

		// Join individual user room for notifications
		socket.on("join", (userId) => {
			if (userId !== socket.user._id.toString()) {
				console.warn(
					`Unauthorized join attempt by ${socket.user._id} for room ${userId}`
				);
				return;
			}
			socket.join(userId);
			socket.join(`user_${userId}`);
			console.log(`User ${userId} joined individual room ${userId} and user_${userId}`);
		});

		// Automatically join user to their own room
		socket.join(socket.user._id.toString());
		socket.join(`user_${socket.user._id.toString()}`);
		console.log(`User ${socket.user._id} auto-joined their room`);

		// Join conversation room for whispers
		socket.on("joinConversation", (partnerId) => {
			const room = [socket.user._id.toString(), partnerId].sort().join(":");
			const conversationRoom = `conversation_${[socket.user._id.toString(), partnerId].sort().join('_')}`;
			socket.join(room);
			socket.join(conversationRoom);
			console.log(`User ${socket.user._id} joined conversation room ${room} and ${conversationRoom}`);
		});

		// Handle sending whispers
		socket.on(
			"sendWhisper",
			asyncHandler(async ({ receiverId, content }, callback) => {
				try {
					console.log(`Whisper from ${socket.user._id} to ${receiverId}: ${content}`);
					
					const whisper = await saveWhisper({
						senderId: socket.user._id,
						receiverId,
						content,
						senderAlias: socket.user.anonymousAlias,
						senderEmoji: socket.user.avatarEmoji,
					});

					console.log(`Whisper saved successfully: ${whisper._id}`);

					// Emit to conversation room for real-time update
					const room = [socket.user._id.toString(), receiverId].sort().join(":");
					io.to(room).emit("receiveWhisper", whisper);
					console.log(`Whisper emitted to room: ${room}`);

					// Also emit to receiver's individual room
					io.to(receiverId).emit("receiveWhisper", whisper);
					console.log(`Whisper emitted to receiver: ${receiverId}`);

					if (callback && typeof callback === 'function') {
						callback({ status: "success", whisper });
					}
				} catch (error) {
					console.error(
						`Error sending whisper for user ${socket.user._id}:`,
						error.message
					);
					if (callback && typeof callback === 'function') {
						callback({ status: "error", message: error.message });
					}
				}
			})
		);

		socket.on("disconnect", async () => {
			console.log(`User disconnected: ${socket.user._id}, Socket ID: ${socket.id}`);
			
			// Update user's offline status and last seen
			try {
				const lastSeen = new Date();
				await User.findByIdAndUpdate(socket.user._id, {
					isOnline: false,
					lastSeen: lastSeen
				});
				
				// Emit to all users that this user is now offline
				socket.broadcast.emit("userOffline", {
					userId: socket.user._id.toString(),
					lastSeen: lastSeen.toISOString()
				});
			} catch (error) {
				console.error("Error updating user offline status:", error);
			}
		});
	});
};
