
const asyncHandler = require("express-async-handler");
const Whisper = require("../../models/whisperModel");
const User = require("../../models/userModel"); // <-- fixed import

const getWhisperConversation = asyncHandler(async (req, res) => {
	const partnerId = req.params.userId;
	try {
		const partnerExists = await User.findById(partnerId);
		if (!partnerExists) {
			console.error(`Partner not found for ID: ${partnerId}`);
			res.status(404);
			throw new Error("User not found");
		}
		const messages = await Whisper.find({
			$or: [
				{ sender: req.user._id, receiver: partnerId },
				{ sender: partnerId, receiver: req.user._id },
			],
		}).sort({ createdAt: 1 });

		const hasRecognized = req.user.recognizedUsers.some(
			(ru) => ru && ru.toString() === partnerId
		);

		let partnerInfo = {
			_id: partnerExists._id,
			anonymousAlias: partnerExists.anonymousAlias,
			avatarEmoji: partnerExists.avatarEmoji,
		};

		if (hasRecognized) {
			partnerInfo.username = partnerExists.username;
		}

		res.json({
			messages,
			partner: partnerInfo,
			hasRecognized,
		});
	} catch (error) {
		console.error(
			`Error fetching conversation with ${partnerId}:`,
			error.message
		);
		throw error;
	}
});
module.exports = { getWhisperConversation };
