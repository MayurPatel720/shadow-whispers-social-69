
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateOneSignalPlayerId } from "@/lib/api";
import oneSignalService from "@/components/oneSignalService";
import { toast } from "@/hooks/use-toast";

export const useOneSignalIntegration = () => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const initializeOneSignal = async () => {
      try {
        if (!oneSignalService.isSupported()) {
          console.log("OneSignal is not supported on this device");
          return;
        }

        // Initialize OneSignal
        await oneSignalService.initialize();

        // Set external user ID
        await oneSignalService.setExternalUserId(user._id);

        // Add user tags for better targeting
        await oneSignalService.addTags({
          username: user.username,
          college: user.college || "unknown",
          area: user.area || "unknown",
        });

        // Listen for subscription changes
        const handleSubscriptionChange = async (event: CustomEvent) => {
          const { playerId } = event.detail;
          if (playerId) {
            try {
              await updateOneSignalPlayerId(playerId);
              console.log("OneSignal player ID updated in backend:", playerId);
            } catch (error) {
              console.error("Failed to update player ID in backend:", error);
            }
          }
        };

        // Listen for notification clicks
        const handleNotificationClick = (event: CustomEvent) => {
          console.log("Push notification clicked:", event.detail);
          // Handle navigation based on notification data
          const { data } = event.detail.result || {};
          if (data?.type && data?.notificationId) {
            // Navigate to appropriate page based on notification type
            switch (data.type) {
              case 'whisper':
                window.location.href = '/whispers';
                break;
              case 'comment':
              case 'like':
                if (data.postId) {
                  window.location.href = `/post/${data.postId}`;
                }
                break;
              default:
                window.location.href = '/';
            }
          }
        };

        window.addEventListener("onesignal:subscribed", handleSubscriptionChange);
        window.addEventListener("onesignal:notificationClick", handleNotificationClick);

        return () => {
          window.removeEventListener("onesignal:subscribed", handleSubscriptionChange);
          window.removeEventListener("onesignal:notificationClick", handleNotificationClick);
        };
      } catch (error) {
        console.error("Failed to initialize OneSignal integration:", error);
      }
    };

    initializeOneSignal();
  }, [isAuthenticated, user]);
};
