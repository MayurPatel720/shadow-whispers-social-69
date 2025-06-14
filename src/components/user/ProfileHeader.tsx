
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, UserRound, MessageSquare, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileHeaderProps {
	isOwnProfile: boolean;
	profileData: any;
	user: any;
	displayedAlias: string;
	claimedBadges: any[];
	onEdit: () => void;
	onShowMatches: () => void;
	onShowMessages: () => void;
	onWhisper: () => void;
	onShowRecognitions?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
	isOwnProfile,
	profileData,
	user,
	displayedAlias,
	claimedBadges,
	onEdit,
	onShowMatches,
	onShowMessages,
	onWhisper,
	onShowRecognitions,
}) => {
	const isMobile = useIsMobile();

	return (
		<CardHeader className="p-4 pb-0 w-full">
			{/* Avatar and Name Section */}
			<div className="flex items-center gap-3 mb-4">
				<div className="h-16 w-16 flex items-center justify-center rounded-full bg-undercover-dark text-3xl shrink-0">
					{profileData?.avatarEmoji || user.avatarEmoji || "🎭"}
				</div>
				<div className="flex flex-col min-w-0 flex-1">
					<div className="flex items-center gap-2 min-w-0">
						<CardTitle className="text-xl text-undercover-light-purple text-left truncate">
							{displayedAlias}
						</CardTitle>
						{isOwnProfile && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 p-0"
								onClick={onEdit}
								aria-label="Edit profile"
							>
								<Edit size={16} />
							</Button>
						)}
					</div>
					<p className="text-sm text-muted-foreground text-left truncate">
						@{profileData?.username || user.username}
					</p>
					{claimedBadges.length > 0 && (
						<div className="flex gap-1 mt-1">
							{claimedBadges.map((reward) => (
								<span
									key={reward.tierLevel}
									className="text-lg"
									title="Shadow Recruiter Badge"
								>
									{reward.tierLevel === 1 ? "🥷" : ""}
								</span>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Horizontal Button Row - matching first image layout */}
			<div className="flex gap-2 w-full justify-center mb-4">
				{isOwnProfile ? (
					<>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={onShowMatches}
							className="flex items-center gap-2 flex-1 max-w-[120px]"
						>
							<UserRound size={16} />
							<span className="hidden sm:inline">Your Matches</span>
							<span className="sm:hidden">Matches</span>
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={onShowMessages}
							className="flex items-center gap-2 flex-1 max-w-[120px]"
						>
							<MessageSquare size={16} />
							<span>Messages</span>
						</Button>
						{onShowRecognitions && (
							<Button 
								variant="outline" 
								size="sm" 
								onClick={onShowRecognitions}
								className="flex items-center gap-2 flex-1 max-w-[120px]"
							>
								<Eye size={16} />
								<span className="hidden sm:inline">Recognitions</span>
								<span className="sm:hidden">Recog</span>
							</Button>
						)}
					</>
				) : (
					<Button
						variant="outline"
						size="sm"
						onClick={onWhisper}
						className="flex items-center gap-2 max-w-[120px]"
					>
						<UserRound size={16} />
						Whisper
					</Button>
				)}
			</div>
		</CardHeader>
	);
};

export default ProfileHeader;
