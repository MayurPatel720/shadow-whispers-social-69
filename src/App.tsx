import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import SmoothScrollProvider from "./components/providers/SmoothScrollProvider";
import LoginSuccessAnimation from "./components/animations/LoginSuccessAnimation";
import React, { useState } from "react";

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
import VerifyEmail from "./pages/VerifyEmail"; // <--- NEW

// Layout
import AppShell from "./components/layout/AppShell";

const queryClient = new QueryClient();

function GlobalApp() {
  const { showLoginAnimation, setShowLoginAnimation } = useAuth();
  const [loginAnimNavPending, setLoginAnimNavPending] = useState(false);

  return (
    <>
      {/* Render animation overlay if login/registration success */}
      {showLoginAnimation && (
        <div className="fixed inset-0 z-[99] bg-black/70 flex items-center justify-center">
          <LoginSuccessAnimation 
            onComplete={() => {
              setShowLoginAnimation(false);
              setLoginAnimNavPending(true);
              // Let the redirect happen, only after animation.
              window.location.pathname = "/";
            }}
          />
        </div>
      )}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Remove verify-email as its UI is moved to settings tab */}
        {/* <Route path="/verify-email" element={<VerifyEmail />} /> */}
        <Route path="/admin/login" element={<AdminLogin />} />

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

        {/* Protected routes with AppShell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell>
                <Outlet />
              </AppShell>
            </ProtectedRoute>
          }
        >
          <Route index element={<Index />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="ghost-circles" element={<GhostCircles />} />
          <Route path="invite/:circleId" element={<InvitePage />} />
          <Route path="chat" element={<WhispersPage />} />
          <Route path="chat/:userId" element={<WhispersPage />} />
          <Route path="whispers" element={<WhispersPage />} />
          <Route path="recognitions" element={<RecognitionsPage />} />
          <Route path="referrals" element={<ReferralPage />} />
          <Route path="matches" element={<MatchesPage />} />
        </Route>

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
          <Router>
            <AuthProvider>
              <div className="App">
                <GlobalApp />
              </div>
            </AuthProvider>
          </Router>
        </AdminProvider>
      </SmoothScrollProvider>
    </QueryClientProvider>
  );
}

export default App;
