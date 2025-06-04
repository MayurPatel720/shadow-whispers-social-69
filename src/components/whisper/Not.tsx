
// src/components/NotificationButton.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { initSocket } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const NotificationButton: React.FC = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
	const userId = user?._id;

	// Check if we're on mobile
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	const isAndroid = /Android/.test(navigator.userAgent);

	useEffect(() => {
		if (!userId) {
			console.log("No user ID available. Please log in.");
			toast({
				variant: "destructive",
				title: "Authentication Error",
				description: "Please log in to receive notifications.",
			});
			return;
		}

		// Check notification support
		if (!("Notification" in window)) {
			console.log("Browser does not support notifications.");
			toast({
				variant: "destructive",
				title: "Browser Not Supported",
				description: "Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari.",
			});
			return;
		}

		// Set initial permission status
		setPermissionStatus(Notification.permission);

		// Special handling for mobile browsers
		const handleMobileNotifications = () => {
			if (isMobile) {
				// For iOS Safari, notifications only work if the site is added to home screen
				if (isIOS && !window.navigator.standalone) {
					toast({
						title: "iOS Notification Setup",
						description: "On iOS, add this app to your home screen for full notification support.",
						duration: 8000,
					});
				}
				
				// For Android Chrome, ensure notifications are enabled
				if (isAndroid && Notification.permission === 'default') {
					toast({
						title: "Enable Notifications",
						description: "Tap 'Enable Notifications' and allow when prompted for the best experience.",
						duration: 6000,
					});
				}
			}
		};

		handleMobileNotifications();

		const socket = initSocket();

		socket.on("connect", () => {
			console.log("Notification socket connected, ID:", socket.id);
			socket.emit("join", userId);
			console.log(`Joined individual room ${userId}`);
		});

		socket.on("connect_error", (err) => {
			console.error("Notification socket connection error:", err.message);
			toast({
				variant: "destructive",
				title: "Connection Error",
				description: "Failed to connect to notification service.",
			});
		});

		socket.on(
			"notification",
			({ title, body }: { title: string; body: string }) => {
				console.log("Received notification:", { title, body });
				
				// Always show in-app toast as fallback
				toast({
					title,
					description: body,
					duration: 5000,
				});

				// Try to show browser notification if permission is granted
				if (Notification.permission === "granted") {
					try {
						// Enhanced notification options for mobile
						const notificationOptions: NotificationOptions = {
							body,
							icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
							badge: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
							tag: "whisper-notification-" + Date.now(),
							requireInteraction: isMobile,
							silent: false,
							vibrate: isMobile ? [200, 100, 200] : undefined,
							actions: isMobile ? [
								{
									action: 'open',
									title: 'Open App'
								}
							] : undefined
						};

						const notification = new Notification(title, notificationOptions);
						
						// Handle notification click
						notification.onclick = () => {
							window.focus();
							notification.close();
						};
						
						// Auto-close on mobile to prevent clutter
						if (isMobile) {
							setTimeout(() => {
								if (notification) {
									notification.close();
								}
							}, 6000);
						}
						
						console.log("Browser notification displayed:", title);
					} catch (error) {
						console.error("Error showing notification:", error);
						// Fallback to enhanced in-app notification
						toast({
							title: "📱 " + title,
							description: body + " (Browser notification failed)",
							duration: 8000,
						});
					}
				} else {
					console.warn("Notification permission not granted:", Notification.permission);
					
					// Show permission reminder for mobile users
					if (isMobile && Notification.permission === 'denied') {
						toast({
							title: "Notifications Disabled",
							description: "Go to browser settings > Site settings > Notifications to enable alerts.",
							duration: 6000,
						});
					}
				}
			}
		);

		return () => {
			socket.disconnect();
			console.log("Notification socket disconnected");
		};
	}, [userId, toast, isMobile, isIOS, isAndroid]);

	const handleTestNotification = async () => {
		try {
			// Enhanced permission request for mobile
			if (Notification.permission !== 'granted') {
				const permission = await Notification.requestPermission();
				setPermissionStatus(permission);
				
				if (permission !== 'granted') {
					toast({
						variant: "destructive",
						title: "Permission Required",
						description: isMobile 
							? "Please enable notifications in your browser settings for this site."
							: "Please allow notifications to test the feature.",
						duration: 6000,
					});
					return;
				}
			}

			const response = await api.post("/api/notifications", {
				title: "Test Notification",
				message: "This is a test from your mobile device!",
				userId,
			});
			
			console.log("Test notification response:", response.data);
			
			toast({
				title: "Test Notification Sent",
				description: "Check if you received the notification!",
			});
			
			// Show enhanced test browser notification for mobile
			if (Notification.permission === "granted") {
				const notification = new Notification("Test Notification", {
					body: "This is a test from your mobile device!",
					icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
					tag: "test-notification",
					vibrate: isMobile ? [300, 200, 300] : undefined,
					requireInteraction: isMobile,
				});
				
				if (isMobile) {
					setTimeout(() => notification.close(), 4000);
				}
			}
		} catch (error) {
			console.error("Error sending test notification:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to send test notification.",
			});
		}
	};

	const handleEnableNotifications = async () => {
		try {
			// Enhanced permission request with mobile considerations
			if (isMobile) {
				toast({
					title: "Permission Request",
					description: "Please allow notifications when your browser prompts you.",
					duration: 4000,
				});
			}

			const permission = await Notification.requestPermission();
			setPermissionStatus(permission);
			
			if (permission === 'granted') {
				toast({
					title: "Notifications Enabled! 🎉",
					description: "You'll now receive push notifications for messages!",
				});
				
				// Show immediate test notification on success
				setTimeout(() => {
					if (Notification.permission === "granted") {
						const welcomeNotification = new Notification("Welcome!", {
							body: "Notifications are now enabled for this device.",
							icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
							tag: "welcome-notification",
							vibrate: isMobile ? [200, 100, 200] : undefined,
						});
						
						if (isMobile) {
							setTimeout(() => welcomeNotification.close(), 3000);
						}
					}
				}, 500);
			} else {
				const errorMessage = isMobile 
					? "Notifications blocked. Go to browser settings > Site settings > Notifications to enable."
					: "Please allow notifications when prompted by your browser.";
				
				toast({
					variant: "destructive",
					title: "Permission Denied",
					description: errorMessage,
					duration: 8000,
				});
			}
		} catch (error) {
			console.error("Error requesting permission:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Could not request notification permission. Try refreshing the page.",
			});
		}
	};

	// Show different instructions based on device
	const getInstructions = () => {
		if (isIOS) {
			return "For best results on iOS: Add to home screen, then enable notifications.";
		} else if (isAndroid) {
			return "Android: Allow notifications when prompted by Chrome.";
		} else {
			return "Desktop: Click allow when your browser asks for permission.";
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{permissionStatus !== 'granted' && (
				<div className="space-y-2">
					<Button 
						onClick={handleEnableNotifications} 
						variant="outline"
						className="text-sm"
					>
						Enable Notifications
					</Button>
					<p className="text-xs text-muted-foreground">
						{getInstructions()}
					</p>
				</div>
			)}
			<Button onClick={handleTestNotification} variant="outline">
				Test Notification
			</Button>
			<div className="text-xs text-muted-foreground space-y-1">
				<p>Status: {permissionStatus === 'granted' ? '✅ Enabled' : '❌ Disabled'}</p>
				<p>Device: {isMobile ? (isIOS ? 'iOS' : 'Mobile') : 'Desktop'}</p>
			</div>
		</div>
	);
};

export default NotificationButton;
