
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/lib/api";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showLoginAnimation: boolean;
  setShowLoginAnimation: (show: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    fullName: string,
    email: string,
    password: string,
    referralCode?: string
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  // New onboarding state
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  // Computed property for authentication status
  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data or validate token
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setShowLoginAnimation(true);
      
      // Check if onboarding is needed
      if (!data.onboardingComplete) {
        setTimeout(() => setShowOnboarding(true), 2000); // Show after login animation
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    fullName: string,
    email: string,
    password: string,
    referralCode?: string
  ) => {
    setIsLoading(true);
    try {
      console.log("Starting registration process...");
      const data = await registerUser(
        username,
        fullName,
        email,
        password,
        referralCode
      );
      
      console.log("Registration successful, received data:", data);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setShowLoginAnimation(true);
      
      // Always show onboarding for new users
      setTimeout(() => {
        console.log("Showing onboarding modal...");
        setShowOnboarding(true);
      }, 2500); // Show after login animation completes
      
      toast({
        title: "Account created!",
        description: "Welcome to UnderKover! Let's get you set up.",
      });
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong during registration. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowOnboarding(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      // API call to update profile would go here
      // For now, just update local state
      if (user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile",
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      // API call to refresh user data would go here
      // For now, just maintain current state
      console.log("Refreshing user data...");
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        showLoginAnimation,
        setShowLoginAnimation,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
        refreshUser,
        showOnboarding,
        setShowOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
