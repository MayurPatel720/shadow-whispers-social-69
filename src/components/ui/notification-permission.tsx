
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, X, Check, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
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
        description: "Notifications are not supported in this browser.",
      });
      return;
    }

    setIsRequesting(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll now receive notifications for new messages and updates.",
        });
        onPermissionGranted?.();
        setShowPrompt(false);
      } else if (result === 'denied') {
        toast({
          variant: "destructive",
          title: "Notifications blocked",
          description: "You can enable notifications later in your browser settings.",
        });
        onPermissionDenied?.();
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        variant: "destructive",
        title: "Permission error",
        description: "Failed to request notification permission. Please try again.",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    onPermissionDenied?.();
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
              <Bell className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-purple-300">Enable Notifications</CardTitle>
              <CardDescription className="text-gray-400">
                Stay updated with real-time messages and activity
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

        <div className="flex items-center gap-2 text-xs text-amber-400 mb-4">
          <AlertCircle size={14} />
          <span>You can change this setting anytime in your browser</span>
        </div>

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
