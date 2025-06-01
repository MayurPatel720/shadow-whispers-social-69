
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
import { Ghost, ImageIcon, Loader2, X, Plus } from "lucide-react";
import ImageSlider from "@/components/ui/image-slider";

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (imageFiles.length + files.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 10 images per post.",
        variant: "destructive",
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Each image must be under 5MB.",
          variant: "destructive",
        });
        return;
      }

      setImageFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setImageFiles([]);
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && imageFiles.length === 0) {
      return toast({
        title: "Content required",
        description: "Please add some text or images to your post.",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);
    let uploadedImageUrls: string[] = [];

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

          const data = await res.json();
          uploadedImageUrls.push(data.secure_url);
        }
        
        console.log("Images uploaded to Cloudinary:", uploadedImageUrls);
        setIsUploading(false);
      }

      await createPost(content, ghostCircleId, undefined, uploadedImageUrls);
      setContent("");
      setImages([]);
      setImageFiles([]);

      toast({
        title: "Post created",
        description: ghostCircleId
          ? "Your anonymous post has been shared in the Ghost Circle."
          : "Your anonymous post has been shared.",
      });

      onSuccess?.();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-800 text-white border-purple-600">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-300">
            {ghostCircleId ? (
              <>
                <Ghost className="w-5 h-5 text-purple-500" />
                Create Ghost Circle Post
              </>
            ) : (
              "Create Anonymous Post"
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {ghostCircleId
              ? "This post will be visible only within this Ghost Circle."
              : "Your identity will remain hidden."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[120px] bg-gray-700 border-gray-600 focus:border-purple-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-purple-300">
                  Selected Images ({images.length}/10)
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={removeAllImages}
                  className="text-xs"
                >
                  <X size={12} className="mr-1" />
                  Remove All
                </Button>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <ImageSlider images={images} className="max-h-[300px] mb-3" />
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[150px] overflow-y-auto">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-16 object-cover rounded border-2 border-gray-600"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-80 hover:opacity-100"
                      >
                        <X size={12} />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center rounded-b">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-purple-300 border-purple-700 w-full sm:w-auto"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={isUploading || isSubmitting || images.length >= 10}
            >
              <ImageIcon className="mr-2 w-4 h-4" />
              {isUploading ? "Uploading..." : "Add Images"}
            </Button>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>{images.length}/10 images</span>
              {images.length > 0 && (
                <span className="text-purple-300">• {imageFiles.reduce((total, file) => total + file.size, 0) > 1024 * 1024 ? `${(imageFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)}MB` : `${Math.round(imageFiles.reduce((total, file) => total + file.size, 0) / 1024)}KB`}</span>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-gray-600 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              disabled={(!content.trim() && images.length === 0) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                "Post Anonymously"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
