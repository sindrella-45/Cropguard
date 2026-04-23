/**
 * AI-powered Help Chatbot for CropGuard AI.
 *
 * IMPROVEMENT: Now calls the real Anthropic API via the
 * /v1/messages endpoint to give genuinely helpful answers
 * to any question a farmer asks about using the app or
 * about crop diseases in general.
 *
 * Features:
 *   - Real AI answers via Claude Sonnet
 *   - Quick topic buttons for common questions
 *   - Fully responsive (mobile-friendly floating panel)
 *   - Minimisable floating button
 *   - Typing indicator while loading
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

const QUICK_TOPICS = [
  "How to take a good leaf photo",
  "What do severity levels mean",
  "How to read the confidence score",
  "When should I seek expert help",
  "How to view my past diagnoses",
  "What does the RAG knowledge base do",
];

const SYSTEM_PROMPT = `You are the CropGuard AI help assistant — a friendly, knowledgeable guide 
for farmers and users of the CropGuard AI crop disease detection application.

CropGuard AI is a web app where farmers upload a leaf photo and receive an AI-powered 
diagnosis of crop diseases, with treatment recommendations and prevention tips.

Key features of CropGuard AI you can explain:
- Upload any plant leaf photo (JPG, PNG, WEBP, max 5MB)
- AI analyzes symptoms using GPT-4o vision
- RAG pipeline searches verified agricultural PDFs (CABI, FAO)
- Confidence scores show how certain the diagnosis is (0-100%)
- Severity levels: None (healthy), Mild, Moderate, Severe
- Urgency levels: Low, Medium, High, Critical
- Treatment types: Immediate, Organic, Chemical, Preventive
- Diagnosis history saved for logged-in farmers
- Personality modes: Friendly, Formal, Concise
- Plugin system to enable/disable tools

You can also answer general crop disease questions relevant to Uganda and East Africa.
Be warm, helpful, and use simple language accessible to everyday farmers.
If asked about diseases, give practical, actionable advice.
Keep responses concise — 3-5 sentences maximum unless a detailed explanation is needed.`;

export default function HelpChatbot() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role:    "assistant",
      content: "👋 Hello! I'm your CropGuard AI help assistant. Ask me anything about using the app or about crop diseases. You can also click one of the quick topics below!",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Call Anthropic API directly
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 500,
          system:     SYSTEM_PROMPT,
          messages:   newMessages.map(m => ({
            role:    m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const answer = data.content?.[0]?.text || "I couldn't get a response. Please try again.";

      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: "Sorry, I couldn't connect right now. For common questions, try the quick topics below!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      bottom:   "24px",
      right:    "24px",
      zIndex:   200,
      // Mobile: smaller positioning
    }}>

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          background:    "#1A2F0E",
          border:        "1px solid rgba(106, 171, 53, 0.3)",
          borderRadius:  "16px",
          width:         "clamp(280px, 90vw, 340px)",
          maxHeight:     "clamp(380px, 60vh, 500px)",
          display:       "flex",
          flexDirection: "column",
          marginBottom:  "12px",
          boxShadow:     "0 8px 40px rgba(0,0,0,0.5)",
          animation:     "fadeIn 0.2s ease",
        }}>

          {/* Header */}
          <div style={{
            background:     "rgba(106, 171, 53, 0.12)",
            borderBottom:   "1px solid rgba(106, 171, 53, 0.2)",
            padding:        "12px 16px",
            borderRadius:   "16px 16px 0 0",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>💬</span>
              <div>
                <div style={{ color: "#6AAB35", fontWeight: "700", fontSize: "14px" }}>
                  AI Help Assistant
                </div>
                <div style={{ color: "rgba(180, 220, 120, 0.5)", fontSize: "10px" }}>
                  Powered by Claude AI
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border:     "none",
                color:      "rgba(180, 220, 120, 0.5)",
                cursor:     "pointer",
                fontSize:   "18px",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex:          1,
            overflowY:     "auto",
            padding:       "12px",
            display:       "flex",
            flexDirection: "column",
            gap:           "10px",
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf:    msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth:     "88%",
                  background:   msg.role === "user"
                    ? "rgba(106, 171, 53, 0.2)"
                    : "rgba(255, 255, 255, 0.05)",
                  border:       msg.role === "user"
                    ? "1px solid rgba(106, 171, 53, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: msg.role === "user"
                    ? "12px 12px 4px 12px"
                    : "12px 12px 12px 4px",
                  padding:      "8px 12px",
                  color:        "#F5F0E8",
                  fontSize:     "12px",
                  lineHeight:   "1.6",
                  whiteSpace:   "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            ))}

            {/* Quick Topics — show only after welcome message */}
            {messages.length === 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {QUICK_TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => sendMessage(topic)}
                    style={{
                      background:   "rgba(106, 171, 53, 0.1)",
                      border:       "1px solid rgba(106, 171, 53, 0.2)",
                      borderRadius: "8px",
                      padding:      "4px 10px",
                      color:        "#B4DC78",
                      fontSize:     "11px",
                      cursor:       "pointer",
                      fontFamily:   "inherit",
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div style={{
                alignSelf:    "flex-start",
                background:   "rgba(255, 255, 255, 0.05)",
                border:       "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px 12px 12px 4px",
                padding:      "10px 14px",
                display:      "flex",
                gap:          "4px",
                alignItems:   "center",
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width:        "7px",
                    height:       "7px",
                    borderRadius: "50%",
                    background:   "#6AAB35",
                    animation:    `pulse 1.2s ease ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding:    "10px 12px",
            borderTop:  "1px solid rgba(106, 171, 53, 0.15)",
            display:    "flex",
            gap:        "8px",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") sendMessage(input);
              }}
              placeholder="Ask anything..."
              style={{
                flex:         1,
                background:   "rgba(255, 255, 255, 0.05)",
                border:       "1px solid rgba(74, 122, 40, 0.3)",
                borderRadius: "8px",
                padding:      "8px 10px",
                color:        "#F5F0E8",
                fontSize:     "12px",
                fontFamily:   "inherit",
                outline:      "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                background:   "rgba(106, 171, 53, 0.2)",
                border:       "1px solid rgba(106, 171, 53, 0.3)",
                borderRadius: "8px",
                padding:      "8px 12px",
                color:        "#6AAB35",
                cursor:       loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize:     "16px",
                opacity:      loading || !input.trim() ? 0.5 : 1,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background:     isOpen
            ? "rgba(106, 171, 53, 0.2)"
            : "linear-gradient(135deg, #6AAB35, #4A7C2F)",
          border:         "1.5px solid #6AAB35",
          borderRadius:   "50%",
          width:          "52px",
          height:         "52px",
          fontSize:       "22px",
          cursor:         "pointer",
          boxShadow:      "0 4px 20px rgba(106, 171, 53, 0.35)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          marginLeft:     "auto",
          transition:     "all 0.2s ease",
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}
