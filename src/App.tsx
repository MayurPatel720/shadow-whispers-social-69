
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import ProfilePage from "@/pages/ProfilePage";
import RecognitionsPage from "@/pages/RecognitionsPage";
import ReferralPage from "@/pages/ReferralPage";
import WhispersPage from "@/pages/WhispersPage";
import MatchesPage from "@/pages/MatchesPage";
import GhostCircles from "@/pages/GhostCircles";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";
import AdminMatchStats from "@/pages/AdminMatchStats";
import InvitePage from "@/pages/InvitePage";
import NotFound from "@/pages/NotFound";

// Components
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const GlobalApp = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/invite/:inviteCode" element={<InvitePage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
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

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recognitions"
          element={
            <ProtectedRoute>
              <RecognitionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referral"
          element={
            <ProtectedRoute>
              <ReferralPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whispers"
          element={
            <ProtectedRoute>
              <WhispersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circles"
          element={
            <ProtectedRoute>
              <GhostCircles />
            </ProtectedRoute>
          }
        />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScrollProvider>
        <div className="min-h-screen bg-background">
          <Router>
            <AdminProvider>
              <AuthProvider>
                <GlobalApp />
              </AuthProvider>
            </AdminProvider>
          </Router>
        </div>
      </SmoothScrollProvider>
    </QueryClientProvider>
  );
}

export default App;
