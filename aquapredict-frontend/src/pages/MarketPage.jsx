// src/pages/MarketPage.jsx
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Download, RefreshCw, Search, ArrowUp, ArrowDown, Copy, Phone, Heart, Bell } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useToast } from "../components/ToastNotification";

/**
 * MarketPage.jsx (enhanced)
 * - MASTER_DATA source of truth (same as before)
 * - PriceCard: favorite, alerts, live dot, lastUpdated
 * - Local alerts rules and alerts modal (client-side)
 * - Simulated realtime feed that updates history & triggers alerts (for testing)
 *
 * NOTE: For production replace simulated feed with real websocket and move favorites/alerts to centralized context or backend.
 */

/* =========================
   MASTER DATA (source of truth)
   ========================= */
const makeHistory = (base, jitter = 0.04) => {
  const arr = [];
  let prev = base;
  for (let i = 0; i < 7; i++) {
    const noise = (Math.random() - 0.5) * base * jitter;
    const next = Math.round(Math.max(5, prev + noise));
    arr.push(next);
    prev = next;
  }
  return arr;
};

const MASTER_DATA = [
  { species: "Tuna", base: 320 },
  { species: "Mackerel", base: 180 },
  { species: "Sardine", base: 90 },
  { species: "Pomfret", base: 260 },
  { species: "Crab", base: 420 },
  { species: "Lobster", base: 720 },
  { species: "Anchovy", base: 75 },
  { species: "Seer Fish", base: 380 },
  { species: "Kingfish", base: 300 },
  { species: "Hilsa", base: 650 },
  { species: "Rohu", base: 160 },
  { species: "Catla", base: 150 },
  { species: "Prawns (Tiger)", base: 540 },
  { species: "Prawns (Vannamei)", base: 260 },
  { species: "Butterfish", base: 200 },
  { species: "Barracuda", base: 240 },
  { species: "Cuttlefish", base: 230 },
  { species: "Squid", base: 220 },
  { species: "Anchor (local anchovy)", base: 70 },
  { species: "Kotl (Pomfret variety)", base: 280 },
  { species: "Threadfin", base: 330 },
  { species: "Silverbellies", base: 120 },
  { species: "Mrigal", base: 140 },
  { species: "Catfish (Singhi)", base: 210 },
].map((d) => ({ ...d, history: makeHistory(d.base, 0.06) }));

