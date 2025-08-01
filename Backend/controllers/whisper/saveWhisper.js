const User = require("../../models/userModel");
const Whisper = require("../../models/whisperModel");
const { sendWhisperNotification } = require('../../utils/notificationService');

const saveWhisper = async ({
	senderId,
	receiverId,
	content,
	senderAlias,
	senderEmoji,
}) => {
	try {
		const receiver = await User.findById(receiverId);
		if (!receiver) {
			console.error(`Receiver not found for ID: ${receiverId}`);
			throw new Error("Receiver not found");
		}

		const messageCount = await Whisper.countDocuments({
			$or: [
				{ sender: senderId, receiver: receiverId },
				{ sender: receiverId, receiver: senderId },
			],
		});

		const visibilityLevel = Math.min(3, Math.floor(messageCount / 10));

		const whisper = await Whisper.create({
			sender: senderId,
			receiver: receiverId,
			content,
			senderAlias,
			senderEmoji,
			read: false,
			visibilityLevel,
		});

		// Send comprehensive notification (database + push + socket)
		try {
			await sendWhisperNotification({
				senderId,
				receiverId,
				content,
				senderAlias,
				io: global.io
			});
			console.log(`✅ Whisper notification sent from ${senderId} to ${receiverId}`);
		} catch (notificationError) {
			console.error('❌ Failed to send whisper notification:', notificationError);
		}

		// Emit socket events for real-time updates
		if (global.io) {
			// Emit to the receiver
			global.io.to(`user_${receiverId}`).emit('receiveWhisper', whisper);
			
			// Emit to the conversation room for both users
			const conversationRoom = `conversation_${[senderId, receiverId].sort().join('_')}`;
			global.io.to(conversationRoom).emit('receiveWhisper', whisper);
		}

		return whisper;
	} catch (error) {
		console.error(
			`Error saving whisper from ${senderId} to ${receiverId}:`,
			error.message
		);
		throw error;
	}
};

module.exports = { saveWhisper };
