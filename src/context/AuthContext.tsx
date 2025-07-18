import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/lib/api";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data or validate token
      // For now, just set a default user
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
      } else {
        setUser({
          _id: "default_user_id",
          username: "DefaultUser",
          fullName: "Default User",
          email: "default@example.com",
          posts: [],
          anonymousAlias: "Anonymous",
          avatarEmoji: "🎭",
          referralCode: "",
          referralCount: 0,
          friends: [],
          ghostCircles: [],
          recognizedUsers: [],
          identityRecognizers: [],
          recognitionAttempts: 0,
          successfulRecognitions: 0,
          recognitionRevocations: [],
          bio: "",
          claimedRewards: [],
          interests: [],
          premiumMatchUnlocks: 0,
          isEmailVerified: false,
        });
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
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
      const data = await registerUser(
        username,
        fullName,
        email,
        password,
        referralCode
      );
      localStorage.setItem("token", data.token);
      setUser(data);
      setShowLoginAnimation(true);
      
      // Always show onboarding for new users
      setTimeout(() => setShowOnboarding(true), 2000);
      
      toast({
        title: "Account created!",
        description: "Welcome to UnderKover! Let's get you set up.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setShowOnboarding(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data or validate token
      // For now, just set a default user
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
      } else {
        setUser({
          _id: "default_user_id",
          username: "DefaultUser",
          fullName: "Default User",
          email: "default@example.com",
          posts: [],
          anonymousAlias: "Anonymous",
          avatarEmoji: "🎭",
          referralCode: "",
          referralCount: 0,
          friends: [],
          ghostCircles: [],
          recognizedUsers: [],
          identityRecognizers: [],
          recognitionAttempts: 0,
          successfulRecognitions: 0,
          recognitionRevocations: [],
          bio: "",
          claimedRewards: [],
          interests: [],
          premiumMatchUnlocks: 0,
          isEmailVerified: false,
        });
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        showLoginAnimation,
        setShowLoginAnimation,
        login,
        register,
        logout,
        updateUser,
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
