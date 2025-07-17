
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface AreaSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAreaSelect: (area: string) => void;
  currentArea: string;
}

const AreaSelectionDialog: React.FC<AreaSelectionDialogProps> = ({
  open,
  onOpenChange,
  onAreaSelect,
  currentArea,
}) => {
  const [area, setArea] = useState(currentArea || "");

  const handleSubmit = () => {
    if (area.trim()) {
      onAreaSelect(area.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Your Area
          </DialogTitle>
          <DialogDescription>
            Enter your area to see posts from your local community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="area-input">Area/Location</Label>
            <Input
              id="area-input"
              placeholder="Enter your area (e.g., Anand, Ahmedabad)"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

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
              disabled={!area.trim()}
              className="flex-1"
            >
              Select Area
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreaSelectionDialog;
