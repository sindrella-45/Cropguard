"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

// Decode JWT token without a library
function decodeJWT(token: string) {
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, addToast } = useAppStore();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    const hash   = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token  = params.get("access_token");
    const type   = params.get("type");

    if (type === "recovery") {
      router.push("/auth/login");
      return;
    }

    if (!token) {
      router.push("/auth/login");
      return;
    }

    // ── Decode user info directly from JWT ──────────────
    const decoded = decodeJWT(token);

    if (decoded) {
      const email  = decoded.email || "";
      const name   = decoded.user_metadata?.full_name
                  || decoded.user_metadata?.name
                  || email.split("@")[0]
                  || "Farmer";
      const userId = decoded.sub || "user";

      
      localStorage.setItem("cropguard_token", token);
      localStorage.setItem("cropguard_user", JSON.stringify({
        user_id:   userId,
        email,
        full_name: name,
        access_token: token,
      }));

      setStatus("Welcome to CropGuard AI!");

      setUser({
        id:          userId,
        name,
        email,
        role:        "Farmer",
        location:    "Uganda",
        avatar:      name.slice(0, 2).toUpperCase(),
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long", year: "numeric",
        }),
        crops: [],
      });

      addToast(`Welcome, ${name.split(" ")[0]}! 👋`, "success");

      // Try to sync profile with backend in background (non-blocking)
      const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${BACKEND}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((profile) => {
          if (profile?.full_name && profile.full_name !== name) {
            setUser({
              id:          userId,
              name:        profile.full_name,
              email:       profile.email || email,
              role:        "Farmer",
              location:    "Uganda",
              avatar:      profile.full_name.slice(0, 2).toUpperCase(),
              memberSince: new Date().toLocaleDateString("en-US", {
                month: "long", year: "numeric",
              }),
              crops: [],
            });

            // Keep cropguard_user in sync too
            localStorage.setItem("cropguard_user", JSON.stringify({
              user_id:      userId,
              email:        profile.email || email,
              full_name:    profile.full_name,
              access_token: token,
            }));
          }
        })
        .catch(() => {
          // Backend still waking up — user already logged in, ignore
        });

      router.push("/dashboard");
      return;
    }

    // JWT decode failed — redirect to login
    addToast("Sign in failed. Please try again.", "error");
    router.push("/auth/login");

  }, [router, setUser, addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            🌿
          </div>
        </div>
        <div className="font-semibold text-gray-800 text-lg mb-1">{status}</div>
        <div className="text-sm text-gray-400">Please wait...</div>
      </div>
    </div>
  );
}
