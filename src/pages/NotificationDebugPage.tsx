
import React from "react";
import OneSignalDebugger from "@/components/notifications/OneSignalDebugger";

const NotificationDebugPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-center">
        <OneSignalDebugger />
      </div>
    </div>
  );
};

export default NotificationDebugPage;
