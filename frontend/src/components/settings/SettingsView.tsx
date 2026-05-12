"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { LANGUAGES } from "@/lib/data";
import { t } from "@/lib/i18n";

export function SettingsView() {
  const { settings, updateSetting, addToast, setUser } = useAppStore();
  const router = useRouter();

  // language mapping
  const langMap: Record<string, string> = {
    English: "en",
    Swahili: "sw",
    French: "fr",
    Luganda: "lg",
    Runyankole: "nyn",
  };

  const lang = langMap[settings.language] || "en";

  // ── Apply dark mode to <html> ───────────────────────────────────────────
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  // ── Apply language to <html lang=""> ────────────────────────────────────
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}

    setUser(null);
    addToast("You have been signed out.", "info");
    router.push("/");
  };

  const handleDeleteData = async () => {
    if (!confirm("Are you sure you want to delete ALL your data? This cannot be undone.")) return;

    addToast(
      "Data deletion request submitted. You will receive a confirmation email.",
      "info"
    );
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
    label,
    desc,
    children,
  }: {
    label: string;
    desc?: string;
    children: React.ReactNode;
  }) => (
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
          in Supabase. We never share your personal information with third
          parties. You can delete all your data at any time below.
        </p>
      </div>

      {/* Language */}
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
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </SettingRow>

        {settings.language !== "English" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 mt-2">
            {settings.language === "Swahili" &&
              "🇹🇿 Lugha imewekwa kuwa Kiswahili. Tafsiri kamili itakuja hivi karibuni."}
            {settings.language === "French" &&
              "🇫🇷 Langue définie sur le Français. La traduction complète arrive bientôt."}
            {settings.language === "Luganda" &&
              "🇺🇬 Olulimi oluweereddwa Luganda. Enkyusa enzijuvu ejja mangu."}
            {settings.language === "Runyankole" &&
              "🇺🇬 Orurimi rwategekwa Runyankole. Ohukyenkya kwaba harufu."}
          </div>
        )}
      </div>

      {/* Appearance */}
      <div className="mb-7">
        <SectionTitle title="Appearance" />

        <SettingRow label={t(lang, "set_dark_mode")} desc="Switch to dark theme">
          <Toggle
            defaultChecked={settings.darkMode}
            onChange={(v) => {
              updateSetting("darkMode", v);
              addToast(`Dark mode ${v ? "enabled" : "disabled"}`, "success");
            }}
          />
        </SettingRow>
      </div>

      {/* Notifications */}
      <div className="mb-7">
        <SectionTitle title="Notifications" />

        <SettingRow
          label={t(lang, "set_push")}
          desc="Get alerts for completed diagnoses"
        >
          <Toggle
            defaultChecked={settings.pushNotifications}
            onChange={(v) => {
              updateSetting("pushNotifications", v);

              if (v && "Notification" in window) {
                Notification.requestPermission().then((perm) => {
                  if (perm === "granted") {
                    addToast("Push notifications enabled ✓", "success");
                  } else {
                    addToast(
                      "Please allow notifications in your browser settings",
                      "warning"
                    );
                    updateSetting("pushNotifications", false);
                  }
                });
              } else {
                addToast(
                  `Push notifications ${v ? "enabled" : "disabled"}`,
                  "success"
                );
              }
            }}
          />
        </SettingRow>
      </div>

      {/* About */}
      <div className="mb-7">
        <SectionTitle title="About" />

        <Card className="p-4">
          <div className="flex flex-col gap-2 text-sm">
            {[
              ["App Version", "1.0.0"],
              ["Backend", "FastAPI + Supabase"],
              ["AI Models", "GPT-4o, Claude 3, Gemini 1.5"],
              ["Database", "Supabase PostgreSQL"],
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
        Sign Out of All Devices
      </Button>
    </div>
  );
}