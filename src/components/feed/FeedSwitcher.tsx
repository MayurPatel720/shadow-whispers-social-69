
import React from "react";
import { ChevronDown, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedSwitcherProps {
  currentFilter: "global" | "college" | "area";
  onFilterChange: (filter: "global" | "college" | "area") => void;
  userCollege?: string;
  userArea?: string;
  onEditCollege?: () => void;
  onEditArea?: () => void;
}

const FeedSwitcher: React.FC<FeedSwitcherProps> = ({
  currentFilter,
  onFilterChange,
  userCollege,
  userArea,
  onEditCollege,
  onEditArea,
}) => {
  const getFeedLabel = () => {
    switch (currentFilter) {
      case "global":
        return "Global";
      case "college":
        return userCollege || "College";
      case "area":
        return userArea || "Area";
      default:
        return "Global";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-xl font-bold text-foreground hover:text-purple-400 transition-colors">
          {getFeedLabel()}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-card border-border">
        <DropdownMenuItem
          onClick={() => onFilterChange("global")}
          className={`cursor-pointer ${
            currentFilter === "global" ? "bg-purple-600/20 text-purple-400" : ""
          }`}
        >
          Global
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onFilterChange("college")}
          className={`cursor-pointer flex items-center justify-between ${
            currentFilter === "college" ? "bg-purple-600/20 text-purple-400" : ""
          }`}
        >
          <span>{userCollege || "College"}</span>
          {userCollege && onEditCollege && (
            <Edit2 
              className="h-3 w-3 ml-2 opacity-60 hover:opacity-100" 
              onClick={(e) => {
                e.stopPropagation();
                onEditCollege();
              }}
            />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onFilterChange("area")}
          className={`cursor-pointer flex items-center justify-between ${
            currentFilter === "area" ? "bg-purple-600/20 text-purple-400" : ""
          }`}
        >
          <span>{userArea || "Area"}</span>
          {userArea && onEditArea && (
            <Edit2 
              className="h-3 w-3 ml-2 opacity-60 hover:opacity-100" 
              onClick={(e) => {
                e.stopPropagation();
                onEditArea();
              }}
            />
          )}
        </DropdownMenuItem>

        {(userCollege || userArea) && (
          <>
            <DropdownMenuSeparator />
            {userCollege && (
              <DropdownMenuItem
                onClick={onEditCollege}
                className="cursor-pointer text-muted-foreground text-sm"
              >
                <Edit2 className="h-3 w-3 mr-2" />
                Change College
              </DropdownMenuItem>
            )}
            {userArea && (
              <DropdownMenuItem
                onClick={onEditArea}
                className="cursor-pointer text-muted-foreground text-sm"
              >
                <Edit2 className="h-3 w-3 mr-2" />
                Change Area
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FeedSwitcher;
