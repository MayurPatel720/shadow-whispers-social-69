
import React, { useState } from "react";
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
import { GraduationCap, Search } from "lucide-react";

interface CollegeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCollegeSelect: (college: string) => void;
  currentCollege: string;
}

const DEFAULT_COLLEGES = ["BVM", "ADIT", "GCET"];

const CollegeSelectionDialog: React.FC<CollegeSelectionDialogProps> = ({
  open,
  onOpenChange,
  onCollegeSelect,
  currentCollege,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(currentCollege || "");
  const [customCollege, setCustomCollege] = useState("");

  const filteredColleges = DEFAULT_COLLEGES.filter(college =>
    college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    const college = selectedCollege === "custom" ? customCollege : selectedCollege;
    if (college.trim()) {
      onCollegeSelect(college.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Select Your College
          </DialogTitle>
          <DialogDescription>
            Choose your college to see posts from your college community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label>Select College</Label>
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a college" />
              </SelectTrigger>
              <SelectContent>
                {filteredColleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <div className="flex gap-2">
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
