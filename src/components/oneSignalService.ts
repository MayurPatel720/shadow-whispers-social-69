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

export const initializeOneSignal = async (appId: string): Promise<void> => {
	try {
		console.log("🚀 Initializing OneSignal with appId:", appId);
		await OneSignal.init({
			appId,
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
		});

		console.log("✅ OneSignal initialized successfully");
	} catch (error: any) {
		console.error("❌ Error initializing OneSignal:", error);
	}
};

export const getOneSignalPlayerId = async (): Promise<string | null> => {
	try {
		console.log("🔑 Fetching OneSignal Player ID...");
		const playerId = await OneSignal.User.PushSubscription.id;

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
};

export const sendNotification = async (
	playerIds: string[],
	payload: NotificationPayload
): Promise<void> => {
	try {
		console.log("✉️ Sending notification to player IDs:", playerIds, "with payload:", payload);

		const notification = {
			include_player_ids: playerIds,
			headings: { en: payload.title },
			contents: { en: payload.body },
			web_url: payload.url,
			app_url: payload.url,
			data: payload.data,
			buttons: payload.buttons,
		};

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const response = await OneSignal.push(notification);

		console.log("✅ Notification sent successfully:", response);
	} catch (error: any) {
		console.error("❌ Error sending notification:", error);
	}
};

export const requestNotificationPermission = async (): Promise<{
	success: boolean;
	error?: string;
	playerId?: string;
}> => {
	try {
		console.log("🔔 Starting notification permission request...");

		// Check if OneSignal is initialized
		if (!OneSignal.User) {
			console.error("❌ OneSignal not initialized");
			return { success: false, error: "OneSignal not initialized" };
		}

		// Check current permission status
		const hasPermission = await OneSignal.Notifications.permission;
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
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Get the player ID after subscription
			const playerId = OneSignal.User.PushSubscription.id;
			console.log("📱 Player ID after opt-in:", playerId);
			
			if (playerId) {
				console.log("✅ Successfully subscribed with player ID:", playerId);
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
};

export const setExternalUserId = async (userId: string): Promise<void> => {
	try {
		console.log(`🔗 Setting external user ID: ${userId}`);
		await OneSignal.login(userId);
		console.log("✅ External user ID set successfully");
	} catch (error: any) {
		console.error("❌ Error setting external user ID:", error);
	}
};

export const removeExternalUserId = async (): Promise<void> => {
	try {
		console.log("🚪 Removing external user ID");
		await OneSignal.logout();
		console.log("✅ External user ID removed successfully");
	} catch (error: any) {
		console.error("❌ Error removing external user ID:", error);
	}
};
