
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, GraduationCap, MapPin, Clock } from "lucide-react";

interface EmptyFeedMessageProps {
  feedType: "global" | "college" | "area";
  onCreatePost: () => void;
  onSwitchFeed: () => void;
  isAuthenticated: boolean;
}

const EmptyFeedMessage: React.FC<EmptyFeedMessageProps> = ({
  feedType,
  onCreatePost,
  onSwitchFeed,
  isAuthenticated,
}) => {
  const getIcon = () => {
    switch (feedType) {
      case "college":
        return <GraduationCap className="h-12 w-12 text-muted-foreground" />;
      case "area":
        return <MapPin className="h-12 w-12 text-muted-foreground" />;
      default:
        return <Users className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (feedType) {
      case "college":
        return "Building your college community...";
      case "area":
        return "Connecting your local area...";
      default:
        return "Loading secrets...";
    }
  };

  const getDescription = () => {
    switch (feedType) {
      case "college":
        return "Your college feed is growing! Share your first secret to connect with your college community.";
      case "area":
        return "Your area feed is growing! Share your first secret to connect with your local community.";
      default:
        return "Someone's secrets are coming your way...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 relative">
        {getIcon()}
        <Clock className="h-4 w-4 absolute -top-1 -right-1 text-purple-500 animate-pulse" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-foreground">{getTitle()}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {getDescription()}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {isAuthenticated && (
          <Button onClick={onCreatePost} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Share Your Secret
          </Button>
        )}
        {feedType !== "global" && (
          <Button variant="outline" onClick={onSwitchFeed}>
            Switch to Global Feed
          </Button>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {feedType === "college" ? "College secrets loading..." : feedType === "area" ? "Area secrets loading..." : "Global secrets loading..."}
      </p>
    </div>
  );
};

export default EmptyFeedMessage;
