import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hash } from "lucide-react";
import { getPostsByTag } from "@/lib/api-tags";
import PostCard from "@/components/feed/PostCard";
import { useAuth } from "@/context/AuthContext";

const TagPostsPage: React.FC = () => {
	const { tagName } = useParams<{ tagName: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [posts, setPosts] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => {
		if (tagName) {
			fetchPosts();
		}
	}, [tagName]);

	const fetchPosts = async () => {
		if (!tagName) return;

		try {
			setIsLoading(true);
			const response = await getPostsByTag({ tagName });
			setPosts(response.posts);
			setHasMore(response.hasMore);
		} catch (error) {
			console.error("Error fetching posts by tag:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRefresh = () => {
		fetchPosts();
	};

	const handlePostUpdate = (postId: string) => {
		handleRefresh();
	};

	const handlePostDelete = (postId: string) => {
		setPosts((prev) => prev.filter((post) => post._id !== postId));
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-950 text-white">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-center min-h-[60vh]">
						<div className="animate-spin h-8 w-8 border-2 border-purple-500 rounded-full border-t-transparent"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-white">
			<div className="container mx-auto px-4 py-6 max-w-4xl">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate(-1)}
							className="text-gray-400 hover:text-white"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div className="flex items-center space-x-2">
							<Hash className="h-6 w-6 text-purple-500" />
							<h1 className="text-2xl font-bold capitalize">{tagName}</h1>
						</div>
					</div>
				</div>

				{/* Posts */}
				<div className="space-y-6">
					{posts.length > 0 ? (
						posts.map((post) => (
							<PostCard
								key={post._id}
								post={post}
								currentUserId={user?._id}
								onRefresh={handleRefresh}
								showOptions={true}
							/>
						))
					) : (
						<div className="text-center py-12">
							<Hash className="h-12 w-12 text-gray-600 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-400 mb-2">
								No posts found
							</h3>
							<p className="text-gray-500">
								Be the first to post with #{tagName}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TagPostsPage;
