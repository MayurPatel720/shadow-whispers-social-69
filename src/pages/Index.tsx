
import GlobalFeed from "@/components/feed/GlobalFeed";
import { useRequestNotificationPermission } from "@/hooks/useRequestNotificationPermission";

const Index = () => {
	const notificationDialog = useRequestNotificationPermission();

	return (
		<>
			<GlobalFeed />
			{notificationDialog}
		</>
	);
};

export default Index;
