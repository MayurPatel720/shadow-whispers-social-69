/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Shield,
	Users,
	FileText,
	Trash2,
	Edit,
	Eye,
	LogOut,
	Search,
	Ban,
	UserCheck,
	AlertTriangle,
	BarChart3,
	Bell,
	Bot,
	Plus,
	MessageSquare,
	Heart,
	Settings,
	Loader2,
	Upload,
	Download
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { getWeeklyPrompt, setWeeklyPrompt } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";

interface AdminPost {
	_id: string;
	content: string;
	anonymousAlias: string;
	avatarEmoji: string;
	likes: any[];
	comments: any[];
	createdAt: string;
	expiresAt: string;
	shareCount: number;
	isSeedPost?: boolean;
	feedType?: string;
	notificationAccepts?: number;
	user: {
		_id: string;
		username: string;
		email: string;
		fullName: string;
		anonymousAlias: string;
	} | null;
}

interface AdminUser {
	_id: string;
	username: string;
	email: string;
	fullName: string;
	anonymousAlias: string;
	avatarEmoji: string;
	posts: string[];
	createdAt: string;
	banned?: boolean;
	isActive?: boolean;
}

const AdminPanel = () => {
	const { logout } = useAdmin();
	const navigate = useNavigate();
	const [posts, setPosts] = useState<AdminPost[]>([]);
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
	const [editContent, setEditContent] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalPosts: 0,
		realPosts: 0,
		seedPosts: 0,
		activeUsers: 0,
		bannedUsers: 0,
		postsToday: 0,
	});
	const [promptInput, setPromptInput] = useState<string>("");
	
	// Seeding states
	const [seedingLoading, setSeedingLoading] = useState(false);
	const [botCount, setBotCount] = useState(10);
	const [postCount, setPostCount] = useState(20);
	const [feedType, setFeedType] = useState('global');
	const [selectedCollege, setSelectedCollege] = useState('');
	const [selectedArea, setSelectedArea] = useState('');
	const [csvFile, setCsvFile] = useState<File | null>(null);

	const {
		data: currentPrompt,
		isLoading: promptLoading,
		refetch: refetchPrompt,
	} = useQuery({
		queryKey: ["weeklyPrompt"],
		queryFn: getWeeklyPrompt,
	});

	const { mutate: updatePrompt, isPending: updatingPrompt } = useMutation({
		mutationFn: (newPrompt: string) => setWeeklyPrompt(newPrompt),
		onSuccess: () => {
			refetchPrompt();
			toast({
				title: "Prompt Updated",
				description: "Weekly prompt has been changed.",
			});
			setPromptInput("");
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to update prompt.",
			});
		},
	});

	useEffect(() => {
		fetchData();
	}, []);

	const calculateStats = (
		fetchedPosts: AdminPost[],
		fetchedUsers: AdminUser[]
	) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const postsToday = fetchedPosts.filter(
			(post) => new Date(post.createdAt) >= today
		).length;

		const realPosts = fetchedPosts.filter((post: AdminPost) => !post.isSeedPost);
		const seedPosts = fetchedPosts.filter((post: AdminPost) => post.isSeedPost);
		const activeUsers = fetchedUsers.filter((user) => !user.banned).length;
		const bannedUsers = fetchedUsers.filter((user) => user.banned).length;

		return {
			totalUsers: fetchedUsers.length,
			totalPosts: fetchedPosts.length,
			realPosts: realPosts.length,
			seedPosts: seedPosts.length,
			activeUsers,
			bannedUsers,
			postsToday,
		};
	};

	const fetchData = async () => {
		try {
			setLoading(true);

			const token = localStorage.getItem("adminAuth");
			if (token) {
				api.defaults.headers["Authorization"] = `Bearer admin-${token}`;
			}

			console.log("Fetching admin data...");

			const [postsResponse, usersResponse] = await Promise.all([
				api.get("/api/admin/posts"),
				api.get("/api/admin/users"),
			]);

			const fetchedPosts = postsResponse.data || [];
			const fetchedUsers = usersResponse.data || [];

			setPosts(fetchedPosts);
			setUsers(fetchedUsers);

			// Calculate and set stats
			const calculatedStats = calculateStats(fetchedPosts, fetchedUsers);
			setStats(calculatedStats);

			console.log(
				`Loaded ${fetchedPosts.length} posts and ${fetchedUsers.length} users`
			);
		} catch (error) {
			console.error("Error fetching admin data:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description:
					"Failed to fetch data. Please check your admin credentials.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDeletePost = async (postId: string) => {
		if (!confirm("Are you sure you want to delete this post?")) return;

		try {
			await api.delete(`/api/admin/posts/${postId}`);
			const updatedPosts = posts.filter((post) => post._id !== postId);
			setPosts(updatedPosts);

			// Recalculate stats
			const updatedStats = calculateStats(updatedPosts, users);
			setStats(updatedStats);

			toast({
				title: "Post deleted",
				description: "Post has been successfully deleted.",
			});
		} catch (error) {
			console.error("Error deleting post:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to delete post. Please try again.",
			});
		}
	};

	const handleBanUser = async (userId: string, banned: boolean) => {
		const action = banned ? "ban" : "unban";
		if (!confirm(`Are you sure you want to ${action} this user?`)) return;

		try {
			await api.put(`/api/admin/users/${userId}/ban`, { banned });

			const updatedUsers = users.map((user) =>
				user._id === userId ? { ...user, banned } : user
			);
			setUsers(updatedUsers);

			// Recalculate stats after user ban/unban
			const updatedStats = calculateStats(posts, updatedUsers);
			setStats(updatedStats);

			toast({
				title: `User ${action}ned`,
				description: `User has been successfully ${action}ned.`,
			});
		} catch (error) {
			console.error(`Error ${action}ning user:`, error);
			toast({
				variant: "destructive",
				title: "Error",
				description: `Failed to ${action} user. Please try again.`,
			});
		}
	};

	const handleEditPost = (post: AdminPost) => {
		setEditingPost(post);
		setEditContent(post.content);
	};

	const handleSaveEdit = async () => {
		if (!editingPost) return;

		try {
			const response = await api.put(`/api/admin/posts/${editingPost._id}`, {
				content: editContent,
			});

			setPosts(
				posts.map((post) =>
					post._id === editingPost._id
						? { ...post, content: editContent }
						: post
				)
			);

			setEditingPost(null);
			setEditContent("");

			toast({
				title: "Post updated",
				description: "Post has been successfully updated.",
			});
		} catch (error) {
			console.error("Error updating post:", error);
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to update post. Please try again.",
			});
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/admin/login");
	};

	const handleCreateBots = async () => {
		if (seedingLoading) return;
		
		try {
			setSeedingLoading(true);
			console.log('Creating bots with config:', {
				count: botCount,
				feedType: feedType,
				college: selectedCollege,
				area: selectedArea
			});
			
			const response = await api.post('/api/admin/seed/bots', {
				count: botCount,
				feedType: feedType,
				college: feedType === 'college' ? selectedCollege : undefined,
				area: feedType === 'area' ? selectedArea : undefined
			});
			
			toast({
				title: "Bots Created Successfully",
				description: `Created ${response.data.bots?.length || 0} fully functional bot users`,
			});
			
			// Refresh data
			await fetchData();
		} catch (error: any) {
			console.error('Error creating bots:', error);
			toast({
				variant: "destructive",
				title: "Bot Creation Failed",
				description: error?.response?.data?.message || "Failed to create bots. Check console for details.",
			});
		} finally {
			setSeedingLoading(false);
		}
	};

	const handleCreatePosts = async () => {
		if (seedingLoading) return;
		
		try {
			setSeedingLoading(true);
			const response = await api.post('/api/admin/seed/posts', {
				count: postCount,
				feedType: feedType,
				college: feedType === 'college' ? selectedCollege : undefined,
				area: feedType === 'area' ? selectedArea : undefined
			});
			
			toast({
				title: "Posts Created Successfully",
				description: `Created ${response.data.posts || 0} seed posts`,
			});
			
			// Refresh data
			await fetchData();
		} catch (error: any) {
			console.error('Error creating posts:', error);
			toast({
				variant: "destructive",
				title: "Post Creation Failed",
				description: error?.response?.data?.message || "Failed to create posts. Check console for details.",
			});
		} finally {
			setSeedingLoading(false);
		}
	};

	const handleAddInteractions = async () => {
		if (seedingLoading) return;
		
		try {
			setSeedingLoading(true);
			console.log('Adding interactions to recent posts...');
			const response = await api.post('/api/admin/seed/interactions', {
				postCount: 50,
				likesPerPost: 3,
				commentsPerPost: 1
			});
			
			console.log('Interactions response:', response.data);
			toast({
				title: "Interactions Added",
				description: `Added ${response.data.totalLikes || 0} likes and ${response.data.totalComments || 0} comments`,
			});
			
			// Refresh data
			await fetchData();
		} catch (error: any) {
			console.error('Error adding interactions:', error);
			toast({
				variant: "destructive",
				title: "Interaction Addition Failed",
				description: error?.response?.data?.message || "Failed to add interactions.",
			});
		} finally {
			setSeedingLoading(false);
		}
	};

	const handleComprehensiveSeeding = async () => {
		if (seedingLoading) return;
		
		try {
			setSeedingLoading(true);
			const requestData = {
				colleges: selectedCollege ? [selectedCollege] : [],
				areas: selectedArea ? [selectedArea] : [],
				botsPerFeed: 8,
				postsPerFeed: 15,
				interactionsEnabled: true
			};
			
			const response = await api.post('/api/admin/seed/complete', requestData);
			
			toast({
				title: "Comprehensive Seeding Complete",
				description: `Created ${response.data.results?.botsCreated || 0} bots, ${response.data.results?.postsCreated || 0} posts, and added interactions`,
			});
			
			// Refresh data
			await fetchData();
		} catch (error: any) {
			console.error('Error in comprehensive seeding:', error);
			toast({
				variant: "destructive",
				title: "Comprehensive Seeding Failed",
				description: error?.response?.data?.message || "Failed to complete comprehensive seeding.",
			});
		} finally {
			setSeedingLoading(false);
		}
	};

	const handleCsvUpload = async () => {
		if (!csvFile || seedingLoading) return;
		
		try {
			setSeedingLoading(true);
			const formData = new FormData();
			formData.append('csvFile', csvFile);
			formData.append('feedType', feedType);
			if (feedType === 'college' && selectedCollege) {
				formData.append('college', selectedCollege);
			}
			if (feedType === 'area' && selectedArea) {
				formData.append('area', selectedArea);
			}
			
			const response = await api.post('/api/admin/seed/csv-posts', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			
			toast({
				title: "CSV Posts Created",
				description: `Created ${response.data.postsCreated || 0} posts from ${response.data.totalRowsProcessed || 0} CSV rows`,
			});
			
			setCsvFile(null);
			// Reset file input
			const fileInput = document.getElementById('csvFile') as HTMLInputElement;
			if (fileInput) fileInput.value = '';
			
			// Refresh data
			await fetchData();
		} catch (error: any) {
			console.error('Error uploading CSV:', error);
			toast({
				variant: "destructive",
				title: "CSV Upload Failed",
				description: error?.response?.data?.message || "Failed to upload CSV posts.",
			});
		} finally {
			setSeedingLoading(false);
		}
	};

	const downloadCsvTemplate = () => {
		const csvContent = `content,category,tags,imageUrl,images
"Just had the most amazing coffee at the campus café ☕","social","coffee,campus,food","https://example.com/coffee.jpg",""
"Anyone else feel like finals week is never ending?","study","finals,stress,college","",""
"Found this hidden spot on campus perfect for studying 📚","study","study,campus,hidden gems","https://example.com/library.jpg",""
"Late night philosophical thoughts hitting different tonight 🌙","confession","philosophy,late night,thoughts","",""
"The sunset from the hill is absolutely gorgeous today","area","sunset,nature,beauty","https://example.com/sunset.jpg","https://example.com/sunset2.jpg,https://example.com/sunset3.jpg"`;
		
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'post_template.csv';
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const filteredPosts = posts.filter(
		(post) =>
			post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(post.user?.username || "")
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			(post.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
	);

	const filteredUsers = users.filter(
		(user) =>
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-2 border-purple-500 rounded-full border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			{/* Header */}
			<div className="bg-gray-800 border-b border-gray-700 p-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Shield className="h-8 w-8 text-purple-500" />
						<h1 className="text-2xl font-bold">Admin Panel</h1>
					</div>
					<Button
						onClick={handleLogout}
						variant="outline"
						className="border-gray-600"
					>
						<LogOut className="h-4 w-4 mr-2" />
						Logout
					</Button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6">
				{/* Weekly Prompt Card at Top */}
				<div className="mb-8">
					<section className="bg-purple-800 border border-purple-700 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center gap-4 shadow-md">
						<div className="flex-1">
							<h3 className="text-lg font-bold mb-1 flex items-center gap-2">
								Weekly Prompt
							</h3>
							{promptLoading ? (
								<p className="text-white/60">Loading...</p>
							) : (
								<p className="text-white/90">
									{currentPrompt?.promptText || "No prompt set."}
								</p>
							)}
						</div>
						<form
							className="flex flex-col md:flex-row gap-2 items-center"
							onSubmit={e => {
								e.preventDefault();
								if (promptInput.trim()) {
									updatePrompt(promptInput.trim());
								}
							}}
						>
							<input
								type="text"
								value={promptInput}
								onChange={e => setPromptInput(e.target.value)}
								placeholder="Set new prompt..."
								className="text-black rounded px-3 py-2 border border-gray-300 text-sm md:w-80 mb-2 md:mb-0"
							/>
							<Button
								type="submit"
								className="bg-purple-600 hover:bg-purple-700 text-white"
								disabled={updatingPrompt || !promptInput.trim()}
							>
								{updatingPrompt ? "Updating..." : "Update"}
							</Button>
						</form>
					</section>
				</div>

				{/* Stats Dashboard */}
				<div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
					<Card className="bg-gray-800 border-gray-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-blue-500/20 rounded-full">
									<Users className="h-6 w-6 text-blue-400" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">
										{stats.totalUsers}
									</p>
									<p className="text-gray-400">Total Users</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gray-800 border-gray-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-green-500/20 rounded-full">
									<FileText className="h-6 w-6 text-green-400" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">
										{stats.totalPosts}
									</p>
									<p className="text-gray-400">Total Posts</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gray-800 border-gray-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-emerald-500/20 rounded-full">
									<UserCheck className="h-6 w-6 text-emerald-400" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">
										{stats.activeUsers}
									</p>
									<p className="text-gray-400">Active Users</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gray-800 border-gray-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-red-500/20 rounded-full">
									<Ban className="h-6 w-6 text-red-400" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">
										{stats.bannedUsers}
									</p>
									<p className="text-gray-400">Banned Users</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gray-800 border-gray-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-yellow-500/20 rounded-full">
									<BarChart3 className="h-6 w-6 text-yellow-400" />
								</div>
								<div>
									<p className="text-2xl font-bold text-white">
										{stats.postsToday}
									</p>
									<p className="text-gray-400">Posts Today</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				
				{/* Real vs Seed Posts Breakdown */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<Card className="bg-gray-800 border-gray-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-blue-500/20 rounded-full">
									<MessageSquare className="h-6 w-6 text-blue-400" />
								</div>
								<div>
									<p className="text-2xl font-bold text-blue-400">
										{stats.realPosts}
									</p>
									<p className="text-gray-400">Real User Posts</p>
									<p className="text-sm text-gray-500">
										{stats.totalPosts > 0 ? ((stats.realPosts / stats.totalPosts) * 100).toFixed(1) : 0}% of total
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					
					<Card className="bg-gray-800 border-gray-700">
						<CardContent className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-green-500/20 rounded-full">
									<Bot className="h-6 w-6 text-green-400" />
								</div>
								<div>
									<p className="text-2xl font-bold text-green-400">
										{stats.seedPosts}
									</p>
									<p className="text-gray-400">Bot Seed Posts</p>
									<p className="text-sm text-gray-500">
										{stats.totalPosts > 0 ? ((stats.seedPosts / stats.totalPosts) * 100).toFixed(1) : 0}% of total
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Search */}
				<div className="mb-6">
					<div className="relative max-w-md">
						<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Search posts, users, emails..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-gray-800 border-gray-600 text-white"
						/>
					</div>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="posts" className="space-y-4">
					<TabsList className="bg-gray-800 border-gray-700">
						<TabsTrigger
							value="posts"
							className="data-[state=active]:bg-purple-600"
						>
							Posts Management
						</TabsTrigger>
						<TabsTrigger
							value="users"
							className="data-[state=active]:bg-purple-600"
						>
							Users Management
						</TabsTrigger>
						<TabsTrigger
							value="seeding"
							className="data-[state=active]:bg-purple-600"
						>
							<Bot className="h-4 w-4 mr-2" />
							Bot Seeding
						</TabsTrigger>
						<TabsTrigger
							value="notifications"
							className="data-[state=active]:bg-purple-600"
						>
							<Bell className="h-4 w-4 mr-2" />
							Push Notifications
						</TabsTrigger>
					</TabsList>

					<TabsContent value="posts">
						<Card className="bg-gray-800 border-gray-700">
							<CardHeader>
								<CardTitle className="text-white">Posts Management</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="border-gray-700">
												<TableHead className="text-gray-300">Content</TableHead>
												<TableHead className="text-gray-300">Author</TableHead>
												<TableHead className="text-gray-300">Feed Type</TableHead>
												<TableHead className="text-gray-300">
													Real User
												</TableHead>
												<TableHead className="text-gray-300">
													Anonymous
												</TableHead>
												<TableHead className="text-gray-300">
													Engagement
												</TableHead>
												<TableHead className="text-gray-300">Notifications</TableHead>
												<TableHead className="text-gray-300">Created</TableHead>
												<TableHead className="text-gray-300">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredPosts.map((post) => (
												<TableRow key={post._id} className="border-gray-700">
													<TableCell className="text-white max-w-xs">
														<p className="truncate">{post.content}</p>
													</TableCell>
													<TableCell className="text-white">
														<div>
															<p className="font-medium">
																{post.user?.username || "Unknown"}
															</p>
															<p className="text-sm text-gray-400">
																{post.user?.email || "N/A"}
															</p>
														</div>
													</TableCell>
													<TableCell className="text-white">
														<Badge
															variant={post.feedType?.includes('Global') ? 'default' : 
																	post.feedType?.includes('College') ? 'secondary' :
																	post.feedType?.includes('Area') ? 'outline' : 'destructive'}
															className="text-xs"
														>
															{post.feedType || 'Global'}
														</Badge>
													</TableCell>
													<TableCell className="text-white">
														<Badge
															variant="outline"
															className="border-blue-500 text-blue-400"
														>
															{post.user?.fullName || "Unknown"}
														</Badge>
													</TableCell>
													<TableCell className="text-white">
														<div className="flex items-center gap-2">
															<span>{post.avatarEmoji}</span>
															<span>{post.anonymousAlias}</span>
														</div>
													</TableCell>
													<TableCell className="text-white">
														<div className="text-sm">
															<div>❤️ {post.likes?.length || 0}</div>
															<div>💬 {post.comments?.length || 0}</div>
															<div>📤 {post.shareCount || 0}</div>
														</div>
													</TableCell>
													<TableCell className="text-white">
														<div className="text-sm">
															<div className="flex items-center gap-1">
																<Bell className="h-3 w-3" />
																{post.notificationAccepts || 0}
															</div>
															<div className="text-xs text-gray-400">accepted</div>
														</div>
													</TableCell>
													<TableCell className="text-gray-400">
														{new Date(post.createdAt).toLocaleDateString()}
													</TableCell>
													<TableCell>
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="outline"
																onClick={() => handleEditPost(post)}
																className="border-gray-600"
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant="destructive"
																onClick={() => handleDeletePost(post._id)}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="users">
						<Card className="bg-gray-800 border-gray-700">
							<CardHeader>
								<CardTitle className="text-white">Users Management</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="border-gray-700">
												<TableHead className="text-gray-300">User</TableHead>
												<TableHead className="text-gray-300">Email</TableHead>
												<TableHead className="text-gray-300">
													Anonymous Alias
												</TableHead>
												<TableHead className="text-gray-300">
													Posts Count
												</TableHead>
												<TableHead className="text-gray-300">Status</TableHead>
												<TableHead className="text-gray-300">Joined</TableHead>
												<TableHead className="text-gray-300">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredUsers.map((user) => (
												<TableRow key={user._id} className="border-gray-700">
													<TableCell className="text-white">
														<div className="flex items-center gap-3">
															<span className="text-lg">
																{user.avatarEmoji || "🎭"}
															</span>
															<div>
																<p className="font-medium">{user.fullName}</p>
																<p className="text-sm text-gray-400">
																	@{user.username}
																</p>
															</div>
														</div>
													</TableCell>
													<TableCell className="text-white">
														{user.email}
													</TableCell>
													<TableCell className="text-white">
														{user.anonymousAlias}
													</TableCell>
													<TableCell className="text-white">
														{user.posts?.length || 0}
													</TableCell>
													<TableCell>
														{user.banned ? (
															<Badge variant="destructive">Banned</Badge>
														) : (
															<Badge variant="default" className="bg-green-500">
																Active
															</Badge>
														)}
													</TableCell>
													<TableCell className="text-gray-400">
														{new Date(user.createdAt).toLocaleDateString()}
													</TableCell>
													<TableCell>
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="outline"
																className="border-gray-600"
															>
																<Eye className="h-4 w-4" />
															</Button>
															<Button
																size="sm"
																variant={
																	user.banned ? "default" : "destructive"
																}
																onClick={() =>
																	handleBanUser(user._id, !user.banned)
																}
															>
																{user.banned ? (
																	<UserCheck className="h-4 w-4" />
																) : (
																	<Ban className="h-4 w-4" />
																)}
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="seeding">
						<div className="space-y-6">
							{/* Configuration Card */}
							<Card className="bg-gray-800 border-gray-700">
								<CardHeader>
									<CardTitle className="text-white flex items-center gap-2">
										<Settings className="h-5 w-5" />
										Seeding Configuration
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="text-sm font-medium text-gray-300 mb-2 block">
												Feed Type
											</label>
											<select
												value={feedType}
												onChange={(e) => setFeedType(e.target.value)}
												className="w-full bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
											>
												<option value="global">Global</option>
												<option value="college">College</option>
												<option value="area">Area</option>
											</select>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-300 mb-2 block">
												Bot Count
											</label>
											<Input
												type="number"
												value={botCount}
												onChange={(e) => setBotCount(parseInt(e.target.value) || 10)}
												className="bg-gray-700 border-gray-600 text-white"
												min="1"
												max="50"
											/>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-300 mb-2 block">
												Post Count
											</label>
											<Input
												type="number"
												value={postCount}
												onChange={(e) => setPostCount(parseInt(e.target.value) || 20)}
												className="bg-gray-700 border-gray-600 text-white"
												min="1"
												max="100"
											/>
										</div>
									</div>

									{feedType === 'college' && (
										<div>
											<label className="text-sm font-medium text-gray-300 mb-2 block">
												College Name
											</label>
											<Input
												value={selectedCollege}
												onChange={(e) => setSelectedCollege(e.target.value)}
												placeholder="e.g., Stanford University"
												className="bg-gray-700 border-gray-600 text-white"
											/>
											<p className="text-xs text-gray-400 mt-1">
												Leave empty to create bots for random colleges
											</p>
										</div>
									)}

									{feedType === 'area' && (
										<div>
											<label className="text-sm font-medium text-gray-300 mb-2 block">
												Area Name
											</label>
											<Input
												value={selectedArea}
												onChange={(e) => setSelectedArea(e.target.value)}
												placeholder="e.g., San Francisco"
												className="bg-gray-700 border-gray-600 text-white"
											/>
											<p className="text-xs text-gray-400 mt-1">
												Leave empty to create bots for random areas
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Seeding Actions */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Create Bots */}
								<Card className="bg-gray-800 border-gray-700">
									<CardHeader>
										<CardTitle className="text-white flex items-center gap-2">
											<Bot className="h-5 w-5 text-blue-400" />
											Create Bot Users
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-gray-400 text-sm">
											Create fully functional AI bot users with unique personalities. 
											These bots can be matched with, chatted with, and will participate in all social features.
										</p>
										<div className="bg-blue-900/20 p-3 rounded border border-blue-700">
											<h4 className="text-blue-300 font-medium mb-2">Bot Features:</h4>
											<ul className="text-sm text-blue-200 space-y-1">
												<li>• Unique personalities and interests</li>
												<li>• Matchable in Whisper system</li>
												<li>• Can engage in conversations</li>
												<li>• Feed-specific content creation</li>
												<li>• Automatic activity patterns</li>
											</ul>
										</div>
										<Button
											onClick={handleCreateBots}
											disabled={seedingLoading}
											className="w-full bg-blue-600 hover:bg-blue-700"
										>
											{seedingLoading ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Plus className="h-4 w-4 mr-2" />
											)}
											Create {botCount} Interactive Bots
										</Button>
									</CardContent>
								</Card>

								{/* Create Posts */}
								<Card className="bg-gray-800 border-gray-700">
									<CardHeader>
										<CardTitle className="text-white flex items-center gap-2">
											<MessageSquare className="h-5 w-5 text-green-400" />
											Generate Posts
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-gray-400 text-sm">
											Generate realistic, contextual posts from bot users with varied content 
											appropriate for the selected feed type.
										</p>
										<div className="bg-green-900/20 p-3 rounded border border-green-700">
											<h4 className="text-green-300 font-medium mb-2">Post Types:</h4>
											<ul className="text-sm text-green-200 space-y-1">
												<li>• Study & academic content</li>
												<li>• Social interactions</li>
												<li>• Confessions & thoughts</li>
												<li>• Local recommendations</li>
												<li>• Philosophical discussions</li>
											</ul>
										</div>
										<Button
											onClick={handleCreatePosts}
											disabled={seedingLoading}
											className="w-full bg-green-600 hover:bg-green-700"
										>
											{seedingLoading ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Plus className="h-4 w-4 mr-2" />
											)}
											Create {postCount} Posts
										</Button>
									</CardContent>
								</Card>

								{/* Add Interactions */}
								<Card className="bg-gray-800 border-gray-700">
									<CardHeader>
										<CardTitle className="text-white flex items-center gap-2">
											<Heart className="h-5 w-5 text-red-400" />
											Add Interactions
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-gray-400 text-sm">
											Add authentic likes and comments to recent posts to make the feed 
											feel active and engaging.
										</p>
										<div className="bg-red-900/20 p-3 rounded border border-red-700">
											<h4 className="text-red-300 font-medium mb-2">Interaction Features:</h4>
											<ul className="text-sm text-red-200 space-y-1">
												<li>• Realistic engagement patterns</li>
												<li>• Contextual comments</li>
												<li>• Diverse bot participation</li>
												<li>• Natural interaction timing</li>
											</ul>
										</div>
										<Button
											onClick={handleAddInteractions}
											disabled={seedingLoading}
											className="w-full bg-red-600 hover:bg-red-700"
										>
											{seedingLoading ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Heart className="h-4 w-4 mr-2" />
											)}
											Add Interactions
										</Button>
									</CardContent>
								</Card>

								{/* Comprehensive Seeding */}
								<Card className="bg-gray-800 border-gray-700">
									<CardHeader>
										<CardTitle className="text-white flex items-center gap-2">
											<Settings className="h-5 w-5 text-purple-400" />
											Complete Setup
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-gray-400 text-sm">
											Perform a comprehensive seeding across all feed types with bots, 
											posts, and interactions in one go.
										</p>
										<div className="bg-purple-900/20 p-3 rounded border border-purple-700">
											<h4 className="text-purple-300 font-medium mb-2">Complete Setup Includes:</h4>
											<ul className="text-sm text-purple-200 space-y-1">
												<li>• Global, college, and area bots</li>
												<li>• Feed-appropriate content</li>
												<li>• Automatic interactions</li>
												<li>• Cross-feed engagement</li>
											</ul>
										</div>
										<Button
											onClick={handleComprehensiveSeeding}
											disabled={seedingLoading}
											className="w-full bg-purple-600 hover:bg-purple-700"
										>
											{seedingLoading ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Settings className="h-4 w-4 mr-2" />
											)}
											Complete Ecosystem Setup
										</Button>
									</CardContent>
								</Card>
							</div>

							{/* CSV Import Section */}
							<Card className="bg-gray-800 border-gray-700">
								<CardHeader>
									<CardTitle className="text-white flex items-center gap-2">
										<Upload className="h-5 w-5 text-orange-400" />
										Import Posts from CSV
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-gray-400 text-sm">
										Upload a CSV file with custom post content. The CSV should have columns: 
										content, category (optional), tags (optional, comma-separated), imageUrl (optional), images (optional, comma-separated URLs).
									</p>
									
									<div className="flex gap-4 items-center">
										<Button
											onClick={downloadCsvTemplate}
											variant="outline"
											className="border-gray-600"
										>
											<Download className="h-4 w-4 mr-2" />
											Download Template
										</Button>
									</div>
									
									<div className="space-y-3">
										<Input
											id="csvFile"
											type="file"
											accept=".csv"
											onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
											className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:border-0 file:text-white"
										/>
										
										{csvFile && (
											<div className="bg-orange-900/20 p-3 rounded border border-orange-700">
												<p className="text-orange-300 text-sm">
													Selected file: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
												</p>
											</div>
										)}
										
										<Button
											onClick={handleCsvUpload}
											disabled={!csvFile || seedingLoading}
											className="w-full bg-orange-600 hover:bg-orange-700"
										>
											{seedingLoading ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Upload className="h-4 w-4 mr-2" />
											)}
											Upload CSV Posts
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* Bot Activity Info */}
							<Card className="bg-gray-800 border-gray-700">
								<CardHeader>
									<CardTitle className="text-white">Automatic Bot Activity System</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-3">
											<h4 className="text-green-400 font-medium">Active Processes:</h4>
											<div className="space-y-2 text-gray-300">
												<p>• <strong>Hourly Posts:</strong> Bots create 2-5 new posts every hour</p>
												<p>• <strong>Interaction Cycles:</strong> Likes and comments added every 15 minutes</p>
												<p>• <strong>Daily Cleanup:</strong> Expired seed posts removed at midnight</p>
												<p>• <strong>Smart Distribution:</strong> Content distributed across all feed types</p>
											</div>
										</div>
										<div className="space-y-3">
											<h4 className="text-blue-400 font-medium">Bot Capabilities:</h4>
											<div className="space-y-2 text-gray-300">
												<p>• <strong>Whisper Matching:</strong> Available for anonymous chats</p>
												<p>• <strong>Real Conversations:</strong> Can respond to messages</p>
												<p>• <strong>Social Features:</strong> Participate in all platform features</p>
												<p>• <strong>Personality-Based:</strong> Consistent behavior patterns</p>
											</div>
										</div>
									</div>
									
									<div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded">
										<h4 className="text-yellow-300 font-medium mb-2">Important Notes:</h4>
										<ul className="text-sm text-yellow-200 space-y-1">
											<li>• Bots are indistinguishable from real users to regular users</li>
											<li>• All bot interactions follow realistic timing patterns</li>
											<li>• Bot activity automatically scales with user activity</li>
											<li>• Seed posts expire after 24 hours to keep content fresh</li>
										</ul>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="notifications">
						<Card className="bg-gray-800 border-gray-700">
							<CardHeader>
								<CardTitle className="text-white">Push Notifications</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-400">Push notification management features will be added here.</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Edit Post Modal */}
				{editingPost && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
						<Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
							<CardHeader>
								<CardTitle className="text-white">Edit Post</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-sm font-medium text-gray-300">
										Content
									</label>
									<Textarea
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className="mt-1 bg-gray-700 border-gray-600 text-white"
										rows={6}
									/>
								</div>
								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => {
											setEditingPost(null);
											setEditContent("");
										}}
										className="border-gray-600"
									>
										Cancel
									</Button>
									<Button
										onClick={handleSaveEdit}
										className="bg-purple-600 hover:bg-purple-700"
									>
										Save Changes
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminPanel;
