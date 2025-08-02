
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { initSocket } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";
import { Socket } from "socket.io-client";
import { getUnreadCount } from "@/lib/api-notifications";

interface NotificationContextType {
  socket: Socket | null;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(new Set());
  const { isAuthenticated, user } = useAuth();
  
  // Use ref to track processed messages across re-renders
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // Function to refresh unread count from server
  const refreshUnreadCount = async () => {
    if (isAuthenticated && user) {
      try {
        console.log("🔄 Refreshing unread count...");
        const countData = await getUnreadCount();
        console.log("📊 Received unread count:", countData);
        const serverCount = countData.unreadCount || 0;
        
        // Only update if there's a significant difference
        setUnreadCount(prev => {
          if (prev !== serverCount) {
            console.log(`🔄 Syncing count: ${prev} → ${serverCount}`);
            return serverCount;
          }
          return prev;
        });
      } catch (error) {
        console.error('❌ Error fetching unread count:', error);
      }
    }
  };

  // Initialize socket and fetch initial unread count
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        console.log("🔌 Initializing socket connection...");
        const socketInstance = initSocket();
        setSocket(socketInstance);

        // Clear processed messages when reconnecting
        setProcessedMessageIds(new Set());
        processedMessagesRef.current = new Set();

        // Join user's notification room
        socketInstance.emit("join", user._id);
        console.log("👤 Joined user room:", user._id);

        // Fetch initial unread count
        refreshUnreadCount();

        // Listen for new notifications (database notifications)
        socketInstance.on("newNotification", (notification) => {
          console.log("🔔 New notification received:", notification);
          
          // Check for duplicates using notification ID
          const notificationId = notification.id || notification._id || `notification-${Date.now()}`;
          
          if (processedMessagesRef.current.has(notificationId)) {
            console.log("🔄 Skipping duplicate notification:", notificationId);
            return;
          }
          
          processedMessagesRef.current.add(notificationId);
          setProcessedMessageIds(prev => new Set([...prev, notificationId]));
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            duration: 4000,
          });

          // Update unread count
          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log("📈 Updated unread count from", prev, "to", newCount, "(notification)");
            return newCount;
          });
        });

        // Listen for whisper notifications (real-time chat updates)
        socketInstance.on("receiveWhisper", (whisper) => {
          console.log("💬 New whisper received:", whisper);
          console.log("Current user:", user._id);
          console.log("Whisper sender:", whisper.sender);
          console.log("Whisper receiver:", whisper.receiver);
          
          // Only show notification if this whisper is TO me (not from me)
          if (whisper.receiver === user._id && whisper.sender !== user._id) {
            // Use whisper _id for deduplication
            const whisperId = whisper._id || `whisper-${whisper.sender}-${whisper.createdAt}`;
            
            if (processedMessagesRef.current.has(whisperId)) {
              console.log("🔄 Skipping duplicate whisper notification:", whisperId);
              return;
            }
            
            processedMessagesRef.current.add(whisperId);
            setProcessedMessageIds(prev => new Set([...prev, whisperId]));
            
            console.log("✅ Showing whisper notification for incoming message");
            console.log("🗂️ Total processed messages:", processedMessagesRef.current.size);
            
            // Show toast for whisper
            toast({
              title: `New message from ${whisper.senderAlias}`,
              description: whisper.content.length > 50 
                ? `${whisper.content.substring(0, 47)}...` 
                : whisper.content,
              duration: 4000,
            });

            // Don't increment count for whispers - they should be handled by database notifications
            console.log("ℹ️ Whisper toast shown, but not incrementing count (handled by database notification)");
          } else {
            console.log("🔕 Skipping notification for own message or irrelevant whisper");
          }
        });

        // Listen for comment notifications
        socketInstance.on("newComment", (data) => {
          console.log("💬 New comment notification:", data);
          
          // Check for duplicates
          const commentId = data.id || `comment-${data.commenterId}-${Date.now()}`;
          if (processedMessagesRef.current.has(commentId)) {
            console.log("🔄 Skipping duplicate comment notification:", commentId);
            return;
          }
          
          processedMessagesRef.current.add(commentId);
          setProcessedMessageIds(prev => new Set([...prev, commentId]));
          
          toast({
            title: "New Comment",
            description: `${data.commenterAlias} commented on your post`,
            duration: 4000,
          });

          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log("📈 Updated unread count from", prev, "to", newCount, "(comment)");
            return newCount;
          });
        });

        // Listen for reply notifications
        socketInstance.on("newReply", (data) => {
          console.log("↩️ New reply notification:", data);
          
          // Check for duplicates
          const replyId = data.id || `reply-${data.replierId}-${Date.now()}`;
          if (processedMessagesRef.current.has(replyId)) {
            console.log("🔄 Skipping duplicate reply notification:", replyId);
            return;
          }
          
          processedMessagesRef.current.add(replyId);
          setProcessedMessageIds(prev => new Set([...prev, replyId]));
          
          toast({
            title: "New Reply",
            description: `${data.replierAlias} replied to your comment`,
            duration: 4000,
          });

          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log("📈 Updated unread count from", prev, "to", newCount, "(reply)");
            return newCount;
          });
        });

        // Listen for like summary notifications
        socketInstance.on("likesSummary", (data) => {
          console.log("❤️ Likes summary notification:", data);
          
          // Check for duplicates
          const likesId = data.id || `likes-${data.likeCount}-${Date.now()}`;
          if (processedMessagesRef.current.has(likesId)) {
            console.log("🔄 Skipping duplicate likes notification:", likesId);
            return;
          }
          
          processedMessagesRef.current.add(likesId);
          setProcessedMessageIds(prev => new Set([...prev, likesId]));
          
          const likeText = data.likeCount === 1 ? 'like' : 'likes';
          const postText = data.postCount === 1 ? 'post' : 'posts';
          
          toast({
            title: "Your posts got new likes!",
            description: `You received ${data.likeCount} new ${likeText} on ${data.postCount} ${postText}`,
            duration: 5000,
          });

          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log("📈 Updated unread count from", prev, "to", newCount, "(likes)");
            return newCount;
          });
        });

        console.log("✅ Socket connection initialized with all listeners");

        return () => {
          console.log("🔌 Disconnecting socket...");
          socketInstance.disconnect();
          setProcessedMessageIds(new Set());
          processedMessagesRef.current = new Set();
        };
      } catch (error) {
        console.error("❌ Socket initialization error:", error);
      }
    } else {
      // Disconnect socket if user logs out
      if (socket) {
        console.log("🔌 Disconnecting socket (user logged out)...");
        socket.disconnect();
        setSocket(null);
        setUnreadCount(0);
        setProcessedMessageIds(new Set());
        processedMessagesRef.current = new Set();
      }
    }
  }, [isAuthenticated, user]);

  return (
    <NotificationContext.Provider value={{ 
      socket, 
      unreadCount, 
      setUnreadCount, 
      refreshUnreadCount 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
