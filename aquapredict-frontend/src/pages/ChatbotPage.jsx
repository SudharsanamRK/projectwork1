// src/pages/ChatbotPage.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare, Copy, Trash, PlusCircle, Sparkles, Ship, Send, Bot, User, Clock, Zap, TrendingUp, Database } from "lucide-react";

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
  text: "I'm AquaBot! Ask me about fishing conditions, tides, weather, or catch recommendations.",
  ts: new Date().toISOString(),
});

const defaultSessionTitle = () =>
  `Chat • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

/* ---------------- QuickPrompts - REDESIGNED ---------------- */
function QuickPrompts({ onPick }) {
  const prompts = [
    { text: "Where are the best locations to catch mackerel today?"},
    { text: "What is the tide schedule for Chennai tomorrow?"},
    { text: "Is it safe to go fishing with 1.5m waves?"},
    { text: "Recommend bait for tuna in December."},
  ];

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Quick Prompts</h3>
            <p className="text-xs text-slate-400">Get started quickly</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPick(p.text)}
            className="w-full group text-left px-4 py-3.5 bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/30 hover:border-blue-500/50 rounded-xl text-sm transition-all duration-200 flex items-start gap-3"
          >
            <span className="text-xl mt-0.5">{p.icon}</span>
            <span className="flex-1 text-slate-200 group-hover:text-white">{p.text}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2 text-xs text-blue-300">
          <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Click any prompt to populate input field</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SavedChatsPanel - REDESIGNED ---------------- */
function SavedChatsPanel({ sessions, currentSessionId, onNewSession, onOpenSession, onDeleteSession }) {
  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Chat History</h3>
            <p className="text-xs text-slate-400">{sessions.length} conversations</p>
          </div>
        </div>
        <button
          onClick={onNewSession}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors shadow-lg shadow-purple-500/20"
          title="New chat"
        >
          <PlusCircle size={14} />
          New
        </button>
      </div>

      <div className="max-h-72 overflow-auto space-y-2 pr-1 custom-scrollbar">
        {sessions.length === 0 && (
          <div className="text-sm text-slate-400 p-6 text-center bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p>No saved chats yet</p>
            <p className="text-xs mt-1">Start a new conversation</p>
          </div>
        )}

        {sessions.map((s) => {
          const isActive = s.id === currentSessionId;
          return (
            <div
              key={s.id}
              className={`group flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-linear-to-r from-purple-600/20 to-blue-600/20 border-2 border-purple-500/50 shadow-lg" 
                  : "bg-slate-800/40 border border-slate-700/30 hover:bg-slate-700/50 hover:border-slate-600/50"
              }`}
            >
              <button onClick={() => onOpenSession(s.id)} className="flex-1 text-left min-w-0" title={`Open ${s.title}`}>
                <div className={`font-medium truncate text-sm ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                  {s.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-400">
                    {s.updatedAt ? formatTime(s.updatedAt) : formatTime(s.createdAt)}
                  </span>
                </div>
              </button>

              <button
                onClick={() => onDeleteSession(s.id)}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-500/20 border border-transparent hover:border-red-500/50 transition-all opacity-0 group-hover:opacity-100"
                title="Delete chat"
              >
                <Trash size={14} className="text-slate-400 hover:text-red-400" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Database className="w-3.5 h-3.5" />
          <span>Saved locally in your browser</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ChatWindow - REDESIGNED ---------------- */
function ChatWindow({ messages }) {
  return (
    <div className="px-5 py-5 space-y-5">
      {messages.map((m, idx) => {
        const isUser = m.sender === "user";
        return (
          <div key={idx} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              isUser 
                ? "bg-linear-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30" 
                : "bg-linear-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30"
            }`}>
              {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block px-4 py-3 rounded-2xl ${
                  isUser 
                    ? "bg-linear-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-slate-800 text-slate-100 border border-slate-700/50"
                }`}
                style={{ maxWidth: "85%" }}
              >
                {m.sender === "bot" ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">{m.text}</div>
                )}
              </div>

              <div className={`mt-1.5 text-xs flex items-center gap-1.5 ${isUser ? "justify-end" : "justify-start"}`}>
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-slate-500">{formatTime(m.ts)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- MessageInput - REDESIGNED ---------------- */
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
      <div className="flex items-end gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700/50 shadow-xl">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask about fishing, tides, weather, or anything else..."
          className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-slate-500 text-slate-100 max-h-32"
          style={{ minHeight: 40 }}
        />
        <button
          onClick={onSend}
          disabled={sending || !value.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all shadow-lg shadow-blue-500/30"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
      <div className="mt-2 px-2 text-xs text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            Shift+Enter for newline
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Powered by AI
        </div>
      </div>
    </div>
  );
}

/* ---------------- ContextPanel - REDESIGNED ---------------- */
function ContextPanel({ region = "Chennai Coast", env = {} }) {
  const stats = [
    { label: "Temperature", value: `${env.temperature ?? "27.3"}°C`, icon: "🌡️", color: "orange" },
    { label: "Salinity", value: `${env.salinity ?? "33.8"} PSU`, icon: "💧", color: "blue" },
    { label: "Region", value: region, icon: "📍", color: "green" },
  ];

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Context</h3>
            <p className="text-xs text-slate-400">Environmental data</p>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-emerald-500/10 rounded-lg">
          <span className="text-xs font-medium text-emerald-400">LIVE</span>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{stat.label}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className="text-lg font-bold text-white">{stat.value}</div>
          </div>
        ))}

        <div className="bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">Model Info</span>
          </div>
          <div className="text-sm font-medium text-white">AquaBot v1.0</div>
          <div className="text-xs text-slate-400 mt-1">Neural Language Model</div>
        </div>
      </div>

      <button
        onClick={() => {
          const text = `Context: ${region} • Temp ${env.temperature ?? "27.3"}°C • Salinity ${env.salinity ?? "33.8"} PSU`;
          navigator.clipboard?.writeText(text);
          alert("Context copied.");
        }}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-sm font-medium transition-colors"
      >
        <Copy size={14} />
        Copy Context
      </button>
    </div>
  );
}

