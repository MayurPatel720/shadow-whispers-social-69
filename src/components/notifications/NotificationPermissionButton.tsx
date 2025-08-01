
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import oneSignalService from "@/components/oneSignalService";
import { updateOneSignalPlayerId } from "@/lib/api";

const NotificationPermissionButton: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      if (!oneSignalService.isSupported()) {
        return;
      }

      const status = await oneSignalService.getSubscriptionStatus();
      setPermissionStatus(status.permission || "default");
      setIsSubscribed(status.isSubscribed);
    } catch (error) {
      console.error("Error checking permission status:", error);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await oneSignalService.requestPermissionAndSubscribe();
      
      if (result.success) {
        if (result.playerId) {
          await updateOneSignalPlayerId(result.playerId);
        }
        setIsSubscribed(true);
        setPermissionStatus("granted");
        toast({
          title: "Notifications enabled!",
          description: "You'll now receive push notifications.",
        });
      } else {
        throw new Error(result.error || "Failed to enable notifications");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast({
        title: "Failed to enable notifications",
        description: "Please check your browser settings and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      await oneSignalService.unsubscribe();
      setIsSubscribed(false);
      toast({
        title: "Notifications disabled",
        description: "You won't receive push notifications anymore.",
      });
    } catch (error) {
      console.error("Error disabling notifications:", error);
      toast({
        title: "Error",
        description: "Failed to disable notifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if not supported
  if (!oneSignalService.isSupported()) {
    return null;
  }

  // Show different states based on permission and subscription
  if (permissionStatus === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="h-4 w-4" />
        <span>Notifications blocked</span>
      </div>
    );
  }

  if (isSubscribed && permissionStatus === "granted") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDisableNotifications}
        disabled={isLoading}
        className="text-green-600 hover:text-green-700"
      >
        <BellRing className="h-4 w-4 mr-1" />
        {isLoading ? "Updating..." : "Notifications On"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnableNotifications}
      disabled={isLoading}
      className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
    >
      <Bell className="h-4 w-4 mr-1" />
      {isLoading ? "Enabling..." : "Enable Notifications"}
    </Button>
  );
};

export default NotificationPermissionButton;
