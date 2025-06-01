// src/components/NotificationButton.tsx
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { initSocket } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const NotificationButton: React.FC = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const userId = user?._id;

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

		// Request notification permission
		const requestPermission = async () => {
			const perm = await Notification.requestPermission();
			console.log("Notification permission:", perm);
			if (perm !== "granted") {
				toast({
					variant: "destructive",
					title: "Permission Denied",
					description: "Please allow notifications to receive message alerts.",
				});
			}
		};
		requestPermission();

		const socket = initSocket();

		socket.on("connect", () => {
			console.log("Notification socket connected, ID:", socket.id);
			socket.emit("join", userId); // Join individual room
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
				// Ensure permission is granted
				if (Notification.permission === "granted") {
					new Notification(title, {
						body,
						icon: "/lovable-Uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
					});
					console.log("Browser notification displayed:", title);
					toast({
						title,
						description: body,
					});
				} else {
					console.warn(
						"Notification permission not granted:",
						Notification.permission
					);
					requestPermission();
				}
			}
		);

		return () => {
			socket.disconnect();
			console.log("Notification socket disconnected");
		};
	}, [userId, toast]);

	const handleTestNotification = async () => {
		try {
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
			if (Notification.permission === "granted") {
				new Notification("Test Notification", {
					body: "Triggered from frontend!",
					icon: "/lovable-Uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png",
				});
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

	return (
		<Button onClick={handleTestNotification} variant="outline">
			Test Notification
		</Button>
	);
};

export default NotificationButton;
