import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; // backend later

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I'm Rishav's AI assistant. Ask me anything about his work." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text })
      });

      const data = await res.json();
      const botMessage = { from: "bot", text: data.answer || "No answer received." };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "Error contacting server. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      background: "#f3f4f6"
    }}>
      <div style={{
        padding: "12px 16px",
        background: "#111827",
        color: "white",
        fontWeight: 600,
        fontSize: "14px"
      }}>
        Rishav’s AI Chatbot
      </div>

      <div style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: m.from === "user" ? "flex-end" : "flex-start",
              marginBottom: "8px"
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "8px 12px",
                borderRadius: "12px",
                fontSize: "14px",
                background: m.from === "user" ? "#2563eb" : "white",
                color: m.from === "user" ? "white" : "#111827",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: "12px", color: "#6b7280" }}>Thinking...</div>
        )}
      </div>

      <div style={{ padding: "12px", borderTop: "1px solid #e5e7eb" }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Ask about Rishav’s skills, projects, experience..."
          style={{
            width: "100%",
            resize: "none",
            padding: "8px 10px",
            fontSize: "14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            outline: "none"
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px"
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
