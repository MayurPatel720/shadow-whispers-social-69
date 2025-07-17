
import { useEffect, useState } from "react";
import oneSignalService from "@/components/oneSignalService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
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
					setPermissionChecked(true);
					return;
				}

				const { isSubscribed, permission } = await oneSignalService.getSubscriptionStatus();
				
				// If permission is already granted or user is already subscribed, don't show dialog
				if (permission === "granted" || isSubscribed) {
					setPermissionChecked(true);
					return;
				}

				// If permission was previously denied, don't show dialog again
				if (permission === "denied") {
					setPermissionChecked(true);
					return;
				}

				// Only show dialog if permission is default (not asked before) and user is not subscribed
				if (permission === "default" && !isSubscribed) {
					// Wait a bit for user to settle in before showing dialog
					setTimeout(() => {
						setShowDialog(true);
					}, 3000);
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
			await oneSignalService.requestPermissionAndSubscribe();
			setShowDialog(false);
			toast({
				title: "Notifications enabled!",
				description: "You're all set to receive updates.",
			});
		} catch (error) {
			toast({
				title: "Permission denied",
				description: "You can enable notifications from your browser settings anytime.",
				variant: "destructive",
			});
		}
	};

	const handleDeclineNotifications = () => {
		setShowDialog(false);
		// Mark as checked so we don't show again
		setPermissionChecked(true);
	};

	return (
		<NotificationPermissionDialog
			open={showDialog}
			onOpenChange={setShowDialog}
			onEnable={handleEnableNotifications}
			onDecline={handleDeclineNotifications}
		/>
	);
}
