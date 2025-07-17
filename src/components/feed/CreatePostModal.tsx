
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, X, Image as ImageIcon, Video, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import UnifiedMediaUpload from "@/components/ui/unified-media-upload";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  ghostCircleId?: string;
  currentFeedType?: "global" | "college" | "area";
}

const CreatePostModal = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  ghostCircleId,
  currentFeedType = "global"
}: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<Array<{ type: 'image' | 'video', url: string, file?: File }>>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please add some content or media to your post",
        variant: "destructive",
      });
      return;
    }

    // Check if required fields are present for specific feed types
    if (currentFeedType === "college" && !localStorage.getItem("userCollege")) {
      toast({
        title: "Error",
        description: "Please select a college to post in the college feed",
        variant: "destructive",
      });
      return;
    }

    if (currentFeedType === "area" && !localStorage.getItem("userArea")) {
      toast({
        title: "Error",
        description: "Please select an area to post in the area feed",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = mediaFiles.filter(file => file.type === 'image').map(file => file.url);
      const videoData = mediaFiles.filter(file => file.type === 'video').map(file => ({
        url: file.url,
        thumbnail: '', // Add thumbnail logic if needed
        duration: 0,
        size: 0
      }));

      const postData = {
        content: content.trim(),
        images: imageUrls,
        videos: videoData,
        feedType: currentFeedType,
        ...(ghostCircleId && { ghostCircleId })
      };

      // Add college or area based on current feed type
      if (currentFeedType === "college") {
        const userCollege = localStorage.getItem("userCollege");
        if (userCollege) {
          postData.college = userCollege;
        }
      } else if (currentFeedType === "area") {
        const userArea = localStorage.getItem("userArea");
        if (userArea) {
          postData.area = userArea;
        }
      }

      console.log("Creating post with data:", postData);

      await api.post("/api/posts", postData);
      
      toast({
        title: "Success",
        description: `Post created successfully in ${currentFeedType} feed!`,
      });
      
      setContent("");
      setMediaFiles([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (files: { images: File[]; videos: File[] }) => {
    const newMediaFiles: Array<{ type: 'image' | 'video', url: string, file?: File }> = [];
    
    // Process image files
    files.images.forEach(file => {
      const url = URL.createObjectURL(file);
      newMediaFiles.push({ type: 'image', url, file });
    });
    
    // Process video files
    files.videos.forEach(file => {
      const url = URL.createObjectURL(file);
      newMediaFiles.push({ type: 'video', url, file });
    });
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFeedDisplayName = () => {
    switch (currentFeedType) {
      case "college":
        return `College (${localStorage.getItem("userCollege")})`;
      case "area":
        return `Area (${localStorage.getItem("userArea")})`;
      default:
        return "Global";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Share Your Truth 
            {ghostCircleId ? " in Circle" : ` (${getFeedDisplayName()} feed)`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
              <span className="text-lg">{user?.avatarEmoji || "🎭"}</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{user?.anonymousAlias || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">
                {ghostCircleId ? "Posting to Ghost Circle" : `Posting to ${getFeedDisplayName()} feed`}
              </p>
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts anonymously..."
            className="min-h-[120px] resize-none bg-background border-border focus:border-purple-500"
            disabled={isSubmitting}
          />

          <UnifiedMediaUpload
            onFileSelect={handleFileSelect}
            maxFiles={5}
            currentFileCount={mediaFiles.length}
          />

          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mediaFiles.map((file, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-2">
                    <div className="relative">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt="Upload preview"
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-24 bg-muted rounded flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Share Truth"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
