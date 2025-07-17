import React, { useState, useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader, Plus, TrendingUp } from "lucide-react";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import EmptyFeedState from "./EmptyFeedState";
import EmptyFeedMessage from "./EmptyFeedMessage";
import FeedSwitcher from "./FeedSwitcher";
import CollegeSelectionDialog from "./CollegeSelectionDialog";
import AreaSelectionDialog from "./AreaSelectionDialog";
import { getGlobalFeed, getCollegeFeed, getAreaFeed, updateUserProfile } from "@/lib/api-feed";
import WeeklyPromptBanner from "./WeeklyPrompt";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;

type FeedType = "global" | "college" | "area";

const GlobalFeed = () => {
	const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
	const [feedType, setFeedType] = useState<FeedType>("global");
	const [userCollege, setUserCollege] = useState<string>("");
	const [userArea, setUserArea] = useState<string>("");
	const [showCollegeDialog, setShowCollegeDialog] = useState(false);
	const [showAreaDialog, setShowAreaDialog] = useState(false);
	const queryClient = useQueryClient();
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const { isAuthenticated, user } = useAuth();
	const navigate = useNavigate();

	// Load user's college and area from localStorage on mount
	useEffect(() => {
		const savedCollege = localStorage.getItem("userCollege");
		const savedArea = localStorage.getItem("userArea");
		const savedFeedType = localStorage.getItem("feedType") as FeedType;
		
		if (savedCollege) setUserCollege(savedCollege);
		if (savedArea) setUserArea(savedArea);
		if (savedFeedType) setFeedType(savedFeedType);
	}, []);

	const getFeedData = async ({ pageParam = null }) => {
		const filters = {
			limit: PAGE_SIZE,
			after: pageParam as string | null,
		};

		switch (feedType) {
			case "college":
				return getCollegeFeed({ ...filters, college: userCollege });
			case "area":
				return getAreaFeed({ ...filters, area: userArea });
			default:
				return getGlobalFeed(filters);
		}
	};

	const {
		data,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isLoading,
		error,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["posts", "feed", feedType, userCollege, userArea],
		queryFn: getFeedData,
		getNextPageParam: (lastPage) => {
			if (!lastPage || !lastPage.hasMore) return undefined;
			const posts = lastPage.posts;
			if (!posts || posts.length === 0) return undefined;
			return posts[posts.length - 1]._id;
		},
		initialPageParam: null,
		refetchInterval: 30000,
		enabled: feedType === "global" || (feedType === "college" && !!userCollege) || (feedType === "area" && !!userArea),
	});

	const allPosts = data
		? data.pages.flatMap((pg: { posts: any[] }) => pg.posts)
		: [];

	useEffect(() => {
		const observer = new window.IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 1 }
		);
		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}
		return () => {
			if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const handlePostCreated = () => {
		queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
		setIsCreatePostOpen(false);
	};

	const handleFeedTypeChange = (newFeedType: FeedType) => {
		if (newFeedType === "college" && !userCollege) {
			setShowCollegeDialog(true);
			return;
		}
		if (newFeedType === "area" && !userArea) {
			setShowAreaDialog(true);
			return;
		}
		
		setFeedType(newFeedType);
		localStorage.setItem("feedType", newFeedType);
	};

	const handleCollegeSelect = async (college: string) => {
		setUserCollege(college);
		localStorage.setItem("userCollege", college);
		setFeedType("college");
		localStorage.setItem("feedType", "college");
		
		// Update user profile
		try {
			await updateUserProfile({ college });
		} catch (error) {
			console.error("Failed to update user profile:", error);
		}
	};

	const handleAreaSelect = async (area: string) => {
		setUserArea(area);
		localStorage.setItem("userArea", area);
		setFeedType("area");
		localStorage.setItem("feedType", "area");
		
		// Update user profile
		try {
			await updateUserProfile({ area });
		} catch (error) {
			console.error("Failed to update user profile:", error);
		}
	};

	const shouldShowEmptyState = () => {
		return (
			(feedType === "college" && !userCollege) ||
			(feedType === "area" && !userArea)
		);
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center space-y-4 text-muted-foreground">
					<Loader className="h-8 w-8 animate-spin text-purple-500" />
					<p className="animate-pulse">Loading the underground feed...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="text-center space-y-4">
					<p className="text-destructive">Failed to load posts</p>
					<Button
						onClick={() => refetch()}
						variant="outline"
						className="hover-scale"
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background relative">
			<div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
				<div className="flex items-center justify-between max-w-2xl mx-auto p-4">
					<div className="flex items-center space-x-4">
						<h1 className="text-xl font-bold text-foreground">Feed</h1>
						<FeedSwitcher
							currentFilter={feedType}
							onFilterChange={handleFeedTypeChange}
						/>
					</div>
					<Button
						disabled={isAuthenticated === false}
						onClick={() => setIsCreatePostOpen(true)}
						size="sm"
						className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
					>
						<Plus className="h-4 w-4 mr-1" />
						Post
					</Button>
				</div>
			</div>

			<div className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6">
				<WeeklyPromptBanner />

				{shouldShowEmptyState() ? (
					<EmptyFeedMessage
						feedType={feedType}
						onCreatePost={() => setIsCreatePostOpen(true)}
						onSwitchFeed={() => handleFeedTypeChange("global")}
						isAuthenticated={isAuthenticated}
					/>
				) : allPosts.length === 0 ? (
					<EmptyFeedState
						onCreatePost={() => setIsCreatePostOpen(true)}
						isAuthenticated={isAuthenticated}
						onLogin={() => navigate("/login")}
						onRegister={() => navigate("/register")}
					/>
				) : (
					<div className="space-y-6">
						{allPosts.map((post: any, index: number) => (
							<div
								key={post._id}
								className="animate-fade-in opacity-100"
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<PostCard post={post} />
							</div>
						))}
						<div ref={loadMoreRef} />
						{isFetchingNextPage && (
							<div className="flex justify-center p-4">
								<Loader className="h-6 w-6 animate-spin text-purple-500" />
							</div>
						)}
						{!hasNextPage && allPosts.length > 0 && (
							<div className="text-center text-muted-foreground py-8 space-y-2">
								<p className="text-sm">You've seen all the secrets for now</p>
								<Button
									onClick={() => setIsCreatePostOpen(true)}
									variant="outline"
									size="sm"
									className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
									disabled={!isAuthenticated}
								>
									<Plus className="h-4 w-4 mr-2" />
									Share Your Truth
								</Button>
							</div>
						)}
					</div>
				)}
			</div>

			<CreatePostModal
				open={isCreatePostOpen}
				onOpenChange={setIsCreatePostOpen}
				onSuccess={handlePostCreated}
				currentFeedType={feedType}
			/>

			<CollegeSelectionDialog
				open={showCollegeDialog}
				onOpenChange={setShowCollegeDialog}
				onCollegeSelect={handleCollegeSelect}
				currentCollege={userCollege}
			/>

			<AreaSelectionDialog
				open={showAreaDialog}
				onOpenChange={setShowAreaDialog}
				onAreaSelect={handleAreaSelect}
				currentArea={userArea}
			/>
		</div>
	);
};

export default GlobalFeed;
