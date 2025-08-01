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
	LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WhisperModal from "../whisper/WhisperModal";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { useAuth } from "@/context/AuthContext";
import AvatarGenerator from "../user/AvatarGenerator";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";

const NavItem: React.FC<{
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick?: () => void;
	disabled?: boolean;
}> = ({ icon, label, active = false, onClick, disabled = false }) => {
	return (
		<Button
			variant={active ? "secondary" : "ghost"}
			className={`justify-start w-full ${
				active ? "bg-purple-600/20 text-purple-500" : "text-muted-foreground"
			} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
			onClick={disabled ? undefined : onClick}
			disabled={disabled}
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
	const { user, logout, isAuthenticated } = useAuth();

	useEffect(() => {
		if (location.pathname === "/") setCurrentTab("Home");
		else if (location.pathname === "/whispers") setCurrentTab("Whispers");
		else if (location.pathname === "/ghost-circles") setCurrentTab("Circles");
		else if (location.pathname === "/profile") setCurrentTab("Profile");
		else if (location.pathname === "/referrals") setCurrentTab("Referrals");
		setMobileMenuOpen(false);
	}, [location.pathname]);

	const handleNavigation = (path: string, requiresAuth: boolean = false) => {
		if (requiresAuth && !isAuthenticated) {
			navigate("/login");
			return;
		}
		navigate(path);
		setMobileMenuOpen(false);
	};

	const openWhisperModal = () => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}
		setWhisperModalOpen(true);
		setMobileMenuOpen(false);
	};

	const userIdentity = useMemo(
		() => ({
			emoji: user?.avatarEmoji || "🎭",
			nickname: user?.anonymousAlias || "Anonymous User",
			color: "#6E59A5",
		}),
		[user]
	);

	const handleLogout = () => {
		logout();
		navigate("/");
	};

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

	useEffect(() => {
		document.body.classList.remove("overflow-hidden");
		return () => {
			document.body.classList.remove("overflow-hidden");
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
					{isAuthenticated ? (
						<div
							onClick={() => handleNavigation("/profile", true)}
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
					) : (
						<div className="flex items-center gap-3 bg-background rounded-lg p-3 mb-6 border border-purple-500/20">
							<AvatarGenerator
								emoji={userIdentity.emoji}
								nickname={userIdentity.nickname}
								color={userIdentity.color}
								size="md"
							/>
							<div>
								<h2 className="text-lg font-bold">{userIdentity.nickname}</h2>
								<p className="text-xs text-muted-foreground">
									<button
										onClick={() => navigate("/login")}
										className="text-purple-500 hover:text-purple-400"
									>
										Log in to personalize
									</button>
								</p>
							</div>
						</div>
					)}

					<div className="space-y-1">
						<NavItem
							icon={<Home size={18} />}
							label="Home"
							active={currentTab === "Home"}
							onClick={() => handleNavigation("/")}
						/>
						<NavItem
							icon={<Users size={18} />}
							label="Ghost Circles"
							active={currentTab === "Circles"}
							onClick={() => handleNavigation("/ghost-circles", true)}
							disabled={!isAuthenticated}
						/>
						<NavItem
							icon={<MessageSquare size={18} />}
							label="Whispers"
							active={currentTab === "Whispers"}
							onClick={() => handleNavigation("/whispers", true)}
							disabled={!isAuthenticated}
						/>
						<NavItem
							icon={<UserRound size={18} />}
							label="Profile"
							active={currentTab === "Profile"}
							onClick={() => handleNavigation("/profile", true)}
							disabled={!isAuthenticated}
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
					<div className="flex items-center justify-between mb-4">
						{isAuthenticated && <NotificationDropdown />}
					</div>
					{isAuthenticated ? (
						<Button
							onClick={handleLogout}
							className="w-full bg-red-500 hover:bg-red-700 text-white"
						>
							<LogOut size={16} className="mr-2" />
							Log Out
						</Button>
					) : (
						<Button
							onClick={() => navigate("/login")}
							className="w-full bg-purple-600 hover:bg-purple-700 text-white"
						>
							<LogIn size={16} className="mr-2" />
							Log In
						</Button>
					)}
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300"
						aria-hidden="true"
						style={{ pointerEvents: "auto" }}
						onClick={() => setMobileMenuOpen(false)}
					></div>
					<div
						className="fixed left-0 right-0 bottom-0 z-50 flex md:hidden flex-col animate-slide-up transition-all duration-300 bg-card"
						style={{
							height: "90vh",
							maxHeight: "90vh",
						}}
					>
						<div className="p-4 flex justify-between items-center border-b border-border">
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
						<div className="p-4 flex-1 overflow-y-auto">
							{isAuthenticated ? (
								<div
									onClick={() => handleNavigation("/profile", true)}
									className="flex items-center gap-3 bg-background rounded-lg p-3 mb-6 border border-purple-500/20 hover:cursor-pointer"
								>
									<AvatarGenerator
										emoji={userIdentity.emoji}
										nickname={user?.anonymousAlias}
										color={userIdentity.color}
										size="md"
									/>
									<div>
										<h2 className="text-lg font-bold">
											{user?.anonymousAlias}
										</h2>
										<p className="text-xs text-muted-foreground">
											Your anonymous identity
										</p>
									</div>
								</div>
							) : (
								<div className="flex items-center gap-3 bg-background rounded-lg p-3 mb-6 border border-purple-500/20">
									<AvatarGenerator
										emoji={userIdentity.emoji}
										nickname={userIdentity.nickname}
										color={userIdentity.color}
										size="md"
									/>
									<div>
										<h2 className="text-lg font-bold">
											{userIdentity.nickname}
										</h2>
										<p className="text-xs text-muted-foreground">
											<button
												onClick={() => navigate("/login")}
												className="text-purple-500 hover:text-purple-400"
											>
												Log in to personalize
											</button>
										</p>
									</div>
								</div>
							)}
							<div className="space-y-2">
								<NavItem
									icon={<Home size={18} />}
									label="Home"
									active={currentTab === "Home"}
									onClick={() => handleNavigation("/")}
								/>
								<NavItem
									icon={<Users size={18} />}
									label="Ghost Circles"
									active={currentTab === "Circles"}
									onClick={() => handleNavigation("/ghost-circles", true)}
									disabled={!isAuthenticated}
								/>
								<NavItem
									icon={<MessageSquare size={18} />}
									label="Whispers"
									active={currentTab === "Whispers"}
									onClick={() => handleNavigation("/whispers", true)}
									disabled={!isAuthenticated}
								/>
								<NavItem
									icon={<UserRound size={18} />}
									label="Profile"
									active={currentTab === "Profile"}
									onClick={() => handleNavigation("/profile", true)}
									disabled={!isAuthenticated}
								/>
							</div>
							<Button
								onClick={openWhisperModal}
								className="flex items-center justify-center p-2 rounded-lg mt-6 w-full border border-purple-600 hover:bg-purple-700 text-white"
							>
								<MessageSquare size={16} className="mr-2" /> New Whisper
							</Button>
						</div>
						<div className="p-4 border-t border-border">
							{isAuthenticated ? (
								<Button
									onClick={handleLogout}
									className="w-full bg-red-500 hover:bg-red-700 text-white"
								>
									<LogOut size={16} className="mr-2" />
									Log Out
								</Button>
							) : (
								<Button
									onClick={() => navigate("/login")}
									className="w-full bg-purple-600 hover:bg-purple-700 text-white"
								>
									<LogIn size={16} className="mr-2" />
									Log In
								</Button>
							)}
						</div>
					</div>
				</>
			)}

			{/* Main Content */}
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
						{isAuthenticated && <NotificationDropdown />}

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
				<div className="flex-1 min-h-0 overflow-y-auto pb-20 md:pb-0 flex flex-col">
					<div className="flex-1">{children}</div>
					<Footer />
				</div>

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
						onClick={() => handleNavigation("/")}
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
						onClick={() => handleNavigation("/ghost-circles", true)}
						disabled={!isAuthenticated}
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
						onClick={() => handleNavigation("/whispers", true)}
						disabled={!isAuthenticated}
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
						onClick={() => handleNavigation("/profile", true)}
						disabled={!isAuthenticated}
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
