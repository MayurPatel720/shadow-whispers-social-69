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
import { getWhisperConversationPaginated, sendWhisper, markMessagesAsRead } from "@/lib/api-whispers";

interface WhisperConversationProps {
  partnerId: string;
  onBack: () => void;
}

const WhisperConversation: React.FC<WhisperConversationProps> = ({
  partnerId,
  onBack,
}) => {
  const { user } = useAuth();
  const { socket } = useNotification();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [partner, setPartner] = useState<any>(null);
  const [hasRecognized, setHasRecognized] = useState(false);
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
    }
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
    queryFn: () => getWhisperConversationPaginated({ userId: partnerId, limit: 20 }),
    enabled: !!partnerId,
    staleTime: 0, // Always fetch fresh data
  });

  useEffect(() => {
    if (conversationData) {
      setAllMessages(conversationData.messages || []);
      setPartner(conversationData.partner);
      setHasRecognized(conversationData.hasRecognized);
      setHasMore(conversationData.hasMore);
    }
  }, [conversationData]);

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

  useEffect(() => {
    if (conversationData && isFirstLoad) {
      setAllMessages(conversationData.messages || []);
      setPartner(conversationData.partner);
      setHasRecognized(conversationData.hasRecognized);
      setHasMore(conversationData.hasMore);
      setIsFirstLoad(false);
    }
  }, [conversationData, isFirstLoad]);

  // Socket listeners for real-time messages
  useEffect(() => {
    if (!socket || !partnerId) return;

    const conversationRoom = `conversation_${[user?._id, partnerId].sort().join('_')}`;
    socket.emit("joinConversation", partnerId);

    const handleReceiveWhisper = (whisper: any) => {
      console.log("🔔 Received whisper in conversation:", whisper);
      console.log("Current user ID:", user?._id);
      console.log("Partner ID:", partnerId);
      console.log("Whisper sender:", whisper.sender);
      console.log("Whisper receiver:", whisper.receiver);
      
      // Check if this whisper belongs to current conversation
      const isMyConversation = (whisper.sender === partnerId && whisper.receiver === user?._id) ||
                              (whisper.sender === user?._id && whisper.receiver === partnerId);
      
      if (isMyConversation) {
        setAllMessages(prev => [whisper, ...prev]);
        
        // Mark as read immediately if it's from the partner (not from me)
        if (whisper.sender === partnerId) {
          markAsReadMutation.mutate();
        }
      }
    };

    socket.on("receiveWhisper", handleReceiveWhisper);

    return () => {
      socket.off("receiveWhisper", handleReceiveWhisper);
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
      const oldestMessage = allMessages[allMessages.length - 1];
      const data = await getWhisperConversationPaginated({
        userId: partnerId,
        limit: 20,
        before: oldestMessage?._id
      });
      
      setAllMessages(prev => [...prev, ...data.messages]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Failed to load more messages:", error);
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: "Could not load more messages. Please try again."
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
      // Don't emit socket event here - the backend will handle it
      // The message will come back through the socket listener
    },
    onError: (error: any) => {
      console.error("Send whisper error:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Could not send your message. Please try again."
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center space-x-3 bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AvatarGenerator
          emoji={partner.avatarEmoji || "🎭"}
          nickname={partner.anonymousAlias}
          color="#6E59A5"
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-undercover-light-purple truncate">
            {hasRecognized ? partner.username : partner.anonymousAlias}
          </h3>
          <p className="text-sm text-muted-foreground">
            {hasRecognized ? "Identity Revealed" : "Anonymous"}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <WhisperMessageList
        messages={allMessages}
        currentUserId={user?._id}
        onLoadMore={loadMoreMessages}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
      />

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your whisper..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-undercover-purple hover:bg-undercover-deep-purple"
          >
            {sendMessageMutation.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default WhisperConversation;
