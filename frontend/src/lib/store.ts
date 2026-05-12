import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Diagnosis, ToastMessage } from '@/types';

// ── Settings shape ────────────────────────────────────────────────────────────
export interface AppSettings {
  language: string;
  darkMode: boolean;
  pushNotifications: boolean;
  weeklyCropTips: boolean;
  diseaseOutbreakAlerts: boolean;
  offlineMode: boolean;
  autoDownload: boolean;
  dataAnalytics: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'English',
  darkMode: false,
  pushNotifications: true,
  weeklyCropTips: true,
  diseaseOutbreakAlerts: true,
  offlineMode: true,
  autoDownload: false,
  dataAnalytics: true,
};

// ── Offline cache shape ───────────────────────────────────────────────────────
export interface CacheItem {
  key: string;
  label: string;
  icon: string;
  sizeLabel: string;
  downloaded: boolean;
  downloadedAt?: string;
}

const DEFAULT_CACHE: CacheItem[] = [
  { key: 'disease-db',  label: 'Disease Database', icon: '🦠', sizeLabel: '200+ diseases · 45 MB', downloaded: false },
  { key: 'crop-guides', label: 'Crop Guides',       icon: '📚', sizeLabel: '48 guides · 12 MB',    downloaded: false },
  { key: 'ai-model',    label: 'AI Lite Model',     icon: '🤖', sizeLabel: 'Compact model · 68 MB', downloaded: false },
];

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Network
  isOnline: boolean;
  setOnline: (v: boolean) => void;

  // Diagnoses — starts EMPTY, filled from real backend
  diagnoses: Diagnosis[];
  addDiagnosis: (d: Diagnosis) => void;
  setDiagnoses: (d: Diagnosis[]) => void;

  // Settings — persisted to localStorage
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;

  // Offline cache state
  cacheItems: CacheItem[];
  setCacheDownloaded: (key: string, downloaded: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ── Auth ──────────────────────────────────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),

      // ── Toasts ────────────────────────────────────────────────────────────
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ── Network ───────────────────────────────────────────────────────────
      isOnline: true,
      setOnline: (isOnline) => set({ isOnline }),

      // ── Diagnoses — NO mock data ──────────────────────────────────────────
      diagnoses: [],
      addDiagnosis: (d) => set((s) => ({ diagnoses: [d, ...s.diagnoses] })),
      setDiagnoses: (diagnoses) => set({ diagnoses }),

      // ── Settings ──────────────────────────────────────────────────────────
      settings: DEFAULT_SETTINGS,
      updateSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      // ── Offline cache ─────────────────────────────────────────────────────
      cacheItems: DEFAULT_CACHE,
      setCacheDownloaded: (key, downloaded) =>
        set((s) => ({
          cacheItems: s.cacheItems.map((c) =>
            c.key === key
              ? { ...c, downloaded, downloadedAt: downloaded ? new Date().toISOString() : undefined }
              : c
          ),
        })),
    }),
    {
      name: 'cropguard-store',
      // Persist user, diagnoses, settings and cache — never toasts
      partialize: (s) => ({
        user: s.user,
        diagnoses: s.diagnoses,
        settings: s.settings,
        cacheItems: s.cacheItems,
      }),
    }
  )
);
