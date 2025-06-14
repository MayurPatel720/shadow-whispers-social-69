import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, UserRound, MessageSquare, X } from "lucide-react";

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
}) => {
	return (
		<CardHeader className="p-2 sm:p-4 md:p-5 pb-0">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				{/* Avatar + alias/name row */}
				<div className={`flex flex-col xs:flex-row items-start gap-1 w-full`}>
					<div className="flex items-center gap-3 w-full min-w-0">
						{/* Avatar */}
						<div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-undercover-dark text-2xl sm:text-3xl shrink-0">
							{profileData?.avatarEmoji || user.avatarEmoji || "🎭"}
						</div>
						{/* Alias/Name + Edit (all on one row for mobile) */}
						<div className="flex-1 flex items-center min-w-0">
							<div className="flex flex-col min-w-0">
								<CardTitle className="text-lg sm:text-xl text-undercover-light-purple text-left truncate">
									{displayedAlias}
								</CardTitle>
								<p className="text-xs sm:text-sm text-muted-foreground break-words max-w-[120px] sm:max-w-none text-left truncate">
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
							{isOwnProfile && (
								<Button
									variant="outline"
									size="icon"
									className="ml-2 h-8 w-8"
									onClick={onEdit}
									aria-label="Edit profile"
								>
									<Edit size={16} />
								</Button>
							)}
						</div>
					</div>
				</div>
				{/* Actions */}
				<div
					className={`flex gap-2 w-full flex-wrap justify-end mt-2 sm:mt-0 ${
						isOwnProfile
							? "sm:flex sm:w-auto"
							: ""
					}`}
				>
					{isOwnProfile ? (
						<>
							<Button variant="outline" size="sm" onClick={onEdit} className="hidden sm:flex">
								<Edit size={16} className="mr-2" />
								Edit
							</Button>
							<Button variant="outline" size="sm" onClick={onShowMatches}>
								<UserRound size={16} className="mr-2" />
								Your Matches
							</Button>
							<Button variant="outline" size="sm" onClick={onShowMessages}>
								<MessageSquare size={16} className="mr-2" />
								Messages
							</Button>
						</>
					) : (
						<Button variant="outline" size="sm" onClick={onWhisper} className="w-full sm:w-auto">
							<UserRound size={16} className="mr-2" />
							Whisper
						</Button>
					)}
				</div>
			</div>
		</CardHeader>
	);
};

export default ProfileHeader;
