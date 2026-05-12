"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppStore } from "@/lib/store";
import { authApi, dashboardApi } from "@/lib/api";

export function ProfileView() {
  const { user, setUser, addToast, diagnoses, setDiagnoses } = useAppStore();
  const router = useRouter();

  const [name,     setName]     = useState(user?.name     || "");
  const [email,    setEmail]    = useState(user?.email    || "");
  const [phone,    setPhone]    = useState("");
  const [location, setLocation] = useState(user?.location || "");
  const [crops,    setCrops]    = useState(user?.crops?.join(", ") || "");
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  // Real stats from backend
  const [totalDiagnoses, setTotalDiagnoses] = useState(diagnoses.length);
  const [avgRating,      setAvgRating]      = useState<number | null>(null);
  const [memberSince,    setMemberSince]    = useState(user?.memberSince || "");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        // Load real profile from backend
        const profile = await authApi.me();
        if (profile) {
          setName(profile.full_name || name);
          setEmail(profile.email    || email);
          // Update user in store with real data
          if (user) {
            setUser({
              ...user,
              name:   profile.full_name,
              email:  profile.email,
              avatar: profile.full_name?.slice(0, 2).toUpperCase() || user.avatar,
            });
          }
        }

        // Load real history for stats
        const hist = await dashboardApi.getHistory(50);
        setTotalDiagnoses(hist.total);

        // Set real diagnoses in store
        if (hist.diagnoses.length > 0) {
          const mapped = hist.diagnoses.map((d) => ({
            id:         d.id,
            crop:       d.plant_identified,
            cropEmoji:  getCropEmoji(d.plant_identified),
            disease:    d.disease_name,
            severity:   mapSeverity(d.severity) as "High" | "Medium" | "Low" | "Healthy",
            confidence: d.confidence_score,
            date:       new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            plantPart:  "Leaf",
            treatments: d.treatments?.map((t: { action: string; details: string }) => `${t.action}: ${t.details}`) || [],
            prevention: d.prevention_tips || [],
          }));
          setDiagnoses(mapped);
        }

        // Load real feedback rating
        const feedback = await dashboardApi.getFeedbackSummary();
        if (feedback.total_feedback > 0) {
          setAvgRating(feedback.average_rating);
        }

      } catch {
        // fail silently — show whatever we have in store
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update store with new values
      if (user) {
        setUser({
          ...user,
          name,
          email,
          location,
          crops: crops.split(",").map((c) => c.trim()).filter(Boolean),
          avatar: name.slice(0, 2).toUpperCase(),
        });
      }
      addToast("Profile updated successfully!", "success");
    } catch {
      addToast("Failed to update profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    setUser(null);
    addToast("You have been signed out.", "info");
    router.push("/");
  };

  const handlePasswordReset = async () => {
    try {
      await authApi.resetPassword(email);
      addToast("Password reset email sent! Check your inbox.", "success");
    } catch {
      addToast("Failed to send reset email.", "error");
    }
  };

  const displayAvatar   = user?.avatar   || name.slice(0, 2).toUpperCase() || "??";
  const displayName     = user?.name     || name || "Farmer";
  const displayRole     = user?.role     || "Farmer";
  const displayLocation = user?.location || location || "Uganda";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your account information and farming statistics</p>
      </div>

      {/* Profile header — real user data */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-green-600 to-green-900 rounded-2xl p-8 mb-6 overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-56 h-56 bg-white/5 rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10">
          <div className="w-[72px] h-[72px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-2xl text-white mb-4 backdrop-blur-sm">
            {displayAvatar}
          </div>
          <div className="font-heading font-bold text-2xl text-white">{displayName}</div>
          <div className="text-white/75 text-sm mt-0.5">
            {displayRole} · {displayLocation} 🇺🇬
          </div>
          {memberSince && (
            <div className="text-white/50 text-xs mt-1">Member since {memberSince}</div>
          )}
          {/* Badges based on real diagnosis count */}
          <div className="flex flex-wrap gap-2 mt-4">
            {totalDiagnoses >= 1  && <span className="bg-white/15 border border-white/30 text-white text-xs font-medium px-3 py-1 rounded-full">🌿 Active Farmer</span>}
            {totalDiagnoses >= 10 && <span className="bg-white/15 border border-white/30 text-white text-xs font-medium px-3 py-1 rounded-full">🔬 Diagnosis Expert</span>}
            {totalDiagnoses >= 25 && <span className="bg-white/15 border border-white/30 text-white text-xs font-medium px-3 py-1 rounded-full">⭐ Pro Member</span>}
            {totalDiagnoses === 0 && <span className="bg-white/15 border border-white/30 text-white text-xs font-medium px-3 py-1 rounded-full">🌱 Getting Started</span>}
          </div>
        </div>
      </motion.div>

      {/* Stats — real numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 text-center">
          {loading ? (
            <div className="shimmer h-10 rounded-xl mb-2" />
          ) : (
            <div className="font-heading font-bold text-3xl text-green-700">{totalDiagnoses}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">Diagnoses Run</div>
        </Card>

        <Card className="p-5 text-center">
          {loading ? (
            <div className="shimmer h-10 rounded-xl mb-2" />
          ) : (
            <div className="font-heading font-bold text-3xl text-green-700">
              {avgRating !== null ? `${avgRating.toFixed(1)}★` : "—"}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">Avg. Rating Given</div>
        </Card>

        <Card className="p-5 text-center">
          <div className="font-heading font-bold text-3xl text-green-700">
            {user?.memberSince || "—"}
          </div>
          <div className="text-xs text-gray-400 mt-1">Member Since</div>
        </Card>
      </div>

      {/* Edit form */}
      <Card className="p-6 mb-5">
        <h3 className="font-semibold text-gray-800 mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+256 700 000 000"
          />
          <Input
            label="Farm Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Wakiso District, Uganda"
          />
          <div className="md:col-span-2">
            <Input
              label="Primary Crops (comma-separated)"
              value={crops}
              onChange={(e) => setCrops(e.target.value)}
              placeholder="e.g. Maize, Tomato, Coffee"
            />
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Account Security</h3>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <h4 className="font-semibold text-green-800 text-sm mb-1.5">🔒 Data Privacy</h4>
          <p className="text-sm text-green-700 leading-relaxed">
            All your crop images and diagnosis results are encrypted and stored in Supabase.
            Your data is kept in compliance with Uganda&apos;s Data Protection Act.
            We never sell your personal data.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={handlePasswordReset}>
          Send Password Reset Email
        </Button>
      </Card>

      <div className="flex gap-3">
        <Button loading={saving} onClick={handleSave}>Save Changes</Button>
        <Button variant="danger" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCropEmoji(plant: string): string {
  const p = (plant || "").toLowerCase();
  if (p.includes("tomato"))  return "🍅";
  if (p.includes("maize") || p.includes("corn")) return "🌽";
  if (p.includes("bean"))    return "🫘";
  if (p.includes("coffee"))  return "☕";
  if (p.includes("cabbage")) return "🥬";
  if (p.includes("banana"))  return "🍌";
  if (p.includes("pepper"))  return "🌶️";
  if (p.includes("potato"))  return "🥔";
  if (p.includes("rice"))    return "🌾";
  return "🌿";
}

function mapSeverity(s: string): string {
  switch ((s || "").toLowerCase()) {
    case "severe":   return "High";
    case "moderate": return "Medium";
    case "mild":     return "Low";
    case "none":     return "Healthy";
    default:         return "Low";
  }
}
