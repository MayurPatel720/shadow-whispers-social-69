import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "@/lib/api";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
	const navigate = useNavigate();

	// Computed property for authentication status
	const isAuthenticated = !!user;

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			const storedUser = localStorage.getItem("user");
			if (storedUser) {
				try {
					const parsedUser = JSON.parse(storedUser);
					console.log("Loaded user from localStorage:", parsedUser);
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
			console.log("Login successful, received data:", data);

			// Check if user has already completed onboarding in localStorage
			const storedUser = localStorage.getItem("user");
			let hasCompletedOnboarding = false;

			if (storedUser) {
				try {
					const parsedStoredUser = JSON.parse(storedUser);
					hasCompletedOnboarding = parsedStoredUser.onboardingComplete === true;
					console.log("Stored user onboarding status:", hasCompletedOnboarding);
				} catch (error) {
					console.error("Error parsing stored user:", error);
				}
			}

			// Merge the API data with existing onboarding status
			const mergedUserData = {
				...data,
				onboardingComplete:
					hasCompletedOnboarding || data.onboardingComplete || false,
			};

			console.log("Merged user data with onboarding status:", mergedUserData);

			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(mergedUserData));
			setUser(mergedUserData);

			// Show login animation first
			setShowLoginAnimation(true);

			// After animation completes, check if onboarding is needed
			setTimeout(() => {
				setShowLoginAnimation(false);
				// Only show onboarding if user hasn't completed it
				if (!mergedUserData.onboardingComplete) {
					console.log("User hasn't completed onboarding, showing modal");
					setTimeout(() => {
						setShowOnboarding(true);
					}, 300);
				} else {
					console.log("User has completed onboarding, skipping modal");
					navigate("/");
				}
			}, 3000); // Animation duration

			toast({
				title: "Welcome back!",
				description: "You have successfully logged in.",
			});
		} catch (error: any) {
			console.error("Login error:", error);
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

			// New users always need onboarding
			const newUserData = {
				...data,
				onboardingComplete: false,
			};

			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(newUserData));
			setUser(newUserData);

			// Show login animation first
			setShowLoginAnimation(true);

			// Always show onboarding for new users after animation completes
			setTimeout(() => {
				setShowLoginAnimation(false);
				setTimeout(() => {
					console.log("Showing onboarding modal for new user...");
					setShowOnboarding(true);
				}, 300);
			}, 3000); // Animation duration

			toast({
				title: "Account created!",
				description: "Welcome to UnderKover! Let's get you set up.",
			});
		} catch (error: any) {
			console.error("Registration failed:", error);
			toast({
				variant: "destructive",
				title: "Registration failed",
				description:
					error.message ||
					"Something went wrong during registration. Please try again.",
			});
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		console.log("Logging out user");
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		setShowOnboarding(false);
		setShowLoginAnimation(false);
		toast({
			title: "Logged out",
			description: "You have been successfully logged out.",
		});
	};

	const updateUser = (userData: User) => {
		console.log("Updating user data in AuthContext:", userData);

		// Ensure the updated user data is properly set
		const updatedUser = { ...userData };
		setUser(updatedUser);
		localStorage.setItem("user", JSON.stringify(updatedUser));

		// Close onboarding when user profile is updated with onboardingComplete
		if (updatedUser.onboardingComplete) {
			console.log("Onboarding completed, closing modal and updating state");
			navigate("/");
			setShowOnboarding(false);
		}
	};

	const updateProfile = async (profileData: Partial<User>) => {
		try {
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
