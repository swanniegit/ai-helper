'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  showUpdateAvailable();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed: ', error);
        });
    }

    // Check if app is already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsInstalled(localStorage.getItem('pwa-installed') === 'true');

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt if not dismissed and not installed
      if (!isInstalled && !isStandalone) {
        setTimeout(() => setShowInstallPrompt(true), 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      } else {
        console.log('User dismissed the install prompt');
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const showUpdateAvailable = () => {
    // You could show a toast or modal here
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Don't show if already installed, in standalone mode, or dismissed
  if (isInstalled || isStandalone || localStorage.getItem('pwa-install-dismissed') === 'true') {
    return null;
  }

  // Mobile Install Banner
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className=\"fixed bottom-4 left-4 right-4 z-50 md:bottom-6 md:left-6 md:right-auto md:max-w-sm animate-slideInLeft\">
        <Card className=\"bg-gradient-metro text-white border-0 shadow-2xl\">
          <CardHeader className=\"pb-3\">
            <div className=\"flex items-start justify-between\">
              <div className=\"flex items-center gap-3\">
                <div className=\"bg-white/20 p-2 rounded-lg\">
                  <Smartphone className=\"h-5 w-5\" />
                </div>
                <div>
                  <CardTitle className=\"text-lg text-white\">
                    Install DevPath Chronicles
                  </CardTitle>
                  <CardDescription className=\"text-white/80 text-sm\">
                    Access your learning journey offline
                  </CardDescription>
                </div>
              </div>
              <Button
                variant=\"ghost\"
                size=\"sm\"
                onClick={handleDismiss}
                className=\"text-white/80 hover:text-white hover:bg-white/10 p-1 h-auto\"
              >
                <X className=\"h-4 w-4\" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className=\"pt-0\">
            <div className=\"flex gap-2\">
              <Button
                onClick={handleInstallClick}
                className=\"flex-1 bg-white text-primary hover:bg-white/90\"
                size=\"sm\"
              >
                <Download className=\"h-4 w-4 mr-2\" />
                Install App
              </Button>
              <Button
                onClick={handleDismiss}
                variant=\"ghost\"
                className=\"text-white/80 hover:text-white hover:bg-white/10\"
                size=\"sm\"
              >
                Not Now
              </Button>
            </div>
            
            {/* Benefits */}
            <div className=\"mt-3 space-y-1 text-xs text-white/70\">
              <div className=\"flex items-center gap-2\">
                <div className=\"w-1 h-1 bg-white/60 rounded-full\" />
                <span>Take quizzes offline</span>
              </div>
              <div className=\"flex items-center gap-2\">
                <div className=\"w-1 h-1 bg-white/60 rounded-full\" />
                <span>Faster loading times</span>
              </div>
              <div className=\"flex items-center gap-2\">
                <div className=\"w-1 h-1 bg-white/60 rounded-full\" />
                <span>Home screen access</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// Utility component for checking PWA features
export function PWAFeatures() {
  const [features, setFeatures] = useState({
    serviceWorker: false,
    notifications: false,
    backgroundSync: false,
    offline: false
  });

  useEffect(() => {
    setFeatures({
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      offline: navigator.onLine !== undefined
    });
  }, []);

  return (
    <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">
      {Object.entries(features).map(([feature, supported]) => (
        <div
          key={feature}
          className={cn(
            \"p-3 rounded-lg border text-center\",
            supported 
              ? \"bg-green-50 border-green-200 text-green-800\" 
              : \"bg-red-50 border-red-200 text-red-800\"
          )}
        >
          <div className=\"font-medium capitalize\">
            {feature.replace(/([A-Z])/g, ' $1').trim()}
          </div>
          <div className=\"text-xs mt-1\">
            {supported ? '✅ Supported' : '❌ Not Supported'}
          </div>
        </div>
      ))}
    </div>
  );
}