
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ModernVideoPlayer from './modern-video-player';
import { Video } from '@/types';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  duration?: number;
}

interface ModernImageSliderProps {
  images?: string[];
  videos?: Video[];
  className?: string;
}

const ModernImageSlider: React.FC<ModernImageSliderProps> = ({ 
  images = [], 
  videos = [], 
  className 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine images and videos into a single media array
  const mediaItems: MediaItem[] = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(video => ({ 
      type: 'video' as const, 
      url: video.url, 
      thumbnail: video.thumbnail,
      duration: video.duration 
    }))
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setIsDragging(false);
  };

  if (!mediaItems || mediaItems.length === 0) return null;

  if (mediaItems.length === 1) {
    const item = mediaItems[0];
    return (
      <div className={cn("relative w-full", className)}>
        <div className="w-full overflow-hidden rounded-xl bg-gray-100">
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt="Post media"
              className="w-full h-auto object-cover aspect-video"
            />
          ) : (
            <ModernVideoPlayer
              src={item.url}
              thumbnail={item.thumbnail}
              className="w-full aspect-video"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {mediaItems.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-auto object-cover aspect-video"
                />
              ) : (
                <ModernVideoPlayer
                  src={item.url}
                  thumbnail={item.thumbnail}
                  autoplay={index === currentIndex}
                  className="w-full aspect-video"
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={16} />
            </Button>
          </>
        )}

        {/* Media count indicator */}
        {mediaItems.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium z-10">
            {currentIndex + 1}/{mediaItems.length}
          </div>
        )}
      </div>
      
      {/* Dot indicators */}
      {mediaItems.length > 1 && (
        <div className="flex justify-center mt-3 space-x-2">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                index === currentIndex 
                  ? "bg-undercover-purple scale-125" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModernImageSlider;
