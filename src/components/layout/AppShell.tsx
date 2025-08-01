
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import logo from "@/assets/logo.png";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import NotificationPermissionButton from "@/components/notifications/NotificationPermissionButton";

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isBrandSpinning, setIsBrandSpinning] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const handleBrandClick = () => {
    setIsBrandSpinning(true);
    setTimeout(() => {
      setIsBrandSpinning(false);
    }, 500);
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-secondary py-4 shadow-sm">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={logo}
              alt="UnderKover Logo"
              className="h-8 w-auto mr-2"
            />
            <h1
              className="text-xl font-bold text-purple-500 cursor-pointer"
              onClick={handleBrandClick}
            >
              UnderKover
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && <NotificationDropdown />}
            {isAuthenticated && <NotificationPermissionButton />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(theme === "light" ? "dark" : "light")
              }
            >
              {theme === "light" ? <Moon /> : <Sun />}
            </Button>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarEmoji} alt={user?.username} />
                      <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-10">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
