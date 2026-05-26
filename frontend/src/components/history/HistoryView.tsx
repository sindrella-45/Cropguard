"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { historyApi, type HistoryItem } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { getSeverityBadge, mapSeverity } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PER_PAGE = 7;

const CROP_EMOJIS: Record<string, string> = {
  tomato: "🍅", maize: "🌽", bean: "🫘", coffee: "☕",
  cabbage: "🥬", banana: "🍌", pepper: "🌶️", cassava: "🌿",
  potato: "🥔", rice: "🌾", default: "🌿",
};

function getCropEmoji(plant: string): string {
  const lower = plant.toLowerCase();
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return CROP_EMOJIS.default;
}

export function HistoryView() {
  const { diagnoses, addToast } = useAppStore();
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sevFilter, setSevFilter] = useState("All");
  const [page, setPage] = useState(0);

  useEffect(() => {
    historyApi.getAll()
      .then(setApiHistory)
      .catch(() => {
        // Fall back to local store if backend unavailable
        addToast("Using local history — backend offline", "warning");
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  // Merge API history with local store
  const allHistory = apiHistory.length > 0
    ? apiHistory.map((h) => ({
        id: h.id,
        crop: h.plant_identified,
        cropEmoji: getCropEmoji(h.plant_identified),
        disease: h.diagnosis_name,
        severity: mapSeverity(h.severity),
        confidence: h.confidence_score,
        date: new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      }))
    : diagnoses.map((d) => ({
        id: d.id, crop: d.crop, cropEmoji: d.cropEmoji,
        disease: d.disease, severity: d.severity,
        confidence: d.confidence, date: d.date,
      }));

  const filtered = allHistory.filter((d) => {
    const matchQ = !query || d.crop.toLowerCase().includes(query.toLowerCase()) || d.disease.toLowerCase().includes(query.toLowerCase());
    const matchS = sevFilter === "All" || d.severity === sevFilter;
    return matchQ && matchS;
  });

  const paginated = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Diagnosis History</h1>
        <p className="text-gray-500 text-sm mt-0.5">All your past crop diagnoses in one place</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search crop or disease..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 placeholder:text-gray-400" />
          </div>
          <select value={sevFilter} onChange={(e) => { setSevFilter(e.target.value); setPage(0); }}
            className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-green-500 bg-white">
            {["All","High","Medium","Low","Healthy"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map((i) => <div key={i} className="h-14 shimmer rounded-xl" />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3 opacity-40">🌱</div>
            <div className="font-semibold text-gray-600 mb-1">No diagnoses found</div>
            <div className="text-sm text-gray-400">Try adjusting your search filters</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Crop","Disease","Severity","Confidence","Date","Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((d, i) => (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{d.cropEmoji}</span>
                        <span className="text-sm text-gray-700">{d.crop}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm text-gray-700">{d.disease}</td>
                    <td className="px-4 py-3.5 border-b border-gray-100">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSeverityBadge(d.severity)}`}>{d.severity}</span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm text-gray-600">{d.confidence}%</td>
                    <td className="px-4 py-3.5 border-b border-gray-100 text-sm text-gray-500">{d.date}</td>
                    <td className="px-4 py-3.5 border-b border-gray-100">
                      <Button size="sm" variant="ghost">View</Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PER_PAGE && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
              <Button size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
