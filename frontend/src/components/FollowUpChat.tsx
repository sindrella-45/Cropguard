/**
 * Follow-up chat component for CropGuard AI.
 *
 * Allows farmers to ask follow-up questions about their
 * diagnosis after receiving results. Calls the backend
 * /followup endpoint which uses Redis session memory
 * to give contextual answers about the specific diagnosis.
 *
 * Features:
 *   - Suggested questions as clickable chips
 *   - Real API calls to backend with diagnosis context
 *   - Chat history displayed as conversation bubbles
 *   - Loading spinner while waiting for response
 *   - Fully responsive for mobile and desktop
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

interface FollowUpChatProps {
  sessionId:   string;
  diseaseName: string;
  plantName:   string;
  personality: string;
}

const SUGGESTED_QUESTIONS = [
  "Where can I buy copper fungicide in Uganda?",
  "How long until my plant recovers?",
  "Will this disease spread to other plants?",
  "Is neem oil safe for vegetables I will eat?",
  "What is the best time to apply treatment?",
  "Should I remove the affected leaves first?",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function FollowUpChat({
  sessionId,
  diseaseName,
  plantName,
  personality,
}: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role:    "assistant",
      content: `I can answer questions about the ${diseaseName} diagnosis for your ${plantName}. What would you like to know?`,
    },
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuestion = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMessage: Message = { role: "user", content: question };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("cropguard_token")
        : null;

      const response = await fetch(`${API_BASE}/followup`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          session_id:  sessionId,
          question,
          personality,
          model: "gpt-4o",
        }),
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role:    "assistant",
          content: "Sorry, I couldn't answer that right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background:   "rgba(255, 255, 255, 0.03)",
      border:       "1px solid rgba(106, 171, 53, 0.2)",
      borderRadius: "16px",
      overflow:     "hidden",
    }}>
      {/* Header */}
      <div style={{
        background:   "rgba(106, 171, 53, 0.08)",
        borderBottom: "1px solid rgba(106, 171, 53, 0.15)",
        padding:      "14px 18px",
        display:      "flex",
        alignItems:   "center",
        gap:          "10px",
      }}>
        <span style={{ fontSize: "18px" }}>💬</span>
        <div>
          <div style={{ color: "#6AAB35", fontWeight: "700", fontSize: "14px" }}>
            Ask About This Diagnosis
          </div>
          <div style={{ color: "rgba(180, 220, 120, 0.5)", fontSize: "12px" }}>
            Your agent remembers the diagnosis context
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(106, 171, 53, 0.1)" }}>
        <div style={{
          color:        "rgba(180, 220, 120, 0.5)",
          fontSize:     "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "8px",
        }}>
          Suggested Questions
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SUGGESTED_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendQuestion(q)}
              disabled={loading}
              style={{
                background:   "rgba(106, 171, 53, 0.1)",
                border:       "1px solid rgba(106, 171, 53, 0.2)",
                borderRadius: "20px",
                padding:      "5px 12px",
                color:        "#B4DC78",
                fontSize:     "12px",
                cursor:       loading ? "not-allowed" : "pointer",
                fontFamily:   "inherit",
                opacity:      loading ? 0.5 : 1,
                transition:   "all 0.15s ease",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{
        height:        "280px",
        overflowY:     "auto",
        padding:       "14px 16px",
        display:       "flex",
        flexDirection: "column",
        gap:           "10px",
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf:    msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth:     "85%",
              background:   msg.role === "user"
                ? "rgba(106, 171, 53, 0.2)"
                : "rgba(255, 255, 255, 0.05)",
              border:       msg.role === "user"
                ? "1px solid rgba(106, 171, 53, 0.3)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: msg.role === "user"
                ? "12px 12px 4px 12px"
                : "12px 12px 12px 4px",
              padding:      "10px 14px",
              color:        "#F5F0E8",
              fontSize:     "13px",
              lineHeight:   "1.6",
              whiteSpace:   "pre-wrap",
            }}
          >
            {msg.role === "assistant" && (
              <span style={{ fontSize: "12px", marginRight: "6px" }}>🌿</span>
            )}
            {msg.content}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div style={{
            alignSelf:    "flex-start",
            background:   "rgba(255, 255, 255, 0.05)",
            border:       "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px 12px 12px 4px",
            padding:      "10px 16px",
            display:      "flex",
            gap:          "4px",
            alignItems:   "center",
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width:        "7px",
                  height:       "7px",
                  borderRadius: "50%",
                  background:   "#6AAB35",
                  animation:    `pulse 1.2s ease ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding:     "12px 16px",
        borderTop:   "1px solid rgba(106, 171, 53, 0.15)",
        display:     "flex",
        gap:         "8px",
        alignItems:  "flex-end",
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendQuestion(input);
            }
          }}
          placeholder="Ask anything about your diagnosis..."
          rows={2}
          style={{
            flex:         1,
            background:   "rgba(255, 255, 255, 0.05)",
            border:       "1px solid rgba(74, 122, 40, 0.3)",
            borderRadius: "10px",
            padding:      "10px 12px",
            color:        "#F5F0E8",
            fontSize:     "13px",
            fontFamily:   "Georgia, serif",
            outline:      "none",
            resize:       "none",
          }}
        />
        <button
          onClick={() => sendQuestion(input)}
          disabled={loading || !input.trim()}
          style={{
            background:   "rgba(106, 171, 53, 0.2)",
            border:       "1px solid rgba(106, 171, 53, 0.4)",
            borderRadius: "10px",
            padding:      "10px 16px",
            color:        "#6AAB35",
            fontSize:     "18px",
            cursor:       loading || !input.trim() ? "not-allowed" : "pointer",
            opacity:      loading || !input.trim() ? 0.5 : 1,
            flexShrink:   0,
            alignSelf:    "stretch",
            display:      "flex",
            alignItems:   "center",
          }}
        >
          ➤
        </button>
      </div>

      <p style={{
        textAlign: "center",
        color:     "rgba(180, 220, 120, 0.3)",
        fontSize:  "11px",
        padding:   "0 16px 10px",
      }}>
        Powered by your diagnosis context · Press Enter to send
      </p>
    </div>
  );
}
