import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      console.log('🔍 Checking if PWA is installed...');
      
      // Check for standalone mode (iOS Safari)
      if (window.navigator.standalone) {
        console.log('✅ PWA detected: iOS Safari standalone mode');
        setIsInstalled(true);
        return;
      }
      
      // Check for display-mode: standalone (Android Chrome)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ PWA detected: Android Chrome standalone mode');
        setIsInstalled(true);
        return;
      }
      
      // Check for related applications (if available)
      if ('getInstalledRelatedApps' in navigator) {
        (navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
          if (relatedApps.length > 0) {
            console.log('✅ PWA detected: Related apps found');
            setIsInstalled(true);
          }
        });
      }
      
      console.log('ℹ️ PWA not detected as installed');
    };

    checkIfInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA install prompt available!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('🎉 PWA successfully installed!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Debug logging
  console.log('PWA Status:', {
    isInstallable,
    isInstalled,
    deferredPrompt: !!deferredPrompt,
    shouldShow: isInstallable && !isInstalled
  });

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    installApp,
  };
};