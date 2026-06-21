"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { dashboardApi, type HistoryResponse, type TokenUsage, type RealDiagnosis } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.07 },
});

// Map backend severity to badge color
function severityBadge(severity: string) {
  switch (severity?.toLowerCase()) {
    case "severe":   return "bg-red-50 text-red-600";
    case "moderate": return "bg-amber-50 text-amber-700";
    case "mild":     return "bg-teal-50 text-teal-700";
    case "none":     return "bg-green-50 text-green-700";
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

// Pick a crop emoji based on plant name
function cropEmoji(plant: string): string {
  const p = (plant || "").toLowerCase();
  if (p.includes("tomato"))   return "🍅";
  if (p.includes("maize") || p.includes("corn")) return "🌽";
  if (p.includes("bean"))     return "🫘";
  if (p.includes("coffee"))   return "☕";
  if (p.includes("cabbage"))  return "🥬";
  if (p.includes("banana"))   return "🍌";
  if (p.includes("pepper"))   return "🌶️";
  if (p.includes("cassava"))  return "🌿";
  if (p.includes("potato"))   return "🥔";
  if (p.includes("rice"))     return "🌾";
  return "🌿";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return iso;
  }
}

// Compute breakdown from real diagnoses
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
    { label: "Fungal Diseases", pct: Math.round((counts.Fungal / total) * 100), color: "bg-green-500" },
    { label: "Bacterial",       pct: Math.round((counts.Bacterial / total) * 100), color: "bg-amber-400" },
    { label: "Pest Damage",     pct: Math.round((counts["Pest Damage"] / total) * 100), color: "bg-red-400" },
    { label: "Healthy / Other", pct: Math.round(((counts.Healthy + counts.Other) / total) * 100), color: "bg-blue-400" },
  ].filter((b) => b.pct > 0);
}

// Skeleton loader
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />;
}

