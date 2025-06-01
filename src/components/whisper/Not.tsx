
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

		if (!("Notification" in window)) {
			console.log("Browser does not support notifications.");
			toast({
				variant: "destructive",
				title: "Browser Error",
				description: "Notifications are not supported in this browser.",
			});
			return;
		}

		// Set initial permission status
		setPermissionStatus(Notification.permission);

		// Enhanced permission request for mobile
		const requestPermission = async () => {
			try {
				// For mobile, we need to request permission on user interaction
				if (isMobile) {
					// Show a custom toast to encourage manual permission enabling
					if (Notification.permission === 'default') {
						toast({
							title: "Enable Notifications",
							description: "Please allow notifications when prompted to receive message alerts.",
							duration: 5000,
						});
					}
				}

				const permission = await Notification.requestPermission();
				setPermissionStatus(permission);
				console.log("Notification permission:", permission);
				
				if (permission !== "granted") {
					toast({
						variant: "destructive",
						title: "Permission Denied",
						description: isMobile 
							? "Please enable notifications in your browser settings for this app."
							: "Please allow notifications to receive message alerts.",
					});
				} else {
					toast({
						title: "Notifications Enabled",
						description: "You'll now receive push notifications for new messages!",
					});
				}
			} catch (error) {
				console.error("Error requesting notification permission:", error);
				toast({
					variant: "destructive",
					title: "Permission Error",
					description: "Could not request notification permission.",
				});
			}
		};

		// Request permission immediately for desktop, or wait for user interaction on mobile
		if (!isMobile && Notification.permission === 'default') {
			requestPermission();
		}

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
				
				// Always show in-app toast
				toast({
					title,
					description: body,
				});

				// Try to show browser notification if permission is granted
				if (Notification.permission === "granted") {
					try {
						const notification = new Notification(title, {
							body,
							icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
							badge: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
							tag: "whisper-notification",
							requireInteraction: isMobile, // Keep notification visible longer on mobile
							silent: false,
						});
						
						// Auto-close notification after 5 seconds on mobile to prevent clutter
						if (isMobile) {
							setTimeout(() => notification.close(), 5000);
						}
						
						console.log("Browser notification displayed:", title);
					} catch (error) {
						console.error("Error showing notification:", error);
					}
				} else {
					console.warn("Notification permission not granted:", Notification.permission);
					// On mobile, remind user to enable notifications
					if (isMobile && Notification.permission === 'denied') {
						toast({
							title: "Notifications Disabled",
							description: "Enable notifications in browser settings to receive alerts.",
							duration: 3000,
						});
					}
				}
			}
		);

		return () => {
			socket.disconnect();
			console.log("Notification socket disconnected");
		};
	}, [userId, toast, isMobile]);

	const handleTestNotification = async () => {
		try {
			// Request permission first on mobile if not already granted
			if (isMobile && Notification.permission !== 'granted') {
				const permission = await Notification.requestPermission();
				setPermissionStatus(permission);
				if (permission !== 'granted') {
					toast({
						variant: "destructive",
						title: "Permission Required",
						description: "Please allow notifications to test the feature.",
					});
					return;
				}
			}

			const response = await api.post("/api/notifications", {
				title: "Test Notification",
				message: "Triggered from frontend!",
				userId,
			});
			
			console.log("Test notification response:", response.data);
			
			toast({
				title: "Test Notification Sent",
				description: "Check your notifications!",
			});
			
			// Show test browser notification
			if (Notification.permission === "granted") {
				const notification = new Notification("Test Notification", {
					body: "Triggered from frontend!",
					icon: "/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
					tag: "test-notification",
				});
				
				if (isMobile) {
					setTimeout(() => notification.close(), 3000);
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
			const permission = await Notification.requestPermission();
			setPermissionStatus(permission);
			
			if (permission === 'granted') {
				toast({
					title: "Notifications Enabled",
					description: "You'll now receive push notifications!",
				});
			} else {
				toast({
					variant: "destructive",
					title: "Permission Denied",
					description: isMobile 
						? "Please enable notifications in your browser settings."
						: "Please allow notifications when prompted.",
				});
			}
		} catch (error) {
			console.error("Error requesting permission:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Could not request notification permission.",
			});
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{permissionStatus !== 'granted' && (
				<Button 
					onClick={handleEnableNotifications} 
					variant="outline"
					className="text-sm"
				>
					Enable Notifications
				</Button>
			)}
			<Button onClick={handleTestNotification} variant="outline">
				Test Notification
			</Button>
			{isMobile && (
				<p className="text-xs text-muted-foreground">
					Status: {permissionStatus === 'granted' ? '✅ Enabled' : '❌ Disabled'}
				</p>
			)}
		</div>
	);
};

export default NotificationButton;
