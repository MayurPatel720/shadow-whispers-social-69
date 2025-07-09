
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, UserRound, MessageSquare, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

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
	userId?: string;
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
	userId,
}) => {
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	const handleWhisperClick = () => {
		if (userId && userId !== user?._id) {
			// Navigate to whispers page with the specific user selected
			navigate(`/whispers`, { state: { selectUserId: userId } });
		}
	};

	return (
		<CardHeader className="p-2 sm:p-4 md:p-5 pb-0 w-full">
			{/* DESKTOP Row (avatar/name left, actions right) */}
			{!isMobile ? (
				<div className="flex flex-row items-center justify-between gap-4 w-full">
					{/* Avatar + name/alias on left */}
					<div className="flex items-center min-w-0 gap-3">
						<div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-undercover-dark text-2xl sm:text-3xl shrink-0">
							{profileData?.avatarEmoji || user.avatarEmoji || "🎭"}
						</div>
						<div className="flex flex-col min-w-0">
							<div className="flex items-center gap-2 min-w-0">
								<CardTitle className="text-lg sm:text-xl text-undercover-light-purple text-left truncate flex items-center gap-1 min-w-0">
									<span className="truncate">{displayedAlias}</span>
								</CardTitle>
							</div>
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
					</div>
					{/* Actions: ALL BUTTONS on the right as a horizontal row */}
					<div className="flex gap-2 flex-wrap items-center">
						{isOwnProfile ? (
							<>
								<Button variant="outline" size="sm" onClick={onEdit}>
									<Edit size={16} className="mr-2" />
									Edit
								</Button>
								<Button variant="outline" size="sm" onClick={onShowMessages}>
									<MessageSquare size={16} className="mr-2" />
									Messages
								</Button>
								<Button variant="outline" size="sm" onClick={onShowMatches}>
									<UserRound size={16} className="mr-2" />
									Your Matches
								</Button>
								{onShowRecognitions && (
									<Button
										variant="outline"
										size="sm"
										onClick={onShowRecognitions}
									>
										<Eye size={16} className="mr-2" />
										Recognitions
									</Button>
								)}
							</>
						) : (
							<Button
								variant="outline"
								size="sm"
								onClick={handleWhisperClick}
								className="w-full sm:w-auto"
							>
								<UserRound size={16} className="mr-2" />
								Whisper
							</Button>
						)}
					</div>
				</div>
			) : (
				/* MOBILE layout: keep current version for mobile, actions below */
				<>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3 w-full min-w-0">
							<div className="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-undercover-dark text-2xl sm:text-3xl shrink-0">
								{profileData?.avatarEmoji || user.avatarEmoji || "🎭"}
							</div>
							<div className="flex-1 flex items-center min-w-0">
								<div className="flex flex-col min-w-0 flex-1">
									<div className="flex items-center gap-1 min-w-0">
										<CardTitle className="text-lg sm:text-xl text-undercover-light-purple text-left truncate flex items-center gap-1 min-w-0">
											<span className="truncate">{displayedAlias}</span>
										</CardTitle>
										{isOwnProfile && (
											<Button
												variant="outline"
												size="icon"
												className="ml-2 h-8 w-8 p-0"
												onClick={onEdit}
												aria-label="Edit profile"
											>
												<Edit size={16} />
											</Button>
										)}
									</div>
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
							</div>
						</div>
					</div>
					{/* MOBILE: Actions stacked below and full width */}
					<div className="w-full">
						{isOwnProfile ? (
							<div className="flex w-full sm:hidden gap-2 mt-1">
								<Button
									className="flex-1"
									variant="outline"
									size="sm"
									onClick={onShowMatches}
								>
									<UserRound size={16} className="mr-2" />
									Your Matches
								</Button>
								<Button
									className="flex-1"
									variant="outline"
									size="sm"
									onClick={() => navigate("/whispers")}
								>
									<MessageSquare size={16} className="mr-2" />
									Messages
								</Button>
							</div>
						) : (
							<Button
								variant="outline"
								size="sm"
								onClick={handleWhisperClick}
								className="w-full sm:w-auto"
							>
								<UserRound size={16} className="mr-2" />
								Whisper
							</Button>
						)}
					</div>
				</>
			)}
		</CardHeader>
	);
};

export default ProfileHeader;
