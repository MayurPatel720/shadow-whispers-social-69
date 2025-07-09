
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
					<DialogTitle className="flex items-center gap-2">
						<Bell className="h-5 w-5 text-purple-500" />
						Enable Notifications?
					</DialogTitle>
					<DialogDescription className="text-left">
						Stay updated with new messages, friend requests, and important
						updates from UnderKover. You can change this anytime in your
						browser settings.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-2 pt-4">
					<Button
						onClick={handleEnable}
						disabled={isEnabling}
						className="bg-purple-600 hover:bg-purple-700 text-white"
					>
						{isEnabling ? "Enabling..." : "Enable Notifications"}
					</Button>
					<Button
						variant="outline"
						onClick={onDecline}
						className="flex items-center gap-2"
					>
						<BellOff className="h-4 w-4" />
						Maybe Later
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default NotificationPermissionDialog;
