"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sprout, CheckCircle2, AlertTriangle, FileText,
  ArrowRight, CloudRain, Wind, Droplets, TrendingUp,
  Upload, Thermometer,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { dashboardApi, type HistoryResponse, type TokenUsage, type RealDiagnosis } from "@/lib/api";
import { Card } from "@/components/ui/Card";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.07 },
});

function severityBadge(severity: string) {
  switch (severity?.toLowerCase()) {
    case "severe":   return "bg-red-50 text-red-600 border border-red-100";
    case "moderate": return "bg-amber-50 text-amber-700 border border-amber-100";
    case "mild":     return "bg-teal-50 text-teal-700 border border-teal-100";
    case "none":     return "bg-green-50 text-green-700 border border-green-100";
    default:         return "bg-gray-100 text-gray-600";
  }
}

function severityLabel(severity: string) {
  switch (severity?.toLowerCase()) {
    case "severe":   return "High";
    case "moderate": return "Medium";
    case "mild":     return "Low";
    case "none":     return "Healthy";
    default:         return severity || "Unknown";
  }
}

// Map plant name to local crop image
function cropImage(plant: string): string {
  const p = (plant || "").toLowerCase();
  if (p.includes("tomato"))                    return "/images/crop-tomato.jpg";
  if (p.includes("maize") || p.includes("corn")) return "/images/crop-maize.jpg";
  if (p.includes("coffee"))                    return "/images/crop-coffee.jpg";
  if (p.includes("banana"))                    return "/images/crop-banana.jpg";
  if (p.includes("cassava"))                   return "/images/crop-cassava.jpg";
  if (p.includes("potato"))                    return "/images/crop-potato.jpg";
  if (p.includes("rice"))                      return "/images/crop-rice.jpg";
  return "/images/crop-default.jpg";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return iso; }
}

