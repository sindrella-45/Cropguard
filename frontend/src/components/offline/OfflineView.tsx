"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { dashboardApi } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n";

export function OfflineView() {
  const {
    isOnline, addToast, cacheItems,
    setCacheDownloaded, diagnoses,
    settings, setDiagnoses,
  } = useAppStore();

  const lang = settings.language;
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress,    setProgress]    = useState<Record<string, number>>({});
  const [cacheSize,   setCacheSize]   = useState("0 KB");
  const [cachedAt,    setCachedAt]    = useState<string | null>(null);

  // ── Read cache info from localStorage on load ───────────────────────────
  useEffect(() => {
    try {
      const at = localStorage.getItem("cropguard-offline-cached-at");
      if (at) setCachedAt(new Date(at).toLocaleString());

      const raw = localStorage.getItem("cropguard-offline-diagnoses");
      if (raw) {
        const kb = Math.round(raw.length / 1024);
        setCacheSize(`${kb} KB`);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Download / cache handler ────────────────────────────────────────────
  const handleDownload = async (key: string, label: string) => {
    if (!isOnline) {
      addToast("No internet — cannot download", "error");
      return;
    }

    setDownloading(key);
    setProgress((p) => ({ ...p, [key]: 0 }));

    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        const cur = p[key] || 0;
        if (cur >= 95) { clearInterval(interval); return p; }
        return { ...p, [key]: cur + Math.random() * 12 };
      });
    }, 250);

    try {
      if (key === "disease-db") {
        // Cache real diagnosis history from backend
        const hist = await dashboardApi.getHistory(100);
        localStorage.setItem(
          "cropguard-offline-diagnoses",
          JSON.stringify(hist.diagnoses)
        );
        localStorage.setItem(
          "cropguard-offline-cached-at",
          new Date().toISOString()
        );
        const kb = Math.round(
          JSON.stringify(hist.diagnoses).length / 1024
        );
        setCacheSize(`${kb} KB`);
        setCachedAt(new Date().toLocaleString());
        addToast(
          `Disease database cached — ${hist.total} diagnoses saved offline`,
          "success"
        );
      } else if (key === "crop-guides") {
        // Cache the guides content
        const guidesData = {
          guides: GUIDE_CACHE,
          cachedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          "cropguard-offline-guides",
          JSON.stringify(guidesData)
        );
        addToast("Crop guides cached for offline use", "success");
      } else {
        // Simulate download for AI model
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
    } catch { /* ignore */ }
    setCacheSize("0 KB");
    setCachedAt(null);
    addToast("Cache cleared", "info");
  };

  const downloadedCount = cacheItems.filter((c) => c.downloaded).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">
          {t(lang, "nav_offline")}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage downloaded content for use without internet
        </p>
      </div>

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-8 text-center text-white mb-6"
      >
        <div className="text-5xl mb-4">{isOnline ? "📶" : "📵"}</div>
        <h2 className="font-heading font-bold text-xl mb-2">
          {isOnline ? "Online — Ready to Cache" : "You Are Offline"}
        </h2>
        <p className="text-white/70 text-sm mb-5">
          {isOnline
            ? "Download content below to use CropGuard AI without internet."
            : "Using cached data. New diagnoses unavailable until reconnected."}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <span className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full ${
            isOnline
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-700"
          }`}>
            {isOnline ? "● Connected" : "● No Internet"}
          </span>

          {settings.offlineMode && (
            <span className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full bg-blue-100 text-blue-800">
              ✓ Offline Mode On
            </span>
          )}

          {downloadedCount > 0 && (
            <span className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full bg-purple-100 text-purple-800">
              📦 {downloadedCount} item{downloadedCount > 1 ? "s" : ""} cached
            </span>
          )}
        </div>

        {cachedAt && (
          <p className="text-white/40 text-xs mt-4">
            Last cached: {cachedAt} · Size: {cacheSize}
          </p>
        )}
      </motion.div>

      {/* Offline mode disabled warning */}
      {!settings.offlineMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-5 flex gap-2">
          <span>⚠️</span>
          <div>
            <div className="font-medium">Offline Mode is Disabled</div>
            <div className="text-xs mt-0.5">
              Go to Settings → Data & Offline → Enable Offline Mode first.
            </div>
          </div>
        </div>
      )}

      {/* Downloads */}
      <Card className="p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-800">Available Downloads</h3>
          {downloadedCount > 0 && (
            <button
              onClick={handleClearCache}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
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
              <Card className="p-5 text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="font-semibold text-sm text-gray-800 mb-1">
                  {item.label}
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {item.sizeLabel}
                </div>

                {/* Progress bar while downloading */}
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
                    <div className="text-xs text-green-600 font-medium mb-1">
                      ✓ Cached
                    </div>
                    {item.downloadedAt && (
                      <div className="text-xs text-gray-400 mb-3">
                        {new Date(item.downloadedAt).toLocaleDateString()}
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      disabled={!!downloading || !isOnline}
                      onClick={() => handleUpdate(item.key, item.label)}
                    >
                      Update
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-gray-400 mb-3">
                      Not cached
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!!downloading || !isOnline || !settings.offlineMode}
                      onClick={() => handleDownload(item.key, item.label)}
                    >
                      {!isOnline ? "Offline" : "Download"}
                    </Button>
                  </>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          💡 <strong>Start with Disease Database</strong> — it caches your
          real diagnosis history so you can review past diagnoses without internet.
        </div>
      </Card>

      {/* What works offline */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4">
          What Works Without Internet
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { label: "View diagnosis history",   ok: cacheItems[0].downloaded },
            { label: "Read crop guides",         ok: cacheItems[1].downloaded },
            { label: "View past treatments",     ok: cacheItems[0].downloaded },
            { label: "Check prevention tips",    ok: cacheItems[0].downloaded },
            { label: "New AI diagnosis",         ok: false },
            { label: "Follow-up chatbot",        ok: false },
            { label: "Submit feedback",          ok: false },
            { label: "Sync new diagnoses",       ok: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
                item.ok
                  ? "bg-green-50 text-green-800"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              <span>{item.ok ? "✅" : "❌"}</span>
              {item.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Guide content to cache ────────────────────────────────────────────────────
const GUIDE_CACHE = [
  {
    key: "tomato",
    title: "Tomato Disease Guide",
    diseases: ["Late Blight", "Early Blight", "Mosaic Virus", "Bacterial Spot"],
    tips: [
      "Water at the base of plants — never overhead",
      "Remove infected leaves immediately",
      "Rotate with non-solanaceous crops each season",
    ],
  },
  {
    key: "maize",
    title: "Maize Pest & Disease",
    diseases: ["Fall Armyworm", "Maize Streak Virus", "Grey Leaf Spot"],
    tips: [
      "Scout fields weekly for early signs",
      "Apply emamectin benzoate for armyworm",
      "Intercrop with legumes to deter pests",
    ],
  },
  {
    key: "coffee",
    title: "Coffee Leaf Diseases",
    diseases: ["Leaf Rust", "Coffee Wilt", "Berry Disease"],
    tips: [
      "Maintain proper shade coverage",
      "Prune for air circulation",
      "Apply copper fungicide preventively",
    ],
  },
  {
    key: "banana",
    title: "Banana Wilt & Pests",
    diseases: ["Xanthomonas Wilt", "Fusarium Wilt", "Black Sigatoka"],
    tips: [
      "Use clean planting material only",
      "Debudding with a sterile knife",
      "Remove male buds after last hand",
    ],
  },
];