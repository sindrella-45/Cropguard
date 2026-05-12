'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { ToastMessage } from '@/types';

const icons: Record<ToastMessage['type'], string> = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const styles: Record<ToastMessage['type'], string> = {
  success: 'bg-green-800',
  error:   'bg-red-900',
  info:    'bg-blue-900',
  warning: 'bg-amber-900',
};

export function ToastContainer() {
  const { toasts } = useAppStore();
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg pointer-events-auto min-w-[260px] max-w-xs ${styles[t.type]}`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">
              {icons[t.type]}
            </span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
