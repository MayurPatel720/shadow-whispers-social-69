
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, ImageIcon, Video, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updatePost } from "@/lib/api";

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: any;
  onSuccess: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ 
  open, 
  onOpenChange, 
  post,
  onSuccess
}) => {
  const [content, setContent] = useState(post?.content || "");
  const [images, setImages] = useState<string[]>(post?.images || []);
  const [videos, setVideos] = useState<any[]>(post?.videos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const video = {
            url: reader.result as string,
            thumbnail: "",
            duration: 0,
            size: file.size
          };
          setVideos(prev => [...prev, video]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please add some content, image, or video to your post.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updatePost(post._id, content, images, videos);
      
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating post",
        description: "Could not update your post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-300">
            <Edit3 size={20} />
            Edit Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="What's on your mind? Your identity will remain anonymous..."
            className="min-h-[120px] bg-gray-800 border-gray-600 focus:border-purple-500 text-white resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-2 text-xs text-gray-400">
            {content.length}/500 characters
          </div>

          {/* Image Upload */}
          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="flex items-center gap-2 cursor-pointer">
                  <ImageIcon size={16} />
                  Add Images
                </span>
              </Button>
            </label>
          </div>

          {/* Video Upload */}
          <div className="mt-2">
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="flex items-center gap-2 cursor-pointer">
                  <Video size={16} />
                  Add Videos
                </span>
              </Button>
            </label>
          </div>

          {/* Preview Images */}
          {images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Images:</h4>
              <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Videos */}
          {videos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Videos:</h4>
              <div className="grid grid-cols-2 gap-2">
                {videos.map((video, index) => (
                  <div key={index} className="relative">
                    <video src={video.url} className="w-full h-20 object-cover rounded" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeVideo(index)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={(!content.trim() && images.length === 0 && videos.length === 0) || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
