/**
 * API service for CropGuard AI frontend.
 *
 * Centralises all communication with the
 * FastAPI backend. Every backend call goes
 * through this file — never call fetch()
 * directly in components.
 *
 * Why centralise API calls?
 *   - Single place to change the base URL
 *   - Consistent error handling everywhere
 *   - Easy to add auth headers globally
 *   - Simple to mock during testing
 *
 * Usage:
 *   import { analyzeLeaf, getHistory } from '@/services/api'
 *
 *   const result = await analyzeLeaf({
 *     image_data: base64String,
 *     personality: 'friendly'
 *   })
 */

// Backend base URL
// Change this when deploying to production
const API_BASE = process.env.NEXT_PUBLIC_API_URL
  || "http://localhost:8000";


// ── Types ──────────────────────────────────────────────────

export interface AnalyzeRequest {
  image_data:     string;
  image_type:     string;
  plant_type?:    string;
  personality:    string;
  selected_model: string;
}

export interface Treatment {
  type:    string;
  action:  string;
  details: string;
}

export interface DiagnosisDetail {
  name:            string;
  scientific_name: string | null;
  severity:        string;
  description:     string;
}

export interface DiseaseDetection {
  plant_identified: string;
  health_status:    string;
  confidence_score: number;
  diagnosis:        DiagnosisDetail;
  causes:           string[];
  symptoms:         string[];
  treatments:       Treatment[];
  prevention_tips:  string[];
  urgency:          string;
  farmer_advice:    string;
}

export interface SourceReference {
  document_name:    string;
  chunk_id:         string;
  similarity_score: number;
  page_number:      number | null;
  chunk_text:       string | null;
}

export interface AnalyzeResponse {
  diagnosis:          DiseaseDetection;
  treatments:         Treatment[];
  prevention_tips:    string[];
  sources:            SourceReference[];
  retrieved_context:  any[];
  tokens_used:        number;
  cost_usd:           number;
  session_id:         string;
  diagnosis_id?:      string;    
  fallback_triggered: boolean;
  weather_data:       any | null;
  model_used:         string;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface SignupRequest {
  email:     string;
  password:  string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type:   string;
  user_id:      string;
  email:        string;
  full_name:    string;
}

export interface FeedbackRequest {
  diagnosis_id: string;
  user_id:      string;
  rating:       number;
  comment?:     string;
  was_accurate?: boolean;
}

export interface Plugin {
  id:          string;
  name:        string;
  description: string;
  enabled:     boolean;
  required:    boolean;
  icon:        string;
}

export interface LLMModel {
  id:               string;
  name:             string;
  provider:         string;
  description:      string;
  supports_vision:  boolean;
  recommended:      boolean;
}


// ── Helper ─────────────────────────────────────────────────

/**
 * Get auth token from localStorage.
 * Returns null if not authenticated.
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cropguard_token");
}

/**
 * Build request headers with optional auth token.
 */
function getHeaders(
  includeAuth: boolean = false
): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Handle API response and throw on error.
 */
async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(
      () => ({ detail: "Request failed" })
    );

    if (response.status === 401) {
  const url = response.url || ""
  if (!url.includes("/feedback")) {
    localStorage.removeItem("cropguard_token")
    localStorage.removeItem("cropguard_user")
    window.location.href = "/login"
  }
  throw new Error("Session expired. Please login again.")
}

throw new Error(
  error.detail || `HTTP ${response.status}`
);
}
return response.json();
}

// ── Analysis ───────────────────────────────────────────────

/**
 * Send leaf image to backend for disease analysis.
 *
 * @param request - Image data and analysis settings
 * @returns Complete diagnosis response
 *
 * @example
 * const result = await analyzeLeaf({
 *   image_data: base64String,
 *   image_type: 'image/jpeg',
 *   personality: 'friendly',
 *   selected_model: 'gpt-4o'
 * })
 */
export async function analyzeLeaf(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const response = await fetch(
    `${API_BASE}/analyze`,
    {
      method:  "POST",
      headers: getHeaders(true),
      body:    JSON.stringify(request),
    }
  );
  return handleResponse<AnalyzeResponse>(response);
}