export function DashboardView() {
  const { user } = useAppStore();

  const [history, setHistory]   = useState<HistoryResponse | null>(null);
  const [tokens, setTokens]     = useState<TokenUsage | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [weather, setWeather]   = useState<{ temp: string; desc: string; humidity: string; wind: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch history + tokens in parallel
        const [hist, tok] = await Promise.all([
          dashboardApi.getHistory(20),
          dashboardApi.getTokenUsage().catch(() => null),
        ]);
        setHistory(hist);
        setTokens(tok);

        // Real weather via Open-Meteo (free, no API key)
        // Default: Kampala lat/lng — can be made dynamic
        try {
          const wRes = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=0.3476&longitude=32.5825&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Africa%2FNairobi"
          );
          if (wRes.ok) {
            const wData = await wRes.json();
            const c = wData.current;
            const code = c.weather_code;
            const desc =
              code === 0 ? "Clear sky" :
              code <= 3  ? "Partly cloudy" :
              code <= 48 ? "Foggy" :
              code <= 67 ? "Rainy" :
              code <= 77 ? "Snowy" :
              code <= 82 ? "Showers" :
              "Stormy";
            setWeather({
              temp: `${Math.round(c.temperature_2m)}°C`,
              desc,
              humidity: `${c.relative_humidity_2m}%`,
              wind: `${c.wind_speed_10m} km/h`,
            });
          }
        } catch {
          // weather is non-critical, ignore failure
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const diagnoses  = history?.diagnoses || [];
  const summary    = history?.summary;
  const recent     = diagnoses.slice(0, 4);
  const breakdown  = computeBreakdown(diagnoses);

  // ── Stat cards derived from real data ──────────────────────────────────────
  const totalDiagnoses = summary?.total_diagnoses ?? 0;
  const healthyCount   = diagnoses.filter((d) => d.severity?.toLowerCase() === "none").length;
  const alertCount     = diagnoses.filter((d) => ["severe", "moderate"].includes(d.severity?.toLowerCase())).length;
  const requestsMade   = tokens?.requests_made ?? 0;

  const stats = [
    { icon: "🌱", val: totalDiagnoses, lbl: "Total Diagnoses",    sub: `${requestsMade} API calls`,    bg: "bg-green-50" },
    { icon: "✅", val: healthyCount,   lbl: "Healthy Crops",      sub: "No disease detected",           bg: "bg-green-50",  color: "text-green-600" },
    { icon: "⚠️", val: alertCount,     lbl: "Active Alerts",      sub: "Moderate or severe",            bg: "bg-amber-50",  color: "text-amber-600" },
    { icon: "📋", val: requestsMade,   lbl: "Reports Generated",  sub: tokens ? `$${tokens.total_cost_usd.toFixed(4)} total` : "Loading...", bg: "bg-blue-50" },
  ];

  const firstName = user?.name?.split(" ")[0] ?? "Farmer";

  // ── Most recent disease for welcome message ─────────────────────────────────
  const lastDiagnosis = diagnoses[0];
  const lastMsg = lastDiagnosis
    ? `Last diagnosis: ${lastDiagnosis.plant_identified} — ${lastDiagnosis.disease_name} · ${formatDate(lastDiagnosis.created_at)}`
    : "No diagnoses yet — upload your first crop image!";

  // ── Farmer tips based on recurring diseases ─────────────────────────────────
  const recurringDiseases = summary?.recurring_diseases || [];
  const mostCommon = summary?.most_common_disease;
  const tips = [
    mostCommon
      ? `🔁 ${mostCommon} has been detected multiple times. Consider preventive treatment this season.`
      : "🌞 Inspect crops early morning when symptoms are most visible and dew is present.",
    recurringDiseases.length > 1
      ? `⚠️ You have ${recurringDiseases.length} recurring diseases: ${recurringDiseases.slice(0, 2).join(", ")}. Review your treatment schedule.`
      : "📸 Photograph symptoms in daylight with the leaf flat against a neutral background for best AI accuracy.",
    "💧 Overwatering is a leading cause of fungal diseases. Check soil moisture before irrigating.",
  ];

  return (
    <div>
      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </motion.div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {error} — showing cached data if available.
        </div>
      )}

      {/* Welcome banner */}
      <motion.div {...fadeUp(1)} className="relative bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 mb-6 overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <h2 className="font-heading font-bold text-xl text-white mb-1.5 relative z-10">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName}! 👋
        </h2>
        <p className="text-white/70 text-sm mb-5 relative z-10">{lastMsg}</p>
        <Link href="/diagnose" className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-white/20 transition-all no-underline relative z-10">
          + Upload New Image
        </Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? [1,2,3,4].map((i) => <Skeleton key={i} className="h-36" />)
          : stats.map((s, i) => (
            <motion.div key={s.lbl} {...fadeUp(i + 2)}>
              <Card className="p-5">
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-4`}>{s.icon}</div>
                <div className="font-heading font-bold text-3xl text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.lbl}</div>
                <div className={`text-xs mt-2 ${s.color || "text-green-600"}`}>{s.sub}</div>
              </Card>
            </motion.div>
          ))
        }
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — recent + tips */}
        <motion.div {...fadeUp(6)} className="lg:col-span-2 space-y-5">
          {/* Recent diagnoses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">Recent Diagnoses</h3>
              <Link href="/history" className="text-sm text-green-600 hover:text-green-700 no-underline">View all</Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-40">🌱</div>
                <div className="font-semibold text-gray-600 mb-1">No diagnoses yet</div>
                <div className="text-sm text-gray-400 mb-4">Upload your first crop image to get started</div>
                <Link href="/diagnose" className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-700 transition-all no-underline">
                  + Diagnose Now
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recent.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                    <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {cropEmoji(d.plant_identified)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {d.plant_identified} — {d.disease_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Confidence: {d.confidence_score?.toFixed(1)}% · {d.urgency} urgency
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(d.created_at)}</div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${severityBadge(d.severity)}`}>
                      {severityLabel(d.severity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recurring diseases alert */}
          {!loading && recurringDiseases.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <div className="font-semibold text-amber-800 text-sm mb-1">Recurring Diseases Detected</div>
                <div className="text-sm text-amber-700">
                  {recurringDiseases.join(", ")} {recurringDiseases.length === 1 ? "has" : "have"} appeared multiple times in your history. Consider a preventive treatment plan.
                </div>
              </div>
            </div>
          )}

          {/* Farmer tips — personalised from real data */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              {mostCommon ? "⚠️ Personalised Alerts" : "🌱 Farmer Tips"}
            </h3>
            <div className="flex flex-col gap-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-xl border-l-[3px] border-green-400">
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Right — weather + breakdown */}
        <motion.div {...fadeUp(7)} className="space-y-5">
          {/* Real weather widget */}
          {weather ? (
            <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl p-5 text-white">
              <div className="text-xs opacity-75 mb-3">📍 Kampala, Uganda — Live Weather</div>
              <div className="font-heading font-bold text-5xl leading-none">{weather.temp}</div>
              <div className="text-sm opacity-85 mt-1.5">{weather.desc}</div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[["Humidity", weather.humidity], ["Wind", weather.wind]].map(([lbl, val]) => (
                  <div key={lbl} className="bg-white/15 rounded-xl p-2.5">
                    <div className="text-xs opacity-70 mb-0.5">{lbl}</div>
                    <div className="text-sm font-semibold">{val}</div>
                  </div>
                ))}
              </div>
              {weather.desc.toLowerCase().includes("rain") || weather.desc.toLowerCase().includes("shower") ? (
                <div className="mt-3 p-2.5 bg-white/15 rounded-xl text-xs">
                  🌧️ Rain expected — apply fungicide before it starts.
                </div>
              ) : weather.desc.toLowerCase().includes("cloud") ? (
                <div className="mt-3 p-2.5 bg-white/15 rounded-xl text-xs">
                  ⛅ Cloudy — good time to inspect crops for symptoms.
                </div>
              ) : (
                <div className="mt-3 p-2.5 bg-white/15 rounded-xl text-xs">
                  ☀️ Good weather — ideal for crop inspection and spraying.
                </div>
              )}
            </div>
          ) : loading ? (
            <Skeleton className="h-52" />
          ) : (
            <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl p-5 text-white">
              <div className="text-xs opacity-75 mb-3">📍 Kampala, Uganda</div>
              <div className="text-sm opacity-70">Weather data unavailable</div>
            </div>
          )}

          {/* Token usage card */}
          {tokens && (
            <Card className="p-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm">💰 API Usage This Session</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Total Tokens",    val: tokens.total_tokens.toLocaleString() },
                  { label: "Total Cost",      val: `$${tokens.total_cost_usd.toFixed(4)}` },
                  { label: "Requests Made",   val: tokens.requests_made },
                  { label: "Avg Tokens/Call", val: Math.round(tokens.average_tokens_per_request) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="font-semibold text-gray-800">{r.val}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Breakdown chart — from real diagnosis data */}
          {!loading && breakdown.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm">Diagnosis Breakdown</h3>
              <div className="flex flex-col gap-3">
                {breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{b.label}</span>
                      <span className="font-semibold text-gray-700">{b.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
              <div className="mt-3 text-xs text-gray-400 text-center">
                Based on {totalDiagnoses} real diagnosis{totalDiagnoses !== 1 ? "es" : ""}
              </div>
            </Card>
          )}

          {/* Empty state for breakdown */}
          {!loading && breakdown.length === 0 && (
            <Card className="p-5 text-center">
              <div className="text-3xl mb-2 opacity-40">📊</div>
              <div className="text-sm text-gray-500">Breakdown chart will appear after your first diagnosis</div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
