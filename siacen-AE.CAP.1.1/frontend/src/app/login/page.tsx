/**
 * Login page for CropGuard AI.
 *
 * Handles farmer login and signup with
 * email and password via Supabase Auth.
 *
 * Features:
 *   - Toggle between login and signup
 *   - Form validation
 *   - JWT token storage
 *   - Redirect to home on success
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link          from "next/link";
import { login, signup } from "@/services/api";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [mode,     setMode]     = useState<Mode>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && !name) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = mode === "login"
        ? await login({ email, password })
        : await signup({ email, password, full_name: name });

      // Store token and user info
      localStorage.setItem(
        "cropguard_token",
        response.access_token
      );
      localStorage.setItem(
        "cropguard_user",
        JSON.stringify({
          id:        response.user_id,
          email:     response.email,
          full_name: response.full_name,
        })
      );

      router.push("/");

    } catch (err: any) {
      setError(
        err.message ||
        "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "24px",
    }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "32px" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "48px" }}>🌿</span>
          <h1 style={{
            color:      "#6AAB35",
            fontSize:   "24px",
            margin:     "8px 0 0",
            fontFamily: "Georgia, serif",
          }}>
            CropGuard AI
          </h1>
        </div>
      </Link>

      {/* Form Card */}
      <div className="card" style={{
        width:    "100%",
        maxWidth: "400px",
      }}>
        <h2 style={{
          color:        "#F5F0E8",
          margin:       "0 0 24px",
          fontSize:     "20px",
          textAlign:    "center",
          fontFamily:   "Georgia, serif",
        }}>
          {mode === "login"
            ? "Login to your account"
            : "Create your account"
          }
        </h2>

        {/* Name Field (signup only) */}
        {mode === "signup" && (
          <div style={{ marginBottom: "14px" }}>
            <label style={{
              color:        "rgba(180, 220, 120, 0.6)",
              fontSize:     "12px",
              display:      "block",
              marginBottom: "6px",
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="John Farmer"
              className="input"
            />
          </div>
        )}

        {/* Email Field */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{
            color:        "rgba(180, 220, 120, 0.6)",
            fontSize:     "12px",
            display:      "block",
            marginBottom: "6px",
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="farmer@example.com"
            className="input"
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            color:        "rgba(180, 220, 120, 0.6)",
            fontSize:     "12px",
            display:      "block",
            marginBottom: "6px",
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="input"
            onKeyDown={e => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:   "rgba(192, 57, 43, 0.1)",
            border:       "1px solid rgba(192, 57, 43, 0.3)",
            borderRadius: "8px",
            padding:      "10px 12px",
            marginBottom: "14px",
            color:        "#FFAAAA",
            fontSize:     "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", marginBottom: "14px" }}
        >
          {loading
            ? "Please wait..."
            : mode === "login" ? "Login" : "Create Account"
          }
        </button>

        {/* Toggle Mode */}
        <p style={{
          textAlign: "center",
          color:     "rgba(180, 220, 120, 0.5)",
          fontSize:  "13px",
          margin:    0,
        }}>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "
          }
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            style={{
              background: "none",
              border:     "none",
              color:      "#6AAB35",
              cursor:     "pointer",
              fontSize:   "13px",
              fontFamily: "inherit",
            }}
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}