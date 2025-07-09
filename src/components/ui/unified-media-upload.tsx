
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UnifiedMediaUploadProps {
  onFileSelect: (files: { images: File[]; videos: File[] }) => void;
  disabled?: boolean;
  maxFiles?: number;
  currentFileCount?: number;
}

const UnifiedMediaUpload: React.FC<UnifiedMediaUploadProps> = ({
  onFileSelect,
  disabled = false,
  maxFiles = 10,
  currentFileCount = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageFiles: File[] = [];
    const videoFiles: File[] = [];

    // Separate images and videos
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const maxSize = isMobile ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "Image too large",
            description: `${file.name} is too large. Maximum size is ${isMobile ? '10MB' : '5MB'}.`,
            variant: "destructive",
          });
          continue;
        }
        imageFiles.push(file);
      } else if (file.type.startsWith('video/')) {
        const maxSize = isMobile ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "Video too large",
            description: `${file.name} is too large. Maximum size is ${isMobile ? '100MB' : '50MB'}.`,
            variant: "destructive",
          });
          continue;
        }
        videoFiles.push(file);
      } else {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not supported. Please select images or videos only.`,
          variant: "destructive",
        });
      }
    }

    if (imageFiles.length > 0 || videoFiles.length > 0) {
      onFileSelect({ images: imageFiles, videos: videoFiles });
    }

    // Clear input
    e.target.value = '';
  };

  const triggerFileSelect = () => {
    if (currentFileCount >= maxFiles) {
      toast({
        title: "Maximum files reached",
        description: `You can only upload ${maxFiles} files per post.`,
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={triggerFileSelect}
        disabled={disabled || currentFileCount >= maxFiles}
        className="w-full text-purple-300 border-purple-700 hover:bg-purple-900/20 bg-purple-800/30 h-12"
      >
        <Upload size={20} className="mr-3" />
        Add Photos & Videos
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        capture={isMobile ? "environment" : undefined}
      />

      <div className="text-xs text-gray-400 text-center">
        {currentFileCount}/{maxFiles} files selected • Images up to {isMobile ? '10MB' : '5MB'} • Videos up to {isMobile ? '100MB' : '50MB'}
      </div>
    </div>
  );
};

export default UnifiedMediaUpload;
