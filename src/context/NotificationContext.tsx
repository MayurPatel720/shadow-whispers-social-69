
import React, { createContext, useContext, useEffect, useState } from "react";
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
  const { isAuthenticated, user } = useAuth();

  // Function to refresh unread count from server
  const refreshUnreadCount = async () => {
    if (isAuthenticated && user) {
      try {
        const countData = await getUnreadCount();
        setUnreadCount(countData.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count:', error);
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

        // Join user's notification room
        socketInstance.emit("join", user._id);

        // Fetch initial unread count
        refreshUnreadCount();

        // Listen for new notifications
        socketInstance.on("newNotification", (notification) => {
          console.log("🔔 New notification received:", notification);
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            duration: 4000,
          });

          // Update unread count
          setUnreadCount(prev => prev + 1);
        });

        // Listen for whisper notifications (only for messages from others)
        socketInstance.on("receiveWhisper", (whisper) => {
          console.log("💬 New whisper received:", whisper);
          console.log("Current user:", user._id);
          console.log("Whisper sender:", whisper.sender);
          
          // Only show notification if this whisper is TO me (not from me)
          if (whisper.receiver === user._id && whisper.sender !== user._id) {
            console.log("✅ Showing whisper notification for incoming message");
            
            // Show toast for whisper
            toast({
              title: `New message from ${whisper.senderAlias}`,
              description: whisper.content.length > 50 
                ? `${whisper.content.substring(0, 47)}...` 
                : whisper.content,
              duration: 4000,
            });

            // Update unread count
            setUnreadCount(prev => prev + 1);
          } else {
            console.log("🔕 Skipping notification for own message or irrelevant whisper");
          }
        });

        // Listen for comment notifications
        socketInstance.on("newComment", (data) => {
          console.log("💬 New comment notification:", data);
          
          toast({
            title: "New Comment",
            description: `${data.commenterAlias} commented on your post`,
            duration: 4000,
          });

          setUnreadCount(prev => prev + 1);
        });

        // Listen for reply notifications
        socketInstance.on("newReply", (data) => {
          console.log("↩️ New reply notification:", data);
          
          toast({
            title: "New Reply",
            description: `${data.replierAlias} replied to your comment`,
            duration: 4000,
          });

          setUnreadCount(prev => prev + 1);
        });

        // Listen for like summary notifications
        socketInstance.on("likesSummary", (data) => {
          console.log("❤️ Likes summary notification:", data);
          
          const likeText = data.likeCount === 1 ? 'like' : 'likes';
          const postText = data.postCount === 1 ? 'post' : 'posts';
          
          toast({
            title: "Your posts got new likes!",
            description: `You received ${data.likeCount} new ${likeText} on ${data.postCount} ${postText}`,
            duration: 5000,
          });

          setUnreadCount(prev => prev + 1);
        });

        console.log("✅ Socket connection initialized");

        return () => {
          console.log("🔌 Disconnecting socket...");
          socketInstance.disconnect();
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
