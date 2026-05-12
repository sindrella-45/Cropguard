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

export default function LoginPage() {
  const router = useRouter();
  const { setUser, addToast } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password too short";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const data = await authApi.login(email, password);
      setUser({
        id: data.user_id,
        name: data.full_name,
        email: data.email,
        role: "Farmer",
        location: "Uganda",
        avatar: data.full_name.slice(0, 2).toUpperCase(),
        memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        crops: [],
      });
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

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT — branding */}
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-green-700 to-green-900 px-12 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-[10px] bg-white/20 border border-white/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" /><circle cx="12" cy="8" r="1.5" fill="white" /></svg>
            </div>
            <span className="font-heading font-bold text-lg text-white">CropGuard<span className="text-green-300"> AI</span></span>
          </Link>
        </div>
        <div className="relative z-10 mt-12">
          <h2 className="font-heading font-bold text-4xl text-white leading-snug mb-4">Smart farming starts with smart diagnosis.</h2>
          <p className="text-white/70 text-base leading-relaxed">Join thousands of farmers using AI to protect their crops and maximize their yields.</p>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          {["98.2% disease detection accuracy","Results in under 3 seconds","Works offline in remote areas","Available in 5 local languages","Your data is always private"].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/85 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" />{f}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center bg-white px-6 py-12 md:px-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 no-underline">
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <h2 className="font-heading font-bold text-3xl text-gray-900 mb-1">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your CropGuard AI account.</p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
            <div className="flex-1 text-center py-2 rounded-lg bg-white shadow-sm text-green-700 text-sm font-semibold">Sign In</div>
            <Link href="/auth/register" className="flex-1 text-center py-2 text-gray-500 text-sm font-medium no-underline hover:text-gray-700">Create Account</Link>
          </div>

          {errors.general && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Input label="Email Address" type="email" placeholder="you@example.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              error={errors.email} autoComplete="email" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 border-2 border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none focus:border-green-500 placeholder:text-gray-400 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-3.5 h-3.5 accent-green-600" />
                Remember me
              </label>
              <button type="button" className="text-sm text-green-600 font-medium hover:underline">Forgot password?</button>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">🔒 Your data is encrypted and never sold to third parties.</p>
        </motion.div>
      </div>
    </div>
  );
}
