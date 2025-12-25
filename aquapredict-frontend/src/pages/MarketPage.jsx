// src/pages/MarketPage.jsx - REDESIGNED
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Download, RefreshCw, Search, ArrowUp, ArrowDown, Copy, Phone, Heart, Bell, TrendingUp, Filter, X, Activity, DollarSign, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useToast } from "../components/ToastNotification";

/* ==================== DATA & HELPERS ==================== */
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
].map((d) => ({ ...d, history: makeHistory(d.base, 0.06) }));

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

function makeTideForecast() {
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
  { name: "Chennai Fish Mart", distKm: 12, lastPriceNote: "High demand for small pelagics", contact: "+91 98765 43210" },
  { name: "Marina Traders", distKm: 6, lastPriceNote: "Buying lobsters & prawns", contact: "+91 99876 54321" },
  { name: "Anna Market Hub", distKm: 18, lastPriceNote: "Focus on pomfret & seer", contact: "+91 91234 56780" },
];

/* ==================== COMPONENTS ==================== */

/* Stats Card */
function StatCard({ icon: Icon, label, value, change, color = "blue" }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50 shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-bold text-white mt-1">{value}</div>
      </div>
    </div>
  );
}

/* Price Card - Redesigned */
function PriceCard({ item, onOpenDetail, isFav, toggleFav, openAlertsFor, latestMap }) {
  const last = item.history[item.history.length - 1];
  const prev = item.history[item.history.length - 2] || last;
  const changeVal = (((last - prev) / Math.max(1, prev)) * 100).toFixed(1);
  const isPositive = changeVal >= 0;
  const latest = latestMap[item.species] || null;

  return (
    <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300">
      {/* Top Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => toggleFav(item.species)}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 backdrop-blur-sm transition-colors"
        >
          <Heart size={14} className={isFav(item.species) ? "text-pink-400 fill-pink-400" : "text-slate-400"} />
        </button>
        <button
          onClick={() => openAlertsFor(item.species)}
          className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 backdrop-blur-sm transition-colors"
        >
          <Bell size={14} className="text-slate-400" />
        </button>
      </div>

      {/* Species Name */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">{item.species}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${latest ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-400">
            {latest ? new Date(latest.updatedAt).toLocaleTimeString() : 'No live data'}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-white">₹{last}</div>
        <div className="text-sm text-slate-400">per kg</div>
      </div>

      {/* Change Badge */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {isPositive ? <TrendingUp size={14} /> : <ArrowDown size={14} />}
          <span className="font-semibold">{isPositive ? '+' : ''}{changeVal}%</span>
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="mb-4 h-12 flex items-end gap-1">
        {item.history.map((val, idx) => {
          const max = Math.max(...item.history);
          const height = (val / max) * 100;
          return (
            <div
              key={idx}
              className={`flex-1 rounded-t transition-all ${isPositive ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Actions */}
      <button
        onClick={() => onOpenDetail(item)}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
      >
        View Details
      </button>
    </div>
  );
}

/* Alerts Modal */
function AlertsModal({ open, onClose, species, rules, addRule, removeRule }) {
  const [threshold, setThreshold] = useState("");
  const [mode, setMode] = useState("gte");

  useEffect(() => {
    if (!open) {
      setThreshold("");
      setMode("gte");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Price Alerts</h3>
            <p className="text-sm text-slate-400 mt-1">{species} • Set notification rules</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Add Rule Form */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gte">When ≥</option>
              <option value="lte">When ≤</option>
            </select>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Price (₹)"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                const num = Number(threshold);
                if (!num) return alert("Enter a valid threshold.");
                addRule({ species, type: mode, threshold: num });
                setThreshold("");
                alert("Alert rule saved!");
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white font-semibold transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {/* Active Rules */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Active Rules</h4>
          <div className="space-y-2 max-h-48 overflow-auto">
            {rules.filter(r => r.species === species).length ? (
              rules.filter(r => r.species === species).map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-white">
                      {r.type === "gte" ? "≥" : "≤"} ₹{r.threshold}
                    </span>
                  </div>
                  <button
                    onClick={() => removeRule(r.id)}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">
                No rules set for this species
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== MAIN PAGE ==================== */
export default function MarketPage() {
  const toast = useToast();

  const [data, setData] = useState(MASTER_DATA);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("top_gainers");
  const [selected, setSelected] = useState(null);
  const [chartSpecies, setChartSpecies] = useState(data[0]?.species || "");
  const [tideForecast] = useState(makeTideForecast());
  const [buyers] = useState(SAMPLE_BUYERS);

  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("fav_species") || "[]"));
    } catch {
      return new Set();
    }
  });

  const [rules, setRules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("market_rules") || "[]");
    } catch {
      return [];
    }
  });

  const [latestMap, setLatestMap] = useState({});
  const [alertsOpenFor, setAlertsOpenFor] = useState(null);

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
    
    if (filter === "gainers") {
      list = list.filter((d) => {
        const last = d.history[d.history.length - 1];
        const prev = d.history[d.history.length - 2] || last;
        return last >= prev;
      });
    }
    if (filter === "losers") {
      list = list.filter((d) => {
        const last = d.history[d.history.length - 1];
        const prev = d.history[d.history.length - 2] || last;
        return last < prev;
      });
    }

    if (sortBy === "top_gainers") {
      list = [...list].sort((a, b) => {
        const aLast = a.history[a.history.length - 1];
        const aPrev = a.history[a.history.length - 2] || aLast;
        const bLast = b.history[b.history.length - 1];
        const bPrev = b.history[b.history.length - 2] || bLast;
        return (bLast - bPrev) - (aLast - aPrev);
      });
    } else if (sortBy === "price_desc") {
      list = [...list].sort((a, b) => b.history[b.history.length - 1] - a.history[a.history.length - 1]);
    } else if (sortBy === "price_asc") {
      list = [...list].sort((a, b) => a.history[a.history.length - 1] - b.history[b.history.length - 1]);
    } else if (sortBy === "alpha") {
      list = [...list].sort((a, b) => a.species.localeCompare(b.species));
    }

    const favs = list.filter((l) => favorites.has(l.species));
    const others = list.filter((l) => !favorites.has(l.species));
    return [...favs, ...others];
  }, [data, query, filter, sortBy, favorites]);

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
    toast?.success("Market data refreshed");
  }, [toast]);

  const openAlertsFor = (species) => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setAlertsOpenFor(species);
  };

  // Top movers calculation
  const topGainer = useMemo(() => {
    let max = null;
    let maxChange = -Infinity;
    data.forEach(d => {
      const last = d.history[d.history.length - 1];
      const prev = d.history[d.history.length - 2] || last;
      const change = last - prev;
      if (change > maxChange) {
        maxChange = change;
        max = d;
      }
    });
    return max;
  }, [data]);

  const avgPrice = useMemo(() => {
    const sum = data.reduce((acc, d) => acc + d.history[d.history.length - 1], 0);
    return Math.round(sum / data.length);
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={DollarSign}
            label="Avg Market Price"
            value={`₹${avgPrice}`}
            change={2.4}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Top Gainer"
            value={topGainer?.species || "N/A"}
            change={5.8}
            color="emerald"
          />
          <StatCard
            icon={Activity}
            label="Active Species"
            value={data.length}
            color="purple"
          />
          <StatCard
            icon={Heart}
            label="Favorites"
            value={favorites.size}
            color="pink"
          />
        </div>

        {/* Filters & Search */}
        <div className="mb-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search species..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("gainers")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "gainers" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Gainers
                </button>
                <button
                  onClick={() => setFilter("losers")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "losers" ? "bg-rose-600 text-white" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Losers
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="top_gainers">Top Movers</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="alpha">A → Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* Main Chart */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Price Trend Analysis</h3>
                  <p className="text-sm text-slate-400 mt-1">7-day historical data</p>
                </div>
                <select
                  value={chartSpecies}
                  onChange={(e) => setChartSpecies(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                >
                  {data.map((d) => (
                    <option key={d.species} value={d.species}>
                      {d.species}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} />
                    <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`₹${value}`, "Price"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tide & Buyers Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tide Forecast */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Tide & Weather</h3>
                <div className="space-y-3">
                  {tideForecast.map((t, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{t.date}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {t.highTime} high · {t.lowTime} low
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-cyan-400">H: {t.high}</div>
                          <div className="text-xs text-slate-400">Wave: {t.waveHeight}m</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyers */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Nearby Buyers</h3>
                <div className="space-y-3">
                  {buyers.map((b, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{b.name}</div>
                          <div className="text-xs text-slate-400 mt-1">{b.distKm} km away</div>
                          <div className="text-xs text-slate-500 mt-1">{b.lastPriceNote}</div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(b.contact);
                            toast?.success(`Copied: ${b.contact}`);
                          }}
                          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-slate-300" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Species Cards Grid */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 gap-4 max-h-[calc(100vh-200px)] overflow-auto pr-2 custom-scrollbar">
              {visible.length ? (
                visible.map((item) => (
                  <PriceCard
                    key={item.species}
                    item={item}
                    onOpenDetail={(item) => setSelected(item)}
                    isFav={isFav}
                    toggleFav={toggleFav}
                    openAlertsFor={openAlertsFor}
                    latestMap={latestMap}
                  />
                ))
              ) : (
                <div className="text-center text-slate-400 py-12">
                  No species match your filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selected.species}</h3>
                <p className="text-slate-400 mt-1">
                  Current: ₹{selected.history[selected.history.length - 1]}/kg
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={selected.history.map((p, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return {
                      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                      price: p,
                    };
                  })}
                >
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} />
                  <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`₹${value}`, "Price"]}
                  />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  downloadCSV(
                    [{ species: selected.species, price: selected.history[selected.history.length - 1] }],
                    `${selected.species}_export.csv`
                  );
                  toast?.success("Exported!");
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      <AlertsModal
        open={!!alertsOpenFor}
        onClose={() => setAlertsOpenFor(null)}
        species={alertsOpenFor}
        rules={rules}
        addRule={addRule}
        removeRule={removeRule}
      />

      {/* Custom Scrollbar */}
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