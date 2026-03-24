import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/chat";
const WS_URL = import.meta.env.VITE_WS_URL || "wss://rishav-chatbot.duckdns.org/ws/chat";
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi, I'm Rishav's AI assistant. Ask me anything about his work, skills, or experience.",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ── Auto-scroll ──────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, loading]);

  // ── WebSocket with reconnect ─────────────────────────
  const connectWS = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      setConnectionStatus("connected");
      reconnectAttempts.current = 0;
    };

    socket.onmessage = (event) => {
      let botText = event.data;
      try {
        const parsed = JSON.parse(event.data);
        botText = parsed.answer || parsed.message || parsed.text || parsed;
      } catch (_) {
        /* plain text is fine */
      }
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: botText, time: new Date() },
      ]);
      setLoading(false);
    };

    socket.onerror = () => {
      console.warn("[WS] error event (non-fatal, waiting for onclose)");
    };

    socket.onclose = () => {
      setConnectionStatus("disconnected");
      setLoading(false);

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        const delay = RECONNECT_DELAY * reconnectAttempts.current;
        console.log(`[WS] reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
        reconnectTimer.current = setTimeout(connectWS, delay);
      }
    };

    ws.current = socket;
  }, []);

  useEffect(() => {
    connectWS();
    return () => {
      clearTimeout(reconnectTimer.current);
      if (ws.current) ws.current.close();
    };
  }, [connectWS]);

  // ── Send ─────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: trimmed, time: new Date() },
    ]);
    setInput("");
    setLoading(true);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message: trimmed }));
    } else {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Connection lost. Trying to reconnect…",
          time: new Date(),
          isError: true,
        },
      ]);
      setLoading(false);
      connectWS();
    }

    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Time formatter ───────────────────────────────────
  const formatTime = (d) =>
    d
      ? new Date(d).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="chat-page">
      <div className="chat-card">
        {/* Header */}
        <div className="chat-header">
          <div className="header-left">
            <div className="header-avatar">R</div>
            <div>
              <div className="header-title">Rishav's AI</div>
              <div className="header-sub">
                <span className={`status-dot status-dot--${connectionStatus}`} />
                {connectionStatus === "connected"
                  ? "Online"
                  : connectionStatus === "connecting"
                  ? "Connecting…"
                  : "Offline – reconnecting…"}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((m, idx) => {
            const isUser = m.from === "user";
            return (
              <div
                key={idx}
                className={`msg-row ${isUser ? "msg-row--user" : "msg-row--bot"}`}
              >
                {!isUser && <div className="bot-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                  </svg>
                </div>}
                <div
                  className={`bubble ${isUser ? "bubble--user" : "bubble--bot"} ${
                    m.isError ? "bubble--error" : ""
                  }`}
                >
                  <span className="bubble-text">{m.text}</span>
                  <span
                    className={`bubble-time ${
                      isUser ? "bubble-time--user" : "bubble-time--bot"
                    }`}
                  >
                    {formatTime(m.time)}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="msg-row msg-row--bot">
              <div className="bot-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                  </svg>
              </div>
              <div className="bubble bubble--bot">
                <span className="typing-dots">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about skills, projects..."
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}