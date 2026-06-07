"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, addToast } = useAppStore();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    const timeout = setTimeout(() => {
      addToast("Sign in is taking longer than expected. Please try again.", "error");
      router.push("/auth/login");
    }, 15000); // 15 second timeout

    const hash   = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token  = params.get("access_token");
    const type   = params.get("type");

    if (token) {
      setStatus("Setting up your account...");
      localStorage.setItem("cropguard-token", token);

      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((profile) => {
          clearTimeout(timeout);
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
          clearTimeout(timeout);
          // Still log them in even if profile fetch fails
          addToast("Signed in with Google ✓", "success");
          router.push("/dashboard");
        });

    } else if (type === "recovery") {
      clearTimeout(timeout);
      router.push("/auth/reset-password");

    } else {
      clearTimeout(timeout);
      router.push("/auth/login");
    }

    return () => clearTimeout(timeout);
  }, [router, setUser, addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-5" />
        <div className="font-semibold text-gray-800 text-lg mb-1">{status}</div>
        <div className="text-sm text-gray-400">
          This may take up to 30 seconds if the server is waking up
        </div>
        <div className="mt-6 text-xs text-gray-300">
          If this takes too long,{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-green-600 hover:underline"
          >
            go back to login
          </button>
        </div>
      </div>
    </div>
  );
}