
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, X, Check, AlertCircle, Smartphone, Monitor } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  className?: string;
}

const NotificationPermission: React.FC<NotificationPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  className
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');

    if ('Notification' in window) {
      setPermission(Notification.permission);
      setShowPrompt(Notification.permission === 'default');
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        variant: "destructive",
        title: "Not supported",
        description: deviceType === 'mobile' 
          ? "Your mobile browser doesn't support notifications. Try using Chrome or Safari."
          : "Notifications are not supported in this browser.",
      });
      return;
    }

    setIsRequesting(true);

    try {
      // Enhanced mobile notification request
      if (deviceType === 'mobile') {
        toast({
          title: "Permission Request",
          description: "Please allow notifications when your browser prompts you. This may appear at the top of your screen.",
          duration: 5000,
        });

        // Small delay to let user read the message
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: "Notifications enabled! 🔔",
          description: deviceType === 'mobile' 
            ? "You'll now receive push notifications on your mobile device!"
            : "You'll now receive notifications for new messages and updates.",
        });
        
        // Show test notification for mobile users
        if (deviceType === 'mobile') {
          setTimeout(() => {
            try {
              const notificationOptions: NotificationOptions = {
                body: "Notifications are working on your mobile device.",
                icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
                badge: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
                tag: "welcome-mobile",
                requireInteraction: true,
              };

              const testNotification = new Notification("Welcome! 🎉", notificationOptions);
              
              setTimeout(() => testNotification.close(), 4000);
            } catch (error) {
              console.log('Test notification failed:', error);
            }
          }, 1000);
        }
        
        onPermissionGranted?.();
        setShowPrompt(false);
      } else if (result === 'denied') {
        const deniedMessage = deviceType === 'mobile' 
          ? "Notifications blocked. To enable: Go to your browser settings > Site settings > Notifications and allow for this site."
          : "Notifications blocked. You can enable them later in your browser settings.";
        
        toast({
          variant: "destructive",
          title: "Notifications blocked",
          description: deniedMessage,
          duration: 8000,
        });
        onPermissionDenied?.();
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        variant: "destructive",
        title: "Permission error",
        description: deviceType === 'mobile' 
          ? "Could not request permission. Try refreshing the page or check your browser settings."
          : "Failed to request notification permission. Please try again.",
        duration: 6000,
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    onPermissionDenied?.();
  };

  const getInstructions = () => {
    if (deviceType === 'mobile') {
      return [
        "Tap 'Enable Notifications' below",
        "Allow when your browser asks",
        "Notifications will appear even when the app is closed"
      ];
    } else {
      return [
        "Click 'Enable Notifications' below",
        "Click 'Allow' in the browser popup",
        "You'll receive desktop notifications"
      ];
    }
  };

  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <Card className={`border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-full">
              {deviceType === 'mobile' ? (
                <Smartphone className="h-5 w-5 text-purple-400" />
              ) : (
                <Monitor className="h-5 w-5 text-purple-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg text-purple-300">
                Enable {deviceType === 'mobile' ? 'Mobile' : 'Desktop'} Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">
                {deviceType === 'mobile' 
                  ? "Get instant alerts for messages and activity on your phone"
                  : "Stay updated with real-time messages and activity"
                }
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          {getInstructions().map((instruction, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300">
                {index + 1}
              </div>
              <span>{instruction}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Check size={14} className="text-green-400" />
            <span>New whisper messages</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Check size={14} className="text-green-400" />
            <span>Post interactions</span>
          </div>
        </div>

        {deviceType === 'mobile' && (
          <div className="flex items-center gap-2 text-xs text-amber-400 mb-4">
            <AlertCircle size={14} />
            <span>Works even when the app is closed on mobile</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={requestPermission}
            disabled={isRequesting}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                Requesting...
              </>
            ) : (
              <>
                <Bell size={16} className="mr-2" />
                Enable Notifications
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={dismissPrompt}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <BellOff size={16} className="mr-2" />
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPermission;
