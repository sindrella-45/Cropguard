/**
 * CropGuard AI — API Client
 * Connects frontend to FastAPI backend at localhost:8000
 */

import { useAppStore } from "./store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cropguard_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Types matching your backend models ───────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  full_name: string;
}

export interface Treatment {
  type: "immediate" | "organic" | "chemical" | "preventive";
  action: string;
  details: string;
}

export interface DiagnosisDetail {
  name: string;
  scientific_name?: string;
  severity: "none" | "mild" | "moderate" | "severe";
  description: string;
}

export interface DiseaseDetection {
  plant_identified: string;
  health_status: "healthy" | "diseased" | "stressed" | "uncertain";
  confidence_score: number;
  diagnosis: DiagnosisDetail;
  causes: string[];
  symptoms: string[];
  treatments: Treatment[];
  prevention_tips: string[];
  urgency: "low" | "medium" | "high" | "critical";
  farmer_advice: string;
}

export interface AnalyzeResponse {
  diagnosis:          DiseaseDetection;
  treatments:         Treatment[];        
  prevention_tips:    string[];           
  sources:            Array<{ title: string; url?: string }>;
  confidence_level:   string;
  fallback_triggered: boolean;
  tokens_used?:       number;
  cost_usd?:          number;
  session_id?:        string;
  diagnosis_id?:      string;
  resources?:         Array<{ title: string; url: string; source: string; type: string }>;
  farmer_advice?:     string;
  urgency_description?: string;
  severity_description?: string;
  hedged_disease_name?: string;
  confidence_label?:  string;
}

export interface FollowUpResponse {
  answer: string;
  session_id: string;
  has_context: boolean;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_id: string;
  submitted_at: string;
}

export interface HistoryItem {
  id: string;
  plant_identified: string;
  diagnosis_name: string;
  severity: string;
  confidence_score: number;
  created_at: string;
  urgency: string;
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem("cropguard_token", data.access_token);
    localStorage.setItem("cropguard_user", JSON.stringify(data));
    return data;
  },

  async signup(
    email: string,
    password: string,
    full_name: string
  ): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name }),
    });
    const data = await handleResponse<AuthResponse>(res);
    localStorage.setItem("cropguard_token", data.access_token);
    localStorage.setItem("cropguard_user", JSON.stringify(data));
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: authHeaders(),
      });
    } finally {
      localStorage.removeItem("cropguard_token");
      localStorage.removeItem("cropguard_user");
    }
  },

  async me(): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: authHeaders(),
    });
    return handleResponse<AuthResponse>(res);
  },

  async resetPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/auth/reset?email=${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },
};

// ── Diagnose API ──────────────────────────────────────────────────────────────

export const diagnoseApi = {
  /**
   * Convert image file to base64 and send to backend
   */
  async analyze(
    imageFile: File,
    options?: {
      plant_type?: string;
      personality?: "friendly" | "formal" | "concise";
      selected_model?: string;
    }
  ): Promise<AnalyzeResponse> {
    // Convert file to base64
    const base64 = await fileToBase64(imageFile);

    const res = await fetch(`${BASE_URL}/analyze`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        image_data: base64,
        image_type: imageFile.type || "image/jpeg",
        plant_type: options?.plant_type || null,
        personality: options?.personality || "friendly",
        selected_model: options?.selected_model || "gpt-4o",
        language: useAppStore.getState().settings.language,  
      }),
    });
    return handleResponse<AnalyzeResponse>(res);
  },

  /**
   * Ask a follow-up question about a diagnosis
   */
  async followup(
    session_id: string,
    question: string,
    selected_model = "gpt-4o"
  ): Promise<FollowUpResponse> {
    const res = await fetch(`${BASE_URL}/followup`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ session_id, question, selected_model, language: useAppStore.getState().settings.language, }),
    });
    return handleResponse<FollowUpResponse>(res);
  },
};

// ── History API ───────────────────────────────────────────────────────────────

