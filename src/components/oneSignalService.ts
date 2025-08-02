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
	private initializationPromise: Promise<void> | null = null;
	private config: OneSignalConfig;
	private isDevelopment = import.meta.env.DEV;

	constructor(config: OneSignalConfig) {
		this.config = config;
		console.log("OneSignal App ID:", this.config.appId);
		console.log("NODE_ENV:", import.meta.env.NODE_ENV || "development");
		console.log("Environment:", this.isDevelopment ? "development" : "production");
	}

	async initialize(): Promise<void> {
		// Return existing promise if initialization is in progress
		if (this.initializationPromise) {
			return this.initializationPromise;
		}

		if (this.isInitialized) {
			console.log("OneSignal already initialized");
			return;
		}

		// In development, skip OneSignal initialization if not on proper domain
		if (this.isDevelopment && !window.location.hostname.includes('underkover')) {
			console.log("OneSignal skipped in development - domain restriction");
			return;
		}

		this.initializationPromise = this.performInitialization();
		return this.initializationPromise;
	}

	private async performInitialization(): Promise<void> {
		try {
			// Clear any existing subscription to avoid conflicts
			await this.clearExistingSubscription();

			await OneSignal.init({
				appId: this.config.appId,
				safari_web_id: this.config.safariWebId,
				allowLocalhostAsSecureOrigin: this.isDevelopment,
				autoRegister: false,
				autoResubscribe: true,
				persistNotification: true,
				showCredit: false,
				notifyButton: {
					enable: false,
					prenotify: true,
					showCredit: false,
					text: {
						'tip.state.unsubscribed': "Subscribe to notifications",
						'tip.state.subscribed': "You're subscribed to notifications",
						'tip.state.blocked': "You've blocked notifications",
						'message.prenotify': 'Click to subscribe to notifications',
						'message.action.subscribed': "Thanks for subscribing!",
						'message.action.subscribing': "Subscribing...",
						'message.action.resubscribed': "You're subscribed to notifications",
						'message.action.unsubscribed': "You won't receive notifications again",
						'dialog.main.title': 'Manage Site Notifications',
						'dialog.main.button.subscribe': 'SUBSCRIBE',
						'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
						'dialog.blocked.title': 'Unblock Notifications',
						'dialog.blocked.message': "Follow these instructions to allow notifications:"
					}
				},
			});

			this.isInitialized = true;
			console.log("OneSignal initialized successfully");
			this.setupEventListeners();
		} catch (error) {
			console.error("Failed to initialize OneSignal:", error);
			this.initializationPromise = null; // Reset so it can be tried again
			throw new Error("OneSignal initialization failed");
		}
	}

	private async clearExistingSubscription(): Promise<void> {
		try {
			// Check if there's an existing service worker registration
			if ('serviceWorker' in navigator) {
				const registrations = await navigator.serviceWorker.getRegistrations();
				for (const registration of registrations) {
					if (registration.scope.includes('OneSignal') || registration.scope.includes('onesignal')) {
						console.log("Clearing existing OneSignal service worker...");
						await registration.unregister();
					}
				}
			}
		} catch (error) {
			console.warn("Could not clear existing subscriptions:", error);
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
			// In development, return mock success if domain restricted
			if (this.isDevelopment && !window.location.hostname.includes('underkover')) {
				console.log("OneSignal mock success in development");
				return { success: true, playerId: "dev-mock-player-id" };
			}

			if (!this.isInitialized) {
				await this.initialize();
			}

			// First check if already subscribed
			const isSubscribed = OneSignal.User.PushSubscription.optedIn;
			if (isSubscribed) {
				const playerId = OneSignal.User.PushSubscription.id;
				console.log("Already subscribed with player ID:", playerId);
				return { success: true, playerId: playerId || undefined };
			}

			// Check current permission status before requesting
			let currentPermission: NotificationPermission = "default";
			try {
				if ('Notification' in window) {
					currentPermission = Notification.permission;
				}
			} catch (err) {
				console.warn("Could not check Notification permission:", err);
			}

			console.log("Current permission status:", currentPermission);

			// If permission is already denied, guide user to manually enable
			if (currentPermission === "denied") {
				return { 
					success: false, 
					error: "Notifications are blocked. Please enable them in your browser settings and refresh the page." 
				};
			}

			// Request permission first
			try {
				await OneSignal.Notifications.requestPermission();
				
				// Wait a moment for permission to be processed
				await new Promise(resolve => setTimeout(resolve, 500));
				
				// Check if permission was actually granted
				const permissionGranted = OneSignal.Notifications.permission;
				console.log("Permission request result:", permissionGranted);
				
				if (!permissionGranted) {
					return { 
						success: false, 
						error: "Permission denied. Please allow notifications in your browser." 
					};
				}
			} catch (permissionError) {
				console.error("Error requesting permission:", permissionError);
				return { 
					success: false, 
					error: "Failed to request notification permission. Please try enabling them in your browser settings." 
				};
			}

			// Then opt in to push notifications
			try {
				await OneSignal.User.PushSubscription.optIn();
				
				// Wait longer for the subscription to be processed
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				const playerId = OneSignal.User.PushSubscription.id;

				if (!playerId) {
					// Retry once more
					await new Promise(resolve => setTimeout(resolve, 1000));
					const retryPlayerId = OneSignal.User.PushSubscription.id;
					
					if (!retryPlayerId) {
						return { success: false, error: "Failed to generate subscription ID. Please try again." };
					}
					
					console.log("Successfully subscribed with player ID (retry):", retryPlayerId);
					return { success: true, playerId: retryPlayerId };
				}

				console.log("Successfully subscribed with player ID:", playerId);
				return { success: true, playerId };
			} catch (subscriptionError) {
				console.error("Error during subscription:", subscriptionError);
				return { 
					success: false, 
					error: "Failed to complete subscription. Please try again or check your browser settings." 
				};
			}
		} catch (error) {
			console.error("Failed to subscribe to notifications:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
			};
		}
	}

	async unsubscribe(): Promise<{ success: boolean; error?: string }> {
		try {
			await OneSignal.User.PushSubscription.optOut();
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
			// In development, return mock status if domain restricted
			if (this.isDevelopment && !window.location.hostname.includes('underkover')) {
				console.log("OneSignal mock status in development");
				return { 
					isSubscribed: false, 
					permission: "default" as NotificationPermission 
				};
			}

			if (!this.isInitialized) {
				await this.initialize();
			}

			const isSubscribed = OneSignal.User.PushSubscription.optedIn;
			const playerId = OneSignal.User.PushSubscription.id;

			let permission: NotificationPermission = "default";
			try {
				const permissionStatus = OneSignal.Notifications.permission;
				if (permissionStatus === true) {
					permission = "granted";
				} else if (permissionStatus === false) {
					permission = "denied";
				} else {
					permission = "default";
				}
			} catch (permError) {
				console.warn("Could not get permission status:", permError);
				// Fallback to native Notification API
				if ('Notification' in window) {
					permission = Notification.permission;
				}
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
			// In development, return mock success if domain restricted
			if (this.isDevelopment && !window.location.hostname.includes('underkover')) {
				console.log("OneSignal mock user ID set in development");
				return { success: true };
			}

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
			// In development, return mock success if domain restricted
			if (this.isDevelopment && !window.location.hostname.includes('underkover')) {
				console.log("OneSignal mock tags set in development");
				return { success: true };
			}

			await OneSignal.User.addTags(tags);
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
	appId: "22c5717d-d011-4611-b319-06b8691907d8",
	safariWebId: "web.onesignal.auto.3cfe9839-ceab-4809-9212-172318dbfb2e",
};

export const oneSignalService = new OneSignalService(oneSignalConfig);
export default oneSignalService;
export type { NotificationPayload, TargetOptions };
