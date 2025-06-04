
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, ImageIcon, Video, X, Camera, FolderOpen } from "lucide-react";
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageCameraRef = useRef<HTMLInputElement>(null);
  const videoCameraRef = useRef<HTMLInputElement>(null);

  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + videos.length + files.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload maximum 10 files per post.",
        variant: "destructive",
      });
      return;
    }

    // Process new files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        continue;
      }

      const maxSize = isMobile ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is ${isMobile ? '10MB' : '5MB'}.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        setImageFiles(prev => [...prev, file]);
        
        const reader = new FileReader();
        reader.onload = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: "Image processing failed",
          description: `Could not process ${file.name}.`,
          variant: "destructive",
        });
      }
    }

    // Clear input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + videos.length + files.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload maximum 10 files per post.",
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a video file.`,
          variant: "destructive",
        });
        continue;
      }

      const maxSize = isMobile ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Video too large",
          description: `${file.name} is too large. Maximum size is ${isMobile ? '100MB' : '50MB'}.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        setVideoFiles(prev => [...prev, file]);
        
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
      } catch (error) {
        console.error('Error processing video:', error);
        toast({
          title: "Video processing failed",
          description: `Could not process ${file.name}.`,
          variant: "destructive",
        });
      }
    }

    // Clear input
    if (e.target) {
      e.target.value = '';
    }
  };

  const triggerImagePicker = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const triggerVideoPicker = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const triggerImageCamera = () => {
    if (imageCameraRef.current) {
      imageCameraRef.current.click();
    }
  };

  const triggerVideoCamera = () => {
    if (videoCameraRef.current) {
      videoCameraRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
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
    let uploadedImageUrls = [...images.filter(img => img.startsWith('http'))];
    let uploadedVideoUrls = [...videos.filter(vid => vid.url?.startsWith('http'))];

    try {
      // Upload new image files
      if (imageFiles.length > 0) {
        setIsUploading(true);
        
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "undercover");

          const res = await fetch("https://api.cloudinary.com/v1_1/ddtqri4py/image/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await res.json();
          uploadedImageUrls.push(data.secure_url);
        }
      }

      // Upload new video files
      if (videoFiles.length > 0) {
        for (const file of videoFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "undercover");
          formData.append("resource_type", "video");

          const res = await fetch("https://api.cloudinary.com/v1_1/ddtqri4py/video/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await res.json();
          uploadedVideoUrls.push({
            url: data.secure_url,
            thumbnail: data.eager?.[0]?.secure_url || data.secure_url.replace(/\.[^/.]+$/, ".jpg"),
            duration: data.duration
          });
        }
      }

      setIsUploading(false);
      
      await updatePost(post._id, content, uploadedImageUrls, uploadedVideoUrls);
      
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        variant: "destructive",
        title: "Error updating post",
        description: "Could not update your post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const totalFiles = images.length + videos.length;

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

          {/* Photo options */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerImageCamera}
              disabled={isSubmitting || totalFiles >= 10}
              className="text-purple-300 border-purple-700"
            >
              <Camera size={16} className="mr-2" />
              Take Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerImagePicker}
              disabled={isSubmitting || totalFiles >= 10}
              className="text-purple-300 border-purple-700"
            >
              <FolderOpen size={16} className="mr-2" />
              Choose Photos
            </Button>
          </div>

          {/* Video options */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerVideoCamera}
              disabled={isSubmitting || totalFiles >= 10}
              className="text-purple-300 border-purple-700"
            >
              <Video size={16} className="mr-2" />
              Record Video
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerVideoPicker}
              disabled={isSubmitting || totalFiles >= 10}
              className="text-purple-300 border-purple-700"
            >
              <FolderOpen size={16} className="mr-2" />
              Choose Videos
            </Button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={imageCameraRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            capture="environment"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoUpload}
            className="hidden"
          />
          <input
            ref={videoCameraRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
            capture="environment"
          />

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

          {/* Upload progress */}
          {isUploading && (
            <div className="mt-4 bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-300">
                <div className="animate-spin h-4 w-4 border-2 border-purple-300 rounded-full border-t-transparent" />
                <span className="text-sm">Uploading files... Please wait</span>
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
            disabled={(!content.trim() && images.length === 0 && videos.length === 0) || isSubmitting || isUploading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSubmitting || isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" />
                {isUploading ? 'Uploading...' : 'Saving...'}
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
