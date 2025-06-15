import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	UserRound,
	Settings,
	LogOut,
	Image,
	Grid,
	Edit,
	MessageSquare,
	Trash2,
	Award,
	Eye,
	Send,
	Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserPosts, deletePost } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import EditProfileModal from "./EditProfileModal";
import EditPostModal from "@/components/feed/EditPostModal";
import DeletePostDialog from "@/components/feed/DeletePostDialog";
import RecognitionModal from "@/components/recognition/RecognitionModal";
import { toast } from "@/hooks/use-toast";
import { User, Post } from "@/types/user";
import { Textarea } from "@/components/ui/textarea";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import PostsGrid from "./PostsGrid";
import ProfileSettings from "./ProfileSettings";

interface ProfileComponentProps {
	userId?: string;
	anonymousAlias?: string;
}

const ProfileComponent = ({
	userId: targetUserId,
	anonymousAlias: targetAlias,
}: ProfileComponentProps) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [editProfileOpen, setEditProfileOpen] = useState(false);
	const [recognitionModalOpen, setRecognitionModalOpen] = useState(false);
	const [editPostModalOpen, setEditPostModalOpen] = useState(false);
	const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);

	// For "Your Matches"
	const [matchesModalOpen, setMatchesModalOpen] = useState(false);
	// To trigger edit profile if missing data for matches:
	const [forceProfileEdit, setForceProfileEdit] = useState(false);

	const isOwnProfile = !targetUserId || targetUserId === user?._id;
	const currentUserId = isOwnProfile ? user?._id : targetUserId;

	const {
		data: profileData,
		isLoading: profileLoading,
		refetch: refetchProfile,
	} = useQuery<User>({
		queryKey: ["userProfile", targetUserId || user?._id],
		queryFn: () => getUserProfile(currentUserId!),
		enabled: !!currentUserId,
		meta: {
			onError: () => {
				toast({
					variant: "destructive",
					title: "Failed to load profile",
					description: "Could not retrieve profile information.",
				});
			},
		},
	});

	const {
		data: userPosts,
		isLoading: postsLoading,
		refetch,
	} = useQuery<Post[]>({
		queryKey: ["userPosts", currentUserId],
		queryFn: () => getUserPosts(currentUserId!),
		enabled: !!currentUserId,
		meta: {
			onError: () => {
				toast({
					variant: "destructive",
					title: "Failed to load posts",
					description: "Could not retrieve posts.",
				});
			},
		},
	});

	const handleEditPost = (post: Post) => {
		setSelectedPost(post);
		setEditPostModalOpen(true);
	};

	const handleDeletePost = (post: Post) => {
		setSelectedPost(post);
		setDeletePostDialogOpen(true);
	};

	const handlePostUpdated = () => {
		refetch();
		setEditPostModalOpen(false);
		setSelectedPost(null);
	};

	const handlePostDeleted = () => {
		refetch();
		setDeletePostDialogOpen(false);
		setSelectedPost(null);
	};

	const handleWhisperClick = () => {
		if (targetUserId && targetUserId !== user?._id) {
			navigate(`/chat/${targetUserId}`);
		} else {
			toast({
				variant: "destructive",
				title: "Cannot Whisper",
				description: "You cannot whisper to yourself!",
			});
		}
	};

	const handleEditModal = () => {
		setEditProfileOpen(true);
	};

	const handleShowMatches = () => {
		setMatchesModalOpen(true);
	};

	const handleShowMessages = () => {
		navigate("/whispers");
	};

	const showMatchesModal = () => setMatchesModalOpen(true);

	// Callback sent to YourMatchesModal—to be called if matches can't be loaded due to missing gender/interests
	const handleRequireProfileEditForMatches = () => {
		setMatchesModalOpen(false);
		setEditProfileOpen(true);
		setForceProfileEdit(true);
	};

	// When the edit profile modal closes, clear the force flag
	useEffect(() => {
		if (!editProfileOpen) setForceProfileEdit(false);
	}, [editProfileOpen]);

	const isLoading = profileLoading || postsLoading;

	if (!user) return null;

	const displayedAlias = isOwnProfile
		? profileData?.anonymousAlias || user.anonymousAlias || "Unknown User"
		: targetAlias || profileData?.anonymousAlias || "Unknown User";

	// FOR BIO: show the user's bio (profileData), but fallback to user.bio or a default
	const profileBio =
		profileData?.bio ||
		user.bio ||
		`In Undercover, you're known as ${displayedAlias}. This identity stays consistent throughout your experience.`;

	const userStats = {
		posts: userPosts?.length || 0,
		recognizedBy: profileData?.identityRecognizers?.length || 0,
		recognized: profileData?.recognizedUsers?.length || 0,
		recognitionRate:
			profileData?.identityRecognizers?.length &&
			profileData.recognizedUsers?.length
				? Math.round(
						(profileData.recognizedUsers.length /
							profileData.identityRecognizers.length) *
							100
				  ) || 0
				: 0,
	};

	const claimedBadges =
		profileData?.claimedRewards?.filter(
			(reward) => reward.rewardType === "badge" && reward.status === "completed"
		) || [];

	// If user is not verified and this is their own profile, block posting
	const blockPost = isOwnProfile && user && !user.isEmailVerified;

	return (
		<div className="w-full max-w-4xl mx-auto px-2 py-2 sm:px-4 sm:py-4">
			{blockPost && (
				<div className="mb-4 flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded shadow-sm">
					<AlertTriangle className="text-yellow-500" size={20} />
					<span className="text-sm font-medium text-yellow-800">
						To post, chat, or use all features, please verify your email in the Settings tab below.
					</span>
				</div>
			)}
			<Card className="bg-card shadow-md border border-undercover-purple/20 mb-4">
				<ProfileHeader
					isOwnProfile={isOwnProfile}
					profileData={profileData}
					user={user}
					displayedAlias={displayedAlias}
					claimedBadges={claimedBadges}
					onEdit={handleEditModal}
					onShowMatches={handleShowMatches}
					onShowMessages={handleShowMessages}
					onWhisper={handleWhisperClick}
				/>
				<CardContent className="p-2 sm:p-4 md:p-6 pt-3">
					<div className="border-t border-border my-2 sm:my-3"></div>
					<div className="space-y-3">
						<h3 className="text-sm sm:text-base font-medium">
							{isOwnProfile ? "Your Anonymous Identity" : "About this user"}
						</h3>
						<div className="text-sm text-muted-foreground mb-3 break-words whitespace-pre-line ">
							{profileBio}
						</div>
						<ProfileStats
							userStats={userStats}
							onShowRecognitions={() => setRecognitionModalOpen(true)}
						/>
					</div>
					{/* Rewards section */}
					{profileData?.claimedRewards?.length > 0 && (
						<div className="mt-4 sm:mt-6">
							<h3 className="text-sm sm:text-base font-medium flex items-center mb-2">
								<Award size={16} className="mr-2" />
								Your Rewards
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
								{profileData.claimedRewards.map((reward, index) => (
									<div
										key={index}
										className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground p-2 bg-card/50 rounded-md hover:bg-card transition-colors"
									>
										<span>
											{reward.rewardType === "badge"
												? "🥷"
												: reward.rewardType === "cash"
												? "💰"
												: "⭐"}
										</span>
										<p>
											{reward.rewardType === "badge"
												? "Shadow Recruiter Badge"
												: reward.rewardType === "cash"
												? "₹100 Cash Reward"
												: "Premium Features"}{" "}
											- {reward.status === "completed" ? "Claimed" : "Pending"}
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Tabs defaultValue="posts" className="w-full">
				<TabsList className="w-full grid grid-cols-2 mb-4">
					<TabsTrigger
						value="posts"
						className="text-sm data-[state=active]:bg-undercover-purple data-[state=active]:text-white transition-colors"
					>
						<Grid size={16} className="mr-2" />
						Posts
					</TabsTrigger>
					<TabsTrigger
						value="settings"
						className="text-sm data-[state=active]:bg-undercover-purple data-[state=active]:text-white transition-colors"
					>
						<Settings size={16} className="mr-2" />
						Settings
					</TabsTrigger>
				</TabsList>
				<TabsContent value="posts">
					{blockPost && (
						<div className="mb-5 rounded-md border border-yellow-300 bg-yellow-100/50 px-4 py-3 text-center text-yellow-800 font-semibold text-sm">
							Posting is disabled until you verify your email.
						</div>
					)}
					<PostsGrid
						isLoading={isLoading}
						userPosts={userPosts}
						isOwnProfile={isOwnProfile}
						onEdit={handleEditPost}
						onDelete={handleDeletePost}
						onCreatePost={() => {
							if (blockPost) {
								toast({
									variant: "destructive",
									title: "Email Not Verified",
									description: "You must verify your email before creating posts.",
								});
								return;
							}
							navigate("/");
						}}
					/>
				</TabsContent>
				<TabsContent value="settings">
					<ProfileSettings
						isOwnProfile={isOwnProfile}
						onAccountSettings={() => navigate("/profile/settings")}
						onLogout={() => {
							if (window.confirm("Are you sure you want to log out?")) logout();
						}}
					/>
				</TabsContent>
			</Tabs>
			<EditProfileModal
				open={editProfileOpen}
				onOpenChange={setEditProfileOpen}
			/>
			{/* Your Matches Modal */}
			{/* Only import if really used */}
			{/* If needed: */}
			{/* <YourMatchesModal */}
			{/*   open={matchesModalOpen} */}
			{/*   onOpenChange={setMatchesModalOpen} */}
			{/*   requireProfileEdit={handleRequireProfileEditForMatches} */}
			{/* /> */}
			<RecognitionModal
				open={recognitionModalOpen}
				onOpenChange={setRecognitionModalOpen}
			/>
			{selectedPost && (
				<>
					<EditPostModal
						open={editPostModalOpen}
						onOpenChange={setEditPostModalOpen}
						post={selectedPost}
						onSuccess={handlePostUpdated}
					/>
					<DeletePostDialog
						open={deletePostDialogOpen}
						onOpenChange={setDeletePostDialogOpen}
						postId={selectedPost._id}
						onSuccess={handlePostDeleted}
					/>
				</>
			)}
		</div>
	);
};

const StatsCard = ({
	icon,
	value,
	label,
	onClick = () => {},
	clickable = false,
}) => {
	const baseClasses =
		"text-center p-2 border border-undercover-purple/20 rounded-md bg-undercover-dark/10";
	const hoverClasses = clickable
		? "hover:cursor-pointer hover:border-undercover-purple/50 hover:bg-undercover-dark/20 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all duration-300"
		: "";

	return (
		<div
			className={`${baseClasses} ${hoverClasses}`}
			onClick={clickable ? onClick : undefined}
		>
			<div className="flex justify-center mb-1">{icon}</div>
			<p className="font-bold text-sm sm:text-base">{value}</p>
			<p className="text-xs text-muted-foreground">{label}</p>
		</div>
	);
};

const PostCard = ({ post, isOwnProfile, onEdit, onDelete }) => {
	return (
		<div className="relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
			{post.imageUrl ? (
				<img
					src={post.imageUrl}
					alt="Post"
					className="w-full h-32 sm:h-44 object-cover"
				/>
			) : (
				<div className="p-3 h-32 sm:h-28 flex items-center justify-center">
					<p className="text-sm line-clamp-4 overflow-hidden">
						{post.content || "No content"}
					</p>
				</div>
			)}
			{isOwnProfile && (
				<div className="absolute top-2 right-2 flex gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="bg-white/70 hover:bg-white w-7 h-7 rounded-full"
						onClick={onEdit}
					>
						<Edit className="text-black h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="bg-white/70 hover:bg-white w-7 h-7 rounded-full"
						onClick={onDelete}
					>
						<Trash2 className="text-black h-3 w-3" />
					</Button>
				</div>
			)}
		</div>
	);
};

const EmptyPostsState = ({ onCreatePost }) => {
	return (
		<div className="text-center py-8 border border-dashed rounded-lg bg-card">
			<Image className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
			<h3 className="text-lg font-medium mb-1">No Posts Yet</h3>
			<p className="text-sm text-muted-foreground mb-4">
				Share your thoughts anonymously!
			</p>
			<Button
				onClick={onCreatePost}
				className="bg-undercover-purple hover:bg-undercover-deep-purple"
			>
				<Plus size={16} className="mr-2" />
				Create your first post
			</Button>
		</div>
	);
};

export default ProfileComponent;
