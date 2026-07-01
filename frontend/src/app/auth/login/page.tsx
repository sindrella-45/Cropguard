"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, addToast } = useAppStore();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string; password?: string; general?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password too short";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Login ───────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const data = await authApi.login(email, password);

      const user = {
        id:          data.user_id,
        name:        data.full_name,
        email:       data.email,
        role:        "Farmer",
        location:    "Uganda",
        avatar:      data.full_name.slice(0, 2).toUpperCase(),
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long", year: "numeric",
        }),
        crops: [],
      };

      setUser(user);

      // Remember me — persist token to localStorage
      if (remember) {
       localStorage.setItem("cropguard_remember", "true");
       } else {
       localStorage.removeItem("cropguard_remember");
   }


      addToast(`Welcome back, ${data.full_name.split(" ")[0]}! 👋`, "success");
      router.push("/dashboard");

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setErrors({ general: message });
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────────────────
  const handleForgotPassword = async () => {
    const emailToReset = resetEmail || email;
    if (!emailToReset) {
      addToast("Enter your email address first", "warning");
      setShowReset(true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToReset)) {
      addToast("Enter a valid email address", "warning");
      return;
    }

    setResetLoading(true);
    try {
      await authApi.resetPassword(emailToReset);
      setResetSent(true);
      addToast("Password reset email sent! Check your inbox.", "success");
    } catch {
      addToast("Failed to send reset email. Please try again.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  // ── Google Sign In ──────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      // Supabase OAuth redirect
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const REDIRECT_URL = `${window.location.origin}/auth/callback`;
      const googleAuthUrl =
        `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(REDIRECT_URL)}`;
      window.location.href = googleAuthUrl;
    } catch {
      addToast("Google sign in unavailable. Please use email.", "error");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT — branding */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-green-700 to-green-900 px-12 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 no-underline">
  <Image
    src="/cropguard-logo.png"
    alt="CropGuard AI"
    width={48}
    height={48}
    priority
  />

  <span className="font-heading font-bold text-xl text-white">
    CropGuard <span className="text-green-300">AI</span>
  </span>
</Link>
</div>
        <div className="relative z-10 mt-12">
          <h2 className="font-heading font-bold text-4xl text-white leading-snug mb-4">
            Smart farming starts with smart diagnosis.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Join thousands of farmers using AI to protect their crops and maximize yields.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          {[
            "98.2% disease detection accuracy",
            "Results in under 3 seconds",
            "Works offline in remote areas",
            "Available in 5 local languages",
            "Your data is always private",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/85 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center bg-white px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 no-underline">
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h2 className="font-heading font-bold text-3xl text-gray-900 mb-1">
            Welcome back 👋
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in to your CropGuard AI account.
          </p>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <div className="flex-1 text-center py-2 rounded-lg bg-white shadow-sm text-green-700 text-sm font-semibold">
              Sign In
            </div>
            <Link href="/auth/register" className="flex-1 text-center py-2 text-gray-500 text-sm font-medium no-underline hover:text-gray-700">
              Create Account
            </Link>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Error */}
          {errors.general && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {/* Forgot password modal */}
          {showReset && (
            <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              {resetSent ? (
                <div className="text-sm text-blue-700">
                  ✅ Reset email sent to <strong>{resetEmail || email}</strong>. Check your inbox.
                  <button onClick={() => { setShowReset(false); setResetSent(false); }}
                    className="block mt-2 text-blue-600 font-medium hover:underline text-xs">
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-blue-800 mb-2">Reset your password</div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm mb-2 outline-none focus:border-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {resetLoading ? "Sending..." : "Send Reset Email"}
                    </button>
                    <button
                      onClick={() => setShowReset(false)}
                      className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 border-2 border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-green-500 placeholder:text-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs">{errors.password}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 accent-green-600"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setShowReset(!showReset)}
                className="text-sm text-green-600 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            🔒 Your data is encrypted and never sold to third parties.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
