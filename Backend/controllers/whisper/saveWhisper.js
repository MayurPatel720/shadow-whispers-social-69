
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

		console.log(`💾 Saving whisper from ${senderId} to ${receiverId}`);
		const whisper = await Whisper.create({
			sender: senderId,
			receiver: receiverId,
			content,
			senderAlias,
			senderEmoji,
			read: false,
			visibilityLevel,
		});

		console.log(`✅ Whisper saved with ID: ${whisper._id}`);

		// Send comprehensive notification (database + push + socket)
		try {
			console.log(`🔔 Attempting to send whisper notification...`);
			const notificationResult = await sendWhisperNotification({
				senderId,
				receiverId,
				content,
				senderAlias,
				io: global.io
			});
			console.log(`✅ Whisper notification sent successfully:`, notificationResult._id);
		} catch (notificationError) {
			console.error('❌ Failed to send whisper notification:', notificationError);
			console.error('❌ Notification error stack:', notificationError.stack);
			// Don't fail the whisper save if notification fails
		}

		// Emit socket events for real-time updates (separate from notification)
		if (global.io) {
			// Emit to the receiver
			global.io.to(`user_${receiverId}`).emit('receiveWhisper', whisper);
			
			// Emit to the conversation room for both users
			const conversationRoom = `conversation_${[senderId, receiverId].sort().join('_')}`;
			global.io.to(conversationRoom).emit('receiveWhisper', whisper);
			
			console.log(`🔌 Socket events emitted for whisper ${whisper._id}`);
		}

		return whisper;
	} catch (error) {
		console.error(
			`❌ Error saving whisper from ${senderId} to ${receiverId}:`,
			error.message
		);
		console.error('❌ Full whisper save error:', error.stack);
		throw error;
	}
};

module.exports = { saveWhisper };
