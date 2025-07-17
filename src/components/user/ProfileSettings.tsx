
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import VerifyEmailSettings from "./VerifyEmailSettings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUserAccount } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ProfileSettings = ({
  isOwnProfile,
  onAccountSettings,
  onLogout,
}: {
  isOwnProfile: boolean;
  onAccountSettings: () => void;
  onLogout: () => void;
}) => {
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteUserAccount();
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });

      // Clear local storage and logout
      localStorage.removeItem("token");
      logout();
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: error?.message || "Failed to delete account. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOwnProfile) return null;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-4 sm:p-6">
        {/* Email Verification Section */}
        {user && !user.isEmailVerified && (
          <VerifyEmailSettings email={user.email} />
        )}

        <div className="space-y-1">
          <h4 className="text-base font-medium">Account Settings</h4>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="border-t border-border my-3"></div>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={onAccountSettings}
            className="justify-start text-sm w-full hover:bg-gray-100 transition-colors py-2 px-3 rounded-md"
          >
            <Settings size={16} className="mr-2" />
            Account Settings
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-sm w-full hover:bg-red-50 border-red-200 text-red-600 transition-colors py-2 px-3 rounded-md"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone and will permanently remove:
                  <br /><br />
                  • All your posts and comments
                  <br />
                  • All your whisper conversations
                  <br />
                  • Your membership in all ghost circles
                  <br />
                  • All your personal data and settings
                  <br /><br />
                  This process is irreversible and complies with GDPR data deletion requirements.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="destructive"
            onClick={onLogout}
            className="justify-start text-sm w-full transition-colors py-2 px-3 rounded-md"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
