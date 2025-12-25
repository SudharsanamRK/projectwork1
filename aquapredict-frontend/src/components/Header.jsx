import React, { useEffect, useRef } from "react";
import {
  Bell,
  User,
  Clock,
  Share2,
  Plus,
  Link2,
  FileText,
  Save,
  ChevronDown,
} from "lucide-react";

/* =========================
   Page Titles & Subtitles
========================= */
const titles = {
  dashboard: "Sector Intelligence",
  prediction: "Biological Forecasts",
  market: "Commercial Analytics",
  environment: "Marine Conditions",
  chatbot: "AquaBot AI",
  fishpredictor: "Harvest Strategy",
};

const subtitles = {
  dashboard: "Real-time maritime telemetry",
  prediction: "Species migration & population modeling",
  market: "Economic trends & price projections",
  environment: "Oceanographic data & tidal patterns",
  chatbot: "Intelligent maritime assistance",
  fishpredictor: "Sustainable ecological management",
};

export default function Header(props) {
  const {
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

  /* ---------------- Safe Event Emitting ---------------- */
  const emitOrCall = (cb, evtName, detail) => () => {
    if (typeof cb === "function") cb(detail);
    else window.dispatchEvent(new CustomEvent(evtName, { detail }));
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

  return (
    <header
      ref={rootRef}
      className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800/60 px-8 py-4"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        
        {/* LEFT: TITLE SECTION */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {titles[page] || "AquaPredict"}
            </h1>
            {page === "chatbot" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                Beta
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500">
            {subtitles[page] || ""}
          </p>
        </div>

        {/* RIGHT: ACTIONS (Dividers removed for a cleaner look) */}
        <div className="flex items-center gap-6">
          
          {/* Contextual Model Selector for Chatbot */}
          {page === "chatbot" && (
            <div className="relative hidden md:block">
              <select
                onChange={handleModelChange}
                defaultValue="AquaBot v1.0"
                className="appearance-none bg-slate-900/50 border border-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider pl-4 pr-10 py-2 rounded-xl outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
              >
                <option>AquaBot v1.0</option>
                <option>EcoLens v0.9</option>
                <option>MarketSense v0.8</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
            </div>
          )}

          {/* Action Group */}
          <div className="flex items-center gap-2">
            {page === "chatbot" ? (
              <>
                <IconBtn icon={Plus} onClick={doNewChat} tooltip="New Session" />
                <IconBtn icon={Share2} onClick={doShare} tooltip="Share" />
                <IconBtn icon={FileText} onClick={doExportJSON} tooltip="Export" />
                <IconBtn icon={Save} onClick={doToggleNotes} color="text-cyan-400" tooltip="Toggle Notes" />
              </>
            ) : (
              (page === "prediction" || page === "fishpredictor") && (
                <>
                   <div className="hidden lg:flex items-center gap-2 px-3 py-2 mr-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Live Sync
                    </span>
                  </div>
                  <button
                    onClick={doToggleNotes}
                    className="hidden sm:flex items-center px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  >
                    Notes
                  </button>
                  <PrimaryBtn icon={FileText} label="Export JSON" onClick={doExportJSON} />
                </>
              )
            )}
          </div>

          {/* User & Notifications */}
          <div className="flex items-center gap-3">
            <NotifBell />
            <Avatar />
          </div>
        </div>
      </div>
    </header>
  );
}

/* =====================================================
   REFINED UI HELPERS
===================================================== */

const IconBtn = ({ icon: Icon, onClick, tooltip, color = "text-slate-400" }) => (
  <button
    onClick={onClick}
    title={tooltip}
    className={`p-2.5 rounded-xl bg-transparent hover:bg-slate-800/60 border border-transparent transition-all ${color} hover:text-white`}
  >
    <Icon size={18} />
  </button>
);

const PrimaryBtn = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-4 py-2 rounded-xl text-cyan-400 text-[11px] font-bold uppercase tracking-wider transition-all"
  >
    <Icon size={14} /> {label}
  </button>
);

const NotifBell = () => (
  <button className="relative p-2.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all">
    <Bell size={20} />
    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#020617]" />
  </button>
);

const Avatar = () => (
  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer hover:border-cyan-400/50 transition-all group">
    <User size={18} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
  </div>
);