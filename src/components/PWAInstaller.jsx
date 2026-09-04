import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function PWAInstaller() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Listen for beforeinstallprompt event (Chrome, Android)
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstallPrompt(true);
      console.log('📲 PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-40 max-w-sm">
      <div className="rounded-[20px] glass-card border border-[#B24BF3]/40 p-4 shadow-lg backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4A00E0] to-[#B24BF3] flex items-center justify-center text-white flex-shrink-0">
            <Download size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Install IC1101
            </p>
            <p className="text-xs text-white/60 truncate">
              Full-screen app experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#4A00E0] to-[#B24BF3] text-white text-xs font-medium hover:scale-105 active:scale-95 transition-transform shadow-md"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-lg glass-pill flex items-center justify-center text-white/60 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
