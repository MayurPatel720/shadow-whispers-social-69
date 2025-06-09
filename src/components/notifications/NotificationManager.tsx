
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings, Check, X, Smartphone, Monitor } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { oneSignalService } from '@/services/oneSignalService';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface NotificationManagerProps {
  onSubscriptionChange?: (isSubscribed: boolean, playerId?: string) => void;
  className?: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
  onSubscriptionChange,
  className = ''
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [playerId, setPlayerId] = useState<string>();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    initializeNotifications();
    setupEventListeners();
  }, []);

  useEffect(() => {
    if (user && playerId && isSubscribed) {
      // Set external user ID and save to database
      oneSignalService.setExternalUserId(user._id);
      savePlayerIdToDatabase(playerId);
    }
  }, [user, playerId, isSubscribed]);

  const initializeNotifications = async () => {
    try {
      // Check if OneSignal is supported
      setIsSupported(oneSignalService.isSupported());
      
      if (!oneSignalService.isSupported()) {
        console.log('Push notifications not supported in this browser');
        return;
      }

      // Initialize OneSignal
      await oneSignalService.initialize();
      
      // Get current status
      const status = await oneSignalService.getSubscriptionStatus();
      setIsSubscribed(status.isSubscribed);
      setPlayerId(status.playerId);
      setPermission(status.permission || 'default');
      
      console.log('Notification manager initialized:', status);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      toast({
        variant: "destructive",
        title: "Notification Error",
        description: "Failed to initialize push notifications.",
      });
    }
  };

  const setupEventListeners = () => {
    // Listen for subscription changes
    const handleSubscriptionChange = (event: CustomEvent) => {
      const { playerId: newPlayerId } = event.detail;
      setIsSubscribed(true);
      setPlayerId(newPlayerId);
      onSubscriptionChange?.(true, newPlayerId);
    };

    const handleUnsubscribe = () => {
      setIsSubscribed(false);
      setPlayerId(undefined);
      onSubscriptionChange?.(false);
    };

    window.addEventListener('onesignal:subscribed', handleSubscriptionChange as EventListener);
    window.addEventListener('onesignal:unsubscribed', handleUnsubscribe);

    return () => {
      window.removeEventListener('onesignal:subscribed', handleSubscriptionChange as EventListener);
      window.removeEventListener('onesignal:unsubscribed', handleUnsubscribe);
    };
  };

  const savePlayerIdToDatabase = async (playerId: string) => {
    try {
      await api.post('/api/notifications/save-player-id', {
        playerId,
        userId: user?._id,
        platform: 'web'
      });
      console.log('Player ID saved to database');
    } catch (error) {
      console.error('Failed to save player ID:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to enable notifications.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await oneSignalService.requestPermissionAndSubscribe();
      
      if (result.success && result.playerId) {
        setIsSubscribed(true);
        setPlayerId(result.playerId);
        setPermission('granted');
        
        toast({
          title: "Notifications Enabled! 🔔",
          description: "You'll now receive push notifications for important updates.",
        });
        
        onSubscriptionChange?.(true, result.playerId);
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Failed to enable notifications.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);

    try {
      const result = await oneSignalService.unsubscribe();
      
      if (result.success) {
        setIsSubscribed(false);
        setPlayerId(undefined);
        
        toast({
          title: "Notifications Disabled",
          description: "You will no longer receive push notifications.",
        });
        
        onSubscriptionChange?.(false);
      } else {
        throw new Error(result.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      toast({
        variant: "destructive",
        title: "Unsubscribe Failed",
        description: error instanceof Error ? error.message : "Failed to disable notifications.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubscribe = async () => {
    setIsLoading(true);

    try {
      const result = await oneSignalService.resubscribe();
      
      if (result.success && result.playerId) {
        setIsSubscribed(true);
        setPlayerId(result.playerId);
        
        toast({
          title: "Notifications Re-enabled! 🔔",
          description: "You're now subscribed to push notifications again.",
        });
        
        onSubscriptionChange?.(true, result.playerId);
      } else {
        throw new Error(result.error || 'Failed to re-subscribe');
      }
    } catch (error) {
      console.error('Re-subscribe failed:', error);
      toast({
        variant: "destructive",
        title: "Re-subscribe Failed",
        description: error instanceof Error ? error.message : "Failed to re-enable notifications.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className={`bg-gray-100 border-gray-300 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-gray-600">
            <BellOff className="h-5 w-5" />
            <span className="text-sm">Push notifications not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-full">
              {navigator.userAgent.includes('Mobile') ? (
                <Smartphone className="h-5 w-5 text-purple-400" />
              ) : (
                <Monitor className="h-5 w-5 text-purple-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg text-purple-300">
                Push Notifications
              </CardTitle>
              <CardDescription className="text-gray-400 flex items-center gap-2">
                {isSubscribed ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    Active
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-400" />
                    Disabled
                  </>
                )}
                {playerId && (
                  <Badge variant="outline" className="text-xs">
                    ID: {playerId.slice(0, 8)}...
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Check size={14} className="text-green-400" />
            <span>Real-time updates</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Check size={14} className="text-green-400" />
            <span>Works when app is closed</span>
          </div>
        </div>

        <div className="flex gap-2">
          {!isSubscribed ? (
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || permission === 'denied'}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell size={16} className="mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 rounded-full border-t-transparent mr-2" />
                ) : (
                  <BellOff size={16} className="mr-2" />
                )}
                Disable
              </Button>
              
              <Button
                onClick={handleResubscribe}
                disabled={isLoading}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Settings size={16} className="mr-2" />
                Refresh
              </Button>
            </>
          )}
        </div>

        {permission === 'denied' && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">
              Notifications are blocked. Please enable them in your browser settings and refresh the page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
