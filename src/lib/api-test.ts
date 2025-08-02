import { api } from "./api";

// Test OneSignal notifications
export const testOneSignalNotification = async (): Promise<any> => {
  const response = await api.post("/api/test/test-onesignal");
  return response.data;
};

// Test like notification job
export const triggerLikeNotifications = async (): Promise<any> => {
  const response = await api.post("/api/test/trigger-like-notifications");
  return response.data;
};