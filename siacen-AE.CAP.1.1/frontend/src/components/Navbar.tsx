"use client";

// frontend/src/components/Navbar.tsx
// Clean navbar - logo left, auth controls right.
// Crops/Vegetables/Herbs tags removed entirely.

import { useState, useEffect } from "react";
import Link from "next/link";
import { logout } from "@/services/api";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cropguard_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.removeItem("cropguard_user"); }
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header style={{
      background:     "rgba(15, 25, 8, 0.90)",
      backdropFilter: "blur(12px)",
      borderBottom:   "1px solid rgba(106, 171, 53, 0.2)",
      padding:        "0 32px",
      position:       "sticky",
      top:            0,
      zIndex:         100,
    }}>
      <div style={{
        maxWidth:       "1100px",
        margin:         "0 auto",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        height:         "68px",
      }}>

        {/* Logo — left */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "30px" }}>🌿</span>
            <div>
              <h1 style={{
                color:         "#6AAB35",
                margin:        0,
                fontSize:      "21px",
                fontWeight:    "700",
                letterSpacing: "-0.02em",
                fontFamily:    "Georgia, serif",
              }}>
                CropGuard AI
              </h1>
              <p style={{
                color:         "rgba(180, 220, 120, 0.55)",
                margin:        0,
                fontSize:      "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                Commercial Crop Disease Detection
              </p>
            </div>
          </div>
        </Link>

        {/* Auth controls — right */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <>
              <Link href="/dashboard" style={{
                color:          "#B4DC78",
                textDecoration: "none",
                fontSize:       "14px",
              }}>
                📋 History
              </Link>
              <span style={{
                color:    "rgba(180, 220, 120, 0.45)",
                fontSize: "13px",
              }}>
                {user.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{
                  background:   "rgba(192, 57, 43, 0.12)",
                  color:        "#E88",
                  border:       "1px solid rgba(192, 57, 43, 0.25)",
                  borderRadius: "8px",
                  padding:      "6px 14px",
                  fontSize:     "13px",
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                }}
              >
                {isLoggingOut ? "..." : "Logout"}
              </button>
            </>
          ) : (
            <Link href="/login">
              <button style={{
                background:   "rgba(106, 171, 53, 0.12)",
                color:        "#B4DC78",
                border:       "1px solid rgba(106, 171, 53, 0.3)",
                borderRadius: "8px",
                padding:      "6px 16px",
                fontSize:     "13px",
                cursor:       "pointer",
                fontFamily:   "inherit",
              }}>
                Login
              </button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
