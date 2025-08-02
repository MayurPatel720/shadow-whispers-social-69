
import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

interface NotificationPermissionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEnable: () => Promise<void>;
	onDecline: () => void;
}

const NotificationPermissionDialog = ({
	open,
	onOpenChange,
	onEnable,
	onDecline,
}: NotificationPermissionDialogProps) => {
	const [isEnabling, setIsEnabling] = React.useState(false);
	const [permission, setPermission] = React.useState<NotificationPermission>("default");

	React.useEffect(() => {
		if ('Notification' in window) {
			setPermission(Notification.permission);
		}
	}, []);

	const handleEnable = async () => {
		setIsEnabling(true);
		try {
			await onEnable();
		} finally {
			setIsEnabling(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-center">
						<Bell className="h-5 w-5 text-purple-500" />
						Stay Connected with UnderKover
					</DialogTitle>
					<DialogDescription className="text-center pt-2">
						{permission === "denied" ? (
							<>
								You've previously blocked notifications for this site. To enable notifications:
								<br />
								<br />
								<span className="text-sm font-medium">
									1. Click the 🔒 lock icon in your browser address bar<br />
									2. Set notifications to "Allow"<br />
									3. Refresh the page
								</span>
							</>
						) : (
							<>
								Enable notifications to get instant updates when someone responds to your posts, 
								sends you a whisper, or when there's breaking news on campus. 
								<br />
								<br />
								<span className="text-sm text-muted-foreground">
									You can always change this in your browser settings later.
								</span>
							</>
						)}
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3 pt-4">
					{permission === "denied" ? (
						<Button
							variant="outline"
							onClick={onDecline}
							className="flex items-center justify-center gap-2 h-12 text-base"
						>
							Got It
						</Button>
					) : (
						<>
							<Button
								onClick={handleEnable}
								disabled={isEnabling}
								className="bg-purple-600 hover:bg-purple-700 text-white h-12 text-base font-medium"
							>
								{isEnabling ? "Enabling..." : "🔔 Enable Notifications"}
							</Button>
							<Button
								variant="outline"
								onClick={onDecline}
								className="flex items-center justify-center gap-2 h-12 text-base"
							>
								<BellOff className="h-4 w-4" />
								Not Now
							</Button>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default NotificationPermissionDialog;