function computeBreakdown(diagnoses: RealDiagnosis[]) {
  if (!diagnoses.length) return [];
  const counts: Record<string, number> = {
    Fungal: 0, Bacterial: 0, "Pest Damage": 0, Healthy: 0, Other: 0,
  };
  for (const d of diagnoses) {
    const name = (d.disease_name || "").toLowerCase();
    const sev  = (d.severity || "").toLowerCase();
    if (sev === "none") counts["Healthy"]++;
    else if (name.includes("blight") || name.includes("rust") || name.includes("mold") || name.includes("mildew") || name.includes("wilt")) counts["Fungal"]++;
    else if (name.includes("bacterial") || name.includes("rot") || name.includes("spot")) counts["Bacterial"]++;
    else if (name.includes("worm") || name.includes("pest") || name.includes("aphid") || name.includes("weevil")) counts["Pest Damage"]++;
    else counts["Other"]++;
  }
  const total = diagnoses.length;
  return [
    { label: "Fungal Diseases", pct: Math.round((counts.Fungal / total) * 100),                        color: "bg-green-500" },
    { label: "Bacterial",       pct: Math.round((counts.Bacterial / total) * 100),                     color: "bg-amber-400" },
    { label: "Pest Damage",     pct: Math.round((counts["Pest Damage"] / total) * 100),                color: "bg-red-400"   },
    { label: "Healthy / Other", pct: Math.round(((counts.Healthy + counts.Other) / total) * 100),      color: "bg-blue-400"  },
  ].filter((b) => b.pct > 0);
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { user } = useAppStore();

  const [history,  setHistory]  = useState<HistoryResponse | null>(null);
  const [tokens,   setTokens]   = useState<TokenUsage | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [weather,  setWeather]  = useState<{
    temp: string; desc: string; humidity: string; wind: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [hist, tok] = await Promise.all([
          dashboardApi.getHistory(20),
          dashboardApi.getTokenUsage().catch(() => null),
        ]);
        setHistory(hist);
        setTokens(tok);

        // Live weather — Open-Meteo, no API key needed
        try {
          const wRes = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=0.3476&longitude=32.5825&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Africa%2FNairobi"
          );
          if (wRes.ok) {
            const wData = await wRes.json();
            const c    = wData.current;
            const code = c.weather_code;
            const desc =
              code === 0 ? "Clear sky" :
              code <= 3  ? "Partly cloudy" :
              code <= 48 ? "Foggy" :
              code <= 67 ? "Rainy" :
              code <= 77 ? "Snowy" :
              code <= 82 ? "Showers" : "Stormy";
            setWeather({
              temp:     `${Math.round(c.temperature_2m)}°C`,
              desc,
              humidity: `${c.relative_humidity_2m}%`,
              wind:     `${c.wind_speed_10m} km/h`,
            });
          }
        } catch { /* non-critical */ }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const diagnoses         = history?.diagnoses || [];
  const summary           = history?.summary;
  const recent            = diagnoses.slice(0, 5);
  const breakdown         = computeBreakdown(diagnoses);
  const totalDiagnoses    = summary?.total_diagnoses ?? 0;
  const healthyCount      = diagnoses.filter((d) => d.severity?.toLowerCase() === "none").length;
  const alertCount        = diagnoses.filter((d) => ["severe","moderate"].includes(d.severity?.toLowerCase())).length;
  const requestsMade      = tokens?.requests_made ?? 0;
  const firstName         = user?.name?.split(" ")[0] ?? "Farmer";
  const lastDiagnosis     = diagnoses[0];
  const recurringDiseases = summary?.recurring_diseases || [];
  const mostCommon        = summary?.most_common_disease;
  const hour              = new Date().getHours();
  const greeting          = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      icon: <Sprout size={20} className="text-green-600" />,
      bg: "bg-green-50", border: "border-green-100",
      val: totalDiagnoses,
      lbl: "Total Diagnoses",
      sub: `${requestsMade} API calls`,
      trend: "+3 this week",
      trendUp: true,
    },
    {
      icon: <CheckCircle2 size={20} className="text-emerald-600" />,
      bg: "bg-emerald-50", border: "border-emerald-100",
      val: healthyCount,
      lbl: "Healthy Crops",
      sub: "No disease detected",
      trend: totalDiagnoses > 0 ? `${Math.round((healthyCount/totalDiagnoses)*100)}% healthy` : "—",
      trendUp: true,
    },
    {
      icon: <AlertTriangle size={20} className="text-amber-600" />,
      bg: "bg-amber-50", border: "border-amber-100",
      val: alertCount,
      lbl: "Active Alerts",
      sub: "Moderate or severe",
      trend: alertCount > 0 ? "Needs attention" : "All clear",
      trendUp: false,
    },
    {
      icon: <FileText size={20} className="text-blue-600" />,
      bg: "bg-blue-50", border: "border-blue-100",
      val: requestsMade,
      lbl: "Reports Generated",
      sub: tokens ? `$${tokens.total_cost_usd.toFixed(4)} total` : "Loading...",
      trend: "Since account created",
      trendUp: true,
    },
  ];

  const tips = [
    mostCommon
      ? `${mostCommon} has been detected multiple times. Consider preventive treatment this season.`
      : "Inspect crops early morning when symptoms are most visible.",
    recurringDiseases.length > 1
      ? `You have ${recurringDiseases.length} recurring diseases: ${recurringDiseases.slice(0,2).join(", ")}. Review your treatment schedule.`
      : "Photograph symptoms in daylight for best AI accuracy.",
    "Overwatering is a leading cause of fungal diseases. Check soil moisture before irrigating.",
  ];

  const weatherIcon =
    weather?.desc.toLowerCase().includes("rain") || weather?.desc.toLowerCase().includes("shower")
      ? <CloudRain size={32} className="text-white/90" />
      : weather?.desc.toLowerCase().includes("cloud")
      ? <CloudRain size={32} className="text-white/70" />
      : <Thermometer size={32} className="text-white/90" />;

  const weatherTip =
    weather?.desc.toLowerCase().includes("rain") ? "🌧️ Rain expected — apply fungicide before it starts." :
    weather?.desc.toLowerCase().includes("cloud") ? "⛅ Cloudy — good conditions for crop inspection." :
    "☀️ Clear skies — ideal for spraying and field inspection.";

  return (
    <div>
      {/* Page header */}
      <motion.div {...fadeUp(0)} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </motion.div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={15} />
          {error} — showing cached data if available.
        </div>
      )}

      {/* ── Welcome banner with real farm photo ── */}
      <motion.div {...fadeUp(1)} className="relative rounded-2xl overflow-hidden mb-6 min-h-[160px]">
        {/* Real farm photo */}
        <img
          src="/images/dashboard-banner.jpg"
          alt="Farm"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-green-700/50" />

        {/* Content */}
        <div className="relative z-10 p-7 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-2">
                {greeting}
              </div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">
                {firstName} 👋
              </h2>
              <p className="text-white/70 text-sm max-w-md">
                {lastDiagnosis
                  ? `Last diagnosis: ${lastDiagnosis.plant_identified} — ${lastDiagnosis.disease_name} · ${formatDate(lastDiagnosis.created_at)}`
                  : "No diagnoses yet — upload your first crop image to get started."}
              </p>
            </div>
            <Link href="/diagnose" className="no-underline flex-shrink-0">
              <button className="flex items-center gap-2 bg-white text-green-700 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-green-50 transition-all shadow-lg">
                <Upload size={16} />
                New Diagnosis
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? [1,2,3,4].map((i) => <Skeleton key={i} className="h-40" />)
          : statCards.map((s, i) => (
            <motion.div key={s.lbl} {...fadeUp(i + 2)}>
              <Card className={`p-5 border ${s.border} hover:shadow-md transition-shadow`}>
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {s.icon}
                </div>
                <div className="font-heading font-extrabold text-3xl text-gray-900 leading-none mb-1">
                  {s.val}
                </div>
                <div className="text-xs font-medium text-gray-500 mb-2">{s.lbl}</div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <TrendingUp size={10} className={s.trendUp ? "text-green-500" : "text-amber-500"} />
                  {s.sub}
                </div>
              </Card>
            </motion.div>
          ))
        }
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — recent diagnoses + tips */}
        <motion.div {...fadeUp(6)} className="lg:col-span-2 space-y-5">

          {/* Recent Diagnoses with real crop thumbnails */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800 text-base">Recent Diagnoses</h3>
              <Link href="/history" className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 no-underline font-medium">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-14">
                {/* Empty state with real crop image */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-dashed border-gray-200">
                  <img
                    src="/images/crop-default.jpg"
                    alt="No crops yet"
                    className="w-full h-full object-cover opacity-40"
                  />
                </div>
                <div className="font-semibold text-gray-600 mb-1">No diagnoses yet</div>
                <div className="text-sm text-gray-400 mb-4">Upload your first crop image to get started</div>
                <Link href="/diagnose" className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all no-underline">
                  <Upload size={14} /> Diagnose Now
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recent.map((d, i) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3.5 p-3.5 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-green-100"
                  >
                    {/* Real crop thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img
                        src={cropImage(d.plant_identified)}
                        alt={d.plant_identified}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/crop-default.jpg";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {d.plant_identified}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {d.disease_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">{formatDate(d.created_at)}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{d.confidence_score?.toFixed(0)}% confidence</span>
                      </div>
                    </div>

                    {/* Severity badge */}
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${severityBadge(d.severity)}`}>
                      {severityLabel(d.severity)}
                    </span>
                  </motion.div>
                ))}

                {diagnoses.length > 5 && (
                  <Link href="/history" className="no-underline">
                    <div className="text-center py-3 text-sm text-green-600 hover:text-green-700 font-medium border border-dashed border-green-200 rounded-xl hover:bg-green-50 transition-all cursor-pointer">
                      View {diagnoses.length - 5} more diagnoses →
                    </div>
                  </Link>
                )}
              </div>
            )}
          </Card>

          {/* Recurring disease alert */}
          {!loading && recurringDiseases.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800 text-sm mb-1">Recurring Diseases Detected</div>
                <div className="text-sm text-amber-700">
                  {recurringDiseases.join(", ")} {recurringDiseases.length === 1 ? "has" : "have"} appeared
                  multiple times. Consider a preventive treatment plan.
                </div>
              </div>
            </div>
          )}

          {/* Farmer tips */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sprout size={16} className="text-green-600" />
              {mostCommon ? "Personalised Alerts" : "Farmer Tips"}
            </h3>
            <div className="flex flex-col gap-3">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex gap-3 text-sm text-gray-600 p-3.5 bg-gray-50 rounded-xl border-l-[3px] border-green-400"
                >
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">
                    {i === 0 ? "⚡" : i === 1 ? "📸" : "💧"}
                  </span>
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* RIGHT — weather + breakdown */}
        <motion.div {...fadeUp(7)} className="space-y-5">

          {/* Weather widget */}
          {weather ? (
            <div className="relative rounded-2xl overflow-hidden">
              {/* Weather background */}
              <div className={`absolute inset-0 ${
                weather.desc.toLowerCase().includes("rain") || weather.desc.toLowerCase().includes("shower")
                  ? "bg-gradient-to-br from-slate-600 to-slate-800"
                  : weather.desc.toLowerCase().includes("cloud")
                  ? "bg-gradient-to-br from-sky-500 to-slate-600"
                  : "bg-gradient-to-br from-sky-400 to-blue-600"
              }`} />

              <div className="relative z-10 p-5 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs text-white/60 font-medium">📍 Kampala, Uganda</div>
                  {weatherIcon}
                </div>
                <div className="font-extrabold text-5xl leading-none mb-1">{weather.temp}</div>
                <div className="text-sm text-white/80 mb-4">{weather.desc}</div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
                    <Droplets size={14} className="text-blue-200" />
                    <div>
                      <div className="text-[9px] text-white/60 uppercase tracking-wide">Humidity</div>
                      <div className="text-sm font-bold">{weather.humidity}</div>
                    </div>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
                    <Wind size={14} className="text-blue-200" />
                    <div>
                      <div className="text-[9px] text-white/60 uppercase tracking-wide">Wind</div>
                      <div className="text-sm font-bold">{weather.wind}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 text-xs text-white/80 border border-white/10">
                  {weatherTip}
                </div>
              </div>
            </div>
          ) : loading ? (
            <Skeleton className="h-56" />
          ) : (
            <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-5 text-white">
              <div className="text-xs text-white/60 mb-2">📍 Kampala, Uganda</div>
              <div className="text-sm text-white/70">Weather data unavailable</div>
            </div>
          )}

          {/* Token usage */}
          {tokens && (
            <Card className="p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <FileText size={14} className="text-blue-500" />
                API Usage
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Total Tokens",    val: tokens.total_tokens.toLocaleString() },
                  { label: "Total Cost",      val: `$${tokens.total_cost_usd.toFixed(4)}` },
                  { label: "Requests Made",   val: tokens.requests_made },
                  { label: "Avg Tokens/Call", val: Math.round(tokens.average_tokens_per_request) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400 text-xs">{r.label}</span>
                    <span className="font-semibold text-gray-800 text-xs">{r.val}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Breakdown chart */}
          {!loading && breakdown.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" />
                Diagnosis Breakdown
              </h3>
              <div className="flex flex-col gap-3.5">
                {breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">{b.label}</span>
                      <span className="font-bold text-gray-700">{b.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full ${b.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-400 text-center">
                Based on {totalDiagnoses} diagnosis{totalDiagnoses !== 1 ? "es" : ""}
              </div>
            </Card>
          )}

          {/* Crops monitored — real images strip */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Supported Crops</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: "Tomato",  img: "/images/crop-tomato.jpg"  },
                { name: "Maize",   img: "/images/crop-maize.jpg"   },
                { name: "Coffee",  img: "/images/crop-coffee.jpg"  },
                { name: "Banana",  img: "/images/crop-banana.jpg"  },
                { name: "Cassava", img: "/images/crop-cassava.jpg" },
                { name: "Potato",  img: "/images/crop-potato.jpg"  },
                { name: "Rice",    img: "/images/crop-rice.jpg"    },
                { name: "Others",  img: "/images/crop-default.jpg" },
              ].map(({ name, img }) => (
                <div key={name} className="text-center">
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-1 border border-gray-100">
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/crop-default.jpg";
                      }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-400 font-medium">{name}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
