// src/components/AppShell.tsx
import React, { useState, useEffect, useMemo } from "react";
import "../../../public/lovable-uploads/UnderKover_logo2.png";
import {
	Home,
	MessageSquare,
	UserRound,
	Users,
	Menu,
	X,
	PlusCircle,
	LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WhisperModal from "../whisper/WhisperModal";
import { useAuth } from "@/context/AuthContext";
import AvatarGenerator from "../user/AvatarGenerator";
import { useLocation, useNavigate } from "react-router-dom";

const NavItem: React.FC<{
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick?: () => void;
}> = ({ icon, label, active = false, onClick }) => {
	return (
		<Button
			variant={active ? "secondary" : "ghost"}
			className={`justify-start w-full ${
				active ? "bg-purple-600/20 text-purple-500" : "text-muted-foreground"
			}`}
			onClick={onClick}
		>
			{icon}
			<span className="ml-2">{label}</span>
		</Button>
	);
};

interface AppShellProps {
	children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [currentTab, setCurrentTab] = useState("Home");
	const [whisperModalOpen, setWhisperModalOpen] = useState(false);
	const { user, logout } = useAuth();

	useEffect(() => {
		if (location.pathname === "/") setCurrentTab("Home");
		else if (location.pathname === "/whispers") setCurrentTab("Whispers");
		else if (location.pathname === "/ghost-circles") setCurrentTab("Circles");
		else if (location.pathname === "/profile") setCurrentTab("Profile");
		else if (location.pathname === "/referrals") setCurrentTab("Referrals");
		// Always close menu on route change for safety
		setMobileMenuOpen(false);
	}, [location.pathname]);

	const openWhisperModal = () => {
		setWhisperModalOpen(true);
		setMobileMenuOpen(false);
	};

	const userIdentity = useMemo(
		() => ({
			emoji: user?.avatarEmoji || "🎭",
			nickname: user?.anonymousAlias || "Anonymous",
			color: "#6E59A5",
		}),
		[user]
	);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	// Improved: Lock scroll ONLY while menu open, clean up on unmount, always clean up if menu closes
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.classList.add("overflow-hidden");
		} else {
			document.body.classList.remove("overflow-hidden");
		}
		return () => {
			document.body.classList.remove("overflow-hidden");
		};
	}, [mobileMenuOpen]);

	// Extra guard: Remove scroll lock on route change (in case of edge-case navigation bugs)
	useEffect(() => {
		document.body.classList.remove('overflow-hidden');
		return () => {
			document.body.classList.remove('overflow-hidden');
		};
	}, [location.pathname]);

	return (
		<div className="min-h-screen bg-background flex">
			{/* Desktop Sidebar */}
			<div className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
				<div className="p-4 border-b border-border">
					<h1
						className="text-xl font-bold text-purple-500 flex items-center hover:cursor-pointer"
						onClick={() => navigate("/")}
					>
						<img
							src="/lovable-uploads/UnderKover_logo2.png"
							alt="UnderKover"
							className="w-8 h-8 mr-2"
						/>
						UnderKover
					</h1>
				</div>

				<div className="p-4 flex-1">
					<div
						onClick={() => navigate("/profile")}
						className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 mb-6 border border-purple-500/20 hover:cursor-pointer"
					>
						<AvatarGenerator
							emoji={userIdentity.emoji}
							nickname={user?.anonymousAlias}
							color={userIdentity.color}
							size="md"
						/>
						<div>
							<h2 className="text-lg font-bold">{user?.anonymousAlias}</h2>
							<p className="text-xs text-muted-foreground">
								Your anonymous identity
							</p>
						</div>
					</div>

					<div className="space-y-1">
						<NavItem
							icon={<Home size={18} />}
							label="Home"
							active={currentTab === "Home"}
							onClick={() => navigate("/")}
						/>
						<NavItem
							icon={<Users size={18} />}
							label="Ghost Circles"
							active={currentTab === "Circles"}
							onClick={() => navigate("/ghost-circles")}
						/>
						<NavItem
							icon={<MessageSquare size={18} />}
							label="Whispers"
							active={currentTab === "Whispers"}
							onClick={() => navigate("/whispers")}
						/>
						<NavItem
							icon={<UserRound size={18} />}
							label="Profile"
							active={currentTab === "Profile"}
							onClick={() => navigate("/profile")}
						/>
					</div>

					<button
						onClick={openWhisperModal}
						className="flex items-center justify-center p-2 rounded-lg mt-6 w-full border border-purple-600 hover:bg-purple-700 text-white"
					>
						<MessageSquare size={16} className="mr-2" /> New Whisper
					</button>
				</div>

				<div className="p-4">
					<Button
						onClick={handleLogout}
						className="w-full bg-red-500 hover:bg-red-700 text-white"
					>
						<LogOut size={16} className="mr-2" />
						Log Out
					</Button>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<>
					{/* Overlay to prevent background scroll and interaction */}
					<div
						className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300"
						aria-hidden="true"
						style={{ pointerEvents: "auto" }}
						onClick={() => setMobileMenuOpen(false)}
					></div>
					<div
						className="fixed left-0 right-0 bottom-0 z-50 flex md:hidden flex-col animate-slide-up transition-all duration-300"
						style={{
							height: "90vh", // 90% of viewport height
							maxHeight: "90vh",
						}}
					>
						<div className="p-4 flex justify-between items-center border-b border-border bg-background rounded-t-xl">
							<h1 className="text-xl font-bold text-purple-500 flex items-center">
								<img
									src="/lovable-uploads/UnderKover_logo2.png"
									alt="UnderKover"
									className="w-8 h-8 mr-2"
								/>
								UnderKover
							</h1>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMobileMenuOpen(false)}
							>
								<X />
							</Button>
						</div>
						<div className="p-4 flex-1 overflow-y-auto bg-background">
							<div
								onClick={() => navigate("/profile")}
								className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 mb-6 border border-purple-500/20 hover:cursor-pointer"
							>
								<AvatarGenerator
									emoji={userIdentity.emoji}
									nickname={user?.anonymousAlias}
									color={userIdentity.color}
									size="md"
								/>
								<div>
									<h2 className="text-lg font-bold">{user?.anonymousAlias}</h2>
									<p className="text-xs text-muted-foreground">
										Your anonymous identity
									</p>
								</div>
							</div>
							<div className="space-y-2">
								<NavItem
									icon={<Home size={18} />}
									label="Home"
									active={currentTab === "Home"}
									onClick={() => navigate("/")}
								/>
								<NavItem
									icon={<Users size={18} />}
									label="Ghost Circles"
									active={currentTab === "Circles"}
									onClick={() => navigate("/ghost-circles")}
								/>
								<NavItem
									icon={<MessageSquare size={18} />}
									label="Whispers"
									active={currentTab === "Whispers"}
									onClick={() => navigate("/whispers")}
								/>
								<NavItem
									icon={<UserRound size={18} />}
									label="Profile"
									active={currentTab === "Profile"}
									onClick={() => navigate("/profile")}
								/>
							</div>
							<Button
								onClick={openWhisperModal}
								className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white"
							>
								<MessageSquare size={16} className="mr-2" /> New Whisper
							</Button>
						</div>
						<div className="p-4 border-t border-border bg-background">
							<Button
								onClick={handleLogout}
								className="w-full bg-red-500 hover:bg-red-700 text-white"
							>
								<LogOut size={16} className="mr-2" />
								Log Out
							</Button>
						</div>
					</div>
				</>
			)}

			{/* Main Content */}
			{/* Make feed area scrollable, not full page. */}
			<div className="flex-1 flex flex-col h-screen min-h-0">
				{/* Mobile Top Bar */}
				<div className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex justify-between items-center">
					<h1
						className="text-lg font-bold text-purple-500 flex items-center"
						onClick={() => navigate("/")}
					>
						<img
							src="/lovable-uploads/UnderKover_logo2.png"
							alt="UnderKover"
							className="w-6 h-6 mr-2"
						/>
						UnderKover
					</h1>
					<div className="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-purple-500"
							onClick={openWhisperModal}
						>
							<MessageSquare size={20} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setMobileMenuOpen(true)}
						>
							<Menu size={20} />
						</Button>
					</div>
				</div>

				{/* Children (Page Content) */}
				<div className="flex-1 min-h-0 overflow-y-auto">{children}</div>

				{/* Bottom Navigation (Mobile) */}
				<div className="md:hidden fixed bottom-0 w-full bg-card border-t border-border p-2 flex justify-around z-50">
					<Button
						variant="ghost"
						size="icon"
						className={
							currentTab === "Home"
								? "text-purple-500"
								: "text-muted-foreground"
						}
						onClick={() => navigate("/")}
					>
						<Home size={20} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className={
							currentTab === "Circles"
								? "text-purple-500"
								: "text-muted-foreground"
						}
						onClick={() => navigate("/ghost-circles")}
					>
						<Users size={20} />
					</Button>
					<Button
						variant="secondary"
						size="icon"
						className="rounded-full bg-purple-600 text-white"
						onClick={openWhisperModal}
					>
						<PlusCircle size={20} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className={
							currentTab === "Whispers"
								? "text-purple-500"
								: "text-muted-foreground"
						}
						onClick={() => navigate("/whispers")}
					>
						<MessageSquare size={20} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className={
							currentTab === "Profile"
								? "text-purple-500"
								: "text-muted-foreground"
						}
						onClick={() => navigate("/profile")}
					>
						<UserRound size={20} />
					</Button>
				</div>
			</div>

			{/* Whisper Modal */}
			<WhisperModal
				open={whisperModalOpen}
				onOpenChange={setWhisperModalOpen}
			/>
		</div>
	);
};

export default AppShell;
