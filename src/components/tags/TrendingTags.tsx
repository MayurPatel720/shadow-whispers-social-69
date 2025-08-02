import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	TrendingUp,
	Hash,
	ChevronRight,
	ChevronLeft,
	ChevronDown,
} from "lucide-react";
import { getTrendingTags, Tag } from "@/lib/api-tags";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrendingTagsProps {
	className?: string;
	limit?: number;
	onTagClick?: (tag: string) => void;
}

const TrendingTags: React.FC<TrendingTagsProps> = ({
	className,
	limit = 5,
	onTagClick,
}) => {
	const [tags, setTags] = useState<Tag[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);
	const [isExpanded, setIsExpanded] = useState(false);
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	useEffect(() => {
		const fetchTrendingTags = async () => {
			try {
				setIsLoading(true);
				const response = await getTrendingTags({ limit });
				setTags(response.tags);
			} catch (error) {
				console.error("Error fetching trending tags:", error);
				setTags([]); // Set empty array on error
			} finally {
				setIsLoading(false);
			}
		};

		fetchTrendingTags();
	}, [limit]);

	const handleTagClick = (tag: Tag) => {
		if (onTagClick) {
			onTagClick(tag.name);
		} else {
			navigate(`/tags/${tag.name}`);
		}
	};

	const handleViewAll = () => {
		navigate("/trending-tags");
	};

	if (isLoading) {
		return (
			<div className={cn("w-full", className)}>
				<div className="flex justify-between items-center mb-2 px-2">
					<TrendingUp className="h-4 w-4 text-purple-500" />
					<ChevronRight className="h-4 w-4 text-purple-400" />
				</div>
				<div className="overflow-hidden">
					<div className="flex gap-2 px-2 overflow-x-auto scrollbar-hide">
						{[...Array(limit)].map((_, i) => (
							<div
								key={i}
								className="h-8 w-20 bg-gray-800 rounded-full animate-pulse flex-shrink-0"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (tags.length === 0) return null;

	// Mobile: Show paginated view, Desktop: Show horizontal scroll
	const tagsPerPage = isMobile ? 3 : tags.length;
	const totalPages = isMobile ? Math.ceil(tags.length / tagsPerPage) : 1;
	const startIndex = currentPage * tagsPerPage;
	const visibleTags = isMobile
		? tags.slice(startIndex, startIndex + tagsPerPage)
		: tags;

	const goToNextPage = () => {
		setCurrentPage((prev) => (prev + 1) % totalPages);
	};

	const goToPrevPage = () => {
		setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
	};

	if (isMobile) {
		return (
			<div className={cn("w-full", className)}>
				{/* Mobile: Compact single row */}
				<div className="flex items-center gap-1 px-2 py-1">
					{/* <TrendingUp className="h-4 w-4 text-purple-500 flex-shrink-0" /> */}

					{/* Show first 2-3 tags as compact chips */}
					{visibleTags.map((tag) => (
						<button
							key={tag._id}
							onClick={() => handleTagClick(tag)}
							className="flex items-center gap-1 px-2 py-1 rounded-full text-xs
							bg-purple-500/20 text-purple-400 border border-purple-500/30
							hover:bg-purple-500/30 transition-colors flex-shrink-0"
						>
							<Hash className="h-3 w-3" />
							<span className="max-w-[60px] truncate">{tag.displayName}</span>
						</button>
					))}

					{/* View All */}
					<button
						onClick={handleViewAll}
						className="p-1 rounded-full hover:bg-purple-500/10 flex-shrink-0"
						title="View All Trending Tags"
					>
						<ChevronRight className="h-4 w-4 text-purple-400" />
					</button>
				</div>
			</div>
		);
	}

	// Desktop: Compact horizontal row
	return (
		<div className={cn("w-full", className)}>
			<div className="flex items-center gap-1 px-2 py-1 overflow-x-auto scrollbar-hide">
				{tags.map((tag) => (
					<button
						key={tag._id}
						onClick={() => handleTagClick(tag)}
						className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
						bg-purple-500/20 text-purple-400 border border-purple-500/30
						hover:bg-purple-500/30 transition-colors flex-shrink-0 whitespace-nowrap"
					>
						<Hash className="h-3 w-3" />
						{tag.displayName}
					</button>
				))}

				<button
					onClick={handleViewAll}
					className="p-1 rounded-full hover:bg-purple-500/10 flex-shrink-0"
					title="View All Trending Tags"
				>
					<ChevronRight className="h-4 w-4 text-purple-400" />
				</button>
			</div>
		</div>
	);
};

export default TrendingTags;
