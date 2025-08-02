
const asyncHandler = require("express-async-handler");
const Whisper = require("../../models/whisperModel");

const markConversationAsRead = asyncHandler(async (req, res) => {
	const partnerId = req.params.userId;
	const userId = req.user._id;
	
	try {
		// Mark all unread messages from the partner to the current user as read
		const result = await Whisper.updateMany(
			{
				sender: partnerId,
				receiver: userId,
				read: false
			},
			{
				$set: { read: true }
			}
		);

		console.log(`Marked ${result.modifiedCount} messages as read in conversation between ${userId} and ${partnerId}`);
		
		res.json({ 
			success: true, 
			modifiedCount: result.modifiedCount 
		});
	} catch (error) {
		console.error(`Error marking conversation as read for user ${userId} with partner ${partnerId}:`, error.message);
		throw error;
	}
});

module.exports = { markConversationAsRead };
