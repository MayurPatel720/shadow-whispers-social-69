
const asyncHandler = require("express-async-handler");
const Whisper = require("../../models/whisperModel");

const editWhisperMessage = asyncHandler(async (req, res) => {
	const messageId = req.params.messageId;
	const content = req.body.content;
	const userId = req.user._id;

	if (!content || typeof content !== "string" || !content.trim()) {
		res.status(400);
		throw new Error("New message content required.");
	}

	const whisper = await Whisper.findById(messageId);
	if (!whisper) {
		res.status(404);
		throw new Error("Message not found.");
	}

	// Only sender can edit
	if (whisper.sender.toString() !== userId.toString()) {
		res.status(403);
		throw new Error("You are not authorized to edit this message.");
	}

	whisper.content = content;
	await whisper.save();

	// Emit real-time update
	if (global.io) {
		const room = [whisper.sender.toString(), whisper.receiver.toString()].sort().join(":");
		global.io.to(room).emit("whisperMessageEdited", whisper);
	}
	res.json(whisper);
});
module.exports = { editWhisperMessage };