/* ---------------- Main ChatbotPage - REDESIGNED ---------------- */
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
      console.log("CHAT API RESPONSE:", data); // debug (keep for now)

      const botText =
        data?.reply ||
        data?.text ||
        "Sorry, I couldn't process that.";

      setTimeout(() => {
        const botMsg = {
          sender: "bot",
          text: botText,
          ts: new Date().toISOString(),
        };
        const next2 = [...next, botMsg];
        setMessages(next2);
        persistActiveMessages(next2);
        setSending(false);
      }, 300);
    } catch (err) {
      console.error("Chat error:", err);
      setTimeout(() => {
        const botMsg = {
          sender: "bot",
          text: "⚠️ Server error. Please try later.",
          ts: new Date().toISOString(),
        };
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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-blue-950/20 to-slate-950">

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <QuickPrompts onPick={handlePickPrompt} />
            <SavedChatsPanel
              sessions={sessions}
              currentSessionId={activeSessionId}
              onNewSession={createNewSession}
              onOpenSession={openSession}
              onDeleteSession={deleteSession}
            />
          </div>

          {/* Center - Chat Window (Now takes full remaining width) */}
          <main className="lg:col-span-9">
            <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col" style={{ minHeight: "calc(100vh - 180px)" }}>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">AquaBot Assistant</div>
                      <div className="text-xs text-slate-400">Ready to help</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <ChatWindow messages={messages} />
                {sending && (
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="inline-flex items-center gap-3 rounded-2xl px-4 py-3 bg-slate-800 border border-slate-700/50">
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm text-slate-300">AquaBot is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="px-6 py-5 border-t border-slate-700/50 bg-slate-900/50">
                <MessageInput value={input} onChange={setInput} onSend={sendMessage} sending={sending} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.7);
        }
      `}</style>
    </div>
  );
}