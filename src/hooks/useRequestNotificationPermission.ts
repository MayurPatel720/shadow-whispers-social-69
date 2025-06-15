
import { useEffect } from "react";
import oneSignalService from "@/components/oneSignalService";
import { toast } from "@/hooks/use-toast";

// Callback will be fired if permission is needed/requested
export function useRequestNotificationPermission() {
  useEffect(() => {
    let permissionChecked = false;
    async function runCheck() {
      try {
        if (!oneSignalService.isSupported()) return;
        const { isSubscribed, permission } = await oneSignalService.getSubscriptionStatus();
        // Check if browser permission is not granted (not "granted") or not subscribed
        if (!isSubscribed || permission !== "granted") {
          // Only show toast if not already granted
          toast({
            title: "Enable Notifications?",
            description: "Stay updated! Allow notifications to not miss important messages.",
            action: (
              <button
                onClick={async () => {
                  try {
                    await oneSignalService.requestPermissionAndSubscribe();
                    toast({
                      title: "Notifications enabled!",
                      description: "You're all set to receive new updates.",
                    });
                  } catch {
                    toast({
                      title: "Permission denied",
                      description: "You can enable notifications from your browser settings anytime.",
                      variant: "destructive",
                    });
                  }
                }}
                className="px-3 py-1 bg-purple-600 rounded text-white text-sm hover:bg-purple-700 ml-4"
              >
                Enable
              </button>
            ),
          });
        }
        permissionChecked = true;
      } catch (e) {
        // Silent catch
      }
    }
    // Only run once per mount (per page hit)
    runCheck();
    // No cleanup needed
  }, []);
}
