// DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getJSON, FLASK } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Waves,
  Droplets,
  AlertCircle,
  DownloadCloud,
  Bell,
  Search,
  User,
  CloudMoon,
} from "lucide-react";

/* 
  Change: this component accepts a `showHeader` prop (default: false).
  - Default behavior: header is hidden (useful when your app shell already renders top nav).
  - Pass showHeader={true} to render the dashboard header inside this component.
*/

function StatCard({ title, value, sub, colorClass = "text-white", icon }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 shadow flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-400">{title}</div>
          <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
          {sub && <div className="text-slate-400 text-sm mt-1">{sub}</div>}
        </div>
        <div className="text-slate-500">{icon}</div>
      </div>
    </div>
  );
}

function MiniSparkline({ data = [], dataKey = "value", height = 40 }) {
  if (!data || data.length === 0) return <div className="text-slate-400 text-sm">—</div>;
  return (
    <div style={{ width: 120, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area dataKey={dataKey} stroke="#4fd1c5" fill="#0f172a" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function detectAnomalies(series = [], key = "price", threshold = 2) {
  if (!series || series.length < 2) return [];
  const vals = series.map((d) => d[key]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  const sd = Math.sqrt(variance);
  return series
    .map((d) => {
      const z = sd === 0 ? 0 : (d[key] - mean) / sd;
      return { ...d, z, anomaly: Math.abs(z) >= threshold };
    })
    .filter((d) => d.anomaly);
}

function ExportCSVButton({ filename = "report.csv", rows = [], fields = [] }) {
  const handleExport = () => {
    if (!rows || !rows.length) return;
    const header = fields.join(",");
    const csv = [
      header,
      ...rows.map((r) => fields.map((f) => JSON.stringify(r[f] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={handleExport}
      className="bg-slate-800 border border-slate-700 p-2 rounded-md flex items-center gap-2"
      title="Export CSV"
    >
      <DownloadCloud size={16} /> Export CSV
    </button>
  );
}

function AlertsList({ alerts = [] }) {
  return (
    <div className="bg-slate-900 p-4 rounded-2xl shadow space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Alerts</h4>
        <div className="text-slate-400 text-sm">{alerts.length} new</div>
      </div>
      <div className="space-y-2">
        {alerts.slice(0, 5).map((a, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-slate-800">
              <AlertCircle size={18} />
            </div>
            <div>
              <div className="text-sm font-medium">{a.title}</div>
              <div className="text-xs text-slate-400">{a.detail}</div>
            </div>
            <div className="ml-auto text-xs text-slate-500">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataTable({ rows = [], columns = [] }) {
  return (
    <div className="bg-slate-900 p-3 rounded-2xl shadow overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-slate-400 text-left">
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-4">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((r, i) => (
            <tr key={i} className="border-t border-slate-800">
              {columns.map((c) => (
                <td key={c.key} className="py-3 pr-4">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdaptivePredictionLens({ env = {}, marketSeries = [] }) {
  const score = useMemo(() => {
    const tempScore = env.temperature ? Math.max(0, 1 - Math.abs(28 - env.temperature) / 10) : 0;
    const salinityScore = env.salinity ? 1 - Math.abs(34 - env.salinity) / 10 : 0;
    const recentPrices = marketSeries.slice(-3).map((d) => d.price || 0);
    const momentum = recentPrices.length >= 2 ? (recentPrices.slice(-1)[0] - recentPrices[0]) / (recentPrices[0] || 1) : 0;
    const momentumScore = Math.tanh(momentum * 2) * 0.5 + 0.5;
    const final = (tempScore * 0.35 + salinityScore * 0.25 + momentumScore * 0.4) * 100;
    return Math.round(final);
  }, [env, marketSeries]);

  return (
    <div className="bg-slate-900 p-4 rounded-2xl shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-sm">Adaptive Prediction Lens</div>
          <div className="text-2xl font-bold">{score}%</div>
          <div className="text-xs text-slate-400">Blends environment & market momentum</div>
        </div>
        <div className="w-28">
          <svg viewBox="0 0 36 36" className="w-20 h-20">
            <path
              d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32"
              fill="none"
              stroke="#0ea5a4"
              strokeWidth="3"
              strokeDasharray={`${score},100`}
              strokeLinecap="round"
            />
            <text x="18" y="22" textAnchor="middle" fontSize="8" fill="#fff">
              {score}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function MarketAnomalyDetector({ series = [] }) {
  const anomalies = useMemo(() => detectAnomalies(series, "price", 2), [series]);
  return (
    <div className="bg-slate-900 p-4 rounded-2xl shadow">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Market Anomaly Detector</h4>
        <div className="text-slate-400 text-sm">{anomalies.length} flagged</div>
      </div>
      <div className="mt-3 space-y-2">
        {anomalies.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{a.date}</div>
              <div className="text-xs text-slate-400">Price ₹{a.price} • z={a.z.toFixed(2)}</div>
            </div>
            <div className="text-sm text-red-400">Anomaly</div>
          </div>
        ))}
        {!anomalies.length && <div className="text-slate-400 text-sm">No anomalies detected</div>}
      </div>
    </div>
  );
}

export default function DashboardPage({ showHeader = false }) {
  const [conditions, setConditions] = useState(null);
  const [trend, setTrend] = useState([]);
  const [species, setSpecies] = useState("Tuna");
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    let canceled = false;
    async function loadConditions() {
      try {
        const res = await getJSON(`${FLASK}/region/conditions?lat=13.05&lng=80.27`);
        if (!canceled) setConditions(res);
      } catch (e) {
        if (!canceled) {
          setConditions({
            temperature: 27.28,
            wind: "8 km/h W",
            tide: "High tide in 3 hours",
            salinity: 33.84,
            wave_height: 1.3,
          });
        }
      }
    }
    loadConditions();

    setAlerts([
      { title: "High turbidity near coast", detail: "Visibility below safe threshold", time: "2m" },
      { title: "Price surge in Tuna", detail: "Unusual volume observed", time: "30m" },
    ]);
    setActivity([
      { id: 1, text: "Trained new fish species model v1.1", time: "1h" },
      { id: 2, text: "Exported weekly report", time: "2h" },
    ]);

    return () => (canceled = true);
  }, []);

  useEffect(() => {
    let canceled = false;
    async function loadTrend() {
      try {
        const res = await getJSON(`${FLASK}/trends7d?species=${species}`);
        if (!canceled) {
          setTrend(res.series || res || []);
          setTableData((res.series || []).map((s) => ({ date: s.date, price: s.price, vol: s.volume || 0 })));
        }
      } catch (e) {
        const mock = [
          { date: "2025-12-07", price: 350, volume: 120 },
          { date: "2025-12-08", price: 355, volume: 80 },
          { date: "2025-12-09", price: 357, volume: 95 },
          { date: "2025-12-10", price: 358, volume: 88 },
          { date: "2025-12-11", price: 357, volume: 75 },
          { date: "2025-12-12", price: 352, volume: 100 },
          { date: "2025-12-13", price: 351, volume: 110 },
        ];
        if (!canceled) {
          setTrend(mock);
          setTableData(mock.map((s) => ({ date: s.date, price: s.price, vol: s.volume })));
        }
      }
    }
    loadTrend();
    return () => (canceled = true);
  }, [species]);

  const columns = [
    { key: "date", title: "Date" },
    { key: "price", title: "Price (₹/kg)" },
    { key: "vol", title: "Volume (kg)" },
  ];

  const quickActions = [
    { id: "predict", label: "Run Prediction" },
    { id: "export", label: "Export CSV" },
    { id: "notify", label: "Notify Fleet" },
  ];

  return (
    <div className="text-white space-y-6 p-6">
      {/* Conditionally render the header. When your app shell already has the top bar, keep the default (showHeader=false). */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <div className="text-slate-400 text-sm">Monitor your aquaculture analytics</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-md">
              <Search size={16} />
              <input placeholder="Search..." className="bg-transparent outline-none text-sm" />
            </div>
            <button className="p-2 rounded-md bg-slate-900"><Bell /></button>
            <button className="p-2 rounded-md bg-slate-900"><User /></button>
          </div>
        </div>
      )}

      {/* Top KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Temperature"
          value={conditions ? `${conditions.temperature}°C` : "—"}
          sub={conditions ? `${conditions.wind} • ${conditions.tide}` : "Loading..."}
          colorClass="text-yellow-400"
          icon={<CloudMoon />}
        />
        <StatCard
          title="Sea Surface Temp."
          value={conditions ? `${(conditions.temperature - 2).toFixed(2)}°C` : "—"}
          sub="Slight increase"
          colorClass="text-red-400"
          icon={<TrendingUp />}
        />
        <StatCard
          title="Salinity"
          value={conditions ? `${conditions.salinity} PSU` : "—"}
          sub="Normal range"
          colorClass="text-blue-400"
          icon={<Droplets />}
        />
        <StatCard
          title="Wave Activity"
          value={conditions ? `${conditions.wave_height} m` : "—"}
          sub="Safe for fishing"
          colorClass="text-cyan-400"
          icon={<Waves />}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 p-5 rounded-2xl shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Market Price Forecast (₹/kg)</h3>
                <div className="text-slate-400 text-sm">7 day forecast and trend</div>
              </div>

              <div className="flex gap-3 items-center">
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="bg-slate-800 border border-slate-700 p-2 rounded-md"
                >
                  <option value="Tuna">Tuna</option>
                  <option value="Mackerel">Mackerel</option>
                  <option value="Sardine">Sardine</option>
                  <option value="Pomfret">Pomfret</option>
                  <option value="Seer Fish">Seer Fish</option>
                </select>
                <ExportCSVButton filename={`${species}-trend.csv`} rows={trend} fields={["date", "price", "volume"]} />
              </div>
            </div>

            <div className="h-80 w-full mt-4">
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                      }}
                      labelStyle={{ color: "#fff" }}
                      itemStyle={{ color: "#38bdf8" }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={3} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-center">Loading price forecast...</div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-slate-900 p-4 rounded-2xl shadow">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Quick Actions</h4>
                <div className="text-slate-400 text-sm">Shortcuts</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickActions.map((a) => (
                  <button key={a.id} className="bg-slate-800 p-2 rounded-md text-sm">{a.label}</button>
                ))}
              </div>
            </div>

            <div className="w-80 bg-slate-900 p-4 rounded-2xl shadow">
              <h4 className="font-semibold">Live Camera</h4>
              <div className="mt-3 bg-slate-800 h-28 rounded-md flex items-center justify-center text-slate-400">Live feed placeholder</div>
              <div className="mt-3 text-slate-400 text-xs">Real-time visual monitoring of docks or pens</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <MarketAnomalyDetector series={trend} />
            </div>
            <AdaptivePredictionLens env={conditions || {}} marketSeries={trend} />
          </div>

          <div>
            <DataTable rows={tableData} columns={columns} />
          </div>
        </div>

        <div className="space-y-4">
          <AlertsList alerts={alerts} />

          <div className="bg-slate-900 p-4 rounded-2xl shadow">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Fleet Status</h4>
              <div className="text-slate-400 text-sm">7 vessels</div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Vessel A</div>
                  <div className="text-xs text-slate-400">Active • 12 nm</div>
                </div>
                <div className="text-sm text-green-400">Online</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Vessel B</div>
                  <div className="text-xs text-slate-400">Idle • Port</div>
                </div>
                <div className="text-sm text-yellow-400">Idle</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl shadow">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Recent Activity</h4>
              <div className="text-slate-400 text-sm">{activity.length}</div>
            </div>
            <div className="mt-3 space-y-2">
              {activity.map((a) => (
                <div key={a.id} className="text-sm text-slate-200">
                  <div className="font-medium">{a.text}</div>
                  <div className="text-xs text-slate-400">{a.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl shadow">
            <h4 className="font-semibold">Environment Snapshot</h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatCard title="Temp" value={conditions ? `${conditions.temperature}°C` : "—"} sub="Surface" colorClass="text-yellow-400" />
              <StatCard title="Salinity" value={conditions ? `${conditions.salinity} PSU` : "—"} sub="PSU" colorClass="text-blue-400" />
              <StatCard title="Wind" value={conditions ? conditions.wind : "—"} sub="" colorClass="text-slate-300" />
              <StatCard title="Wave" value={conditions ? `${conditions.wave_height} m` : "—"} sub="" colorClass="text-cyan-400" />
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl shadow">
            <h4 className="font-semibold">Mini Trends</h4>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Local Demand</div>
                <MiniSparkline data={trend.map((t) => ({ value: t.price }))} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Volume</div>
                <MiniSparkline data={trend.map((t) => ({ value: t.volume }))} />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Momentum</div>
                <MiniSparkline data={trend.map((t, i) => ({ value: i ? trend[i].price - trend[i - 1].price : 0 }))} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-slate-400 text-sm">© AquaPredict • Data may be delayed by up to 5 minutes</div>
    </div>
  );
}