// ── Authentication ─────────────────────────────────────────

/**
 * Login farmer with email and password.
 *
 * @param request - Login credentials
 * @returns Auth response with JWT token
 */
export async function login(
  request: LoginRequest
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE}/auth/login`,
    {
      method:  "POST",
      headers: getHeaders(),
      body:    JSON.stringify(request),
    }
  );
  return handleResponse<AuthResponse>(response);
}

/**
 * Register new farmer account.
 *
 * @param request - Signup details
 * @returns Auth response with JWT token
 */
export async function signup(
  request: SignupRequest
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_BASE}/auth/signup`,
    {
      method:  "POST",
      headers: getHeaders(),
      body:    JSON.stringify(request),
    }
  );
  return handleResponse<AuthResponse>(response);
}

/**
 * Logout current farmer session.
 */
export async function logout(): Promise<void> {
  await fetch(
    `${API_BASE}/auth/logout`,
    {
      method:  "POST",
      headers: getHeaders(true),
    }
  );
  localStorage.removeItem("cropguard_token");
  localStorage.removeItem("cropguard_user");
}

/**
 * Get current farmer profile.
 */
export async function getProfile(): Promise<any> {
  const response = await fetch(
    `${API_BASE}/auth/me`,
    {
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}


// ── History ────────────────────────────────────────────────

/**
 * Get farmer diagnosis history.
 *
 * @param limit - Maximum records to return
 * @returns List of past diagnoses
 */
export async function getHistory(
  limit: number = 10
): Promise<any> {
  const response = await fetch(
    `${API_BASE}/history?limit=${limit}`,
    {
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}

/**
 * Get single diagnosis by ID.
 *
 * @param id - Diagnosis UUID
 * @returns Single diagnosis record
 */
export async function getDiagnosis(
  id: string
): Promise<any> {
  const response = await fetch(
    `${API_BASE}/history/${id}`,
    {
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}

/**
 * Delete a diagnosis from history.
 *
 * @param id - Diagnosis UUID to delete
 */
export async function deleteDiagnosis(
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/history/${id}`,
    {
      method:  "DELETE",
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}


// ── Feedback ───────────────────────────────────────────────

/**
 * Submit rating for a diagnosis.
 *
 * @param request - Feedback details
 * @returns Feedback confirmation
 */
export async function submitFeedback(
  request: FeedbackRequest
): Promise<any> {
  const response = await fetch(
    `${API_BASE}/feedback`,
    {
      method:  "POST",
      headers: getHeaders(true),
      body:    JSON.stringify(request),
    }
  );
  return handleResponse(response);
}

/**
 * Get feedback summary statistics.
 */
export async function getFeedbackSummary(): Promise<any> {
  const response = await fetch(
    `${API_BASE}/feedback/summary`,
    {
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}


// ── Tokens ─────────────────────────────────────────────────

/**
 * Get token usage and cost statistics.
 */
export async function getTokenUsage(): Promise<any> {
  const response = await fetch(
    `${API_BASE}/tokens/usage`,
    {
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}

/**
 * Get available LLM models.
 *
 * @returns List of models configured in backend
 */
export async function getAvailableModels(): Promise<{
  models: LLMModel[]
}> {
  const response = await fetch(
    `${API_BASE}/tokens/models`
  );
  return handleResponse(response);
}


// ── Plugins ────────────────────────────────────────────────

/**
 * Get all plugins with current states.
 */
export async function getPlugins(): Promise<{
  plugins: Plugin[]
}> {
  const response = await fetch(
    `${API_BASE}/plugins`,
    {
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}

/**
 * Toggle a plugin on or off.
 *
 * @param pluginId - Plugin identifier to toggle
 */
export async function togglePlugin(
  pluginId: string
): Promise<any> {
  const response = await fetch(
    `${API_BASE}/plugins/${pluginId}/toggle`,
    {
      method:  "POST",
      headers: getHeaders(true),
    }
  );
  return handleResponse(response);
}


// ── Health ─────────────────────────────────────────────────

/**
 * Check backend server health.
 */
export async function checkHealth(): Promise<any> {
  const response = await fetch(
    `${API_BASE}/health`
  );
  return handleResponse(response);
}