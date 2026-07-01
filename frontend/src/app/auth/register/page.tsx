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

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, addToast } = useAppStore();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
  });
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [terms,    setTerms]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())   e.name    = "Full name is required";
    if (!form.email)         e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                             e.email   = "Enter a valid email";
    if (!form.password)      e.password = "Password is required";
    else if (form.password.length < 8)
                             e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm)
                             e.confirm  = "Passwords do not match";
    if (!terms)              e.terms    = "Please accept the Terms of Service";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Register ────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const data = await authApi.signup(form.email, form.password, form.name);

      setUser({
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
      });

      // Save token
      localStorage.setItem("cropguard-token", data.access_token);

      addToast("Account created successfully! 🎉", "success");
      router.push("/dashboard");

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setErrors({ general: message });
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign In ──────────────────────────────────────
  const handleGoogleSignIn = async () => {
    try {
      const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const REDIRECT_URL  = `${window.location.origin}/auth/callback`;
      const googleAuthUrl =
        `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(REDIRECT_URL)}`;
      window.location.href = googleAuthUrl;
    } catch {
      addToast("Google sign in unavailable. Please use email.", "error");
    }
  };

  // Password strength
  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 8 ? 2
    : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 4
    : 3;

  const strengthLabel = ["", "Too short", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][strength];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT — branding */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-green-700 to-green-900 px-12 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <Link href="/" className="no-underline">
  <Image
    src="/cropguard-logo.png"
    alt="CropGuard AI"
    width={220}
    height={70}
    priority
    className="h-14 w-auto"
  />
</Link>
        </div>
        <div className="relative z-10 mt-12">
          <h2 className="font-heading font-bold text-4xl text-white leading-snug mb-4">
            Start protecting your crops today.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Create your free account and get your first AI diagnosis in under 60 seconds.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          {[
            "Free to get started",
            "No credit card required",
            "Works on any smartphone",
            "Offline mode included",
            "Available in 5 languages",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/85 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center bg-white px-6 py-12 md:px-12 overflow-y-auto">
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
            Create your account
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Join 10,000+ farmers using CropGuard AI.
          </p>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <Link href="/auth/login" className="flex-1 text-center py-2 text-gray-500 text-sm font-medium no-underline hover:text-gray-700">
              Sign In
            </Link>
            <div className="flex-1 text-center py-2 rounded-lg bg-white shadow-sm text-green-700 text-sm font-semibold">
              Create Account
            </div>
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
            <span className="text-xs text-gray-400 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* General error */}
          {errors.general && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={errors.email}
            />

            {/* Password with strength meter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  autoComplete="new-password"
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
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength >= level ? strengthColor : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${
                    strength === 1 ? "text-red-500" :
                    strength === 2 ? "text-amber-500" :
                    strength === 3 ? "text-blue-500" : "text-green-600"
                  }`}>
                    {strengthLabel}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="text-red-500 text-xs">{errors.password}</span>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  type={showCf ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => set("confirm", e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 pr-11 border-2 border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-green-500 placeholder:text-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCf(!showCf)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm && form.password === form.confirm && (
                <span className="text-green-600 text-xs">✓ Passwords match</span>
              )}
              {errors.confirm && (
                <span className="text-red-500 text-xs">{errors.confirm}</span>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  setErrors((p) => ({ ...p, terms: "" }));
                }}
                className="mt-0.5 w-3.5 h-3.5 accent-green-600 flex-shrink-0"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-green-600 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && (
              <span className="text-red-500 text-xs -mt-2">{errors.terms}</span>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              {loading ? "Creating account..." : "Create Account"}
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
