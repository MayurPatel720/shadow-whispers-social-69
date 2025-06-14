
import React from "react";
import { User } from "@/types/user";
import AvatarGenerator from "@/components/user/AvatarGenerator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RecognitionUserListProps {
  users?: User[];
  activeTab: "recognized" | "recognizers";
  onRevoke?: (userId: string) => void;
}

const RecognitionUserList: React.FC<RecognitionUserListProps> = ({
  users = [],
  activeTab,
  onRevoke,
}) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }
  return (
    <div className="divide-y">
      {users.map((user) => (
        <div key={user._id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <AvatarGenerator
              emoji={user.avatarEmoji}
              nickname={user.anonymousAlias}
              size="md"
            />
            <div>
              <p className="font-medium">{user.anonymousAlias}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          {activeTab === "recognized" && onRevoke && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRevoke(user._id)}
              className="text-destructive hover:text-destructive"
            >
              <X size={16} className="mr-1" />
              Revoke
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecognitionUserList;
