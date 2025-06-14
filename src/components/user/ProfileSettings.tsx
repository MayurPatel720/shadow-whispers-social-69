
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";

const ProfileSettings = ({
  isOwnProfile,
  onAccountSettings,
  onLogout,
}: {
  isOwnProfile: boolean;
  onAccountSettings: () => void;
  onLogout: () => void;
}) => {
  if (!isOwnProfile) return null;
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-4 sm:p-6">
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