export const historyApi = {
  async getAll(): Promise<HistoryItem[]> {
    const res = await fetch(`${BASE_URL}/history`, {
      headers: authHeaders(),
    });
    return handleResponse<HistoryItem[]>(res);
  },

  async getById(diagnosis_id: string): Promise<AnalyzeResponse> {
    const res = await fetch(`${BASE_URL}/history/${diagnosis_id}`, {
      headers: authHeaders(),
    });
    return handleResponse<AnalyzeResponse>(res);
  },

  async delete(diagnosis_id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/history/${diagnosis_id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};

// ── Feedback API ──────────────────────────────────────────────────────────────

export const feedbackApi = {
  async submit(data: {
    diagnosis_id: string;
    rating: number;
    comment?: string;
    was_accurate?: boolean;
  }): Promise<FeedbackResponse> {

    const res = await fetch(`${BASE_URL}/feedback`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        body?.detail ||
        "Failed to submit feedback."
      );
    }

    return body;
  },

  async getSummary(): Promise<{
    total_feedback: number;
    average_rating: number;
    accuracy_rate: number;
  }> {

    const res = await fetch(
      `${BASE_URL}/feedback/summary`,
      {
        headers: authHeaders(),
      }
    );

    return handleResponse(res);
  },
};


// ── Health check ──────────────────────────────────────────────────────────────

export const healthApi = {
  async check(): Promise<{ status: string; version: string }> {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },
};

// ── Utils ─────────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:image/jpeg;base64, prefix — backend wants raw base64
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Map backend severity to frontend badge style
export function mapSeverity(severity: string): "High" | "Medium" | "Low" | "Healthy" {
  switch (severity) {
    case "severe":   return "High";
    case "moderate": return "Medium";
    case "mild":     return "Low";
    case "none":     return "Healthy";
    default:         return "Low";
  }
}

// Map backend urgency to badge color
export function mapUrgency(urgency: string): string {
  switch (urgency) {
    case "critical": return "bg-red-50 text-red-700";
    case "high":     return "bg-red-50 text-red-600";
    case "medium":   return "bg-amber-50 text-amber-700";
    case "low":      return "bg-green-50 text-green-700";
    default:         return "bg-gray-100 text-gray-600";
  }
}

// ── Dashboard API ─────────────────────────────────────────────────────────────

export interface HistorySummary {
  total_diagnoses: number;
  most_common_disease: string | null;
  recent_diagnoses: RealDiagnosis[];
  recurring_diseases: string[];
}

export interface HistoryResponse {
  diagnoses: RealDiagnosis[];
  total: number;
  summary: HistorySummary;
}

export interface RealDiagnosis {
  id: string;
  user_id: string;
  plant_identified: string;
  disease_name: string;
  severity: string;
  confidence_score: number;
  urgency: string;
  treatments: Array<{ type: string; action: string; details: string }>;
  prevention_tips: string[];
  farmer_advice: string;
  image_url?: string;
  tokens_used?: number;
  cost_usd?: number;
  created_at: string;
}

export interface TokenUsage {
  total_tokens: number;
  total_cost_usd: number;
  requests_made: number;
  average_tokens_per_request: number;
}

export const dashboardApi = {
  async getHistory(limit = 10): Promise<HistoryResponse> {
    const res = await fetch(`${BASE_URL}/history?limit=${limit}`, {
      headers: authHeaders(),
    });
    return handleResponse<HistoryResponse>(res);
  },

  async getTokenUsage(): Promise<TokenUsage> {
    const res = await fetch(`${BASE_URL}/tokens/usage`, {
      headers: authHeaders(),
    });
    return handleResponse<TokenUsage>(res);
  },

  async getFeedbackSummary(): Promise<{
    total_feedback: number;
    average_rating: number;
    accuracy_rate: number;
  }> {
    const res = await fetch(`${BASE_URL}/feedback/summary`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};
