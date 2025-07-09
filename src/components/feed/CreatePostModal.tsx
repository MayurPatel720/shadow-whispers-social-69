
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createPost } from "@/lib/api";
import { Ghost, Loader2, X, Sparkles, Heart, Lock, Shield, UserX, Shuffle } from "lucide-react";
import ImageSlider from "@/components/ui/image-slider";
import UnifiedMediaUpload from "@/components/ui/unified-media-upload";
import { getRandomPrompt, getDailyPrompt, type PostPrompt } from "@/lib/utils/postPrompts";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  ghostCircleId?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  ghostCircleId,
}) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<Array<{url: string, thumbnail?: string, duration?: number}>>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<PostPrompt | null>(() => getDailyPrompt());
  const [showPrompt, setShowPrompt] = useState(true);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleShufflePrompt = () => {
    setCurrentPrompt(getRandomPrompt());
    setShowPrompt(true);
  };

  const handleClearPrompt = () => {
    setCurrentPrompt(null);
    setShowPrompt(false);
  };

  const handleUsePrompt = () => {
    if (currentPrompt) {
      setContent(currentPrompt.text);
      setShowPrompt(false);
    }
  };

  const handleFileSelect = ({ images: newImageFiles, videos: newVideoFiles }: { images: File[]; videos: File[] }) => {
    console.log('Files selected:', { images: newImageFiles, videos: newVideoFiles });
    
    if (newImageFiles.length > 0) {
      setImageFiles(prev => [...prev, ...newImageFiles]);
      
      newImageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.onerror = () => {
          toast({
            title: "File read error",
            description: `Could not read ${file.name}. Please try again.`,
            variant: "destructive",
          });
        };
        reader.readAsDataURL(file);
      });
    }

    if (newVideoFiles.length > 0) {
      setVideoFiles(prev => [...prev, ...newVideoFiles]);
      
      newVideoFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setVideos(prev => [...prev, { url: reader.result as string }]);
        };
        reader.onerror = () => {
          toast({
            title: "File read error",
            description: `Could not read ${file.name}. Please try again.`,
            variant: "destructive",
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAllMedia = () => {
    setImageFiles([]);
    setImages([]);
    setVideoFiles([]);
    setVideos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && imageFiles.length === 0 && videoFiles.length === 0) {
      return toast({
        title: "Content required",
        description: "Please add some text, images, or videos to your post.",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);
    let uploadedImageUrls: string[] = [];
    let uploadedVideoUrls: Array<{url: string, thumbnail?: string, duration?: number}> = [];

    try {
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

      console.log("Media uploaded:", { images: uploadedImageUrls, videos: uploadedVideoUrls });
      setIsUploading(false);

      await createPost(content, ghostCircleId, uploadedImageUrls[0], uploadedImageUrls, uploadedVideoUrls);
      
      // Reset form
      setContent("");
      setImages([]);
      setVideos([]);
      setImageFiles([]);
      setVideoFiles([]);
      setCurrentPrompt(getDailyPrompt());
      setShowPrompt(true);

      toast({
        title: "🎉 Post shared successfully!",
        description: ghostCircleId
          ? "Your anonymous post is now live in the Ghost Circle."
          : "Your truth has been shared with the community.",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to create post",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const totalFiles = imageFiles.length + videoFiles.length;
  const totalSize = [...imageFiles, ...videoFiles].reduce((total, file) => total + file.size, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white border-purple-500/30 shadow-2xl">
        <DialogHeader className="space-y-6 pb-4">
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold">
            {ghostCircleId ? (
              <>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Ghost className="w-7 h-7 text-purple-400" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Share in Ghost Circle
                </span>
              </>
            ) : (
              <>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Share Your Truth Anonymously
                </span>
              </>
            )}
          </DialogTitle>
          
          <DialogDescription className="space-y-6">
            {ghostCircleId ? (
              <p className="text-gray-300 text-center text-lg">
                This post will be visible only within this Ghost Circle.
              </p>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-300 text-center text-xl font-medium">
                  Share your deepest thoughts without fear of judgment.
                </p>
                
                {/* Enhanced Safety Indicators */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 text-green-400">
                      <div className="p-3 bg-green-500/20 rounded-full">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-base">100% Anonymous</div>
                        <div className="text-sm text-green-300">No tracking ever</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-blue-400">
                      <div className="p-3 bg-blue-500/20 rounded-full">
                        <UserX className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-base">Identity Protected</div>
                        <div className="text-sm text-blue-300">Nobody knows it's you</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-purple-400">
                      <div className="p-3 bg-purple-500/20 rounded-full">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-base">Safe Space</div>
                        <div className="text-sm text-purple-300">Judgment-free zone</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced Prompt Section */}
          {currentPrompt && showPrompt && (
            <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <h4 className="text-base font-semibold text-purple-300">Daily Inspiration</h4>
                  </div>
                  <p className="text-white font-medium text-xl leading-relaxed">{currentPrompt.text}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleUsePrompt}
                  className="bg-purple-500/20 border-purple-400/50 text-purple-300 hover:bg-purple-500/30 hover:text-white transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use This Prompt
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleShufflePrompt}
                  className="bg-pink-500/20 border-pink-400/50 text-pink-300 hover:bg-pink-500/30 hover:text-white transition-all duration-200"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  New Prompt
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearPrompt}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Write Freely
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Textarea */}
          <div className="space-y-3">
            <Textarea
              placeholder={currentPrompt?.placeholder || "What's really on your mind? This is your safe space to share anything..."}
              className="min-h-[180px] bg-gray-800/50 border-gray-600/50 focus:border-purple-400 focus:ring-purple-400/20 text-white placeholder:text-gray-400 rounded-xl backdrop-blur-sm resize-none transition-all duration-200 text-lg leading-relaxed p-6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between items-center text-sm text-gray-400 px-2">
              <span>Characters: {content.length}</span>
              {content.length > 500 && (
                <span className="text-yellow-400">Consider breaking into multiple posts for better engagement</span>
              )}
            </div>
          </div>

          {/* Enhanced Media Section */}
          {(images.length > 0 || videos.length > 0) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-3">
                  Selected Media ({totalFiles}/10)
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={removeAllMedia}
                  className="bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30"
                >
                  <X size={16} className="mr-2" />
                  Remove All
                </Button>
              </div>
              
              <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <ImageSlider 
                  images={images} 
                  videos={videos}
                  className="max-h-[400px] mb-6 rounded-xl overflow-hidden" 
                />
              </div>
            </div>
          )}

          {/* Unified Media Upload */}
          <UnifiedMediaUpload
            onFileSelect={handleFileSelect}
            disabled={isUploading || isSubmitting}
            maxFiles={10}
            currentFileCount={totalFiles}
          />

          {isUploading && (
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-purple-300">
                <Loader2 size={24} className="animate-spin" />
                <div>
                  <div className="font-semibold text-lg">Uploading your files...</div>
                  <div className="text-purple-200">Please wait, this may take a moment</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-gray-600/50 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white w-full sm:w-auto transition-all duration-200 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold w-full sm:w-auto transition-all duration-200 shadow-lg h-12 text-base"
              disabled={(!content.trim() && totalFiles === 0) || isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-3" />
                  Sharing Your Truth...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 size={20} className="animate-pulse mr-3" />
                  Uploading...
                </>
              ) : (
                <>
                  <Ghost size={20} className="mr-3" />
                  Share Anonymously
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
