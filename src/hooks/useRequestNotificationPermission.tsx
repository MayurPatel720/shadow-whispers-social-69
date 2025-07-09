
import { useEffect, useState } from "react";
import oneSignalService from "@/components/oneSignalService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import NotificationPermissionDialog from "@/components/notifications/NotificationPermissionDialog";

export function useRequestNotificationPermission() {
	const { isAuthenticated, user } = useAuth();
	const [showDialog, setShowDialog] = useState(false);
	const [permissionChecked, setPermissionChecked] = useState(false);

	useEffect(() => {
		// Only check for authenticated users
		if (!isAuthenticated || !user || permissionChecked) return;

		async function checkNotificationPermission() {
			try {
				if (!oneSignalService.isSupported()) return;

				const { isSubscribed, permission } = await oneSignalService.getSubscriptionStatus();
				
				// Only show dialog if user is not subscribed and permission is not granted
				if (!isSubscribed && permission !== "granted") {
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
	}, [isAuthenticated, user, permissionChecked]);

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
		// Don't show again for this session
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
