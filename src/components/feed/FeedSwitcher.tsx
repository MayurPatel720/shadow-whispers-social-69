
import React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeedSwitcherProps {
  currentFilter: "global" | "college" | "area";
  onFilterChange: (filter: "global" | "college" | "area") => void;
}

const FeedSwitcher: React.FC<FeedSwitcherProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const getFeedLabel = () => {
    switch (currentFilter) {
      case "global":
        return "Global";
      case "college":
        return "College";
      case "area":
        return "Area";
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
      <DropdownMenuContent align="start" className="w-32 bg-card border-border">
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
          className={`cursor-pointer ${
            currentFilter === "college" ? "bg-purple-600/20 text-purple-400" : ""
          }`}
        >
          College
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onFilterChange("area")}
          className={`cursor-pointer ${
            currentFilter === "area" ? "bg-purple-600/20 text-purple-400" : ""
          }`}
        >
          Area
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FeedSwitcher;
