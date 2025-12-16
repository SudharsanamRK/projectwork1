// src/components/Header.jsx
import React, { useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  User,
  Clock,
  Share2,
  Plus,
  Link2,
  FileText,
  Save,
} from "lucide-react";

/*
  Header props:
    - toggleSidebar()
    - page               // 'chatbot' | 'dashboard' | 'prediction' | ...
    - onExportJSON()
    - onCopyLink()
    - onShare()
    - onNewChat()
    - onToggleNotes()
    - onModelChange(value)
    - lastSaved (optional)
*/

const titles = {
  dashboard: "Dashboard Overview",
  prediction: "Fish Prediction",
  market: "Market Trends",
  environment: "Environment Analytics",
  chatbot: "AI Chatbot",
  fishpredictor: "Sustainable Harvest Planner",
};

const subtitles = {
  dashboard: "Monitor your aquaculture analytics",
  prediction: "Predict your next fish catch",
  market: "Track market price forecasts",
  environment: "Analyze sea conditions & tides",
  chatbot: "Your fishing AI assistant",
  fishpredictor: "Plan harvests that balance revenue and conservation",
};

export default function Header(props) {
  const {
    toggleSidebar,
    page = "dashboard",
    onExportJSON,
    onCopyLink,
    onShare,
    onNewChat,
    onToggleNotes,
    onModelChange,
    lastSaved,
  } = props;

  const rootRef = useRef(null);

  // Resolve lastSaved from props/localStorage when not provided
  let lastSavedLocal = lastSaved || null;
  if (!lastSavedLocal) {
    if (page === "fishpredictor")
      lastSavedLocal =
        localStorage.getItem("harvestPlannerLastSaved") || null;
    else if (page === "prediction")
      lastSavedLocal = localStorage.getItem("aq_lastSaved") || null;
    else if (page === "chatbot")
      lastSavedLocal = localStorage.getItem("chat_lastSaved") || null;
  }

  // Graceful caller / event emitter
  const emitOrCall = (cb, evtName, detail = undefined) => () => {
    if (typeof cb === "function") {
      try {
        cb(detail);
      } catch (err) {
        // don't crash header
        // eslint-disable-next-line no-console
        console.error("Header callback error:", err);
      }
    } else {
      window.dispatchEvent(new CustomEvent(evtName, { detail }));
    }
  };

  const doExportJSON = emitOrCall(onExportJSON, "export-json");
  const doCopyLink = emitOrCall(onCopyLink, "copy-link");
  const doShare = emitOrCall(onShare, "share-chat");
  const doNewChat = emitOrCall(onNewChat, "new-chat");
  const doToggleNotes = emitOrCall(onToggleNotes, "toggle-notes");

  const handleModelChange = (e) => {
    const value = e.target.value;
    if (typeof onModelChange === "function") onModelChange(value);
    else window.dispatchEvent(new CustomEvent("model-change", { detail: value }));
  };

  // Listen for page-meta so other pages can toggle compact header mode
  useEffect(() => {
    const handler = (e) => {
      const compact = !!e?.detail?.compactTopbar;
      if (rootRef.current) rootRef.current.classList.toggle("compact", compact);
    };
    window.addEventListener("page-meta", handler);
    return () => window.removeEventListener("page-meta", handler);
  }, []);

  // ---------------- COMPACT HEADER for chatbot (full) ----------------
  if (page === "chatbot") {
    return (
      <header
        ref={rootRef}
        className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-2 sticky top-0 z-30"
        aria-label="AquaBot header"
      >
        <div className="flex items-center justify-between gap-4">
          {/* left: menu + brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">
                  AquaBot
                </h1>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Your fishing AI assistant
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-0.5 hidden md:block">
                {lastSavedLocal
                  ? `Auto-saved • ${new Date(lastSavedLocal).toLocaleTimeString()}`
                  : "Auto-saved • —"}
              </div>
            </div>
          </div>

          {/* right: compact actions (full set) */}
          <div className="flex items-center gap-2">
            {/* model select (compact) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-transparent px-2 py-1 rounded">
              <label htmlFor="model-select" className="sr-only">
                Model
              </label>
              <select
                id="model-select"
                onChange={handleModelChange}
                defaultValue="AquaBot v1.0"
                className="bg-transparent text-sm outline-none text-slate-200"
                aria-label="Select model"
              >
                <option>AquaBot v1.0</option>
                <option>EcoLens v0.9</option>
                <option>MarketSense v0.8</option>
              </select>
            </div>

            <button
              onClick={doNewChat}
              title="New chat"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="New chat"
            >
              <Plus size={16} />
            </button>

            <button
              onClick={doShare}
              title="Share chat"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Share chat"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={doExportJSON}
              title="Export JSON"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Export JSON"
            >
              <FileText size={16} />
            </button>

            <button
              onClick={doCopyLink}
              title="Copy link"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Copy link"
            >
              <Link2 size={16} />
            </button>

            <button
              onClick={doToggleNotes}
              title="Notes"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Toggle notes"
            >
              <Save size={16} />
            </button>

            <div className="relative">
              <button
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </div>

            <div className="w-8 h-8 rounded-full bg-linear-to-r from-sky-400 to-blue-500 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ---------------- COMPACT HEADER for prediction (only share/export/copy/notes + avatar) ----------------
  if (page === "prediction") {
    return (
      <header
        ref={rootRef}
        className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-2 sticky top-0 z-30"
        aria-label="Fish Prediction header"
      >
        <div className="flex items-center justify-between gap-4">
          {/* left: menu + brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">
                  Fish Prediction
                </h1>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Predict your next fish catch
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-0.5 hidden md:block">
                {lastSavedLocal
                  ? `Auto-saved • ${new Date(lastSavedLocal).toLocaleTimeString()}`
                  : "Auto-saved • —"}
              </div>
            </div>
          </div>

          {/* right: only Share, Export, Copy, Notes, and user avatar */}
          <div className="flex items-center gap-2">
            <button
              onClick={doShare}
              title="Share forecast"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Share forecast"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={doExportJSON}
              title="Export JSON"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Export JSON"
            >
              <FileText size={16} />
            </button>

            <button
              onClick={doCopyLink}
              title="Copy link"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Copy link"
            >
              <Link2 size={16} />
            </button>

            <button
              onClick={doToggleNotes}
              title="Notes"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Toggle notes"
            >
              <Save size={16} />
            </button>

            <div className="w-8 h-8 rounded-full bg-linear-to-r from-sky-400 to-blue-500 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ---------------- DEFAULT (other pages) ----------------
  return (
    <header
      ref={rootRef}
      className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700 px-6 py-3 sticky top-0 z-30"
      aria-label="App header"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {titles[page] || "AquaPredict"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitles[page] || ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(page === "prediction" || page === "fishpredictor") && (
            <>
              <div className="hidden sm:flex items-center text-xs text-slate-400 bg-slate-800/30 px-3 py-2 rounded-md">
                <Clock size={12} className="mr-2" />
                <div>
                  Auto-saved:&nbsp;
                  <span className="text-slate-200">
                    {lastSavedLocal ? new Date(lastSavedLocal).toLocaleTimeString() : "—"}
                  </span>
                </div>
              </div>

              <button
                onClick={doToggleNotes}
                className="hidden sm:inline-flex items-center px-3 py-2 rounded-md hover:bg-slate-800 bg-slate-800 text-slate-200"
                title="Toggle notes"
              >
                Notes
              </button>

              <button
                onClick={doExportJSON}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded-md text-white"
                title="Export CSV/JSON"
              >
                <FileText size={14} /> Export
              </button>

              <button
                onClick={doCopyLink}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-md text-white"
                title="Copy JSON"
              >
                <Link2 size={14} /> Copy JSON
              </button>
            </>
          )}

          <button
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-9 h-9 bg-linear-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center cursor-pointer">
            <User size={16} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
