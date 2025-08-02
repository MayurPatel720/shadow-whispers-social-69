
const { sendWhisper } = require("./sendWhisper");
const { getMyWhispers } = require("./getMyWhispers");
const { getWhisperConversation } = require("./getWhisperConversation");
const { markWhisperAsRead } = require("./markWhisperAsRead");
const { markConversationAsRead } = require("./markConversationAsRead");
const { deleteConversation } = require("./deleteConversation");
const { editWhisperMessage } = require("./editWhisperMessage");
const { deleteWhisperMessage } = require("./deleteWhisperMessage");

module.exports = {
	sendWhisper,
	getMyWhispers,
	getWhisperConversation,
	markWhisperAsRead,
	markConversationAsRead,
	deleteConversation,
	editWhisperMessage,
	deleteWhisperMessage,
};
