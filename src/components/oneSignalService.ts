
/* eslint-disable @typescript-eslint/no-explicit-any */
import OneSignal from "react-onesignal";

interface OneSignalConfig {
	appId: string;
	safariWebId?: string;
}

interface NotificationPayload {
	title: string;
	message: string;
	url?: string;
	imageUrl?: string;
	data?: Record<string, any>;
}

interface TargetOptions {
	userIds?: string[];
	segments?: string[];
	platform?: "web" | "android" | "all";
}

class OneSignalService {
	private isInitialized = false;
	private config: OneSignalConfig;

	constructor(config: OneSignalConfig) {
		this.config = config;
		console.log("OneSignal App ID:", this.config.appId);
		console.log("NODE_ENV:", process.env.NODE_ENV);
	}

	async initialize(): Promise<void> {
		if (this.isInitialized) {
			console.log("OneSignal already initialized");
			return;
		}

		try {
			// Clear any existing registrations to prevent conflicts
			await this.clearExistingRegistrations();

			await OneSignal.init({
				appId: this.config.appId,
				safari_web_id: this.config.safariWebId,
				allowLocalhostAsSecureOrigin: process.env.NODE_ENV === "development",
				autoRegister: false,
				autoResubscribe: true,
				persistNotification: true,
				showCredit: false,
			});

			this.isInitialized = true;
			console.log("OneSignal initialized successfully");
			this.setupEventListeners();
		} catch (error) {
			console.error("Failed to initialize OneSignal:", error);
			throw new Error("OneSignal initialization failed");
		}
	}

	private async clearExistingRegistrations(): Promise<void> {
		try {
			if ('serviceWorker' in navigator) {
				const registrations = await navigator.serviceWorker.getRegistrations();
				for (const registration of registrations) {
					if (registration.scope.includes('OneSignal') || registration.scope.includes('onesignal')) {
						console.log('Unregistering existing OneSignal service worker:', registration.scope);
						await registration.unregister();
					}
				}
			}
		} catch (error) {
			console.warn("Could not clear existing registrations:", error);
		}
	}

	private setupEventListeners(): void {
		try {
			OneSignal.User.PushSubscription.addEventListener("change", (event) => {
				console.log("Subscription changed:", event);
				this.handleSubscriptionChange(event.current.optedIn);
			});

			OneSignal.Notifications.addEventListener("click", (event) => {
				console.log("Notification clicked:", event);
				this.handleNotificationClick(event);
			});
		} catch (error) {
			console.error("Failed to setup event listeners:", error);
		}
	}

	async requestPermissionAndSubscribe(): Promise<{
		success: boolean;
		playerId?: string;
		error?: string;
	}> {
		try {
			if (!this.isInitialized) {
				await this.initialize();
			}

			// Check if already subscribed
			const isSubscribed = OneSignal.User.PushSubscription.optedIn;
			if (isSubscribed) {
				const playerId = OneSignal.User.PushSubscription.id;
				return { success: true, playerId: playerId || undefined };
			}

			// Request permission first
			const granted = await OneSignal.Notifications.requestPermission();
			if (!granted) {
				return { success: false, error: "Permission denied" };
			}

			// Subscribe to push notifications
			await OneSignal.User.PushSubscription.optIn();
			
			// Wait a bit for subscription to complete
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const playerId = OneSignal.User.PushSubscription.id;

			if (!playerId) {
				return { success: false, error: "Failed to get player ID" };
			}

			console.log("Successfully subscribed with player ID:", playerId);
			return { success: true, playerId };
		} catch (error) {
			console.error("Failed to subscribe to notifications:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async unsubscribe(): Promise<{ success: boolean; error?: string }> {
		try {
			OneSignal.User.PushSubscription.optOut();
			console.log("Successfully unsubscribed from notifications");
			return { success: true };
		} catch (error) {
			console.error("Failed to unsubscribe:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async getSubscriptionStatus(): Promise<{
		isSubscribed: boolean;
		playerId?: string;
		permission?: NotificationPermission;
	}> {
		try {
			const isSubscribed = OneSignal.User.PushSubscription.optedIn;
			const playerId = OneSignal.User.PushSubscription.id;

			let permission: NotificationPermission = "default";
			try {
				if (typeof Notification !== 'undefined') {
					permission = Notification.permission;
				} else {
					const permissionStatus = OneSignal.Notifications.permission;
					if (permissionStatus === true) {
						permission = "granted";
					} else if (permissionStatus === false) {
						permission = "denied";
					}
				}
			} catch (permError) {
				console.warn("Could not get permission status:", permError);
				permission = "default";
			}

			return {
				isSubscribed: Boolean(isSubscribed),
				playerId: playerId || undefined,
				permission,
			};
		} catch (error) {
			console.error("Failed to get subscription status:", error);
			return { isSubscribed: false, permission: "default" };
		}
	}

	isSupported(): boolean {
		return (
			typeof window !== "undefined" &&
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			"Notification" in window
		);
	}

	async setExternalUserId(
		userId: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			await OneSignal.login(userId);
			console.log("External user ID set:", userId);
			return { success: true };
		} catch (error) {
			console.error("Failed to set external user ID:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async addTags(
		tags: Record<string, string>
	): Promise<{ success: boolean; error?: string }> {
		try {
			OneSignal.User.addTags(tags);
			console.log("User tags set:", tags);
			return { success: true };
		} catch (error) {
			console.error("Failed to set user tags:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	private handleSubscriptionChange(isSubscribed: boolean): void {
		if (isSubscribed) {
			const playerId = OneSignal.User.PushSubscription.id;
			console.log("User subscribed with player ID:", playerId);
			window.dispatchEvent(
				new CustomEvent("onesignal:subscribed", {
					detail: { playerId },
				})
			);
		} else {
			console.log("User unsubscribed");
			window.dispatchEvent(new CustomEvent("onesignal:unsubscribed"));
		}
	}

	private handleNotificationClick(event: any): void {
		console.log("Notification clicked:", event);
		if (event.result?.url) {
			window.open(event.result.url, "_blank");
		}
		window.dispatchEvent(
			new CustomEvent("onesignal:notificationClick", {
				detail: event,
			})
		);
	}
}

const oneSignalConfig: OneSignalConfig = {
	appId: import.meta.env.VITE_ONESIGNAL_APP_ID || "22c5717d-d011-4611-b319-06b8691907d8",
	safariWebId: "web.onesignal.auto.3cfe9839-ceab-4809-9212-172318dbfb2e",
};

export const oneSignalService = new OneSignalService(oneSignalConfig);
export default oneSignalService;
export type { NotificationPayload, TargetOptions };
