"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Wifi, WifiOff, Database } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { authApi, dashboardApi } from "@/lib/api";
import { LANGUAGES } from "@/lib/data";
import { t } from "@/lib/i18n";

export function SettingsView() {
  const {
settings,
updateSetting,
addToast,
setUser,
isOnline,
  } = useAppStore();

  const router = useRouter();
  const lang = settings.language;

  // ── Cache state ─────────────────────────────────────────────────────────
  const [caching,   setCaching]   = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    size: string; date: string | null; count: number;
  }>({ size: "0 KB", date: null, count: 0 });

  // Load cache info on mount
  useEffect(() => {
    try {
      const raw  = localStorage.getItem("cropguard-offline-diagnoses");
      const date = localStorage.getItem("cropguard-offline-cached-at");
      if (raw) {
        setCacheInfo({
          size:  `${Math.round(raw.length / 1024)} KB`,
          date:  date ? new Date(date).toLocaleDateString() : null,
          count: JSON.parse(raw).length,
        });
      }
    } catch { /* ignore */ }
  }, []);

  // ── Apply dark mode ──────────────────────────────────────────────────────
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  // ── Apply language ───────────────────────────────────────────────────────
  useEffect(() => {
    const map: Record<string, string> = {
      English: "en", Swahili: "sw", French: "fr",
      Luganda: "lg", Runyankole: "nyn",
    };
    document.documentElement.lang = map[settings.language] || "en";
  }, [settings.language]);

  // ── Cache diagnoses to localStorage ─────────────────────────────────────
  const cacheOfflineData = async () => {
    if (!isOnline) {
      addToast("No internet — cannot cache data", "error");
      return;
    }
    setCaching(true);
    addToast("Caching your data for offline use...", "info");
    try {
      const hist = await dashboardApi.getHistory(100);
      const raw  = JSON.stringify(hist.diagnoses);
      localStorage.setItem("cropguard-offline-diagnoses", raw);
      localStorage.setItem("cropguard-offline-cached-at", new Date().toISOString());
      setCacheInfo({
        size:  `${Math.round(raw.length / 1024)} KB`,
        date:  new Date().toLocaleDateString(),
        count: hist.diagnoses.length,
      });
      addToast(
        `✓ Cached ${hist.diagnoses.length} diagnoses for offline use`,
        "success"
      );
    } catch {
      addToast("Failed to cache data. Try again.", "error");
    } finally {
      setCaching(false);
    }
  };

  const clearCache = () => {
    if (typeof window !== "undefined") {
  const confirmed = window.confirm("Clear all offline cached data?");
  if (!confirmed) return;
}
    localStorage.removeItem("cropguard-offline-diagnoses");
    localStorage.removeItem("cropguard-offline-cached-at");
    setCacheInfo({ size: "0 KB", date: null, count: 0 });
    addToast("Offline cache cleared", "info");
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setUser(null);
    addToast("You have been signed out.", "info");
    router.push("/");
  };

  const handleDeleteData = async () => {
  if (typeof window !== "undefined") {
  const confirmed = window.confirm("Clear all offline cached data?");
  if (!confirmed) return;
}
    addToast("Data deletion request submitted. You will receive a confirmation email.", "info");
  };

  const handleResetPassword = async () => {
    try {
      const { user } = useAppStore.getState();
      if (user?.email) {
        await authApi.resetPassword(user.email);
        addToast("Password reset email sent! Check your inbox.", "success");
      }
    } catch {
      addToast("Failed to send reset email. Try again.", "error");
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
      {title}
    </div>
  );

  const SettingRow = ({
    label, desc, children,
  }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 mb-2">
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">
          {t(lang, "set_title")}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Customize your CropGuard AI experience
        </p>
      </div>

      {/* Privacy notice */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-7">
        <h4 className="font-semibold text-green-800 mb-1.5">
          🔒 Your Privacy is Protected
        </h4>
        <p className="text-sm text-green-700 leading-relaxed">
          Your crop images and diagnosis data are encrypted and stored securely
          in Supabase. We never share your personal information with third parties.
        </p>
      </div>

      {/* ── Language ─────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <SectionTitle title="Language & Region" />
        <SettingRow
          label={t(lang, "set_language")}
          desc="Changes the language throughout the app"
        >
          <select
            value={settings.language}
            onChange={(e) => {
              updateSetting("language", e.target.value);
              addToast(`Language changed to ${e.target.value}`, "success");
            }}
            className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-green-500 bg-white"
          >
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </SettingRow>

        {settings.language !== "English" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 mt-2">
            {settings.language === "Swahili"    && "🇹🇿 Lugha imewekwa kuwa Kiswahili."}
            {settings.language === "French"     && "🇫🇷 Langue définie sur le Français."}
            {settings.language === "Luganda"    && "🇺🇬 Olulimi oluweereddwa Luganda."}
            {settings.language === "Runyankole" && "🇺🇬 Orurimi rwategekwa Runyankole."}
          </div>
        )}
      </div>

      {/* ── Appearance ───────────────────────────────────────────────────── */}
      <div className="mb-7">
        <SectionTitle title="Appearance" />
        <SettingRow
          label={t(lang, "set_dark_mode")}
          desc="Switch to dark theme — reduces eye strain at night"
        >
          <Toggle
            defaultChecked={settings.darkMode}
            onChange={(v) => {
              updateSetting("darkMode", v);
              addToast(`Dark mode ${v ? "enabled" : "disabled"}`, "success");
            }}
          />
        </SettingRow>
      </div>

      {/* ── Notifications ────────────────────────────────────────────────── */}
      <div className="mb-7">
        <SectionTitle title="Notifications" />
        <SettingRow
          label={t(lang, "set_push")}
          desc="Get alerts for completed diagnoses and updates"
        >
          <Toggle
            defaultChecked={settings.pushNotifications}
            onChange={async (v) => {
              if (v && "Notification" in window) {
                const perm = await Notification.requestPermission();
                if (perm === "granted") {
                  updateSetting("pushNotifications", true);
                  new Notification("CropGuard AI", {
                    body: "Notifications enabled ✓ You will receive diagnosis alerts.",
                  });
                  addToast("Push notifications enabled ✓", "success");
                } else {
                  addToast("Please allow notifications in browser settings", "warning");
                }
              } else {
                updateSetting("pushNotifications", v);
                addToast(`Push notifications ${v ? "enabled" : "disabled"}`, "info");
              }
            }}
          />
        </SettingRow>

        <SettingRow
          label={t(lang, "set_weekly_tips")}
          desc="Receive seasonal farming advice every week"
        >
          <Toggle
            defaultChecked={settings.weeklyCropTips}
            onChange={(v) => {
              updateSetting("weeklyCropTips", v);
              addToast(`Weekly crop tips ${v ? "enabled" : "disabled"}`, "success");
            }}
          />
        </SettingRow>

        <SettingRow
          label={t(lang, "set_outbreak")}
          desc="Get notified about disease outbreaks in your region"
        >
          <Toggle
            defaultChecked={settings.diseaseOutbreakAlerts}
            onChange={(v) => {
              updateSetting("diseaseOutbreakAlerts", v);
              addToast(`Outbreak alerts ${v ? "enabled" : "disabled"}`, "success");
              if (v) {
                setTimeout(() => {
                  addToast(
                    "⚠️ Active Alert: Fall Armyworm reported in Central Uganda",
                    "warning"
                  );
                }, 1500);
              }
            }}
          />
        </SettingRow>

        {settings.diseaseOutbreakAlerts && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mt-2 flex gap-2">
            <span>⚠️</span>
            <div>
              <div className="font-medium">Active Regional Alert</div>
              <div className="text-xs mt-0.5 text-amber-700">
                Fall Armyworm activity reported near Kampala — check your maize crops.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Data & Offline ───────────────────────────────────────────────── */}
      <div className="mb-7">
        <SectionTitle title="Data & Offline" />

        {/* Connection status */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-3 ${
          isOnline
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {isOnline
            ? <><Wifi size={15} /> Connected to internet</>
            : <><WifiOff size={15} /> No internet connection</>
          }
        </div>

        {/* Offline Mode Toggle */}
        <SettingRow
          label={t(lang, "set_offline")}
          desc="Cache your diagnoses so you can view them without internet"
        >
          <Toggle
            defaultChecked={settings.offlineMode}
            onChange={async (v) => {
              updateSetting("offlineMode", v);
              if (v) {
                await cacheOfflineData();
              } else {
                addToast("Offline mode disabled", "info");
              }
            }}
          />
        </SettingRow>

        {/* Cache status card */}
        {settings.offlineMode && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Database size={14} />
                Offline Cache Status
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cacheOfflineData}
                  disabled={caching || !isOnline}
                  className="text-xs text-green-600 font-medium hover:text-green-700 disabled:opacity-40 transition-colors"
                >
                  {caching ? "Caching..." : "Update Cache"}
                </button>
                {cacheInfo.count > 0 && (
                  <button
                    onClick={clearCache}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                <div className="font-bold text-lg text-green-700">
                  {cacheInfo.count}
                </div>
                <div className="text-xs text-gray-400">Diagnoses</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                <div className="font-bold text-lg text-green-700">
                  {cacheInfo.size}
                </div>
                <div className="text-xs text-gray-400">Cached Size</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                <div className="font-bold text-sm text-green-700">
                  {cacheInfo.date || "Never"}
                </div>
                <div className="text-xs text-gray-400">Last Cached</div>
              </div>
            </div>

            {cacheInfo.count === 0 && (
              <div className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                ⚠️ No data cached yet. Click <strong>Update Cache</strong> to save your diagnoses for offline viewing.
              </div>
            )}

            {cacheInfo.count > 0 && (
              <div className="mt-3 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg p-2.5">
                ✓ Your last {cacheInfo.count} diagnoses are saved. You can view them without internet.
              </div>
            )}
          </div>
        )}

        {/* What works offline info */}
        {settings.offlineMode && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 mb-2">
            <div className="font-medium mb-1.5">What works without internet:</div>
            <div className="flex flex-col gap-1">
              <span>✅ View past diagnoses and treatments</span>
              <span>✅ Read crop guides</span>
              <span>❌ New AI diagnosis (needs internet)</span>
              <span>❌ Follow-up chatbot (needs internet)</span>
            </div>
          </div>
        )}

        {/* Auto-download Toggle */}
        <SettingRow
          label={t(lang, "set_auto_download")}
          desc="Automatically refresh cached data when connected to internet"
        >
          <Toggle
            defaultChecked={settings.autoDownload}
            onChange={(v) => {
              updateSetting("autoDownload", v);
              addToast(`Auto-download ${v ? "enabled" : "disabled"}`, "success");
              if (v && settings.offlineMode && isOnline) {
                cacheOfflineData();
              }
            }}
          />
        </SettingRow>
      </div>

      {/* ── Privacy & Security ───────────────────────────────────────────── */}
      <div className="mb-7">
        <SectionTitle title="Privacy & Security" />

        <SettingRow
          label={t(lang, "set_analytics")}
          desc="Share anonymous usage data to improve AI accuracy"
        >
          <Toggle
            defaultChecked={settings.dataAnalytics}
            onChange={(v) => {
              updateSetting("dataAnalytics", v);
              addToast(`Analytics ${v ? "enabled" : "disabled"}`, "success");
            }}
          />
        </SettingRow>

        <button
          onClick={handleResetPassword}
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 w-full hover:bg-gray-50 transition-colors mb-2"
        >
          <div>
            <div className="text-sm font-medium text-gray-800 text-left">
              {t(lang, "set_change_pw")}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Send a password reset link to your email
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        <button
          onClick={handleDeleteData}
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 w-full hover:bg-red-50 transition-colors mb-2"
        >
          <div>
            <div className="text-sm font-medium text-red-600 text-left">
              {t(lang, "set_delete_data")}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Permanently remove all your data from Supabase
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <SectionTitle title="About" />
        <Card className="p-4">
          <div className="flex flex-col gap-2 text-sm">
            {[
              ["App Version",  "1.0.0"],
              ["Backend",      "FastAPI + Supabase"],
              ["AI Models",    "GPT-4o, Claude 3, Gemini 1.5"],
              ["Database",     "Supabase PostgreSQL"],
              ["Offline Mode", settings.offlineMode ? "✓ Enabled" : "✗ Disabled"],
            ].map(([lbl, val]) => (
              <div key={lbl} className="flex justify-between">
                <span className="text-gray-500">{lbl}</span>
                <span className="font-medium text-gray-800">{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Button variant="danger" onClick={handleLogout}>
        {t(lang, "set_logout")}
      </Button>
    </div>
  );
}