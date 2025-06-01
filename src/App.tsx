import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import WhispersPage from "./pages/WhispersPage";
import ProfilePage from "./pages/ProfilePage";
import GhostCircles from "./pages/GhostCircles";
import AppShell from "./components/layout/AppShell";
import InvitePage from "./pages/InvitePage";
import ReferralPage from "./pages/ReferralPage";
import RecognitionsPage from "./pages/RecognitionsPage";
import WhisperChatPage from "./components/whisper/WhisperChatPage";
import PostDetail from "./components/feed/PostDetail";
import Not from "./components/whisper/Not";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />

			<BrowserRouter>
				<AuthProvider>
					<Routes>
						<Route path="/N" element={<Not />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/invite" element={<InvitePage />} />

						{/* Main Routes with AppShell */}
						<Route
							path="/"
							element={
								<ProtectedRoute>
									<AppShell>
										<Index />
									</AppShell>
								</ProtectedRoute>
							}
						/>
						{/* <Route path="/profile/:userId" element={<UserProfilePage />} />
            // <Route path="/whispers/chat/:partnerId" element={<WhisperChatPage />} /> */}
						<Route
							path="/whispers"
							element={
								<ProtectedRoute>
									<AppShell>
										<WhispersPage />
									</AppShell>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/profile"
							element={
								<ProtectedRoute>
									<AppShell>
										<ProfilePage />
									</AppShell>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/profile/:userId"
							element={
								<ProtectedRoute>
									<AppShell>
										<ProfilePage />
									</AppShell>
								</ProtectedRoute>
							}
						/>
						<Route path="/post/:id" element={<PostDetail />} />
						<Route
							path="/chat/:partnerId"
							element={
								<AppShell>
									<WhisperChatPage />
								</AppShell>
							}
						/>
						<Route
							path="/ghost-circles"
							element={
								<ProtectedRoute>
									<AppShell>
										<GhostCircles />
									</AppShell>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/referrals"
							element={
								<ProtectedRoute>
									<AppShell>
										<ReferralPage />
									</AppShell>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/recognitions"
							element={
								<ProtectedRoute>
									<AppShell>
										<RecognitionsPage />
									</AppShell>
								</ProtectedRoute>
							}
						/>
						<Route
							path="/circles"
							element={<Navigate to="/ghost-circles" replace />}
						/>
						<Route
							path="/discover"
							element={
								<ProtectedRoute>
									<AppShell>
										<Index />
									</AppShell>
								</ProtectedRoute>
							}
						/>

						<Route path="*" element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
