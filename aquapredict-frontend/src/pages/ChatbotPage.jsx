// src/pages/ChatbotPage.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare, Copy, Trash, PlusCircle, Sparkles, Ship, Send } from "lucide-react";

const STORAGE_KEY = "aq_chat_sessions_v1";

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const emptyBotMessage = () => ({
  sender: "bot",
  text: "🌊 I'm AquaBot! Ask me anything about fishing, tides, or weather.",
  ts: new Date().toISOString(),
});

const defaultSessionTitle = () =>
  `Chat • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

/* ---------------- QuickPrompts ---------------- */
function QuickPrompts({ onPick }) {
  const prompts = [
    "Where are the best locations to catch mackerel today?",
    "What is the tide schedule for Chennai tomorrow?",
    "Is it safe to go fishing with 1.5m waves?",
    "Recommend bait for tuna in December.",
  ];

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="w-4 h-4 text-sky-400" /> Quick Prompts
        </h3>
        <span className="text-xs text-slate-400">Beginners</span>
      </div>

      <div className="space-y-2">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPick(p)}
            className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-400">Tip: tap a prompt to populate the input, then press Enter to send.</div>
    </div>
  );
}

/* ---------------- SavedChatsPanel ---------------- */
function SavedChatsPanel({ sessions, currentSessionId, onNewSession, onOpenSession, onDeleteSession }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Saved Chats</h3>
        <button
          onClick={onNewSession}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sm"
          title="New chat"
        >
          <PlusCircle size={14} /> New
        </button>
      </div>

      <div className="max-h-56 overflow-auto space-y-2 pr-2">
        {sessions.length === 0 && (
          <div className="text-sm text-slate-400 p-4">No saved chats yet. Create one to start.</div>
        )}

        {sessions.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between gap-3 p-3 rounded-md ${
              s.id === currentSessionId ? "bg-slate-800 border border-sky-600/30" : "bg-slate-800/60"
            }`}
          >
            <div className="flex-1 min-w-0">
              <button onClick={() => onOpenSession(s.id)} className="text-left w-full" title={`Open ${s.title}`}>
                <div className="font-medium truncate text-slate-100 text-sm">{s.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.updatedAt ? formatTime(s.updatedAt) : formatTime(s.createdAt)}</div>
              </button>
            </div>

            <button
              onClick={() => onDeleteSession(s.id)}
              className="p-1 rounded-md bg-transparent hover:bg-red-700/10"
              title="Delete chat"
            >
              <Trash size={14} className="text-slate-300" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-400">Sessions are saved locally. Use header export to back up.</div>
    </div>
  );
}

