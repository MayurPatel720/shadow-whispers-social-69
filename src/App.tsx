
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import ReferralPage from "./pages/ReferralPage";
import RecognitionsPage from "./pages/RecognitionsPage";
import GhostCircles from "./pages/GhostCircles";
import WhispersPage from "./pages/WhispersPage";
import InvitePage from "./pages/InvitePage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId?"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
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
                path="/recognitions"
                element={
                  <ProtectedRoute>
                    <RecognitionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ghost-circles"
                element={
                  <ProtectedRoute>
                    <GhostCircles />
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
                path="/invite/:circleId"
                element={
                  <ProtectedRoute>
                    <InvitePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
