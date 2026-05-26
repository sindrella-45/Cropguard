'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function useOnlineStatus() {
  const setOnline = useAppStore((s) => s.setOnline);
  const addToast  = useAppStore((s) => s.addToast);

  useEffect(() => {
    const onOnline  = () => { setOnline(true);  addToast('Back online!', 'success'); };
    const onOffline = () => { setOnline(false); addToast('You are offline. Offline mode active.', 'warning'); };

    setOnline(navigator.onLine);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setOnline, addToast]);
}
