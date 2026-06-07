"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function AuthCallbackPage() {
  const router  = useRouter();
  const { setUser, addToast } = useAppStore();

  useEffect(() => {
    // Parse hash from Supabase OAuth redirect
    const hash   = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token  = params.get("access_token");
    const type   = params.get("type");

    if (token) {
      // Save token
      localStorage.setItem("cropguard-token", token);

      // Fetch user profile from backend
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((profile) => {
          const name = profile.full_name || profile.email?.split("@")[0] || "Farmer";
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
        })
        .catch(() => {
          addToast("Signed in with Google — setting up your account...", "info");
          router.push("/dashboard");
        });
    } else if (type === "recovery") {
      // Password reset flow
      addToast("Set your new password below", "info");
      router.push("/auth/reset-password");
    } else {
      router.push("/auth/login");
    }
  }, [router, setUser, addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
        <div className="font-semibold text-gray-700">Signing you in...</div>
        <div className="text-sm text-gray-400 mt-1">Please wait a moment</div>
      </div>
    </div>
  );
}
