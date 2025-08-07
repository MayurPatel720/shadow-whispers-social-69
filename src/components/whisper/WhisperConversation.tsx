import React, { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Send, Loader, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { toast } from "@/hooks/use-toast";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import WhisperMessageList from "./WhisperMessageList";
import {
	getWhisperConversationPaginated,
	sendWhisper,
	markMessagesAsRead,
} from "@/lib/api-whispers";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";

interface WhisperConversationProps {
	partnerId: string;
	onBack: () => void;
}

const WhisperConversation: React.FC<WhisperConversationProps> = ({
	partnerId,
	onBack,
}) => {
	const { user } = useAuth();
	const isMobile = useIsMobile();
	const { socket } = useNotification();
	const queryClient = useQueryClient();
	const [newMessage, setNewMessage] = useState("");
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [allMessages, setAllMessages] = useState<any[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [partner, setPartner] = useState<any>(null);
	const [hasRecognized, setHasRecognized] = useState(false);
	const [isOnline, setIsOnline] = useState(false);
	const [lastSeen, setLastSeen] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [isFirstLoad, setIsFirstLoad] = useState(true);

	// Mark messages as read when conversation is opened
	const markAsReadMutation = useMutation({
		mutationFn: () => markMessagesAsRead(partnerId),
		onSuccess: () => {
			// Invalidate whispers list to update unread count
			queryClient.invalidateQueries({ queryKey: ["whispers"] });
		},
		onError: (error) => {
			console.error("Failed to mark messages as read:", error);
		},
	});

	// Mark messages as read when conversation opens
	useEffect(() => {
		if (partnerId && user) {
			markAsReadMutation.mutate();
		}
	}, [partnerId, user]);

	// Fetch initial conversation data
	const { data: conversationData, isLoading } = useQuery({
		queryKey: ["whisper-conversation", partnerId],
		queryFn: () =>
			getWhisperConversationPaginated({ userId: partnerId, limit: 20 }),
		enabled: !!partnerId,
		staleTime: 0, // Always fetch fresh data
	});

	useEffect(() => {
		if (conversationData && isFirstLoad) {
			// Store messages in chronological order (oldest first)
			const sortedMessages = [...(conversationData.messages || [])].sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			);
			setAllMessages(sortedMessages);
			setPartner(conversationData.partner);
			setHasRecognized(conversationData.hasRecognized);
			setHasMore(conversationData.hasMore);
			setIsFirstLoad(false);

			// Set initial online status and last seen from partner data
			if (conversationData.partner) {
				setIsOnline(conversationData.partner.isOnline || false);
				setLastSeen(conversationData.partner.lastSeen);
			}
		}
	}, [conversationData, isFirstLoad]);

	useEffect(() => {
		if (socket && user) {
			socket.emit("join", user._id);
		}
	}, [socket, user]);

	useEffect(() => {
		if (socket && partnerId) {
			socket.emit("joinConversation", partnerId);
		}
	}, [socket, partnerId]);

	// Socket listeners for real-time messages and online status
	useEffect(() => {
		if (!socket || !partnerId || !user) return;

		const handleReceiveWhisper = (whisper: any) => {
			console.log("🔔 Received whisper in conversation:", whisper);

			// Check if this whisper belongs to current conversation
			const isMyConversation =
				(whisper.sender === partnerId && whisper.receiver === user._id) ||
				(whisper.sender === user._id && whisper.receiver === partnerId);

			if (isMyConversation) {
				// Deduplicate messages by checking if message already exists
				setAllMessages((prev) => {
					const messageExists = prev.some((msg) => msg._id === whisper._id);
					if (messageExists) {
						return prev;
					}

					// Add new message at the end (newest messages at bottom)
					const newMessages = [...prev, whisper].sort(
						(a, b) =>
							new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
					return newMessages;
				});

				// Mark as read immediately if it's from the partner (not from me)
				if (whisper.sender === partnerId) {
					markAsReadMutation.mutate();
				}
			}
		};

		const handleWhisperMessageEdited = (editedMessage: any) => {
			setAllMessages((prev) =>
				prev.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg))
			);
		};

		const handleWhisperMessageDeleted = (deletedData: { _id: string }) => {
			setAllMessages((prev) =>
				prev.filter((msg) => msg._id !== deletedData._id)
			);
		};

		const handleUserOnline = (userId: string) => {
			if (userId === partnerId) {
				setIsOnline(true);
				setLastSeen(null);
			}
		};

		const handleUserOffline = (data: { userId: string; lastSeen: string }) => {
			if (data.userId === partnerId) {
				setIsOnline(false);
				setLastSeen(data.lastSeen);
			}
		};

		socket.on("receiveWhisper", handleReceiveWhisper);
		socket.on("whisperMessageEdited", handleWhisperMessageEdited);
		socket.on("whisperMessageDeleted", handleWhisperMessageDeleted);
		socket.on("userOnline", handleUserOnline);
		socket.on("userOffline", handleUserOffline);

		return () => {
			socket.off("receiveWhisper", handleReceiveWhisper);
			socket.off("whisperMessageEdited", handleWhisperMessageEdited);
			socket.off("whisperMessageDeleted", handleWhisperMessageDeleted);
			socket.off("userOnline", handleUserOnline);
			socket.off("userOffline", handleUserOffline);
		};
	}, [socket, partnerId, user, markAsReadMutation]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		if (allMessages.length > 0) {
			scrollToBottom();
		}
	}, [allMessages]);

	const loadMoreMessages = async () => {
		if (!hasMore || isLoadingMore) return;

		setIsLoadingMore(true);
		try {
			// Get the oldest message for pagination
			const oldestMessage = allMessages[0];
			const data = await getWhisperConversationPaginated({
				userId: partnerId,
				limit: 20,
				before: oldestMessage?._id,
			});

			// Add older messages at the beginning, maintain chronological order
			setAllMessages((prev) => {
				const newMessages = [...data.messages, ...prev].sort(
					(a, b) =>
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
				);
				return newMessages;
			});
			setHasMore(data.hasMore);
		} catch (error) {
			console.error("Failed to load more messages:", error);
			toast({
				variant: "destructive",
				title: "Error loading messages",
				description: "Could not load more messages. Please try again.",
			});
		} finally {
			setIsLoadingMore(false);
		}
	};

	const sendMessageMutation = useMutation({
		mutationFn: (content: string) => sendWhisper(partnerId, content),
		onSuccess: (data) => {
			setNewMessage("");
			queryClient.invalidateQueries({ queryKey: ["whispers"] });
			// Don't add the message here - let the socket handle it to prevent duplication
		},
		onError: (error: any) => {
			console.error("Send whisper error:", error);
			toast({
				variant: "destructive",
				title: "Failed to send message",
				description: "Could not send your message. Please try again.",
			});
		},
	});

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (newMessage.trim() && !sendMessageMutation.isPending) {
			sendMessageMutation.mutate(newMessage.trim());
		}
	};

	const getOnlineStatusText = () => {
		if (isOnline) {
			return "Online";
		} else if (lastSeen) {
			return `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
		}
		return "Offline";
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full bg-gradient-to-br from-background to-muted/20">
				<div className="text-center">
					<Loader className="h-8 w-8 animate-spin text-undercover-purple mx-auto mb-2" />
					<p className="text-sm text-muted-foreground">Loading conversation...</p>
				</div>
			</div>
		);
	}

	if (!partner) {
		return (
			<div className="flex justify-center items-center h-full bg-gradient-to-br from-background to-muted/20">
				<div className="text-center">
					<div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
						<MoreVertical className="h-6 w-6 text-muted-foreground" />
					</div>
					<p className="text-muted-foreground">Conversation not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/10 relative">
			{/* Enhanced Header */}
			<div className="relative p-4 border-b backdrop-blur-sm bg-card/95 sticky top-0 z-20 shadow-sm">
				<div className="flex items-center space-x-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={onBack}
						className="md:hidden hover:bg-muted/50 transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="relative">
						<AvatarGenerator
							emoji={partner.avatarEmoji || "🎭"}
							nickname={partner.anonymousAlias}
							color="#6E59A5"
							size="md"
						/>
						{/* Online status indicator */}
						<div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full ${
							isOnline ? 'bg-green-500' : 'bg-gray-400'
						}`}></div>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-undercover-light-purple truncate">
							{hasRecognized ? partner.username : partner.anonymousAlias}
						</h3>
						<p className="text-xs text-muted-foreground flex items-center space-x-1">
							<span className={`w-2 h-2 rounded-full ${
								isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
							}`}></span>
							<span>{getOnlineStatusText()}</span>
							{hasRecognized && (
								<span className="ml-2 text-undercover-purple">• Identity Revealed</span>
							)}
						</p>
					</div>
					<Button variant="ghost" size="sm" className="hover:bg-muted/50">
						<MoreVertical className="h-5 w-5" />
					</Button>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-hidden">
				<WhisperMessageList
					messages={allMessages}
					currentUserId={user?._id}
					onLoadMore={loadMoreMessages}
					isLoadingMore={isLoadingMore}
					hasMore={hasMore}
				/>
			</div>

			{/* Input Area - Fixed at bottom */}
			<div className="border-t bg-card/95 backdrop-blur-xl p-4 relative z-10">
				<form onSubmit={handleSendMessage} className="flex items-center space-x-3">
					<div className="flex-1 relative">
						<Input
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder="Type your whisper..."
							disabled={sendMessageMutation.isPending}
							className="
								resize-none transition-all duration-300 
								bg-muted/70 border-muted-foreground/30 
								focus:bg-background focus:border-undercover-purple/60
								hover:bg-muted/80 hover:border-muted-foreground/40
								rounded-full px-4 py-3 pr-12
								text-base h-12
								placeholder:text-muted-foreground/70
								shadow-lg focus:shadow-xl
								backdrop-blur-sm
							"
							maxLength={1000}
						/>
						{/* Character count for long messages */}
						{newMessage.length > 800 && (
							<div className="absolute -top-6 right-0 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
								{newMessage.length}/1000
							</div>
						)}
					</div>
					
					<Button
						type="submit"
						disabled={!newMessage.trim() || sendMessageMutation.isPending}
						className="
							bg-gradient-to-r from-undercover-purple to-undercover-deep-purple 
							hover:from-undercover-deep-purple hover:to-undercover-purple
							disabled:from-muted disabled:to-muted
							shadow-lg hover:shadow-xl transition-all duration-300 
							rounded-full min-w-[48px] h-12
							hover:scale-110 active:scale-95
							border border-white/20
						"
					>
						{sendMessageMutation.isPending ? (
							<Loader className="h-5 w-5 animate-spin" />
						) : (
							<Send className="h-5 w-5" />
						)}
					</Button>
				</form>
			</div>

			<div ref={messagesEndRef} />
		</div>
	);
};

export default WhisperConversation;
