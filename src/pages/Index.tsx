
import GlobalFeed from "@/components/feed/GlobalFeed";
import { useRequestNotificationPermission } from "@/hooks/useRequestNotificationPermission";

const Index = () => {
  useRequestNotificationPermission();

  return (
    <GlobalFeed />
  );
};

export default Index;
