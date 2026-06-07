"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, addToast } = useAppStore();
  const [status,  setStatus]  = useState("Completing sign in...");
  const [dots,    setDots]    = useState(".");

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => d.length >= 3 ? "." : d + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hash   = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token  = params.get("access_token");
    const type   = params.get("type");

    if (!token && type !== "recovery") {
      // No token — check if user is already logged in via store
      const stored = localStorage.getItem("cropguard-token");
      if (!stored) {
        router.push("/auth/login");
        return;
      }
    }

    if (type === "recovery") {
      router.push("/auth/login");
      return;
    }

    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Save token immediately
    localStorage.setItem("cropguard-token", token);

    // Try to fetch profile — with retries
    const fetchProfile = async (retries = 5, delay = 4000) => {
      const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      for (let i = 0; i < retries; i++) {
        try {
          setStatus(i === 0
            ? "Setting up your account..."
            : `Connecting to server${dots} (attempt ${i + 1}/${retries})`
          );

          const res = await fetch(`${BACKEND}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(10000), // 10s per attempt
          });

          if (res.ok) {
            const profile = await res.json();
            const name = profile.full_name
              || profile.email?.split("@")[0]
              || "Farmer";

            setUser({
              id:          profile.id,
              name,
              email:       profile.email,
              role:        "Farmer",
              location:    "Uganda",
              avatar:      name.slice(0, 2).toUpperCase(),
              memberSince: new Date().toLocaleDateString("en-US", {
                month: "long", year: "numeric",
              }),
              crops: [],
            });

            addToast(`Welcome, ${name.split(" ")[0]}! 👋`, "success");
            router.push("/dashboard");
            return;
          }
        } catch {
          // Retry
        }

        // Wait before retry
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, delay));
        }
      }

      // All retries failed — still log them in with basic info
      setStatus("Almost there...");
      setUser({
        id:          "google-user",
        name:        "Farmer",
        email:       "",
        role:        "Farmer",
        location:    "Uganda",
        avatar:      "FA",
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long", year: "numeric",
        }),
        crops: [],
      });
      addToast("Signed in with Google ✓", "success");
      router.push("/dashboard");
    };

    fetchProfile();
  }, [router, setUser, addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-sm px-6">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl">🌿</span>
          </div>
        </div>

        <div className="font-semibold text-gray-800 text-lg mb-2">
          {status}
        </div>
        <div className="text-sm text-gray-400 mb-6">
          The server may be waking up — this takes up to 60 seconds on first sign in.
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-green-500 rounded-full animate-pulse"
            style={{ width: "60%" }}
          />
        </div>

        <button
          onClick={() => router.push("/auth/login")}
          className="text-xs text-gray-400 hover:text-green-600 transition-colors"
        >
          Taking too long? Go back to login →
        </button>
      </div>
    </div>
  );
}