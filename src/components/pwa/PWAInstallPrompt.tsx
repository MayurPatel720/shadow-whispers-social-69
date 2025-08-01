import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isMobile = useIsMobile();
  const { isInstallable, installApp } = usePWAInstall();

  useEffect(() => {
    console.log('PWA Prompt conditions:', {
      isMobile,
      isInstallable,
      isDismissed
    });
    
    // Show prompt if it's mobile, installable, not dismissed, and not already shown
    if (isMobile && isInstallable && !isDismissed) {
      console.log('📱 Showing PWA install prompt in 1 second...');
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000); // Show after 1 second delay

      return () => clearTimeout(timer);
    }
  }, [isMobile, isInstallable, isDismissed]);

  const handleInstall = async () => {
    await installApp();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Store dismissal in sessionStorage so it doesn't show again in this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  useEffect(() => {
    // Check if user dismissed in this session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (!isVisible || !isMobile || !isInstallable) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex items-center space-x-3 flex-1">
            <div className="bg-white/10 p-2 rounded-full">
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Install App</p>
              <p className="text-xs opacity-90">Get quick access from your home screen</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInstall}
              className="text-primary-foreground hover:bg-white/10 px-3 py-1 h-auto"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-white/10 p-1 h-auto"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;