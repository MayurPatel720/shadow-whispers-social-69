
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Search, Filter } from "lucide-react";
import { INDIAN_COLLEGES, getPopularColleges, searchColleges, getCollegesByType, COLLEGE_TYPES, College } from "@/data/colleges";

interface CollegeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCollegeSelect: (college: string) => void;
  currentCollege: string;
}

const CollegeSelectionDialog: React.FC<CollegeSelectionDialogProps> = ({
  open,
  onOpenChange,
  onCollegeSelect,
  currentCollege,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(currentCollege || "");
  const [customCollege, setCustomCollege] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredColleges = useMemo(() => {
    let colleges = INDIAN_COLLEGES;

    // Filter by search term
    if (searchTerm.trim()) {
      colleges = searchColleges(searchTerm);
    }

    // Filter by type
    if (selectedType !== "all") {
      colleges = colleges.filter(college => college.type === selectedType);
    }

    // Show popular colleges first if no filters applied
    if (!searchTerm.trim() && selectedType === "all") {
      const popular = getPopularColleges();
      const others = colleges.filter(c => !popular.find(p => p.id === c.id));
      return [...popular, ...others].slice(0, 30);
    }

    return colleges.slice(0, 30);
  }, [searchTerm, selectedType]);

  const handleSubmit = () => {
    const college = selectedCollege === "custom" ? customCollege : selectedCollege;
    if (college.trim()) {
      onCollegeSelect(college.trim());
      onOpenChange(false);
    }
  };

  const handleCollegeSelect = (college: College | "custom") => {
    if (college === "custom") {
      setSelectedCollege("custom");
    } else if (typeof college === "object") {
      setSelectedCollege(college.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Select Your College
          </DialogTitle>
          <DialogDescription>
            Choose your college to see posts from your college community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="college-search">Search College</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="college-search"
                placeholder="Search for your college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label>Filter by Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {COLLEGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* College List */}
          <div className="space-y-2">
            <Label>Select College</Label>
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
              {!searchTerm.trim() && selectedType === "all" && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-medium">Popular Colleges:</p>
                </div>
              )}
              
              {filteredColleges.map((college) => (
                <button
                  key={college.id}
                  onClick={() => handleCollegeSelect(college)}
                  className={`w-full p-3 text-left rounded border transition-all text-sm ${
                    selectedCollege === college.name
                      ? "bg-primary/10 border-primary text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{college.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {college.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {college.city}, {college.state} • {college.type} • {college.category}
                    </span>
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => handleCollegeSelect("custom")}
                className={`w-full p-3 text-left rounded border transition-all text-sm ${
                  selectedCollege === "custom"
                    ? "bg-primary/10 border-primary text-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">Other (Custom)</span>
                  <span className="text-xs text-muted-foreground">
                    Enter your college name manually
                  </span>
                </div>
              </button>

              {filteredColleges.length === 0 && searchTerm.trim() && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm mb-2">No colleges found for "{searchTerm}"</p>
                  <p className="text-xs">Try searching with a different term or select "Other (Custom)"</p>
                </div>
              )}
            </div>
          </div>

          {/* Custom College Input */}
          {selectedCollege === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-college">Enter College Name</Label>
              <Input
                id="custom-college"
                placeholder="Enter your college name"
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCollege || (selectedCollege === "custom" && !customCollege.trim())}
              className="flex-1"
            >
              Select College
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollegeSelectionDialog;
