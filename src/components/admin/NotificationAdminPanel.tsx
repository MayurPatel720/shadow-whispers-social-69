
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Send, Users, Smartphone, Monitor, Globe, Image, Link, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface NotificationStats {
  totalSubscribers: number;
  webSubscribers: number;
  mobileSubscribers: number;
  sentToday: number;
  successRate: number;
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  platform: string;
  targetCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  status: 'pending' | 'sending' | 'completed' | 'failed';
}

const NotificationAdminPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [platform, setPlatform] = useState<'all' | 'web' | 'mobile'>('all');
  const [targetSegment, setTargetSegment] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<NotificationStats>({
    totalSubscribers: 0,
    webSubscribers: 0,
    mobileSubscribers: 0,
    sentToday: 0,
    successRate: 0
  });
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/notifications/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/admin/notifications/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a notification title.",
      });
      return false;
    }

    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error", 
        description: "Please enter a notification message.",
      });
      return false;
    }

    if (title.length > 65) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title must be 65 characters or less.",
      });
      return false;
    }

    if (message.length > 178) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Message must be 178 characters or less.",
      });
      return false;
    }

    return true;
  };

  const sendNotification = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        imageUrl: imageUrl.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        platform,
        targetSegment,
      };

      console.log('Sending notification with payload:', payload);

      const response = await api.post('/api/admin/notifications/send', payload);
      
      toast({
        title: "Notification Sent! 🚀",
        description: `Successfully queued notification for ${response.data.targetCount} users.`,
      });

      // Clear form
      setTitle('');
      setMessage('');
      setImageUrl('');
      setActionUrl('');
      setPlatform('all');
      setTargetSegment('all');

      // Refresh stats and history
      fetchStats();
      fetchHistory();

    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast({
        variant: "destructive",
        title: "Send Failed",
        description: error.response?.data?.message || "Failed to send notification. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        title: `[TEST] ${title.trim()}`,
        message: message.trim(),
        imageUrl: imageUrl.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        isTest: true,
      };

      await api.post('/api/admin/notifications/test', payload);
      
      toast({
        title: "Test Notification Sent! 📱",
        description: "Test notification sent to admin devices only.",
      });

    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      toast({
        variant: "destructive",
        title: "Test Send Failed",
        description: error.response?.data?.message || "Failed to send test notification.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: NotificationHistory['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'sending':
        return <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'web':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.totalSubscribers}</p>
                <p className="text-sm text-gray-400">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Monitor className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.webSubscribers}</p>
                <p className="text-sm text-gray-400">Web Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Smartphone className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.mobileSubscribers}</p>
                <p className="text-sm text-gray-400">Mobile Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Send className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.sentToday}</p>
                <p className="text-sm text-gray-400">Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stats.successRate}%</p>
                <p className="text-sm text-gray-400">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="send" className="data-[state=active]:bg-purple-600">
            Send Notification
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
            Notification History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Send Push Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-300">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter notification title"
                      maxLength={65}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">{title.length}/65 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-300">Message *</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter notification message"
                      maxLength={178}
                      rows={4}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">{message.length}/178 characters</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="imageUrl" className="text-gray-300">Image URL (Optional)</Label>
                    <div className="flex gap-2">
                      <Image className="h-4 w-4 text-gray-400 mt-3" />
                      <Input
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="actionUrl" className="text-gray-300">Action URL (Optional)</Label>
                    <div className="flex gap-2">
                      <Link className="h-4 w-4 text-gray-400 mt-3" />
                      <Input
                        id="actionUrl"
                        value={actionUrl}
                        onChange={(e) => setActionUrl(e.target.value)}
                        placeholder="https://example.com/page"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Platform</Label>
                      <Select value={platform} onValueChange={(value) => setPlatform(value as any)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="web">Web Only</SelectItem>
                          <SelectItem value="mobile">Mobile Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-300">Target</Label>
                      <Select value={targetSegment} onValueChange={(value) => setTargetSegment(value as any)}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active Users</SelectItem>
                          <SelectItem value="inactive">Inactive Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button
                  onClick={sendTestNotification}
                  disabled={isLoading}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Send Test
                </Button>
                <Button
                  onClick={sendNotification}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to All Users
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications sent yet</p>
                  </div>
                ) : (
                  history.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusIcon(notification.status)}
                          <Badge variant="outline" className="text-xs">
                            {notification.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {getPlatformIcon(notification.platform)}
                            <span>{notification.platform}</span>
                          </div>
                          <span>Target: {notification.targetCount}</span>
                          <span className="text-green-400">Success: {notification.successCount}</span>
                          {notification.failureCount > 0 && (
                            <span className="text-red-400">Failed: {notification.failureCount}</span>
                          )}
                        </div>
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationAdminPanel;
