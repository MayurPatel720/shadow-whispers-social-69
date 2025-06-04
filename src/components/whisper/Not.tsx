
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { initSocket } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";

const NotificationButton: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userId = user?._id;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (!userId) return;

    const checkNotificationSupport = async () => {
      // Check push notification support
      const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsPushSupported(pushSupported);

      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }

      // Check if already subscribed
      if (pushSupported && Notification.permission === 'granted') {
        const subscribed = await notificationService.checkSubscription();
        setIsSubscribed(subscribed);
      }
    };

    checkNotificationSupport();

    // Initialize socket for fallback notifications
    const socket = initSocket();

    socket.on("connect", () => {
      console.log("Socket connected for notifications:", socket.id);
      socket.emit("join", userId);
    });

    socket.on("notification", ({ title, body }: { title: string; body: string }) => {
      console.log("Received socket notification:", { title, body });
      
      // Only show toast if push notifications are not available or permission denied
      if (!isPushSupported || permissionStatus !== 'granted') {
        toast({
          title,
          description: body,
          duration: 5000,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, toast, isPushSupported, permissionStatus]);

  const handleEnableNotifications = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to enable notifications.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permission = await notificationService.requestNotificationPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        if (isPushSupported) {
          // Subscribe to push notifications
          const subscription = await notificationService.subscribeToPush(userId);
          if (subscription) {
            setIsSubscribed(true);
            toast({
              title: "Push Notifications Enabled! 🔔",
              description: "You'll now receive browser notifications even when the app is closed.",
            });
          } else {
            toast({
              title: "Notifications Enabled",
              description: "You'll receive in-app notifications.",
            });
          }
        } else {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive in-app notifications.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: isMobile 
            ? "Go to browser settings > Site settings > Notifications to enable."
            : "Please allow notifications in your browser settings.",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to test notifications.",
      });
      return;
    }

    if (permissionStatus !== 'granted') {
      toast({
        variant: "destructive",
        title: "Permission Required",
        description: "Please enable notifications first.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await notificationService.sendTestNotification(
        userId,
        "Test Browser Notification",
        "This is a real browser push notification! 🚀"
      );
      
      toast({
        title: "Test Notification Sent",
        description: "Check if you received the browser notification!",
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test notification.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {permissionStatus !== 'granted' && (
        <div className="space-y-2">
          <Button 
            onClick={handleEnableNotifications} 
            variant="outline"
            disabled={isLoading}
            className="w-full text-sm bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                Enabling...
              </>
            ) : (
              'Enable Browser Notifications'
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            {isMobile 
              ? "Enable push notifications to get alerts even when the app is closed."
              : "Enable notifications to get real-time browser alerts."
            }
          </p>
        </div>
      )}
      
      {permissionStatus === 'granted' && (
        <Button 
          onClick={handleTestNotification} 
          variant="outline"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent mr-2" />
              Sending...
            </>
          ) : (
            'Test Browser Notification'
          )}
        </Button>
      )}
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Status: {permissionStatus === 'granted' ? '✅ Enabled' : '❌ Disabled'}</p>
        {isPushSupported && <p>Push: {isSubscribed ? '✅ Subscribed' : '⏳ Available'}</p>}
        <p>Device: {isMobile ? 'Mobile' : 'Desktop'}</p>
        <p>Support: {isPushSupported ? '✅ Browser supports push' : '❌ No push support'}</p>
      </div>
    </div>
  );
};

export default NotificationButton;
