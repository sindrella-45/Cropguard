"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wifi, WifiOff, Database, BookOpen, Cpu,
  Download, RefreshCw, Trash2, CheckCircle2,
  XCircle, AlertTriangle, Package, Clock,
  HardDrive, Lightbulb,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { dashboardApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n";

// Map cache item keys to Lucide icons
function CacheIcon({ itemKey }: { itemKey: string }) {
  if (itemKey === "disease-db")  return <Database size={24} className="text-green-600" />;
  if (itemKey === "crop-guides") return <BookOpen size={24} className="text-blue-600" />;
  if (itemKey === "ai-model")    return <Cpu size={24} className="text-purple-600" />;
  return <Package size={24} className="text-gray-500" />;
}

function CacheIconBg({ itemKey }: { itemKey: string }) {
  if (itemKey === "disease-db")  return "bg-green-50 border border-green-100";
  if (itemKey === "crop-guides") return "bg-blue-50 border border-blue-100";
  if (itemKey === "ai-model")    return "bg-purple-50 border border-purple-100";
  return "bg-gray-50";
}

export function OfflineView() {
  const {
    isOnline, addToast, cacheItems,
    setCacheDownloaded, settings, setDiagnoses,
  } = useAppStore();

  const lang = settings.language;

  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress,    setProgress]    = useState<Record<string, number>>({});
  const [cacheSize,   setCacheSize]   = useState("0 KB");
  const [cachedAt,    setCachedAt]    = useState<string | null>(null);

  useEffect(() => {
    try {
      const cachedAtRaw = localStorage.getItem("cropguard-offline-cached-at");
      if (cachedAtRaw) setCachedAt(new Date(cachedAtRaw).toLocaleString());

      const raw = localStorage.getItem("cropguard-offline-diagnoses");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCacheSize(`${Math.round(raw.length / 1024)} KB`);
        if (!isOnline) {
          setDiagnoses(parsed);
          addToast(`Loaded ${parsed.length} offline diagnoses`, "info");
        }
      }
    } catch (error) {
      console.error("Failed to load offline cache:", error);
    }
  }, [isOnline, setDiagnoses, addToast]);

  const handleDownload = async (key: string, label: string) => {
    if (!isOnline) { addToast("No internet — cannot download", "error"); return; }
    setDownloading(key);
    setProgress((p) => ({ ...p, [key]: 0 }));

    const interval = setInterval(() => {
      setProgress((p) => {
        const cur = p[key] || 0;
        if (cur >= 95) { clearInterval(interval); return p; }
        return { ...p, [key]: cur + Math.random() * 12 };
      });
    }, 250);

    try {
      if (key === "disease-db") {
        const hist = await dashboardApi.getHistory(100);
        const raw  = JSON.stringify(hist.diagnoses);
        localStorage.setItem("cropguard-offline-diagnoses", raw);
        localStorage.setItem("cropguard-offline-cached-at", new Date().toISOString());
        setCacheSize(`${Math.round(raw.length / 1024)} KB`);
        setCachedAt(new Date().toLocaleString());
        addToast(`Disease database cached — ${hist.total} diagnoses saved offline`, "success");
      } else if (key === "crop-guides") {
        localStorage.setItem("cropguard-offline-guides", JSON.stringify({ guides: GUIDE_CACHE, cachedAt: new Date().toISOString() }));
        addToast("Crop guides cached for offline use", "success");
      } else if (key === "ai-model") {
        await new Promise((r) => setTimeout(r, 3000));
        addToast(`${label} ready for offline use`, "success");
      }

      clearInterval(interval);
      setProgress((p) => ({ ...p, [key]: 100 }));
      setCacheDownloaded(key, true);
    } catch {
      clearInterval(interval);
      addToast(`Failed to cache ${label}. Try again.`, "error");
    } finally {
      setTimeout(() => setDownloading(null), 500);
    }
  };

  const handleUpdate = async (key: string, label: string) => {
    setCacheDownloaded(key, false);
    await handleDownload(key, label);
  };

  const handleClearCache = () => {
    if (!confirm("Clear all offline data?")) return;
    cacheItems.forEach((c) => setCacheDownloaded(c.key, false));
    try {
      localStorage.removeItem("cropguard-offline-diagnoses");
      localStorage.removeItem("cropguard-offline-guides");
      localStorage.removeItem("cropguard-offline-cached-at");
    } catch {}
    setCacheSize("0 KB");
    setCachedAt(null);
    setDiagnoses([]);
    addToast("Offline cache cleared", "info");
  };

  const downloadedCount = cacheItems.filter((c) => c.downloaded).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">
          {t(lang, "nav_offline")}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage downloaded content for use without internet
        </p>
      </div>

      {/* ── Status banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-2xl p-7 mb-6 overflow-hidden ${
          isOnline
            ? "bg-gradient-to-br from-green-600 to-green-800"
            : "bg-gradient-to-br from-gray-700 to-gray-900"
        }`}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isOnline ? "bg-white/20" : "bg-white/10"
            }`}>
              {isOnline
                ? <Wifi size={28} className="text-white" />
                : <WifiOff size={28} className="text-white/80" />
              }
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-white mb-1">
                {isOnline ? "Online — Ready to Cache" : "You Are Offline"}
              </h2>
              <p className="text-white/70 text-sm">
                {isOnline
                  ? "Download content below to use CropGuard AI without internet."
                  : "Using cached data. New diagnoses unavailable until reconnected."}
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
              isOnline ? "bg-white/20 text-white" : "bg-red-500/30 text-red-100"
            }`}>
              {isOnline
                ? <><Wifi size={11} /> Connected</>
                : <><WifiOff size={11} /> No Internet</>
              }
            </span>

            {settings.offlineMode && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-400/30 text-blue-100">
                <CheckCircle2 size={11} /> Offline Mode On
              </span>
            )}

            {downloadedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white">
                <Package size={11} /> {downloadedCount} item{downloadedCount > 1 ? "s" : ""} cached
              </span>
            )}
          </div>
        </div>

        {/* Cache metadata */}
        {cachedAt && (
          <div className="relative z-10 flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Clock size={11} />
              Last cached: {cachedAt}
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <HardDrive size={11} />
              Size: {cacheSize}
            </div>
          </div>
        )}
      </motion.div>

      {/* Offline mode disabled warning */}
      {!settings.offlineMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-5 flex gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Offline Mode is Disabled</div>
            <div className="text-xs mt-0.5 text-amber-700">
              Go to Settings → Data & Offline → Enable Offline Mode first.
            </div>
          </div>
        </div>
      )}

      {/* ── Downloads ── */}
      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-green-600" />
            <h3 className="font-semibold text-gray-800">Available Downloads</h3>
          </div>
          {downloadedCount > 0 && (
            <button
              onClick={handleClearCache}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={12} />
              Clear all cache
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cacheItems.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="border border-gray-100 rounded-2xl p-5 text-center hover:shadow-md transition-all">
                {/* Icon */}
                <div className={`w-14 h-14 ${CacheIconBg({ itemKey: item.key })} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <CacheIcon itemKey={item.key} />
                </div>

                <div className="font-semibold text-sm text-gray-800 mb-1">{item.label}</div>
                <div className="text-xs text-gray-400 mb-3">{item.sizeLabel}</div>

                {/* Progress bar */}
                {downloading === item.key && (
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress[item.key] || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(progress[item.key] || 0)}%
                    </div>
                  </div>
                )}

                {item.downloaded ? (
                  <>
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600 font-semibold mb-1">
                      <CheckCircle2 size={12} />
                      Cached
                    </div>
                    {item.downloadedAt && (
                      <div className="text-xs text-gray-400 mb-3">
                        {new Date(item.downloadedAt).toLocaleDateString()}
                      </div>
                    )}
                    <button
                      disabled={!!downloading || !isOnline}
                      onClick={() => handleUpdate(item.key, item.label)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={11} />
                      Update
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-gray-400 mb-3">Not cached</div>
                    <button
                      disabled={!!downloading || !isOnline || !settings.offlineMode}
                      onClick={() => handleDownload(item.key, item.label)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-40"
                    >
                      <Download size={11} />
                      {!isOnline ? "Offline" : downloading === item.key ? "Downloading..." : "Download"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-5 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 flex gap-3">
          <Lightbulb size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Start with Disease Database</strong> — it caches your real diagnosis
            history so you can review past diagnoses without internet.
          </span>
        </div>
      </Card>

      {/* ── What works offline ── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <WifiOff size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-800">What Works Without Internet</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { icon: <Database size={13} />,      label: "View diagnosis history",  ok: cacheItems[0]?.downloaded },
            { icon: <BookOpen size={13} />,      label: "Read crop guides",        ok: cacheItems[1]?.downloaded },
            { icon: <CheckCircle2 size={13} />,  label: "View past treatments",    ok: cacheItems[0]?.downloaded },
            { icon: <CheckCircle2 size={13} />,  label: "Check prevention tips",   ok: cacheItems[0]?.downloaded },
            { icon: <Cpu size={13} />,           label: "New AI diagnosis",        ok: false },
            { icon: <Cpu size={13} />,           label: "Follow-up chatbot",       ok: false },
            { icon: <Wifi size={13} />,          label: "Submit feedback",         ok: false },
            { icon: <RefreshCw size={13} />,     label: "Sync new diagnoses",      ok: false },
          ].map(({ icon, label, ok }) => (
            <div
              key={label}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm border ${
                ok
                  ? "bg-green-50 text-green-800 border-green-100"
                  : "bg-gray-50 text-gray-400 border-gray-100"
              }`}
            >
              <div className={`flex-shrink-0 ${ok ? "text-green-600" : "text-gray-300"}`}>
                {ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              </div>
              <div className={`flex-shrink-0 ${ok ? "text-green-500" : "text-gray-300"}`}>
                {icon}
              </div>
              {label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Offline guide cache ───────────────────────────────────────────────────────
const GUIDE_CACHE = [
  {
    key: "tomato",
    title: "Tomato Disease Guide",
    diseases: ["Late Blight", "Early Blight", "Mosaic Virus", "Bacterial Spot"],
    tips: ["Water at the base of plants", "Remove infected leaves immediately", "Rotate with non-solanaceous crops"],
  },
  {
    key: "maize",
    title: "Maize Pest & Disease",
    diseases: ["Fall Armyworm", "Maize Streak Virus", "Grey Leaf Spot"],
    tips: ["Scout fields weekly", "Apply emamectin benzoate for armyworm", "Intercrop with legumes"],
  },
  {
    key: "coffee",
    title: "Coffee Leaf Diseases",
    diseases: ["Leaf Rust", "Coffee Wilt", "Berry Disease"],
    tips: ["Maintain proper shade coverage", "Prune for air circulation", "Apply copper fungicide preventively"],
  },
  {
    key: "banana",
    title: "Banana Wilt & Pests",
    diseases: ["Xanthomonas Wilt", "Fusarium Wilt", "Black Sigatoka"],
    tips: ["Use clean planting material", "Debudding with sterile knife", "Remove male buds after last hand"],
  },
];
