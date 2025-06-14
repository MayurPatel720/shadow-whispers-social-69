/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, UserRound, MessageSquare } from "lucide-react";

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
	// Always left-align for others, more balanced for self
	return (
		<CardHeader className="p-2 sm:p-4 md:p-5 pb-0">
			<div
				className={`flex flex-col gap-2 ${
					isOwnProfile ? "sm:flex-row sm:items-center sm:justify-between" : ""
				}`}
			>
				<div className={`flex flex-col xs:flex-row items-start gap-1 w-full`}>
					{/* Top-left alignment for avatar/name/username */}
					<div className="flex items-center gap-3">
						<div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-undercover-dark text-2xl sm:text-3xl">
							{profileData?.avatarEmoji || user.avatarEmoji || "🎭"}
						</div>
						<div>
							{/* Left-align name and username */}
							<CardTitle className="text-lg sm:text-xl text-undercover-light-purple text-left">
								{displayedAlias}
							</CardTitle>
							<p className="text-xs sm:text-sm text-muted-foreground break-words max-w-[120px] sm:max-w-none text-left">
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
					{/* Edit button only for own profile on mobile */}
					{isOwnProfile && (
						<div className="block sm:hidden mt-2">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8"
								onClick={onEdit}
							>
								<Edit size={16} />
							</Button>
						</div>
					)}
				</div>
				{/* Right controls for own profile, top for others */}
				<div
					className={`flex gap-2 w-full ${
						isOwnProfile
							? "hidden sm:flex sm:w-auto sm:justify-end"
							: "justify-end mt-2 sm:mt-0"
					}`}
				>
					{isOwnProfile ? (
						<>
							<Button variant="outline" size="sm" onClick={onEdit}>
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
						<Button variant="outline" size="sm" onClick={onWhisper}>
							<UserRound size={16} className="mr-2" />
							Whisper
						</Button>
					)}
				</div>
				{/* Mobile-only bottom row for controls */}
				{isOwnProfile && (
					<div className="flex sm:hidden gap-2 mt-1 w-full">
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={onEdit}
						>
							<Edit size={16} className="mr-2" />
							Edit
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={onShowMatches}
						>
							<UserRound size={16} className="mr-2" />
							Your Matches
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={onShowMessages}
						>
							<MessageSquare size={16} className="mr-2" />
							Messages
						</Button>
					</div>
				)}
				{!isOwnProfile && (
					<div className="flex sm:hidden mt-1 w-full">
						<Button
							variant="outline"
							size="sm"
							className="w-full"
							onClick={onWhisper}
						>
							<UserRound size={16} className="mr-2" />
							Whisper
						</Button>
					</div>
				)}
			</div>
		</CardHeader>
	);
};

export default ProfileHeader;
