import { api } from "./api";

export interface Notification {
  _id: string;
  userId: string;
  type: 'whisper' | 'comment' | 'like' | 'general';
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
}

// Get user notifications with pagination
export const getNotifications = async ({
  limit = 20,
  skip = 0,
  unreadOnly = false
}: {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
} = {}): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());
  if (unreadOnly) params.append('unreadOnly', 'true');
  
  const response = await api.get(`/api/notifications?${params.toString()}`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data;
};

// Mark specific notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await api.put(`/api/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/api/notifications/mark-all-read');
};

// Delete specific notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/api/notifications/${notificationId}`);
};