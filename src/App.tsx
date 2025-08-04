import React, { useState } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Outlet,
	useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { NotificationProvider } from "./context/NotificationContext";
import { useOneSignalIntegration } from "./hooks/useOneSignalIntegration";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import SmoothScrollProvider from "./components/providers/SmoothScrollProvider";
import LoginSuccessAnimation from "./components/animations/LoginSuccessAnimation";
import OnboardingModal from "./components/onboarding/OnboardingModal";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import GhostCircles from "./pages/GhostCircles";
import InvitePage from "./pages/InvitePage";
import WhispersPage from "./pages/WhispersPage";
import RecognitionsPage from "./pages/RecognitionsPage";
import ReferralPage from "./pages/ReferralPage";
import MatchesPage from "./pages/MatchesPage";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminMatchStats from "./pages/AdminMatchStats";
import NotFound from "./pages/NotFound";

// Layout
import AppShell from "./components/layout/AppShell";
import PostDetail from "./components/feed/PostDetail";
import TagPostsPage from "./pages/TagPostsPage";
import TrendingTagsPage from "./pages/TrendingTagsPage";
import OneSignalDebugger from "./components/notifications/OneSignalDebugger";

const queryClient = new QueryClient();

function GlobalApp() {
	const {
		showLoginAnimation,
		setShowLoginAnimation,
		showOnboarding,
		setShowOnboarding,
	} = useAuth();
	const [loginAnimNavPending, setLoginAnimNavPending] = useState(false);
	const navigate = useNavigate();

	// Initialize OneSignal integration here where AuthProvider is available
	useOneSignalIntegration();

	return (
		<>
			{/* Render animation overlay if login/registration success */}
			{showLoginAnimation && (
				<div className="fixed inset-0 z-[99] bg-black/70 flex items-center justify-center">
					<LoginSuccessAnimation
						onComplete={() => {
							setShowLoginAnimation(false);
							setLoginAnimNavPending(true);
							// Use navigate for SPA transition
							navigate("/");
						}}
					/>
				</div>
			)}

			{/* Onboarding Modal */}
			<OnboardingModal open={showOnboarding} onOpenChange={setShowOnboarding} />

			<Routes>
				{/* Public routes */}
				<Route path="/post/:id" element={<PostDetail />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/privacy-policy" element={<PrivacyPolicy />} />
				<Route path="/terms-and-conditions" element={<TermsAndConditions />} />
				<Route path="/admin/login" element={<AdminLogin />} />
				{/* Invite route - handle query parameters */}
				<Route path="/invite" element={<InvitePage />} />

				{/* Combined root route with public and protected sub-routes */}
				<Route
					path="/"
					element={
						<AppShell>
							<Outlet />
						</AppShell>
					}
				>
					<Route index element={<Index />} /> {/* Public */}
					<Route
						path="profile"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="profile/:userId"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="ghost-circles"
						element={
							<ProtectedRoute>
								<GhostCircles />
							</ProtectedRoute>
						}
					/>
					<Route
						path="chat"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="chat/:userId"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="whispers"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route path="tags/:tagName" element={<TagPostsPage />} />
					<Route path="trending-tags" element={<TrendingTagsPage />} />
					<Route path="debug-notifications" element={<OneSignalDebugger />} />
					<Route
						path="recognitions"
						element={
							<ProtectedRoute>
								<RecognitionsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="referrals"
						element={
							<ProtectedRoute>
								<ReferralPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="matches"
						element={
							<ProtectedRoute>
								<MatchesPage />
							</ProtectedRoute>
						}
					/>
				</Route>

				{/* Admin routes */}
				<Route
					path="/admin"
					element={
						<ProtectedAdminRoute>
							<AdminPanel />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path="/admin/match-stats"
					element={
						<ProtectedAdminRoute>
							<AdminMatchStats />
						</ProtectedAdminRoute>
					}
				/>

				{/* 404 route */}
				<Route path="*" element={<NotFound />} />
			</Routes>
			<Toaster />
		</>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<SmoothScrollProvider>
				<AdminProvider>
					<Router
						future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
					>
						<AuthProvider>
							<NotificationProvider>
								<div className="App">
									<GlobalApp />
								</div>
							</NotificationProvider>
						</AuthProvider>
					</Router>
				</AdminProvider>
			</SmoothScrollProvider>
		</QueryClientProvider>
	);
}

export default App;
