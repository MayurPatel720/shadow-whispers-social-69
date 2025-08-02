
import React, { useState, useEffect } from "react";
import { Bell, BellDot, Check, CheckCheck, X, MessageCircle, Heart, User, AlertCircle, RefreshCw, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useNotification } from "@/context/NotificationContext";
import { 
  getNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  type Notification 
} from "@/lib/api-notifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount, refreshUnreadCount } = useNotification();

  // Fetch notifications and sync unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📡 Fetching notifications...");
      
      const notifData = await getNotifications({ limit: 20 });
      console.log("📨 Received notifications response:", notifData);
      
      if (notifData && typeof notifData === 'object') {
        const notificationsList = notifData.notifications || [];
        const apiUnreadCount = notifData.unreadCount || 0;
        
        console.log("📋 Notifications list:", notificationsList);
        console.log("🔢 API unread count:", apiUnreadCount);
        console.log("🔢 Socket unread count:", unreadCount);
        
        setNotifications(notificationsList);
        
        // Show detailed debug info if there's a mismatch
        if (apiUnreadCount !== unreadCount) {
          console.warn(`⚠️ COUNT MISMATCH DETECTED:`);
          console.warn(`   Socket count: ${unreadCount} (real-time)`);
          console.warn(`   API count: ${apiUnreadCount} (database)`);
          console.warn(`   Notifications returned: ${notificationsList.length}`);
          console.warn(`   Unread notifications: ${notificationsList.filter(n => !n.read).length}`);
          
          // If API has 0 but socket has >0, this suggests database save issue
          if (apiUnreadCount === 0 && unreadCount > 0) {
            console.error(`❌ BACKEND ISSUE: Socket notifications not being saved to database!`);
            console.error(`   This means notifications are being sent via socket but not persisted.`);
            console.error(`   Check backend notification service and database writes.`);
          }
          
          // Sync to API count since it's the source of truth for persisted notifications
          setUnreadCount(apiUnreadCount);
        }
        
        // Additional debugging for empty notifications with positive count
        if (apiUnreadCount > 0 && notificationsList.length === 0) {
          console.warn("🔍 Fetching separate unread count to verify database state...");
          try {
            const countData = await getUnreadCount();
            console.log("🔍 Direct count API result:", countData);
          } catch (countError) {
            console.error("❌ Error fetching direct count:", countError);
          }
        }
        
      } else {
        console.warn("⚠️ Invalid API response format:", notifData);
        setNotifications([]);
        setError("Invalid response format");
      }
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      setError(error.message || "Failed to load notifications");
      setNotifications([]);
      
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if unread
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'whisper':
          if (notification.data?.senderId) {
            navigate(`/whispers?userId=${notification.data.senderId}`);
          } else {
            navigate('/whispers');
          }
          break;
        case 'comment':
        case 'like':
          if (notification.data?.postId) {
            navigate(`/post/${notification.data.postId}`);
          }
          break;
        default:
          // General notifications don't navigate anywhere
          break;
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive"
      });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      const wasUnread = notifications.find(n => n._id === notificationId && !n.read);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({
        title: "Success",
        description: "Notification deleted"
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  };

  // Force refresh notifications and count
  const handleForceRefresh = async () => {
    console.log("🔄 Force refreshing notifications...");
    await refreshUnreadCount();
    await fetchNotifications();
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'whisper':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Check if there's a significant database/socket mismatch
  const hasCountMismatch = unreadCount > 0 && notifications.length === 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <BellDot className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium min-w-[1.25rem]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 max-w-[calc(100vw-1rem)] p-0 mx-2 sm:mx-0 bg-background border shadow-lg z-50" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 px-4 pt-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleForceRefresh}
                  className="h-8 w-8 p-0 hover:bg-muted rounded-md"
                  title="Refresh notifications"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-8 px-3 hover:bg-muted rounded-md"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            
            {/* Debug info for count mismatch */}
            {hasCountMismatch && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                <div className="flex items-center gap-2 text-orange-700 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Database Sync Issue Detected
                </div>
                <div className="text-orange-600 mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Socket notifications: {unreadCount}
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    Database notifications: {notifications.length}
                  </div>
                  <p className="text-xs">Notifications are being received but not saved to database.</p>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-80 max-h-[60vh]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium mb-1">Error loading notifications</p>
                  <p className="text-xs opacity-75 text-center">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => fetchNotifications()}
                    className="mt-2"
                  >
                    Try again
                  </Button>
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-muted-foreground">
                  <Bell className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">No notifications yet</p>
                  <p className="text-xs opacity-75 text-center">You'll see updates here when they arrive</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification, index) => (
                    <div key={notification._id} className="group">
                      <div
                        className={`p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 active:bg-muted/70 relative ${
                          !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-5">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity"
                                  onClick={(e) => handleDeleteNotification(e, notification._id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/75 mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