/* -------------------- helpers -------------------- */
const downloadCSV = (rows = [], filename = "market_export.csv") => {
  if (!rows.length) {
    alert("No rows to export.");
    return;
  }
  const header = Object.keys(rows[0]).join(",") + "\n";
  const body = rows
    .map((r) =>
      Object.values(r)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  const csv = header + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* -------------------- Sparkline (small) -------------------- */
function Sparkline({ data = [], width = 96, height = 36 }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const last = data[data.length - 1];
  const first = data[0];
  const positive = last >= first;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block">
      <polyline
        fill="none"
        stroke={positive ? "#34d399" : "#f87171"}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------- AlertsModal -------------------- */
function AlertsModal({ open, onClose, species, rules, addRule, removeRule }) {
  const [threshold, setThreshold] = useState("");
  const [mode, setMode] = useState("gte");

  useEffect(() => { if (!open) { setThreshold(""); setMode("gte"); } }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Price alerts — {species}</h3>
            <div className="text-xs text-slate-400">Create simple price rules and get notifications</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-md text-white">
              <option value="gte">Notify when ≥</option>
              <option value="lte">Notify when ≤</option>
            </select>
            <input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="Price (₹)" className="bg-slate-800 border border-slate-700 p-2 rounded-md text-white flex-1" />
            <button onClick={() => {
              const num = Number(threshold);
              if (!num) return alert("Enter a valid threshold.");
              addRule({ species, type: mode, threshold: num });
              setThreshold("");
              alert("Alert rule saved (local).");
            }} className="bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded-md text-white">Add</button>
          </div>

          <div>
            <div className="text-sm text-slate-300 mb-2">Active rules</div>
            <div className="space-y-2">
              {rules.filter(r => r.species === species).length ? (
                rules.filter(r => r.species === species).map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 p-2 rounded-md border border-slate-700 text-sm">
                    <div>{r.type === "gte" ? "≥" : "≤"} ₹{r.threshold}</div>
                    <button onClick={() => removeRule(r.id)} className="text-red-400">Delete</button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No rules for this species.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- PriceCard (updated) -------------------- */
function PriceCard({ item, onOpenDetail, onCopy, isFav, toggleFav, openAlertsFor, latestMap }) {
  const last = item.history[item.history.length - 1];
  const prev = item.history[item.history.length - 2] || last;
  const changeVal = (((last - prev) / Math.max(1, prev)) * 100).toFixed(1);
  const changeStr = `${changeVal >= 0 ? "+" : ""}${changeVal}%`;
  const latest = latestMap[item.species] || null; // { price, updatedAt }

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
      {/* top-right action icons */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <button onClick={() => toggleFav(item.species)} className="p-1 rounded-md hover:bg-white/5" title={isFav(item.species) ? "Unfavorite" : "Favorite"}>
          <Heart size={16} className={isFav(item.species) ? "text-pink-400" : "text-slate-400"} />
        </button>

        <button onClick={() => openAlertsFor(item.species)} className="p-1 rounded-md hover:bg-white/5" title="Alerts">
          <Bell size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-300">{item.species}</div>
          <div className="mt-1 text-xl font-semibold text-white">₹{last}/kg</div>
          <div className="text-xs mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${changeVal >= 0 ? "bg-emerald-900/30 text-emerald-300" : "bg-red-900/30 text-red-300"}`}>
              {changeVal >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {changeStr}
            </span>
            <span className="text-xs text-slate-400">· last: ₹{last}</span>
          </div>

          {/* live indicator + lastUpdated */}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${latest ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
            <span className="text-xs text-slate-400">{latest ? `Updated: ${new Date(latest.updatedAt).toLocaleTimeString()}` : "No live data"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button onClick={() => onOpenDetail(item)} className="text-sm px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-medium">View</button>
        <div className="flex items-center gap-2">
          <button onClick={() => onCopy(item)} title="Copy data" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
            <Copy size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Synthetic tide/weather/buyer demo data -------------------- */
function makeTideForecast(region = "Chennai Coast") {
  const now = new Date();
  const days = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      date: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      high: `${(1.4 + Math.random() * 0.8).toFixed(2)} m`,
      highTime: `${(4 + Math.floor(Math.random() * 8))}:00`,
      low: `${(0.2 + Math.random() * 0.6).toFixed(2)} m`,
      lowTime: `${(10 + Math.floor(Math.random() * 8))}:00`,
      waveHeight: (0.5 + Math.random() * 1.2).toFixed(2),
      windKmh: 5 + Math.floor(Math.random() * 18),
      tempC: (25 + Math.floor(Math.random() * 6)),
    });
  }
  return days;
}

const SAMPLE_BUYERS = [
  { name: "Chennai Fish Mart", distKm: 12, lastPriceNote: "High demand for small pelagics", contact: "+91 98765 43210", trend: [210, 215, 218, 220, 222, 224, 224] },
  { name: "Marina Traders", distKm: 6, lastPriceNote: "Buying lobsters & prawns", contact: "+91 99876 54321", trend: [700, 705, 710, 715, 720, 730, 733] },
  { name: "Anna Market Hub", distKm: 18, lastPriceNote: "Focus on pomfret & seer", contact: "+91 91234 56780", trend: [260, 262, 265, 263, 266, 268, 273] },
];

/* -------------------- MarketPage (main) -------------------- */
function MarketPage() {
  const toast = useToast();

  const [data, setData] = useState(MASTER_DATA);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("top_gainers");
  const [selected, setSelected] = useState(null);
  const [chartSpecies, setChartSpecies] = useState(data[0]?.species || "");
  const [tideForecast, setTideForecast] = useState(makeTideForecast());
  const [buyers] = useState(SAMPLE_BUYERS);

  // favorites stored locally (set of species)
  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("fav_species") || "[]"));
    } catch {
      return new Set();
    }
  });

  // alert rules: { id, species, type: 'gte'|'lte', threshold }
  const [rules, setRules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("market_rules") || "[]");
    } catch {
      return [];
    }
  });

  // latestMap stores realtime quick info: { [species]: { price, updatedAt } }
  const [latestMap, setLatestMap] = useState({});

  const addRule = (rule) => {
    const r = { ...rule, id: Date.now() + Math.random() };
    setRules((prev) => {
      const next = [r, ...prev];
      localStorage.setItem("market_rules", JSON.stringify(next));
      return next;
    });
  };

  const removeRule = (id) => {
    setRules((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem("market_rules", JSON.stringify(next));
      return next;
    });
  };

  const toggleFav = (species) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(species)) next.delete(species);
      else next.add(species);
      localStorage.setItem("fav_species", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const isFav = (species) => favorites.has(species);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data.filter((d) => (q ? d.species.toLowerCase().includes(q) : true));
    if (filter === "gainers") list = list.filter((d) => {
      const last = d.history[d.history.length - 1];
      const prev = d.history[d.history.length - 2] || last;
      return last >= prev;
    });
    if (filter === "losers") list = list.filter((d) => {
      const last = d.history[d.history.length - 1];
      const prev = d.history[d.history.length - 2] || last;
      return last < prev;
    });

    if (sortBy === "top_gainers") {
      list = [...list].sort((a, b) => {
        const aLast = a.history[a.history.length - 1];
        const aPrev = a.history[a.history.length - 2] || aLast;
        const bLast = b.history[b.history.length - 1];
        const bPrev = b.history[b.history.length - 2] || bLast;
        return (bLast - bPrev) - (aLast - aPrev);
      });
    } else if (sortBy === "price_desc") list = [...list].sort((a, b) => b.history[b.history.length - 1] - a.history[a.history.length - 1]);
    else if (sortBy === "price_asc") list = [...list].sort((a, b) => a.history[a.history.length - 1] - b.history[b.history.length - 1]);
    else if (sortBy === "alpha") list = [...list].sort((a, b) => a.species.localeCompare(b.species));

    // put favorites to top
    const favs = list.filter((l) => favorites.has(l.species));
    const others = list.filter((l) => !favorites.has(l.species));
    return [...favs, ...others];
  }, [data, query, filter, sortBy, favorites]);

  /* Simulated realtime feed (replace with websocket in future)
     - Updates a random species every ~8-16s
     - Pushes new price into history (shift)
     - Records latestMap[species] = { price, updatedAt }
     - Checks rules and fires toast/desktop notification when matched
  */
  const feedRef = useRef();
  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      if (!mounted) return;
      // pick a random species index
      const idx = Math.floor(Math.random() * data.length);
      const item = data[idx];
      const last = item.history[item.history.length - 1];
      const jitter = Math.round((Math.random() - 0.45) * (last * 0.03)); // smaller jitter
      const next = Math.max(5, last + jitter);
      // update data
      setData((prev) => {
        const copy = prev.map((p, i) => {
          if (i !== idx) return p;
          const history = [...p.history.slice(1), next];
          return { ...p, history };
        });
        return copy;
      });
      const now = new Date().toISOString();
      setLatestMap((prev) => ({ ...prev, [item.species]: { price: next, updatedAt: now } }));

      // check rules
      const matches = rules.filter((r) => r.species === item.species).filter((r) => {
        if (r.type === "gte") return next >= r.threshold;
        return next <= r.threshold;
      });
      matches.forEach((rule) => {
        // toast
        toast?.success(`${rule.species} ${rule.type === "gte" ? "≥" : "≤"} ₹${rule.threshold} (Now ₹${next})`);
        // desktop notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`${rule.species} price alert`, { body: `₹${next} — ${rule.type === "gte" ? "above" : "below"} ${rule.threshold}` });
        }
      });

      // schedule next tick in 8-16s
      const delay = 8000 + Math.floor(Math.random() * 8000);
      feedRef.current = setTimeout(tick, delay);
    };

    // start initial tick
    feedRef.current = setTimeout(tick, 3000);
    return () => {
      mounted = false;
      clearTimeout(feedRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules, toast, data.length]); // depend on rules and toast

  // helper: request permission for notifications when user first opens alerts modal
  const requestNotificationPermission = useCallback(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission().then((res) => {
      if (res === "granted") toast?.info("Desktop notifications enabled");
    });
  }, [toast]);

  const handleRefresh = useCallback(() => {
    setData((prev) =>
      prev.map((item) => {
        const last = item.history[item.history.length - 1];
        const jitter = Math.round((Math.random() - 0.45) * (last * 0.02));
        const next = Math.max(5, last + jitter);
        const history = [...item.history.slice(1), next];
        return { ...item, history };
      })
    );
    setTideForecast(makeTideForecast());
    localStorage.setItem("market_lastSaved", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("page-meta-update", {
      detail: { autoSaved: new Date().toLocaleTimeString() }
    }));
  }, []);

  const handleExportVisible = useCallback(() => {
    const rows = visible.map((d) => ({ species: d.species, last: d.history[d.history.length - 1], history: d.history.join("|") }));
    downloadCSV(rows, "aquapredict_market_visible.csv");
  }, [visible]);

  const handleCopyVisibleJSON = useCallback(() => {
    const payload = visible.map((d) => ({ species: d.species, last: d.history[d.history.length - 1], history: d.history }));
    try {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      alert("Visible market data copied as JSON.");
    } catch {
      alert("Copy failed.");
    }
  }, [visible]);

  useEffect(() => {
    const onExport = () => handleExportVisible();
    const onCopy = () => handleCopyVisibleJSON();
    const onToggleNotes = () => alert("Notes toggled (header button). Implement notes drawer if needed.");
    const onRefresh = () => handleRefresh();

    window.addEventListener("export-csv", onExport);
    window.addEventListener("copy-json", onCopy);
    window.addEventListener("toggle-notes", onToggleNotes);
    window.addEventListener("header-refresh", onRefresh);

    return () => {
      window.removeEventListener("export-csv", onExport);
      window.removeEventListener("copy-json", onCopy);
      window.removeEventListener("toggle-notes", onToggleNotes);
      window.removeEventListener("header-refresh", onRefresh);
    };
  }, [handleExportVisible, handleCopyVisibleJSON, handleRefresh]);

  useEffect(() => {
    const meta = {
      page: "market",
      title: "Market Trends",
      subtitle: "Track market price forecasts",
      autoSaved: localStorage.getItem("market_lastSaved") ? new Date(localStorage.getItem("market_lastSaved")).toLocaleTimeString() : null,
      actions: { notes: true, exportCsv: true, copyJson: true, refresh: true }
    };
    window.dispatchEvent(new CustomEvent("page-meta", { detail: meta }));
    const interval = setInterval(() => {
      const t = localStorage.getItem("market_lastSaved");
      window.dispatchEvent(new CustomEvent("page-meta-update", { detail: { autoSaved: t ? new Date(t).toLocaleTimeString() : null } }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    const species = data.find((d) => d.species === chartSpecies) || data[0];
    if (!species) return [];
    return species.history.map((price, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return { date: label, price };
    });
  }, [data, chartSpecies]);

  const openDetail = (item) => {
    setSelected(item);
    setChartSpecies(item.species);
  };
  const closeDetail = () => setSelected(null);
  const handleCopyItem = (item) => {
    const text = `${item.species} — ₹${item.history[item.history.length - 1]}/kg (last)`;
    navigator.clipboard?.writeText(text);
    alert(`Copied: ${text}`);
  };

  useEffect(() => {
    if (!chartSpecies && visible.length) setChartSpecies(visible[0].species);
    if (chartSpecies && !visible.find((v) => v.species === chartSpecies) && visible.length) {
      setChartSpecies(visible[0].species);
    }
  }, [visible, chartSpecies]);

  // Alerts modal state
  const [alertsOpenFor, setAlertsOpenFor] = useState(null);
  const openAlertsFor = (species) => {
    requestNotificationPermission();
    setAlertsOpenFor(species);
  };
  const closeAlerts = () => setAlertsOpenFor(null);

  return (
    <div className="p-6 min-h-screen bg-[#071025] text-white">
      <div className="max-w-screen-2xl mx-auto">
        {/* Top controls */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search species..."
                className="pl-10 pr-3 py-2 rounded-lg bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none"
              />
              <div className="absolute left-3 top-2.5 text-slate-500"><Search size={16} /></div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              <button onClick={() => setFilter("all")} className={`px-3 py-2 rounded-md text-sm ${filter === "all" ? "bg-sky-600 text-white" : "text-slate-300"}`}>All</button>
              <button onClick={() => setFilter("gainers")} className={`px-3 py-2 rounded-md text-sm ${filter === "gainers" ? "bg-emerald-600 text-white" : "text-slate-300"}`}>Gainers</button>
              <button onClick={() => setFilter("losers")} className={`px-3 py-2 rounded-md text-sm ${filter === "losers" ? "bg-red-600 text-white" : "text-slate-300"}`}>Losers</button>
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg bg-slate-800 text-white px-3 py-2">
              <option value="top_gainers">Top movers</option>
              <option value="price_desc">Price (high → low)</option>
              <option value="price_asc">Price (low → high)</option>
              <option value="alpha">A → Z</option>
            </select>

            <button onClick={handleRefresh} title="Refresh (mock)" className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700">
              <RefreshCw size={16} />
            </button>

            <button onClick={handleExportVisible} title="Export visible" className="px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Chart + cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* large chart area + new bottom widgets */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Price Trend</h3>
                <div className="text-xs text-slate-400">Last 7 days — select species to focus</div>
              </div>

              <div className="flex items-center gap-2">
                <select value={chartSpecies} onChange={(e) => setChartSpecies(e.target.value)} className="rounded-lg bg-slate-800 text-white px-3 py-2">
                  {visible.map((d) => <option key={d.species} value={d.species}>{d.species}</option>)}
                </select>
              </div>
            </div>

            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="#0f1724" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} />
                  <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: "#94a3b8" }} />
                  <Tooltip formatter={(value) => [`₹${value}`, "Price"]} />
                  <Legend wrapperStyle={{ color: "#9ca3af" }} />
                  <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* NEW: two useful widgets under the chart */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tide & Weather Snapshot */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-white">Tide & Weather Snapshot</div>
                    <div className="text-xs text-slate-400">Next 3 days — quick operational view</div>
                  </div>
                  <div className="text-xs text-slate-400">{new Date().toLocaleDateString()}</div>
                </div>

                <div className="space-y-3 mt-3">
                  {tideForecast.map((t, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{t.date}</div>
                        <div className="text-xs text-slate-400">{t.highTime} high · {t.lowTime} low</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-sky-300">H: {t.high}</div>
                        <div className="text-xs text-slate-300">L: {t.low}</div>
                        <div className="text-xs text-slate-400 mt-1">Wave: {t.waveHeight} m · Wind: {t.windKmh} km/h</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs text-slate-400">Tip: Plan 1–2 hours around the high/low tide windows. Check regional warnings before departure.</div>
              </div>

              {/* Local Buyers & Landing Markets */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-white">Nearby Buyers & Markets</div>
                    <div className="text-xs text-slate-400">Quick contacts & recent demand trend</div>
                  </div>
                </div>

                <div className="space-y-3 mt-2 flex-1 overflow-auto pr-1">
                  {buyers.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 rounded-md p-2 border border-slate-800">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{b.name}</div>
                        <div className="text-xs text-slate-400">{b.distKm} km · {b.lastPriceNote}</div>
                        <div className="text-xs text-slate-400 mt-1">{b.contact}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-slate-400">Trend</div>
                        <div className="flex items-center gap-2">
                          <Sparkline data={b.trend} width={80} height={28} />
                          <button onClick={() => { navigator.clipboard?.writeText(b.contact); toast?.info(`Copied contact: ${b.contact}`); }} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600">
                            <Phone size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => toast?.info("Notify buyers (demo)")} className="flex-1 py-2 rounded-md bg-sky-600 text-white">Notify Buyers</button>
                  <button onClick={() => downloadCSV(buyers.map(b => ({ name: b.name, contact: b.contact, distKm: b.distKm })), "buyers_export.csv")} className="py-2 px-3 rounded-md bg-slate-700">Export</button>
                </div>
              </div>
            </div>
          </div>

          {/* cards list */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {visible.length ? visible.map((item) => (
              <PriceCard
                key={item.species}
                item={item}
                onOpenDetail={openDetail}
                onCopy={handleCopyItem}
                isFav={isFav}
                toggleFav={toggleFav}
                openAlertsFor={openAlertsFor}
                latestMap={latestMap}
              />
            )) : (
              <div className="col-span-full text-center text-slate-400">No species match your filter/search.</div>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-400">
          Showing <span className="font-semibold text-white">{visible.length}</span> of <span className="font-semibold text-white">{data.length}</span> species.
        </div>

        {/* modal detail */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selected.species}</h3>
                  <div className="text-sm text-slate-400">Last: ₹{selected.history[selected.history.length - 1]}/kg</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => { navigator.clipboard?.writeText(`${selected.species} - ${selected.history[selected.history.length - 1]}`); toast?.info("Copied to clipboard!"); }} className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white flex items-center gap-2">
                    <Copy size={14} /> Copy
                  </button>
                  <button onClick={closeDetail} className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">Close</button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-slate-400 mb-2">Short-term price history</div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={selected.history.map((p, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return { date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), price: p };
                      })}>
                        <CartesianGrid stroke="#0f1724" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} />
                        <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: "#94a3b8" }} />
                        <Tooltip formatter={(value) => [`₹${value}`, "Price"]} />
                        <Line type="monotone" dataKey="price" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">Market notes</div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-sm text-slate-300 space-y-2">
                    <p><strong>Supply:</strong> Local landings and seasonality affect prices. Use the trend chart for timing.</p>
                    <p><strong>Demand:</strong> Restaurants & exporters drive short-term spikes.</p>
                    <p><strong>Advice:</strong> If price has risen steadily for the last 3 days, consider scheduling sales; if falling, hold or look for better timing.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { downloadCSV([{ species: selected.species, price: selected.history[selected.history.length - 1], history: selected.history.join("|") }], `${selected.species}_export.csv`); toast?.info("Exported selected species"); }} className="px-4 py-2 rounded-md bg-sky-600 text-white">Export</button>
                <button onClick={closeDetail} className="px-4 py-2 rounded-md bg-white/5 text-white">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts modal */}
        <AlertsModal
          open={!!alertsOpenFor}
          onClose={closeAlerts}
          species={alertsOpenFor}
          rules={rules}
          addRule={addRule}
          removeRule={removeRule}
        />
      </div>
    </div>
  );
}

export default MarketPage;
