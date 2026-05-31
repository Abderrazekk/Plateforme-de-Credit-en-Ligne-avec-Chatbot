import { useState, useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import api from "../../services/api";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Bonjour ! Je suis l'assistant CréditTunisie. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const botMsg = {
        from: "bot",
        text: data.response || "Désolé, aucune réponse.",
      };
      setMessages((prev) => [...prev, botMsg]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Erreur de connexion au chatbot." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .ct-widget * {
          box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
        }

        .ct-fab {
          position: fixed;
          bottom: 1.75rem;
          right: 1.75rem;
          width: 3.75rem;
          height: 3.75rem;
          background: linear-gradient(145deg, #1a2744 0%, #0f1a35 100%);
          border: 1px solid rgba(196, 160, 80, 0.45);
          border-radius: 50%;
          box-shadow: 0 8px 32px rgba(10, 18, 40, 0.55), 0 0 0 1px rgba(196,160,80,0.12) inset;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
        }
        .ct-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 40px rgba(10, 18, 40, 0.7), 0 0 0 1px rgba(196,160,80,0.25) inset;
        }
        .ct-fab:active { transform: scale(0.96); }

        .ct-fab-icon {
          width: 1.6rem;
          height: 1.6rem;
          color: #c4a050;
        }
        .ct-fab-pulse {
          position: absolute;
          top: 0; right: 0;
          width: 0.75rem;
          height: 0.75rem;
          background: #c4a050;
          border-radius: 50%;
          border: 2px solid #0f1a35;
          animation: ct-pulse 2.2s ease-in-out infinite;
        }
        @keyframes ct-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }

        .ct-panel {
          position: fixed;
          bottom: 6.25rem;
          right: 1.75rem;
          width: 22rem;
          max-height: 36rem;
          background: #f8f7f4;
          border-radius: 1.25rem;
          border: 1px solid rgba(196, 160, 80, 0.22);
          box-shadow:
            0 24px 64px rgba(10, 18, 40, 0.22),
            0 2px 8px rgba(10, 18, 40, 0.1),
            0 0 0 0.5px rgba(196,160,80,0.15) inset;
          display: flex;
          flex-direction: column;
          z-index: 9998;
          overflow: hidden;
          animation: ct-slide-in 0.32s cubic-bezier(.34,1.45,.64,1) both;
        }
        @keyframes ct-slide-in {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (min-width: 640px) {
          .ct-panel { width: 24rem; }
        }

        .ct-header {
          background: linear-gradient(135deg, #1a2744 0%, #0d1829 100%);
          padding: 1rem 1.1rem 0.9rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(196,160,80,0.18);
          flex-shrink: 0;
        }
        .ct-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .ct-avatar {
          width: 2.2rem;
          height: 2.2rem;
          background: linear-gradient(145deg, #c4a050, #9a7a32);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ct-avatar svg {
          width: 1.1rem;
          height: 1.1rem;
          color: #1a2744;
        }
        .ct-header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: #f0e8d0;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }
        .ct-header-sub {
          font-size: 0.68rem;
          font-weight: 300;
          color: rgba(196,160,80,0.75);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 1px;
        }
        .ct-close-btn {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.5rem;
          color: rgba(240,232,208,0.65);
          width: 1.9rem;
          height: 1.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          flex-shrink: 0;
        }
        .ct-close-btn:hover {
          background: rgba(255,255,255,0.13);
          color: #f0e8d0;
        }

        .ct-messages {
          flex: 1;
          padding: 1rem 0.9rem;
          overflow-y: auto;
          min-height: 0;
          height: 17rem;
          background:
            linear-gradient(to bottom, rgba(248,247,244,0) 0%, rgba(248,247,244,1) 95%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27px,
              rgba(196,160,80,0.05) 27px,
              rgba(196,160,80,0.05) 28px
            );
          scroll-behavior: smooth;
        }
        .ct-messages::-webkit-scrollbar { width: 4px; }
        .ct-messages::-webkit-scrollbar-track { background: transparent; }
        .ct-messages::-webkit-scrollbar-thumb {
          background: rgba(196,160,80,0.25);
          border-radius: 4px;
        }

        .ct-msg-row {
          display: flex;
          margin-bottom: 0.65rem;
          animation: ct-msg-in 0.22s ease both;
        }
        @keyframes ct-msg-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ct-msg-row--user { justify-content: flex-end; }
        .ct-msg-row--bot  { justify-content: flex-start; }

        .ct-bubble {
          max-width: 78%;
          padding: 0.55rem 0.85rem;
          font-size: 0.82rem;
          line-height: 1.55;
          font-weight: 400;
          border-radius: 1rem;
        }
        .ct-bubble--user {
          background: linear-gradient(135deg, #1a2744, #0d1829);
          color: #f0e8d0;
          border-bottom-right-radius: 0.25rem;
          border: 1px solid rgba(196,160,80,0.2);
        }
        .ct-bubble--bot {
          background: #ffffff;
          color: #2c2a26;
          border-bottom-left-radius: 0.25rem;
          border: 1px solid rgba(196,160,80,0.15);
          box-shadow: 0 1px 6px rgba(10,18,40,0.06);
        }

        .ct-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0.55rem 0.85rem;
          background: #ffffff;
          border: 1px solid rgba(196,160,80,0.15);
          border-radius: 1rem;
          border-bottom-left-radius: 0.25rem;
          width: fit-content;
          box-shadow: 0 1px 6px rgba(10,18,40,0.06);
        }
        .ct-typing-dot {
          width: 6px;
          height: 6px;
          background: #c4a050;
          border-radius: 50%;
          animation: ct-dot 1.3s ease-in-out infinite;
        }
        .ct-typing-dot:nth-child(2) { animation-delay: 0.18s; }
        .ct-typing-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes ct-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        .ct-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(196,160,80,0.25), transparent);
          flex-shrink: 0;
        }

        .ct-input-area {
          padding: 0.75rem 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f8f7f4;
          flex-shrink: 0;
        }
        .ct-input {
          flex: 1;
          background: #ffffff;
          border: 1px solid rgba(196,160,80,0.25);
          border-radius: 0.75rem;
          padding: 0.55rem 0.85rem;
          font-size: 0.82rem;
          font-family: 'DM Sans', sans-serif;
          color: #2c2a26;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .ct-input::placeholder { color: #a09a8e; }
        .ct-input:focus {
          border-color: rgba(196,160,80,0.55);
          box-shadow: 0 0 0 3px rgba(196,160,80,0.1);
        }
        .ct-send-btn {
          width: 2.3rem;
          height: 2.3rem;
          background: linear-gradient(145deg, #1a2744, #0d1829);
          border: 1px solid rgba(196,160,80,0.3);
          border-radius: 0.75rem;
          color: #c4a050;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
          flex-shrink: 0;
        }
        .ct-send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          border-color: rgba(196,160,80,0.6);
          box-shadow: 0 4px 14px rgba(10,18,40,0.3);
        }
        .ct-send-btn:active:not(:disabled) { transform: scale(0.94); }
        .ct-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .ct-send-btn svg {
          width: 1rem;
          height: 1rem;
        }

        .ct-footer-label {
          text-align: center;
          font-size: 0.62rem;
          font-weight: 300;
          color: #b0aa9e;
          letter-spacing: 0.06em;
          padding-bottom: 0.55rem;
          text-transform: uppercase;
          flex-shrink: 0;
        }
      `}</style>

      <div className="ct-widget">
        {/* Floating button */}
        <button
          onClick={() => setOpen(!open)}
          className="ct-fab"
          aria-label="Ouvrir l'assistant"
        >
          {open ? (
            <svg
              className="ct-fab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="ct-fab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {!open && <span className="ct-fab-pulse" aria-hidden="true" />}
        </button>

        {/* Chat panel */}
        {open && (
          <div
            className="ct-panel"
            role="dialog"
            aria-label="Assistant CréditTunisie"
          >
            {/* Header */}
            <div className="ct-header">
              <div className="ct-header-left">
                <div className="ct-avatar" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <div>
                  <div className="ct-header-title">Assistant CréditTunisie</div>
                  <div className="ct-header-sub">Conseiller en ligne</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ct-close-btn"
                aria-label="Fermer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="ct-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`ct-msg-row ct-msg-row--${msg.from}`}>
                  <div className={`ct-bubble ct-bubble--${msg.from}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ct-msg-row ct-msg-row--bot">
                  <div
                    className="ct-typing"
                    aria-label="Assistant en train d'écrire"
                  >
                    <div className="ct-typing-dot" />
                    <div className="ct-typing-dot" />
                    <div className="ct-typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ct-divider" aria-hidden="true" />

            {/* Input */}
            <div className="ct-input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Votre question..."
                className="ct-input"
                aria-label="Message"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="ct-send-btn"
                aria-label="Envoyer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>

            <div className="ct-footer-label" aria-hidden="true">
              CréditTunisie · Service Client
            </div>
          </div>
        )}
      </div>
    </>
  );
}
