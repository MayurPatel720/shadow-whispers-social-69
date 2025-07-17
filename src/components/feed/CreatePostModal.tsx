
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

      await api.post("/api/posts", postData);
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      setContent("");
      setMediaFiles([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (files: Array<{ type: 'image' | 'video', url: string, file?: File }>) => {
    setMediaFiles(files);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Share Your Truth {ghostCircleId ? "in Circle" : `(${currentFeedType} feed)`}
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
                {ghostCircleId ? "Posting to Ghost Circle" : `Posting to ${currentFeedType} feed`}
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
            onUpload={handleMediaUpload}
            maxFiles={5}
            currentFiles={mediaFiles}
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
