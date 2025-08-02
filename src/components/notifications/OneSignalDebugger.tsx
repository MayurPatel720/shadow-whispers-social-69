
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Settings, TestTube, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import oneSignalService from "@/components/oneSignalService";
import { toast } from "@/hooks/use-toast";
import { updateOneSignalPlayerId } from "@/lib/api";

interface SubscriptionStatus {
  isSubscribed: boolean;
  playerId?: string;
  permission?: NotificationPermission;
}

const OneSignalDebugger: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({ isSubscribed: false });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    console.log(`OneSignal Debug: ${message}`);
  };

  const checkStatus = async () => {
    try {
      setLoading(true);
      addLog("🔍 Checking OneSignal status...");
      
      if (!oneSignalService.isSupported()) {
        addLog("❌ OneSignal not supported on this device/browser");
        return;
      }

      const currentStatus = await oneSignalService.getSubscriptionStatus();
      setStatus(currentStatus);
      
      addLog(`📊 Status: subscribed=${currentStatus.isSubscribed}, permission=${currentStatus.permission}`);
      if (currentStatus.playerId) {
        addLog(`🆔 Player ID: ${currentStatus.playerId}`);
      }
    } catch (error) {
      addLog(`❌ Error checking status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      setLoading(true);
      addLog("🔔 Requesting notification permission...");
      
      const result = await oneSignalService.requestPermissionAndSubscribe();
      
      if (result.success) {
        addLog(`✅ Permission granted! Player ID: ${result.playerId}`);
        
        if (result.playerId) {
          addLog("📤 Updating player ID in backend...");
          await updateOneSignalPlayerId(result.playerId);
          addLog("✅ Player ID updated in backend");
        }
        
        toast({
          title: "Success!",
          description: "OneSignal notifications enabled",
        });
      } else {
        addLog(`❌ Permission denied: ${result.error}`);
        toast({
          title: "Permission Denied",
          description: result.error,
          variant: "destructive",
        });
      }
      
      await checkStatus();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error requesting permission: ${errorMsg}`);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setLoading(true);
      addLog("🔕 Unsubscribing from notifications...");
      
      const result = await oneSignalService.unsubscribe();
      
      if (result.success) {
        addLog("✅ Successfully unsubscribed");
        toast({
          title: "Unsubscribed",
          description: "You won't receive push notifications",
        });
      } else {
        addLog(`❌ Failed to unsubscribe: ${result.error}`);
      }
      
      await checkStatus();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error unsubscribing: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("🗑️ Logs cleared");
  };

  // Check status on component mount
  useEffect(() => {
    checkStatus();
  }, []);

  const getPermissionBadge = () => {
    switch (status.permission) {
      case 'granted':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Default</Badge>;
    }
  };

  const getSubscriptionBadge = () => {
    return status.isSubscribed 
      ? <Badge className="bg-blue-500"><Bell className="h-3 w-3 mr-1" />Subscribed</Badge>
      : <Badge variant="outline"><Bell className="h-3 w-3 mr-1" />Not Subscribed</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          OneSignal Push Notification Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="space-y-2">
          <h4 className="font-medium">Current Status</h4>
          <div className="flex flex-wrap gap-2">
            {getPermissionBadge()}
            {getSubscriptionBadge()}
          </div>
          
          {status.playerId && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
              Player ID: {status.playerId}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions Section */}
        <div className="space-y-2">
          <h4 className="font-medium">Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Status
            </Button>
            
            <Button
              size="sm"
              onClick={requestPermission}
              disabled={loading || status.isSubscribed}
            >
              <Bell className="h-4 w-4 mr-1" />
              Request Permission
            </Button>
            
            {status.isSubscribed && (
              <Button
                variant="destructive"
                size="sm"
                onClick={unsubscribe}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Unsubscribe
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Logs Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Debug Logs</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
            >
              Clear Logs
            </Button>
          </div>
          
          <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No logs yet...</p>
            ) : (
              <div className="space-y-1 text-xs font-mono">
                {logs.map((log, index) => (
                  <div key={index} className="text-foreground">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions Section */}
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium">Testing Instructions</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>1. <strong>Request Permission</strong> - Click "Request Permission" to enable notifications</p>
            <p>2. <strong>Check Console</strong> - Open browser DevTools → Console tab for detailed logs</p>
            <p>3. <strong>Test Notifications</strong> - Send a whisper message to yourself from another account</p>
            <p>4. <strong>OneSignal Dashboard</strong> - Visit OneSignal dashboard to send test notifications</p>
            <p>5. <strong>Browser Settings</strong> - Check browser notification settings if permission is denied</p>
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Pro Tip:</strong> If notifications aren't working, try opening browser settings, 
              searching for "notifications", and ensuring this site has permission to send notifications.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OneSignalDebugger;
