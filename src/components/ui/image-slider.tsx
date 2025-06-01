
import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: string[];
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className={cn("relative w-full", className)}>
        <img
          src={images[0]}
          alt="Post image"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Carousel 
        className="w-full" 
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="relative w-full">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Image count indicator in top right */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
        {currentIndex + 1}/{images.length}
      </div>
      
      {/* Dot indicators at bottom */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200 cursor-pointer",
              index === currentIndex ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
