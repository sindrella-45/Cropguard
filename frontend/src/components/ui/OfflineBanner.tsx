'use client';
import { useAppStore } from '@/lib/store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  useOnlineStatus();
  const isOnline = useAppStore((s) => s.isOnline);
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div initial={{ y: -40 }} animate={{ y: 0 }} exit={{ y: -40 }} className="fixed top-0 left-0 right-0 z-[9998] bg-amber-900 text-amber-100 text-center py-2 px-4 text-sm font-medium">
          ⚠️ You are currently offline. Some features may be unavailable.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
