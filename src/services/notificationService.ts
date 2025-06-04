
import { api } from "@/lib/api";

export interface PushSubscription {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
}

class NotificationService {
	private vapidPublicKey =
		"BIW1fqapVHYJS_j_vQWr32lMj0mlE-KBdRrgCMCODxRgYdH-kncIF3cPT5NPuvwlqfHEFLZ6Smmc38y2T2aAqGo";

	async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
		if ("serviceWorker" in navigator) {
			try {
				// Register with the correct path
				const registration = await navigator.serviceWorker.register("/sw.js");
				console.log("Service Worker registered successfully:", registration);

				// Wait for service worker to be ready
				await navigator.serviceWorker.ready;
				console.log("Service Worker is ready");

				return registration;
			} catch (error) {
				console.error("Service Worker registration failed:", error);
				return null;
			}
		}
		console.warn("Service Worker not supported");
		return null;
	}

	async requestNotificationPermission(): Promise<NotificationPermission> {
		if (!("Notification" in window)) {
			throw new Error("Notifications not supported");
		}

		// First check current permission
		if (Notification.permission === "granted") {
			return "granted";
		}

		if (Notification.permission === "denied") {
			return "denied";
		}

		// Request permission
		const permission = await Notification.requestPermission();
		console.log("Notification permission result:", permission);
		return permission;
	}

	async subscribeToPush(userId: string): Promise<PushSubscription | null> {
		try {
			console.log("Starting push subscription for user:", userId);

			const registration = await this.registerServiceWorker();
			if (!registration) {
				throw new Error("Service Worker not available");
			}

			// Check if already subscribed
			let subscription = await registration.pushManager.getSubscription();
			console.log("Existing subscription:", subscription);

			if (!subscription) {
				console.log("Creating new push subscription...");
				// Create new subscription
				subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
				});
				console.log("New subscription created:", subscription);
			}

			// Convert subscription to our format
			const subscriptionData = {
				endpoint: subscription.endpoint,
				keys: {
					p256dh: btoa(
						String.fromCharCode(
							...new Uint8Array(subscription.getKey("p256dh") as ArrayBuffer)
						)
					),
					auth: btoa(
						String.fromCharCode(
							...new Uint8Array(subscription.getKey("auth") as ArrayBuffer)
						)
					),
				},
			};

			console.log("Sending subscription to backend:", subscriptionData);

			// Send subscription to backend
			const response = await api.post("/api/notifications/subscribe", {
				userId,
				subscription: subscriptionData,
			});

			console.log("Backend response:", response.data);
			return subscriptionData;
		} catch (error) {
			console.error("Push subscription failed:", error);
			return null;
		}
	}

	private urlBase64ToUint8Array(base64String: string): Uint8Array {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

	async sendTestNotification(
		userId: string,
		title: string,
		message: string
	): Promise<void> {
		try {
			console.log("Sending test notification for user:", userId);
			const response = await api.post("/api/notifications/send-push", {
				userId,
				title,
				message,
			});
			console.log("Test notification sent:", response.data);
		} catch (error) {
			console.error("Failed to send test notification:", error);
			throw error;
		}
	}

	async checkSubscription(): Promise<boolean> {
		try {
			const registration = await navigator.serviceWorker.getRegistration();
			if (!registration) return false;

			const subscription = await registration.pushManager.getSubscription();
			return !!subscription;
		} catch (error) {
			console.error("Error checking subscription:", error);
			return false;
		}
	}
}

export const notificationService = new NotificationService();