/* ---------------- ChatWindow (clean, no icons) ---------------- */
function ChatWindow({ messages }) {
  return (
    <div className="px-4 py-4 space-y-4">
      {messages.map((m, idx) => {
        const isUser = m.sender === "user";
        return (
          <div key={idx} className={`max-w-full ${isUser ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-3 rounded-xl ${isUser ? "bg-sky-500 text-slate-900" : "bg-slate-800 text-slate-100"}`}
              style={{ maxWidth: "85%" }}
            >
              {m.sender === "bot" ? (
                <div className="prose prose-sm prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-sm">{m.text}</div>
              )}

              <div className={`mt-2 text-xs ${isUser ? "text-slate-700" : "text-slate-400"}`}>{formatTime(m.ts)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Input component ---------------- */
function MessageInput({ value, onChange, onSend, sending }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-700">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask about fishing, tides, or weather..."
          className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-slate-500 text-slate-100"
          style={{ minHeight: 36 }}
        />
        <button
          onClick={onSend}
          disabled={sending}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-sm font-medium"
        >
          <Send size={16} />
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
      <div className="mt-2 text-xs text-slate-500 flex justify-between">
        <div>Shift+Enter for newline</div>
        <div>Powered by AI</div>
      </div>
    </div>
  );
}

/* ---------------- ContextPanel ---------------- */
function ContextPanel({ region = "Chennai Coast", env = {} }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium">Context</h3>
          <div className="text-xs text-slate-400">Region & recent environment</div>
        </div>
        <div className="text-xs text-slate-400">{new Date().toLocaleDateString()}</div>
      </div>

      <div className="space-y-3 text-sm text-slate-100">
        <div>
          <span className="text-slate-400">Region:</span> <span className="font-medium">{region}</span>
        </div>
        <div>
          <span className="text-slate-400">Temperature:</span>{" "}
          <span className="font-medium">{env.temperature ?? "27.3"}°C</span>
        </div>
        <div>
          <span className="text-slate-400">Salinity:</span> <span className="font-medium">{env.salinity ?? "33.8"} PSU</span>
        </div>
        <div>
          <span className="text-slate-400">Model:</span> <span className="font-medium">AquaBot v1.0</span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={() => {
            const text = `Context: ${region} • Temp ${env.temperature ?? "27.3"}°C • Salinity ${env.salinity ?? "33.8"} PSU`;
            navigator.clipboard?.writeText(text);
            alert("Context copied.");
          }}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-sm"
        >
          <Copy size={14} /> Copy Context
        </button>
      </div>
    </div>
  );
}

/* ---------------- Main ChatbotPage ---------------- */
export default function ChatbotPage() {
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => (sessions[0] ? sessions[0].id : null));
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length) {
          return parsed[0].messages || [emptyBotMessage()];
        }
      }
    } catch {}
    return [emptyBotMessage()];
  });

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    const s = sessions.find((x) => x.id === activeSessionId);
    if (s) {
      setMessages(s.messages || [emptyBotMessage()]);
    }
  }, [activeSessionId, sessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const createNewSession = () => {
    const id = `s_${Date.now()}`;
    const sess = {
      id,
      title: defaultSessionTitle(),
      messages: [emptyBotMessage()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [sess, ...prev]);
    setActiveSessionId(id);
    setMessages(sess.messages);
  };

  const openSession = (id) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    setActiveSessionId(id);
    setMessages(s.messages || [emptyBotMessage()]);
  };

  const deleteSession = (id) => {
    if (!confirm("Delete this saved chat? This cannot be undone.")) return;
    setSessions((prev) => prev.filter((x) => x.id !== id));
    if (id === activeSessionId) {
      const remaining = sessions.filter((x) => x.id !== id);
      if (remaining.length) {
        setActiveSessionId(remaining[0].id);
        setMessages(remaining[0].messages || [emptyBotMessage()]);
      } else {
        createNewSession();
      }
    }
  };

  const persistActiveMessages = (msgs) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: msgs, updatedAt: new Date().toISOString(), title: s.title || defaultSessionTitle() }
          : s
      )
    );
  };

  const sendMessage = async () => {
    const txt = input.trim();
    if (!txt) return;
    const userMsg = { sender: "user", text: txt, ts: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);

    persistActiveMessages(next);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: txt }),
      });
      const data = await res.json();
      const botText = data?.message || "🤖 Sorry, I couldn't process that.";
      setTimeout(() => {
        const botMsg = { sender: "bot", text: botText, ts: new Date().toISOString() };
        const next2 = [...next, botMsg];
        setMessages(next2);
        persistActiveMessages(next2);
        setSending(false);
      }, 300);
    } catch (err) {
      console.error("Chat error:", err);
      setTimeout(() => {
        const botMsg = { sender: "bot", text: "⚠️ Server error. Please try later.", ts: new Date().toISOString() };
        const next2 = [...next, botMsg];
        setMessages(next2);
        persistActiveMessages(next2);
        setSending(false);
      }, 300);
    }
  };

  const handlePickPrompt = (p) => setInput(p);

  useEffect(() => {
    const onExport = () => {
      const rows = sessions.flatMap((s) =>
        (s.messages || []).map((m, i) => ({ session: s.title, idx: i + 1, sender: m.sender, text: m.text, ts: m.ts }))
      );
      if (!rows.length) {
        alert("No sessions/messages to export.");
        return;
      }
      const header = Object.keys(rows[0]).join(",") + "\n";
      const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const csv = header + body;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aqua_chat_sessions_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };
    const onCopy = () => {
      const text = messages.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n\n");
      navigator.clipboard?.writeText(text);
      alert("Conversation copied to clipboard.");
    };
    window.addEventListener("export-csv", onExport);
    window.addEventListener("copy-json", onCopy);
    return () => {
      window.removeEventListener("export-csv", onExport);
      window.removeEventListener("copy-json", onCopy);
    };
  }, [sessions, messages]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("page-meta", {
        detail: {
          page: "chatbot",
          title: "AI Chatbot",
          subtitle: "Your fishing AI assistant",
          actions: { exportCsv: true, copyJson: true, notes: true },
          lastSaved: sessions[0]?.updatedAt || null,
          compactTopbar: true,
        },
      })
    );
  }, [sessions]);

  useEffect(() => {
    if (!sessions.length) {
      createNewSession();
    } else if (!activeSessionId && sessions.length) {
      setActiveSessionId(sessions[0].id);
      setMessages(sessions[0].messages || [emptyBotMessage()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Full-bleed page inner wrapper: fills width but keeps responsive padding */}
      <div className="w-full page-inner p-6" style={{ boxSizing: "border-box" }}>
        {/* Use full width grid that stretches to viewport sides */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left */}
          <div className="lg:col-span-3 flex flex-col">
            <QuickPrompts onPick={handlePickPrompt} />
            <SavedChatsPanel
              sessions={sessions}
              currentSessionId={activeSessionId}
              onNewSession={createNewSession}
              onOpenSession={openSession}
              onDeleteSession={deleteSession}
            />
          </div>

          {/* Center */}
          <main className="lg:col-span-6 flex flex-col min-h-[60vh]">
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 flex flex-col h-full">
              <div className="flex-1 overflow-auto">
                <ChatWindow messages={messages} />
                {sending && (
                  <div className="px-4 mb-4">
                    <div className="inline-flex items-center gap-3 rounded-md p-3 bg-slate-800 text-slate-300 text-sm">
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse delay-75" />
                      <span className="ml-2">AquaBot is typing…</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="mt-4">
                <MessageInput value={input} onChange={setInput} onSend={sendMessage} sending={sending} />
              </div>
            </div>
          </main>

          {/* Right */}
          <aside className="lg:col-span-3">
            <ContextPanel region="Chennai Coast" env={{ temperature: 27.3, salinity: 33.8 }} />
          </aside>
        </div>
      </div>

      {/* Optional local styles to keep padding responsive and flush on very large screens */}
      <style jsx>{`
        .page-inner {
          max-width: 100%;
          padding-left: 48px;
          padding-right: 48px;
        }
        @media (max-width: 1280px) {
          .page-inner { padding-left: 24px; padding-right: 24px; }
        }
        @media (max-width: 768px) {
          .page-inner { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>
    </div>
  );
}
