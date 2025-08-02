
import { useEffect, useState } from "react";
import oneSignalService from "@/components/oneSignalService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { updateOneSignalPlayerId } from "@/lib/api";
import NotificationPermissionDialog from "@/components/notifications/NotificationPermissionDialog";

export function useRequestNotificationPermission() {
	const { isAuthenticated, user, showLoginAnimation } = useAuth();
	const [showDialog, setShowDialog] = useState(false);
	const [permissionChecked, setPermissionChecked] = useState(false);

	useEffect(() => {
		// Don't show dialog during login animation or if user is not authenticated
		if (!isAuthenticated || !user || permissionChecked || showLoginAnimation) return;

		async function checkNotificationPermission() {
			try {
				if (!oneSignalService.isSupported()) {
					console.log("Push notifications not supported on this device/browser");
					setPermissionChecked(true);
					return;
				}

				const { isSubscribed, permission } = await oneSignalService.getSubscriptionStatus();
				
				console.log("Notification status:", { isSubscribed, permission });

				// If permission is already granted and user is subscribed, don't show dialog
				if (permission === "granted" && isSubscribed) {
					console.log("User already has notifications enabled");
					setPermissionChecked(true);
					return;
				}

				// If permission was explicitly denied, show a different dialog to guide user
				if (permission === "denied") {
					console.log("User previously denied notification permission");
					// Show dialog anyway but with different messaging for denied permissions
					setTimeout(() => {
						setShowDialog(true);
					}, 2000);
					setPermissionChecked(true);
					return;
				}

				// Show dialog if permission is default (not asked before) or granted but not subscribed
				if (permission === "default" || (permission === "granted" && !isSubscribed)) {
					console.log("Showing notification permission dialog");
					// Wait a bit for user to settle in before showing dialog
					setTimeout(() => {
						setShowDialog(true);
					}, 2000);
				}
				
				setPermissionChecked(true);
			} catch (error) {
				console.error("Error checking notification permission:", error);
				setPermissionChecked(true);
			}
		}

		checkNotificationPermission();
	}, [isAuthenticated, user, permissionChecked, showLoginAnimation]);

	const handleEnableNotifications = async () => {
		try {
			console.log("User requested to enable notifications");
			const result = await oneSignalService.requestPermissionAndSubscribe();
			
			if (result.success && result.playerId) {
				// Update the player ID in the backend
				await updateOneSignalPlayerId(result.playerId);
				console.log("Notification setup completed successfully");
				
				toast({
					title: "Notifications enabled!",
					description: "You're all set to receive updates.",
				});
			} else {
				throw new Error(result.error || "Failed to enable notifications");
			}
			
			setShowDialog(false);
			setPermissionChecked(true);
		} catch (error) {
			console.error("Error enabling notifications:", error);
			toast({
				title: "Could not enable notifications",
				description: "Please try again or enable from your browser settings.",
				variant: "destructive",
			});
		}
	};

	const handleDeclineNotifications = () => {
		console.log("User declined notifications");
		setShowDialog(false);
		setPermissionChecked(true);
		
		// Store the user's preference to not show again in this session
		sessionStorage.setItem('notifications-declined', 'true');
	};

	// Check if user previously declined in this session
	useEffect(() => {
		const declined = sessionStorage.getItem('notifications-declined');
		if (declined) {
			setPermissionChecked(true);
		}
	}, []);

	return (
		<NotificationPermissionDialog
			open={showDialog}
			onOpenChange={setShowDialog}
			onEnable={handleEnableNotifications}
			onDecline={handleDeclineNotifications}
		/>
	);
}
