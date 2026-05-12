import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getSeverityBadge(severity: string): string {
  switch (severity) {
    case 'High':    return 'bg-red-50 text-red-600';
    case 'Medium':  return 'bg-amber-50 text-amber-700';
    case 'Low':     return 'bg-teal-50 text-teal-700';
    case 'Healthy': return 'bg-green-50 text-green-700';
    default:        return 'bg-gray-100 text-gray-600';
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Chatbot ──────────────────────────────────────────────────────────────────
const BOT_RESPONSES: Record<string, string> = {
  organic:  "For organic treatment of Late Blight, use copper sulfate (Bordeaux mixture), neem oil spray, or a baking soda solution (1 tsp per litre). Less aggressive than chemical fungicides but effective at early stages.",
  spread:   "To prevent spread: isolate affected plants immediately, disinfect tools, avoid working in the field when leaves are wet, and consider removing severely infected plants entirely.",
  severe:   "If symptoms worsen, increase spray frequency to every 5 days. If more than 30% of the plant is affected, consider removing it entirely to protect surrounding crops.",
  default:  "For Late Blight, act within 24–48 hours. Apply the copper-based fungicide in the early morning when temperatures are cooler for best absorption.",
};

export function getBotResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('organic') || lower.includes('natural')) return BOT_RESPONSES.organic;
  if (lower.includes('spread') || lower.includes('other plant'))  return BOT_RESPONSES.spread;
  if (lower.includes('worse') || lower.includes('severe'))        return BOT_RESPONSES.severe;
  return BOT_RESPONSES.default;
}

// ── Diagnose page constants ───────────────────────────────────────────────────
export const LOADING_MESSAGES = [
  'Analyzing your crop...',
  'Identifying disease markers...',
  'Calculating severity...',
  'Preparing treatment recommendations...',
];

export const MOCK_TREATMENT = [
  'Apply copper-based fungicide (Copper Oxychloride) — 3g per litre of water',
  'Remove and destroy infected leaves immediately',
  'Avoid overhead irrigation to reduce humidity',
  'Re-apply treatment every 7–10 days until symptoms clear',
];

export const MOCK_PREVENTION = [
  'Use certified disease-resistant tomato varieties',
  'Ensure adequate spacing for airflow between plants',
  'Rotate crops each season to break disease cycles',
  'Monitor weather forecasts — apply preventive fungicide before rain',
];

// Map backend severity string to frontend display severity
export function mapSeverity(severity: string): "High" | "Medium" | "Low" | "Healthy" {
  switch (severity?.toLowerCase()) {
    case "severe":   return "High";
    case "moderate": return "Medium";
    case "mild":     return "Low";
    case "none":     return "Healthy";
    case "high":     return "High";
    case "medium":   return "Medium";
    case "low":      return "Low";
    case "healthy":  return "Healthy";
    default:         return "Low";
  }
}
