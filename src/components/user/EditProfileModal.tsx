
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
// New for select
import { Select } from "@/components/ui/select";

// Add your own interests list
const INTERESTS = [
  "Music", "Movies", "Sports", "Reading", "Gaming",
  "Travel", "Art", "Cooking", "Fitness", "Tech", "Fashion",
];

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onOpenChange }) => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [interests, setInterests] = useState<string[]>(user?.interests || []);

  useEffect(() => {
    setBio(user?.bio || "");
    setGender(user?.gender || "");
    setInterests(user?.interests || []);
  }, [user?.bio, user?.gender, user?.interests]);

  const toggleInterest = (option: string) => {
    setInterests((current) =>
      current.includes(option)
        ? current.filter((x) => x !== option)
        : [...current, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || interests.length === 0) {
      toast({
        variant: "destructive",
        title: "Profile Incomplete",
        description: "Please select your gender and at least 1 interest.",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      await updateProfile({ bio, gender, interests });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="anonymousAlias">Anonymous Alias</Label>
            <Input
              id="anonymousAlias"
              value={user?.anonymousAlias || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your anonymous alias cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emojiAvatar">Emoji Avatar</Label>
            <Input
              id="emojiAvatar"
              value={user?.avatarEmoji || "🎭"}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your emoji avatar cannot be changed
            </p>
          </div>

          {/* GENDER (REQUIRED) */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-background border rounded p-2"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Required for matchmaking.
            </p>
          </div>

          {/* INTERESTS (REQUIRED MULTISELECT) */}
          <div className="space-y-2">
            <Label>Interests <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full border ${
                    interests.includes(interest)
                      ? "bg-purple-700 text-white border-purple-700"
                      : "bg-muted border-gray-200 text-gray-800"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select at least one interest for better matches!
            </p>
          </div>

          {/* BIO */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us something about yourself..."
              className="resize-none min-h-[80px] max-h-[180px] bg-background"
              maxLength={200}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Write something others will see in your profile.</span>
              <span>{bio.length}/200</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;

