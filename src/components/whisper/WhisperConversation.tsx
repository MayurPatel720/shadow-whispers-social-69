
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader, ArrowLeft, Send, MoreVertical, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getWhisperConversationPaginated, sendWhisper, editWhisper, deleteWhisperMessage } from "@/lib/api";
import { format } from "date-fns";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;

const WhisperConversation = ({ partnerId, onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [hasRecognized, setHasRecognized] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchingFirstPage, setFetchingFirstPage] = useState(true);
  const [oldestMsgId, setOldestMsgId] = useState<string | null>(null);

  const fetchFirstPage = React.useCallback(async () => {
    setFetchingFirstPage(true);
    try {
      const res = await getWhisperConversationPaginated({ userId: partnerId, limit: PAGE_SIZE });
      setMessages(res.messages.reverse());
      setOldestMsgId(res.messages.length > 0 ? res.messages[0]._id : null);
      setHasMore(res.hasMore);
      setPartnerInfo(res.partner);
      setHasRecognized(res.hasRecognized);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to load conversation",
        description: "Please try again later",
      });
    }
    setFetchingFirstPage(false);
  }, [partnerId]);

  const loadOlderMessages = async () => {
    if (!hasMore || loadingMore || !oldestMsgId) return;
    setLoadingMore(true);
    try {
      const res = await getWhisperConversationPaginated({ userId: partnerId, limit: PAGE_SIZE, before: oldestMsgId });
      const olderMessages = res.messages.reverse();
      setMessages((prev) => [...olderMessages, ...prev]);
      setOldestMsgId(olderMessages.length > 0 ? olderMessages[0]._id : oldestMsgId);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    try {
      const response = await sendWhisper(partnerId, content);
      setMessages((prev) => [...prev, response]);
      setContent("");
      // Invalidate whispers list to update last message
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Please try again",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editContent.trim()) return;

    try {
      await editWhisper(editingMessage._id, editContent);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === editingMessage._id
            ? { ...msg, content: editContent, edited: true }
            : msg
        )
      );
      setEditingMessage(null);
      setEditContent("");
      // Invalidate whispers list to update last message if needed
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to edit message",
        description: error.message || "Please try again",
      });
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteWhisperMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      // Invalidate whispers list to update last message
      queryClient.invalidateQueries({ queryKey: ["whispers"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete message",
        description: error.message || "Please try again",
      });
    }
  };

  const startEditing = (message) => {
    setEditingMessage(message);
    setEditContent(message.content);
    // Focus the textarea after setting state
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), "h:mm a");
  };

  const viewProfile = () => {
    if (partnerInfo) {
      navigate(`/profile/${partnerInfo._id}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-3 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center flex-1">
          <div className="mr-3">
            <AvatarGenerator
              emoji={partnerInfo?.avatarEmoji || "👤"}
              nickname={partnerInfo?.anonymousAlias || partnerInfo?.username || "User"}
              size="md"
            />
          </div>
          <div>
            <h3 className="font-medium">
              {hasRecognized && partnerInfo?.username
                ? partnerInfo.username
                : partnerInfo?.anonymousAlias || "Loading..."}
            </h3>
            {hasRecognized && (
              <p className="text-xs text-muted-foreground">
                {partnerInfo?.anonymousAlias}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={viewProfile}>
              View Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col-reverse px-2 sm:px-6 py-4">
        {/* Message list with "Load older" */}
        {hasMore && (
          <div className="flex justify-center mb-2">
            <Button
              size="sm"
              variant="outline"
              disabled={loadingMore}
              onClick={loadOlderMessages}
            >
              {loadingMore ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Load older
            </Button>
          </div>
        )}
        {fetchingFirstPage ? (
          <div className="flex justify-center my-8">
            <Loader className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {messages.map((message) => {
              const isOwnMessage = message.sender === user?._id;
              const isEditing = editingMessage?._id === message._id;

              return (
                <div
                  key={message._id}
                  className={cn(
                    "flex",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2",
                      isOwnMessage
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          ref={textareaRef}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px] bg-background text-foreground"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditing}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleEditMessage}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="break-words">{message.content}</p>
                        <div
                          className={cn(
                            "text-xs mt-1 flex justify-between items-center",
                            isOwnMessage
                              ? "text-white/70"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>
                            {formatMessageTime(message.createdAt)}
                            {message.edited && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </span>
                          {isOwnMessage && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                                    isOwnMessage
                                      ? "hover:bg-purple-700 text-white/70"
                                      : "hover:bg-muted-foreground/10"
                                  )}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => startEditing(message)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteMessage(message._id)
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-3 border-t bg-card">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!content.trim() || isSending}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WhisperConversation;
