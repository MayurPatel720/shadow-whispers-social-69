
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Filter, Globe, GraduationCap, MapPin } from "lucide-react";

interface FeedFilterDialogProps {
  currentFilter: "global" | "college" | "area";
  onFilterChange: (filter: "global" | "college" | "area") => void;
}

const FeedFilterDialog: React.FC<FeedFilterDialogProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const [open, setOpen] = React.useState(false);

  const filterOptions = [
    { value: "global", label: "Global Feed", icon: Globe, description: "See posts from everyone" },
    { value: "college", label: "College Feed", icon: GraduationCap, description: "See posts from your college" },
    { value: "area", label: "Area Feed", icon: MapPin, description: "See posts from your area" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {currentFilter === "global" && "Global"}
          {currentFilter === "college" && "College"}
          {currentFilter === "area" && "Area"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Feed Type</DialogTitle>
          <DialogDescription>
            Select which type of posts you want to see
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={currentFilter === option.value ? "default" : "outline"}
                className="w-full justify-start gap-3 h-auto p-4"
                onClick={() => {
                  onFilterChange(option.value as "global" | "college" | "area");
                  setOpen(false);
                }}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedFilterDialog;
