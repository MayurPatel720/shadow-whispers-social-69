
import GlobalFeed from "@/components/feed/GlobalFeed";
import { useRequestNotificationPermission } from "@/hooks/useRequestNotificationPermission";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";

const Index = () => {
	const notificationDialog = useRequestNotificationPermission();

	return (
		<>
			<PWAInstallPrompt />
			<GlobalFeed />
			{notificationDialog}
		</>
	);
};

export default Index;
