import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hash, TrendingUp } from "lucide-react";
import { getTrendingTags, Tag } from "@/lib/api-tags";

const TrendingTagsPage: React.FC = () => {
	const navigate = useNavigate();
	const [tags, setTags] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchTrendingTags();
	}, []);

	const fetchTrendingTags = async () => {
		try {
			setIsLoading(true);
			const response = await getTrendingTags({ limit: 20 });
			setTags(response.tags);
		} catch (error) {
			console.error("Error fetching trending tags:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTagClick = (tag: Tag) => {
		navigate(`/tags/${tag.name}`);
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
							<TrendingUp className="h-6 w-6 text-purple-500" />
							<h1 className="text-2xl font-bold">Trending Tags</h1>
						</div>
					</div>
				</div>

				{/* Tags Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{tags.map((tag) => (
						<Button
							key={tag._id}
							variant="outline"
							onClick={() => handleTagClick(tag)}
							className="h-auto p-6 flex-col items-start space-y-2 bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200"
						>
							<div className="flex items-center space-x-2 w-full">
								<Hash className="h-5 w-5 text-purple-500" />
								<span className="font-semibold text-lg text-purple-400">
									{tag.displayName}
								</span>
							</div>
							<div className="text-sm text-gray-400 w-full text-left">
								{tag.postCount} {tag.postCount === 1 ? "post" : "posts"}
							</div>
						</Button>
					))}
				</div>

				{tags.length === 0 && (
					<div className="text-center py-12">
						<TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-400 mb-2">
							No trending tags yet
						</h3>
						<p className="text-gray-500">
							Start posting with tags to see them trending here
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default TrendingTagsPage;
