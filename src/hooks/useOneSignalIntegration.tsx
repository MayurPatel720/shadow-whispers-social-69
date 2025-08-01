
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

        // Check if user is already subscribed
        const status = await oneSignalService.getSubscriptionStatus();
        
        if (status.isSubscribed && status.playerId) {
          // Set external user ID and tags for existing subscribers
          await oneSignalService.setExternalUserId(user._id);
          await oneSignalService.addTags({
            username: user.username,
            college: user.college || "unknown",
            area: user.area || "unknown",
          });

          // Update backend with player ID if not already done
          try {
            await updateOneSignalPlayerId(status.playerId);
            console.log("OneSignal player ID updated in backend:", status.playerId);
          } catch (error) {
            console.error("Failed to update player ID in backend:", error);
          }
        }

        // Listen for subscription changes
        const handleSubscriptionChange = async (event: CustomEvent) => {
          const { playerId } = event.detail;
          if (playerId) {
            try {
              await oneSignalService.setExternalUserId(user._id);
              await oneSignalService.addTags({
                username: user.username,
                college: user.college || "unknown",
                area: user.area || "unknown",
              });
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
          const { data } = event.detail.result || {};
          if (data?.type && data?.notificationId) {
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

    // Add a small delay to ensure other components are ready
    const timeoutId = setTimeout(() => {
      initializeOneSignal();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user]);
};
