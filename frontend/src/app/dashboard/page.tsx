/**
 * Dashboard page for CropGuard AI.
 *
 * Shows the farmer's diagnosis history,
 * token usage statistics and plugin settings.
 *
 * Requires authentication — redirects to
 * login if not authenticated.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter }    from "next/navigation";
import Navbar           from "@/components/Navbar";
import History          from "@/components/History";
import TokenUsage       from "@/components/TokenUsage";
import PluginManager    from "@/components/PluginManager";
import HelpChatbot      from "@/components/HelpChatbot";

type Tab = "history" | "usage" | "plugins";

export default function DashboardPage() {
  const router    = useRouter();
  const [user,    setUser]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<Tab>("history");

  useEffect(() => {
    // Check authentication
    const stored = localStorage.getItem("cropguard_user");
    const token  = localStorage.getItem("cropguard_token");

    if (!stored || !token) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      color:          "rgba(180, 220, 120, 0.5)",
    }}>
      Loading...
    </div>
  );

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "history", label: "Diagnosis History", icon: "📋" },
    { id: "usage",   label: "Token Usage",        icon: "📊" },
    { id: "plugins", label: "Plugins",             icon: "🔌" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      <main style={{
        maxWidth: "900px",
        margin:   "0 auto",
        padding:  "40px 24px 80px",
      }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{
            color:      "#F5F0E8",
            fontSize:   "28px",
            margin:     "0 0 6px",
            fontFamily: "Georgia, serif",
          }}>
            Welcome back, {user?.full_name || "Farmer"} 👋
          </h2>
          <p style={{
            color:    "rgba(180, 220, 120, 0.5)",
            fontSize: "14px",
            margin:   0,
          }}>
            Manage your diagnoses, usage and settings
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display:      "flex",
          gap:          "8px",
          marginBottom: "24px",
          flexWrap:     "wrap",
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background:   tab === t.id
                  ? "rgba(106, 171, 53, 0.2)"
                  : "rgba(255, 255, 255, 0.04)",
                border:       tab === t.id
                  ? "1.5px solid #6AAB35"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding:      "10px 18px",
                color:        tab === t.id
                  ? "#6AAB35"
                  : "#B4DC78",
                fontSize:     "13px",
                fontWeight:   tab === t.id ? "700" : "400",
                cursor:       "pointer",
                fontFamily:   "inherit",
                transition:   "all 0.15s ease",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "history" && <History />}
        {tab === "usage"   && <TokenUsage />}
        {tab === "plugins" && <PluginManager />}

      </main>

      <HelpChatbot />
    </div>
  );
}