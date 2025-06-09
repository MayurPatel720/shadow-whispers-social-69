
import React, { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const locomotiveScrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      locomotiveScrollRef.current = new LocomotiveScroll({
        el: scrollRef.current,
        smooth: true,
        multiplier: 1,
        class: 'is-revealed',
        scrollFromAnywhere: false,
        touchMultiplier: 2,
        smoothMobile: true,
      });

      // Update locomotive scroll on route changes
      const handleRouteChange = () => {
        setTimeout(() => {
          locomotiveScrollRef.current?.update();
        }, 100);
      };

      // Listen for route changes
      window.addEventListener('popstate', handleRouteChange);

      return () => {
        locomotiveScrollRef.current?.destroy();
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, []);

  // Update scroll on children change
  useEffect(() => {
    setTimeout(() => {
      locomotiveScrollRef.current?.update();
    }, 100);
  }, [children]);

  return (
    <div ref={scrollRef} data-scroll-container className="locomotive-scroll-container">
      {children}
    </div>
  );
};

export default SmoothScrollProvider;
