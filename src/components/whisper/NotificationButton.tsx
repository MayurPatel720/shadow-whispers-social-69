
import React from 'react';
import NotificationManager from '@/components/notifications/NotificationManager';
import { useAuth } from '@/context/AuthContext';

const NotificationButton: React.FC = () => {
  const { user } = useAuth();

  const handleSubscriptionChange = (isSubscribed: boolean, playerId?: string) => {
    console.log('Subscription changed:', { isSubscribed, playerId, userId: user?._id });
    
    if (isSubscribed && playerId && user) {
      // Additional handling can be added here if needed
      console.log(`User ${user._id} subscribed with OneSignal player ID: ${playerId}`);
    }
  };

  return (
    <div className="w-full">
      <NotificationManager 
        onSubscriptionChange={handleSubscriptionChange}
        className="w-full"
      />
    </div>
  );
};

export default NotificationButton;
