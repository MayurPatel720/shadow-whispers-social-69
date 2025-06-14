import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Music, Dumbbell, Gamepad2, Globe2, Plane, BookOpen, Film, ChefHat, Paintbrush, Shirt, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const INTERESTS_LIST = [
  { label: "Music", icon: <Music className="mr-1 inline" size={16}/> },
  { label: "Movies", icon: <Film className="mr-1 inline" size={16}/> },
  { label: "Sports", icon: <Dumbbell className="mr-1 inline" size={16}/> },
  { label: "Reading", icon: <BookOpen className="mr-1 inline" size={16}/> },
  { label: "Gaming", icon: <Gamepad2 className="mr-1 inline" size={16}/> },
  { label: "Travel", icon: <Plane className="mr-1 inline" size={16}/> },
  { label: "Art", icon: <Paintbrush className="mr-1 inline" size={16}/> },
  { label: "Cooking", icon: <ChefHat className="mr-1 inline" size={16}/> },
  { label: "Fitness", icon: <Dumbbell className="mr-1 inline" size={16}/> },
  { label: "Tech", icon: <Globe2 className="mr-1 inline" size={16}/> },
  { label: "Fashion", icon: <Shirt className="mr-1 inline" size={16}/> },
];

type Gender = "male" | "female" | "other";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onOpenChange }) => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [gender, setGender] = useState<Gender>(
    (["male", "female", "other"].includes(user?.gender) ? user?.gender : "") as Gender
  );
  const [interests, setInterests] = useState<string[]>(user?.interests || []);

  useEffect(() => {
    setBio(user?.bio || "");
    setGender(
      (["male", "female", "other"].includes(user?.gender) ? user?.gender : "") as Gender
    );
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
      <DialogContent
        className="relative w-full max-w-md sm:max-w-lg md:max-w-xl px-0 pb-0 flex flex-col bg-background shadow-2xl rounded-lg"
        style={{
          // keep modal from being too tall, so users never have double vertical scroll
          maxHeight: "94vh",
        }}
      >
        {/* Top sticky area */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-background px-5 py-3 border-b border-border rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl whitespace-nowrap">Edit Profile</DialogTitle>
          </DialogHeader>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-muted transition z-10 focus:outline-none"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {/* Scrollable content area below sticky header, above sticky footer */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-3"
          style={{
            WebkitOverflowScrolling: "touch",
            // allow this area to shrink/grow but not overlap the header/footer
            maxHeight: "calc(94vh - 56px - 66px)", // header ~56px, footer ~66px
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anonymousAlias">Anonymous Alias</Label>
              <Input
                id="anonymousAlias"
                value={user?.anonymousAlias || ""}
                disabled
                className="bg-muted w-full"
              />
              <p className="text-xs text-muted-foreground">Your anonymous alias cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emojiAvatar">Emoji Avatar</Label>
              <Input
                id="emojiAvatar"
                value={user?.avatarEmoji || "🎭"}
                disabled
                className="bg-muted w-full"
              />
              <p className="text-xs text-muted-foreground">Your emoji avatar cannot be changed</p>
            </div>
          </div>
          {/* GENDER */}
          <div className="space-y-2 mt-2">
            <Label htmlFor="gender">
              Gender <span className="text-red-500">*</span>
            </Label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full bg-background border rounded p-2"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <p className="text-xs text-muted-foreground">Required for matchmaking.</p>
          </div>
          {/* INTERESTS LIST */}
          <div className="space-y-2">
            <Label>Interests <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2 justify-start">
              {INTERESTS_LIST.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => toggleInterest(item.label)}
                  className={`flex items-center px-4 py-1.5 rounded-full border transition-all text-sm font-medium min-w-[90px] justify-center
                    ${
                      interests.includes(item.label)
                        ? "bg-purple-700 text-white border-purple-700 shadow-md"
                        : "bg-gray-200 text-gray-800 border-gray-300 hover:border-purple-400"
                    }
                  `}
                  style={{ marginBottom: 4, marginRight: 4 }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Select at least one interest for better matches!</p>
          </div>
          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us something about yourself..."
              className="resize-none min-h-[80px] max-h-[180px] bg-background"
              style={{ width: "100%" }}
              maxLength={200}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Write something others will see in your profile.</span>
              <span>{bio.length}/200</span>
            </div>
          </div>
        </form>
        {/* Sticky footer buttons */}
        <div className="sticky bottom-0 left-0 right-0 z-10 bg-background px-5 py-4 border-t border-border rounded-b-lg flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
