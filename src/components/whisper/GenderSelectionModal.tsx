
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/api";

interface GenderSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenderSaved: () => void;
}

type Gender = "male" | "female" | "other";

const GenderSelectionModal: React.FC<GenderSelectionModalProps> = ({
  open,
  onOpenChange,
  onGenderSaved,
}) => {
  const [selectedGender, setSelectedGender] = useState<Gender>("male");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateUser } = useAuth();

  const handleSave = async () => {
    if (!selectedGender) {
      toast({
        variant: "destructive",
        title: "Please select a gender",
        description: "Gender is required to see matches.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Make actual API call to save gender to database
      const updatedUser = await updateUserProfile({ gender: selectedGender });
      
      // Update the local user state with the response from the API
      if (user) {
        updateUser({ ...user, ...updatedUser });
      }
      
      toast({
        title: "Gender saved!",
        description: "You can now see your matches.",
      });
      onGenderSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save gender:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save gender. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Gender</DialogTitle>
          <DialogDescription>
            We need to know your gender to show you relevant matches. This will be saved to your profile.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Choose your gender:</Label>
            <div className="space-y-2">
              {[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={selectedGender === option.value}
                    onChange={(e) => setSelectedGender(e.target.value as Gender)}
                    className="text-purple-600"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenderSelectionModal;
