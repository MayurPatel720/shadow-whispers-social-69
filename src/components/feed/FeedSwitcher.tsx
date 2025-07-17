
import React from "react";

interface FeedSwitcherProps {
  currentFilter: "global" | "college" | "area";
  onFilterChange: (filter: "global" | "college" | "area") => void;
}

const FeedSwitcher: React.FC<FeedSwitcherProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const feedOptions = [
    { id: "global", label: "Global" },
    { id: "college", label: "College" },
    { id: "area", label: "Area" },
  ];

  return (
    <div className="flex bg-muted rounded-lg p-1">
      {feedOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onFilterChange(option.id as "global" | "college" | "area")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentFilter === option.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FeedSwitcher;
