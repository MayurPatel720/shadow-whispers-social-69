/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getWhisperConversation,
	initSocket,
	markWhisperAsRead,
	sendWhisper,
	deleteConversation,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader, User, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WhisperConversationProps {
	partnerId: string;
	onBack: () => void;
}

interface Whisper {
	_id: string;
	sender: string;
	receiver: string;
	content: string;
	senderAlias: string;
	senderEmoji: string;
	read: boolean;
	createdAt: string;
	visibilityLevel: number;
}

const WhisperConversation: React.FC<WhisperConversationProps> = ({
	partnerId,
	onBack,
}) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Whisper[]>([]);
	const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
	const [editMessageContent, setEditMessageContent] = useState("");
	const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();
	const [socket, setSocket] = useState<Socket | null>(null);

	const {
		data: conversation,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["whisperConversation", partnerId],
		queryFn: () => getWhisperConversation(partnerId),
		enabled: !!partnerId && !!user,
	});

	const deleteConversationMutation = useMutation({
		mutationFn: () => deleteConversation(partnerId),
		onSuccess: () => {
			toast({
				title: "Conversation Deleted",
				description: "The conversation has been permanently deleted.",
			});
			queryClient.invalidateQueries({ queryKey: ["whispers"] });
			onBack();
		},
		onError: (error: any) => {
			console.error("Delete conversation error:", error);
			toast({
				variant: "destructive",
				title: "Failed to Delete",
				description: "Could not delete the conversation. Please try again.",
			});
		},
	});

	const { mutate: editWhisperMutate, isPending: isEditingMessage } = useMutation({
		mutationFn: async ({ messageId, content }: { messageId: string, content: string }) => {
			const res = await import("@/lib/api").then(mod => mod.editWhisper(messageId, content));
			return res;
		},
		onSuccess: (updatedWhisper) => {
			setMessages((prev) =>
				prev.map((msg) => (msg._id === updatedWhisper._id ? updatedWhisper : msg))
			);
			setEditingMessageId(null);
			toast({
				title: "Message Edited",
				description: "Your message was updated.",
			});
		},
		onError: (error: any) => {
			console.error("Failed to edit message:", error);
			toast({
				variant: "destructive",
				title: "Edit Failed",
				description: error?.message || "Could not update message.",
			});
		},
	});

	const { mutate: deleteMessageMutate, isPending: isDeletingMessage } = useMutation({
		mutationFn: async (messageId: string) => {
			const res = await import("@/lib/api").then(mod => mod.deleteWhisperMessage(messageId));
			return res;
		},
		onSuccess: (_resp, messageId) => {
			setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
			setDeleteMessageId(null);
			toast({
				title: "Message Deleted",
				description: "Your message was deleted.",
			});
		},
		onError: (error: any) => {
			console.error("Failed to delete message:", error);
			toast({
				variant: "destructive",
				title: "Delete Failed",
				description: error?.message || "Could not delete message.",
			});
		},
	});

	useEffect(() => {
		if (!user?._id) {
			toast({
				variant: "destructive",
				title: "Authentication Error",
				description: "Please log in to access messaging.",
			});
			return;
		}

		if (conversation?.messages) {
			setMessages(conversation.messages);
			// Mark unread messages as read
			const unreadMessages = conversation.messages.filter(
				(msg: Whisper) => msg.receiver === user._id && !msg.read
			);
			
			unreadMessages.forEach((msg: Whisper) => {
				markWhisperAsRead(msg._id).catch((error) => {
					console.error("Error marking whisper as read:", error);
				});
			});
		}

		const newSocket = initSocket();
		newSocket.on("connect", () => {
			console.log("Connected to WebSocket, ID:", newSocket.id);
			newSocket.emit("joinConversation", partnerId);
		});

		newSocket.on("connect_error", (err) => {
			console.error("Socket connection error:", err.message);
			toast({
				variant: "destructive",
				title: "Connection Error",
				description: "Failed to connect to messaging service.",
			});
		});

		newSocket.on("receiveWhisper", (whisper: Whisper) => {
			setMessages((prev) => [...prev, whisper]);
			queryClient.invalidateQueries({ queryKey: ["whispers"] });
			if (whisper.sender !== user._id) {
				markWhisperAsRead(whisper._id)
					.then(() => console.log(`Whisper ${whisper._id} marked as read`))
					.catch((error) => {
						console.error("Error marking whisper as read:", error);
					});
			}
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [conversation, partnerId, user?._id, queryClient]);

	const sendWhisperMutation = useMutation({
		mutationFn: async (content: string) => {
			if (!socket || !socket.connected) {
				console.warn("Socket not connected, using REST API fallback");
				const whisper = await sendWhisper(partnerId, content);
				return whisper;
			}
			return new Promise((resolve, reject) => {
				socket.emit(
					"sendWhisper",
					{ receiverId: partnerId, content },
					(response: {
						status: string;
						whisper?: Whisper;
						message?: string;
					}) => {
						if (response.status === "success" && response.whisper) {
							resolve(response.whisper);
						} else {
							reject(new Error(response.message || "Failed to send whisper"));
						}
					}
				);
			});
		},
		onSuccess: (whisper: Whisper) => {
			setMessage("");
			setMessages((prev) => [...prev, whisper]); // Update UI immediately
			queryClient.invalidateQueries({ queryKey: ["whispers"] });
			toast({
				title: "Message Sent",
				description: "Your whisper has been sent!",
			});
		},
		onError: (error: any) => {
			console.error("Send whisper error:", error);
			toast({
				variant: "destructive",
				title: "Failed to Send Message",
				description: error.message || "Please try again later.",
			});
		},
	});

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim()) {
			sendWhisperMutation.mutate(message);
		}
	};

	const handleStartEditMessage = (msg: Whisper) => {
		setEditingMessageId(msg._id);
		setEditMessageContent(msg.content);
	};

	const handleSaveEditMessage = (msg: Whisper) => {
		if (editMessageContent.trim() && msg._id) {
			editWhisperMutate({ messageId: msg._id, content: editMessageContent });
		}
	};

	const handleCancelEditMessage = () => {
		setEditingMessageId(null);
		setEditMessageContent("");
	};

	const handleDeleteMessage = (msg: Whisper) => {
		setDeleteMessageId(msg._id);
	};

	const confirmDeleteMessage = (msgId: string) => {
		deleteMessageMutate(msgId);
	};

	const formatTime = (timestamp: string) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const formatDate = (timestamp: string) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return "Today";
		} else if (date.toDateString() === yesterday.toDateString()) {
			return "Yesterday";
		} else {
			return date.toLocaleDateString();
		}
	};

	const handleAliasClick = (userId: string, alias: string) => {
		navigate(`/profile/${userId}`, { state: { anonymousAlias: alias } });
	};

	const groupMessagesByDate = (messages: Whisper[]) => {
		if (!messages || messages.length === 0) return [];

		const groups: { date: string | null; messages: Whisper[]; groupId: string }[] = [];
		let currentDate: string | null = null;
		let currentGroup: Whisper[] = [];

		messages.forEach((message) => {
			const messageDate = formatDate(message.createdAt);

			if (messageDate !== currentDate) {
				if (currentGroup.length > 0) {
					groups.push({
						date: currentDate,
						messages: currentGroup,
						groupId: `${currentDate}-${currentGroup[0]?._id}`,
					});
				}
				currentDate = messageDate;
				currentGroup = [message];
			} else {
				currentGroup.push(message);
			}
		});

		if (currentGroup.length > 0) {
			groups.push({
				date: currentDate,
				messages: currentGroup,
				groupId: `${currentDate}-${currentGroup[0]?._id}`,
			});
		}

		return groups;
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full">
				<Loader className="h-8 w-8 animate-spin text-purple-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-4">
				<p className="text-destructive mb-2">Failed to load conversation</p>
				<Button
					onClick={() =>
						queryClient.invalidateQueries({
							queryKey: ["whisperConversation", partnerId],
						})
					}
				>
					Try Again
				</Button>
			</div>
		);
	}

	if (!conversation) return null;

	const { partner, hasRecognized } = conversation;
	const messageGroups = groupMessagesByDate(messages);

	return (
		<div className="flex flex-col h-screen bg-undercover-dark text-white">
			{/* Header with delete option */}
			<div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-undercover-dark z-10">
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden mr-2 text-white"
						onClick={onBack}
					>
						<ArrowLeft />
					</Button>
					<div
						className="flex items-center space-x-3 cursor-pointer"
						onClick={() => handleAliasClick(partner._id, partner.anonymousAlias)}
					>
						<AvatarGenerator
							emoji={partner.avatarEmoji || "🎭"}
							nickname={partner.anonymousAlias}
							color="#6E59A5"
							size="md"
						/>
						<div>
							<h3 className="font-medium flex items-center text-white">
								{partner.anonymousAlias}
								{hasRecognized && partner.username && (
									<span className="ml-2 text-xs bg-undercover-purple/20 text-undercover-light-purple px-2 py-1 rounded-full flex items-center">
										<User size={12} className="mr-1" />@{partner.username}
									</span>
								)}
							</h3>
							<p className="text-xs text-gray-400">
								{hasRecognized ? "Identity revealed" : "Anonymous whispers"}
							</p>
						</div>
					</div>
				</div>

				<AlertDialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="text-white">
								<MoreVertical size={20} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-gray-800 border-gray-700">
							<AlertDialogTrigger asChild>
								<DropdownMenuItem className="text-red-400 focus:text-red-300 cursor-pointer">
									<Trash2 size={16} className="mr-2" />
									Delete Conversation
								</DropdownMenuItem>
							</AlertDialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>

					<AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Conversation</AlertDialogTitle>
							<AlertDialogDescription className="text-gray-400">
								This will permanently delete all messages with {partner.anonymousAlias}. 
								This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => deleteConversationMutation.mutate()}
								className="bg-red-600 hover:bg-red-700"
								disabled={deleteConversationMutation.isPending}
							>
								{deleteConversationMutation.isPending ? (
									<>
										<Loader className="h-4 w-4 animate-spin mr-2" />
										Deleting...
									</>
								) : (
									"Delete"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-undercover-dark">
				{messageGroups.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
						<p>Start a conversation by sending a message.</p>
					</div>
				) : (
					messageGroups.map((group) => (
						<div key={group.groupId} className="space-y-4">
							<div className="flex justify-center">
								<span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400">
									{group.date}
								</span>
							</div>

							{group.messages.map((msg) => {
								const isMe = msg.sender === user._id;
								const isBeingEdited = editingMessageId === msg._id;
								return (
									<div
										key={msg._id}
										className={`flex ${isMe ? "justify-end" : "justify-start"} relative`}
									>
										<div
											className={`
												max-w-[80%] 
												rounded-lg 
												p-3 
												${isMe ? "bg-undercover-purple text-white rounded-br-none" : "bg-gray-700 text-white rounded-bl-none"}
												flex flex-col`}
										>
											{isMe && isBeingEdited ? (
												<form
													className="flex flex-col"
													onSubmit={e => {
														e.preventDefault();
														handleSaveEditMessage(msg);
													}}
												>
													<input
														type="text"
														value={editMessageContent}
														className="bg-gray-800 text-white rounded p-1 mb-1 focus:outline-none"
														onChange={e => setEditMessageContent(e.target.value)}
														disabled={isEditingMessage}
														autoFocus
													/>
													<div className="flex gap-2">
														<Button
															size="sm"
															type="submit"
															disabled={isEditingMessage}
															className="bg-undercover-purple text-white"
														>
															Save
														</Button>
														<Button
															size="sm"
															variant="secondary"
															type="button"
															disabled={isEditingMessage}
															onClick={handleCancelEditMessage}
														>
															Cancel
														</Button>
													</div>
												</form>
											) : (
												<>
													<p className="break-words">{msg.content}</p>
													<div
														className={`
															w-full flex items-center gap-1 mt-1
															${isMe ? "justify-end" : "justify-start"}
														`}
													>
														<span className={`text-xs ${isMe ? "text-white/70" : "text-gray-400"}`}>
															{formatTime(msg.createdAt)}
															{isMe && msg.read && <span className="ml-1">✓</span>}
														</span>
														{/* Three dots message actions always visible for "me" */}
														{isMe && (
															<div className="ml-1 flex-shrink-0">
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<button
																			className="flex items-center justify-center p-1 rounded-full hover:bg-undercover-purple/20 transition outline-none focus:ring-2 focus:ring-undercover-purple"
																			aria-label="Message actions"
																			tabIndex={0}
																			type="button"
																		>
																			<MoreVertical className="w-4 h-4 text-white/70" />
																		</button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent
																		align="end"
																		className="z-40 bg-gray-900 border border-gray-800 min-w-[120px]"
																	>
																		<DropdownMenuItem
																			onClick={() => handleStartEditMessage(msg)}
																			disabled={isEditingMessage}
																			className="cursor-pointer"
																		>
																			Edit
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			onClick={() => handleDeleteMessage(msg)}
																			disabled={isDeletingMessage}
																			className="text-red-400 cursor-pointer"
																		>
																			Delete
																		</DropdownMenuItem>
																	</DropdownMenuContent>
																</DropdownMenu>
															</div>
														)}
													</div>
												</>
											)}
										</div>
										{/* Delete message alert dialog */}
										{isMe && deleteMessageId === msg._id && (
											<AlertDialog open={true} onOpenChange={open => !open && setDeleteMessageId(null)}>
												<AlertDialogTrigger asChild>
													<div />
												</AlertDialogTrigger>
												<AlertDialogContent className="bg-gray-800 text-white border-gray-700">
													<AlertDialogHeader>
														<AlertDialogTitle>Delete Message</AlertDialogTitle>
														<AlertDialogDescription>
															This message will be permanently deleted and cannot be undone.<br />
															Are you sure?
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel
															className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
															onClick={() => setDeleteMessageId(null)}
														>
															Cancel
														</AlertDialogCancel>
														<AlertDialogAction
															className="bg-red-600 hover:bg-red-700"
															onClick={() => confirmDeleteMessage(msg._id)}
															disabled={isDeletingMessage}
														>
															{isDeletingMessage ? (
																<Loader className="h-4 w-4 animate-spin mr-2" />
															) : null}
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										)}
									</div>
								);
							})}
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="p-3 bg-undercover-dark sticky bottom-16 z-20 flex items-center justify-between md:bottom-0">
				<form onSubmit={handleSendMessage} className="flex-1">
					<Input
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type a message..."
						className="w-full bg-gray-800 border-none text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-undercover-purple p-2 rounded-lg"
						disabled={sendWhisperMutation.isPending}
					/>
				</form>
				<Button
					type="submit"
					size="icon"
					disabled={!message.trim() || sendWhisperMutation.isPending}
					onClick={handleSendMessage}
					className="bg-undercover-purple hover:bg-undercover-deep-purple rounded-full w-12 h-12 ml-2 flex items-center justify-center"
				>
					{sendWhisperMutation.isPending ? (
						<Loader className="h-5 w-5 animate-spin text-white" />
					) : (
						<Send size={16} className="text-white" />
					)}
				</Button>
			</div>
		</div>
	);
};

export default WhisperConversation;
