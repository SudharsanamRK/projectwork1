// src/components/PriceCard.jsx
import React from "react";
import { ArrowUpRight, ArrowDownRight, Copy } from "lucide-react";

/**
 * Clean PriceCard (presentational).
 *
 * Props:
 * - item: { species, history: [...] }
 * - onView(item)
 * - onCopy(item)
 *
 * This version intentionally does NOT render small favorite/alert icons on the
 * card surface to keep layout clean. Favorites/Alerts can be managed in the
 * detail modal (or other explicit UI) instead.
 */

const formatUpdatedLabel = (lastUpdated) => {
  if (!lastUpdated) return "No live data";
  try {
    const d = typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated;
    const now = new Date();
    const diff = Math.round((now - d) / 1000); // seconds
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return d.toLocaleString();
  } catch {
    return String(lastUpdated);
  }
};

export default function PriceCard({
  item,
  onView = () => {},
  onCopy = () => {},
  latest = null, // optional { price, updatedAt }
}) {
  const last = item.history[item.history.length - 1];
  const prev = item.history[item.history.length - 2] || last;
  const changeVal = (((last - prev) / Math.max(1, prev)) * 100).toFixed(1);
  const changePositive = Number(changeVal) >= 0;
  const changeStr = `${changePositive ? "+" : ""}${changeVal}%`;
  const updatedLabel = latest ? formatUpdatedLabel(latest.updatedAt) : "No live data";

  return (
    <div
      role="group"
      className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 duration-150 flex flex-col justify-between"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-white truncate">{item.species}</h3>
          <div className="mt-1 text-xs md:text-sm text-slate-400">Market — coastal node</div>
        </div>

        <div className="flex flex-col items-end">
          <div
            className={`inline-flex items-center gap-2 text-sm font-semibold px-2 py-1 rounded-full ${
              changePositive ? "bg-emerald-900/20 text-emerald-300" : "bg-red-900/20 text-red-300"
            }`}
            aria-hidden
          >
            {changePositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span className="tracking-wide">{changeStr}</span>
          </div>
        </div>
      </div>

      {/* Middle big price and live indicator */}
      <div className="mb-3">
        <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
          ₹{last}/kg
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span
            aria-hidden
            className={`w-2 h-2 rounded-full ${latest ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}
          />
          <div className="text-xs md:text-sm text-slate-400">{latest ? `Updated ${updatedLabel}` : updatedLabel}</div>
        </div>
      </div>

      {/* bottom row: actions */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(item)}
            className="px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium"
            title="View details"
          >
            View
          </button>

          <button
            onClick={() => onCopy(item)}
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-slate-200"
            title="Copy"
            aria-label="Copy price"
          >
            <Copy size={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs md:text-sm text-slate-400">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-slate-400">·</span>
            <span>Node: <span className="text-slate-200 ml-1">Chennai</span></span>
          </div>
          <div className="text-slate-400">Updated</div>
        </div>
      </div>

      <div
        className={`mt-4 h-1 rounded-full ${
          changePositive ? "bg-gradient-to-r from-emerald-500 to-emerald-700" : "bg-gradient-to-r from-red-500 to-red-700"
        }`}
      />
    </div>
  );
}
