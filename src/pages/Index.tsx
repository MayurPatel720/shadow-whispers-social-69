
import GlobalFeed from "@/components/feed/GlobalFeed";
import { useRequestNotificationPermission } from "@/hooks/useRequestNotificationPermission";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import NotificationPrompt from "@/components/notifications/NotificationPrompt";

const Index = () => {
	const notificationDialog = useRequestNotificationPermission();

	return (
		<>
			<PWAInstallPrompt />
			<NotificationPrompt />
			<GlobalFeed />
			{notificationDialog}
		</>
	);
};

export default Index;
