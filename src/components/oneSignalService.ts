
/* eslint-disable @typescript-eslint/no-explicit-any */
import OneSignal from "react-onesignal";

interface NotificationButton {
	text: string;
	id: string;
	icon?: string;
}

interface NotificationPayload {
	title: string;
	body: string;
	url?: string;
	buttons?: NotificationButton[];
	data?: any;
}

class OneSignalService {
	async initialize(appId?: string): Promise<void> {
		try {
			const actualAppId = appId || import.meta.env.VITE_ONESIGNAL_APP_ID;
			if (!actualAppId) {
				throw new Error("OneSignal App ID not found");
			}
			
			console.log("🚀 Initializing OneSignal with appId:", actualAppId);
			await OneSignal.init({
				appId: actualAppId,
				allowLocalhostAsSecureOrigin: true,
				welcomeNotification: {
					title: "Welcome to UnderKover!",
					message: "Thanks for joining the community.",
				},
			});

			OneSignal.Notifications.addEventListener("permissionChange", (permission) => {
				console.warn("🔔 OneSignal Permission Change:", permission);
			});

			OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
				console.log("🔔 OneSignal Foreground Notification:", event);
			});

			OneSignal.Notifications.addEventListener("click", (event) => {
				console.log("🔔 OneSignal Notification Clicked:", event);
				// Dispatch custom event for handling in components
				window.dispatchEvent(new CustomEvent("onesignal:notificationClick", { detail: event }));
			});

			console.log("✅ OneSignal initialized successfully");
		} catch (error: any) {
			console.error("❌ Error initializing OneSignal:", error);
		}
	}

	async getPlayerId(): Promise<string | null> {
		try {
			console.log("🔑 Fetching OneSignal Player ID...");
			const playerId = OneSignal.User?.PushSubscription?.id;

			if (playerId) {
				console.log("🔑 OneSignal Player ID:", playerId);
				return playerId;
			} else {
				console.warn("⚠️ No OneSignal Player ID found");
				return null;
			}
		} catch (error: any) {
			console.error("❌ Error fetching OneSignal Player ID:", error);
			return null;
		}
	}

	async sendNotification(playerIds: string[], payload: NotificationPayload): Promise<void> {
		try {
			console.log("✉️ Sending notification to player IDs:", playerIds, "with payload:", payload);
			// Note: Direct notification sending from client is not supported in newer OneSignal versions
			// This should be handled by your backend
			console.warn("⚠️ Direct client notification sending is deprecated. Use backend API instead.");
		} catch (error: any) {
			console.error("❌ Error sending notification:", error);
		}
	}

	async requestPermissionAndSubscribe(): Promise<{
		success: boolean;
		error?: string;
		playerId?: string;
	}> {
		try {
			console.log("🔔 Starting notification permission request...");

			// Check if OneSignal is initialized
			if (!OneSignal.User) {
				console.error("❌ OneSignal not initialized");
				return { success: false, error: "OneSignal not initialized" };
			}

			// Check current permission status
			const hasPermission = OneSignal.Notifications.permission;
			console.log("🔍 Current permission status:", hasPermission);

			if (hasPermission) {
				console.log("✅ Permission already granted");
				const playerId = OneSignal.User.PushSubscription.id;
				return { 
					success: true, 
					playerId: playerId || undefined 
				};
			}

			// Check if user is subscribed
			const isOptedIn = OneSignal.User.PushSubscription.optedIn;
			console.log("🔍 Current opt-in status:", isOptedIn);

			if (!isOptedIn) {
				// Subscribe to push notifications
				OneSignal.User.PushSubscription.optIn();
				
				// Wait a bit for subscription to complete
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				// Get the player ID after subscription
				const playerId = OneSignal.User.PushSubscription.id;
				console.log("📱 Player ID after opt-in:", playerId);
				
				if (playerId) {
					console.log("✅ Successfully subscribed with player ID:", playerId);
					// Dispatch custom event for subscription
					window.dispatchEvent(new CustomEvent("onesignal:subscribed", { detail: { playerId } }));
					return { success: true, playerId };
				} else {
					console.log("⚠️ Subscribed but no player ID yet");
					return { success: true };
				}
			} else {
				console.log("✅ Already opted in");
				const playerId = OneSignal.User.PushSubscription.id;
				return { 
					success: true, 
					playerId: playerId || undefined 
				};
			}
		} catch (error: any) {
			console.error("❌ Error requesting notification permission:", error);
			return { success: false, error: error.message || "Unknown error" };
		}
	}

	async getSubscriptionStatus(): Promise<{
		isSubscribed: boolean;
		permission: NotificationPermission;
		playerId?: string;
	}> {
		try {
			if (!OneSignal.User) {
				return {
					isSubscribed: false,
					permission: "default"
				};
			}

			const isSubscribed = OneSignal.User.PushSubscription.optedIn || false;
			const permission = OneSignal.Notifications.permission ? "granted" : "default";
			const playerId = OneSignal.User.PushSubscription.id;

			return {
				isSubscribed,
				permission,
				playerId: playerId || undefined
			};
		} catch (error) {
			console.error("Error getting subscription status:", error);
			return {
				isSubscribed: false,
				permission: "default"
			};
		}
	}

	async unsubscribe(): Promise<void> {
		try {
			console.log("🔕 Unsubscribing from notifications");
			if (OneSignal.User?.PushSubscription) {
				OneSignal.User.PushSubscription.optOut();
			}
			console.log("✅ Successfully unsubscribed");
		} catch (error: any) {
			console.error("❌ Error unsubscribing:", error);
		}
	}

	async setExternalUserId(userId: string): Promise<void> {
		try {
			console.log(`🔗 Setting external user ID: ${userId}`);
			await OneSignal.login(userId);
			console.log("✅ External user ID set successfully");
		} catch (error: any) {
			console.error("❌ Error setting external user ID:", error);
		}
	}

	async removeExternalUserId(): Promise<void> {
		try {
			console.log("🚪 Removing external user ID");
			await OneSignal.logout();
			console.log("✅ External user ID removed successfully");
		} catch (error: any) {
			console.error("❌ Error removing external user ID:", error);
		}
	}

	async addTags(tags: Record<string, string>): Promise<void> {
		try {
			console.log("🏷️ Adding tags:", tags);
			await OneSignal.User.addTags(tags);
			console.log("✅ Tags added successfully");
		} catch (error: any) {
			console.error("❌ Error adding tags:", error);
		}
	}

	isSupported(): boolean {
		return typeof window !== 'undefined' && 'Notification' in window;
	}
}

// Create and export a singleton instance
const oneSignalService = new OneSignalService();
export default oneSignalService;

// Also export the individual functions for backward compatibility
export const initializeOneSignal = (appId: string) => oneSignalService.initialize(appId);
export const getOneSignalPlayerId = () => oneSignalService.getPlayerId();
export const sendNotification = (playerIds: string[], payload: NotificationPayload) => 
	oneSignalService.sendNotification(playerIds, payload);
export const requestNotificationPermission = () => oneSignalService.requestPermissionAndSubscribe();
export const setExternalUserId = (userId: string) => oneSignalService.setExternalUserId(userId);
export const removeExternalUserId = () => oneSignalService.removeExternalUserId();
