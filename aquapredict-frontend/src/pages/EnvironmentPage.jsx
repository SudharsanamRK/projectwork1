import React, { useEffect, useState } from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Waves,
  Beaker,
  FlaskConical,
  Activity,
  Cloud,
  RefreshCw,
  Download,
  AlertTriangle,
  Info,
  MapPin,
  ArrowUp,
  ArrowDown,
  Gauge,
  Eye,
  Compass,
} from "lucide-react";

/* ----------------------------------------------
   AQUAPREDICT — ADVANCED ENVIRONMENT ANALYTICS
   Now with real weather API integration
------------------------------------------------ */

const clone = (v) => JSON.parse(JSON.stringify(v));

const downloadCSV = (rows, name) => {
  if (!rows || !rows.length) return;
  const header = Object.keys(rows[0]).join(",") + "\n";
  const body = rows.map((r) => Object.values(r).join(",")).join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

/* ------------ Sparkline Chart ------------ */
function Sparkline({ data = [], width = 120, height = 40 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");

  const positive = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={positive ? "#22d3ee" : "#f87171"}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------ Status Logic ------------ */
function metricStatus(key, value) {
  switch (key) {
    case "temp":
      if (value < 18 || value > 32) return { label: "CRITICAL", color: "text-red-400" };
      if (value < 20 || value > 30) return { label: "Warning", color: "text-yellow-300" };
      return { label: "OK", color: "text-emerald-300" };

    case "sal":
      if (value < 20 || value > 40) return { label: "CRITICAL", color: "text-red-400" };
      if (value < 28 || value > 38) return { label: "Warning", color: "text-yellow-300" };
      return { label: "OK", color: "text-emerald-300" };

    case "do":
      if (value < 3.5) return { label: "CRITICAL", color: "text-red-400" };
      if (value < 5.5) return { label: "Low", color: "text-yellow-300" };
      return { label: "OK", color: "text-emerald-300" };

    case "humidity":
      if (value > 85) return { label: "High", color: "text-yellow-300" };
      return { label: "OK", color: "text-emerald-300" };

    case "pressure":
      if (value < 1000 || value > 1025) return { label: "Unstable", color: "text-yellow-300" };
      return { label: "OK", color: "text-emerald-300" };

    default:
      return { label: "OK", color: "text-emerald-300" };
  }
}

/* ==================================================================
   MAIN COMPONENT
================================================================== */
function EnvironmentPage() {
  const [metrics, setMetrics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [location, setLocation] = useState({ name: "Kanchipuram", lat: 12.8342, lon: 79.7036, state: "Tamil Nadu" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Major coastal and inland cities in India
  const INDIAN_LOCATIONS = [
    // Coastal Cities
    { name: "Mumbai", lat: 19.0760, lon: 72.8777, state: "Maharashtra", type: "Coastal" },
    { name: "Chennai", lat: 13.0827, lon: 80.2707, state: "Tamil Nadu", type: "Coastal" },
    { name: "Kochi", lat: 9.9312, lon: 76.2673, state: "Kerala", type: "Coastal" },
    { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185, state: "Andhra Pradesh", type: "Coastal" },
    { name: "Goa", lat: 15.2993, lon: 74.1240, state: "Goa", type: "Coastal" },
    { name: "Mangalore", lat: 12.9141, lon: 74.8560, state: "Karnataka", type: "Coastal" },
    { name: "Puducherry", lat: 11.9416, lon: 79.8083, state: "Puducherry", type: "Coastal" },
    { name: "Surat", lat: 21.1702, lon: 72.8311, state: "Gujarat", type: "Coastal" },
    { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366, state: "Kerala", type: "Coastal" },
    { name: "Kanchipuram", lat: 12.8342, lon: 79.7036, state: "Tamil Nadu", type: "Coastal" },
    
    // Major Inland Cities
    { name: "Delhi", lat: 28.7041, lon: 77.1025, state: "Delhi", type: "Inland" },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946, state: "Karnataka", type: "Inland" },
    { name: "Hyderabad", lat: 17.3850, lon: 78.4867, state: "Telangana", type: "Inland" },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639, state: "West Bengal", type: "Inland" },
    { name: "Pune", lat: 18.5204, lon: 73.8567, state: "Maharashtra", type: "Inland" },
    { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, state: "Gujarat", type: "Inland" },
    { name: "Jaipur", lat: 26.9124, lon: 75.7873, state: "Rajasthan", type: "Inland" },
    { name: "Lucknow", lat: 26.8467, lon: 80.9462, state: "Uttar Pradesh", type: "Inland" },
    { name: "Chandigarh", lat: 30.7333, lon: 76.7794, state: "Chandigarh", type: "Inland" },
    { name: "Bhopal", lat: 23.2599, lon: 77.4126, state: "Madhya Pradesh", type: "Inland" },
  ];

  // Fetch real weather data
  const fetchWeatherData = async (loc = location) => {
    try {
      setLoading(true);
      setError(null);

      const lat = loc.lat;
      const lon = loc.lon;
      
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,cloud_cover&timezone=auto`;
      
      const response = await fetch(weatherUrl);
      const data = await response.json();

      if (!data.current) {
        throw new Error("Unable to fetch weather data");
      }

      const current = data.current;

      // Generate simulated marine data based on weather
      const seaTemp = Math.max(20, Math.min(30, current.temperature_2m + Math.random() * 3));
      const salinity = 34 + Math.random() * 2;
      const dissolvedOxygen = 6 + Math.random() * 1.5;
      const ph = 7.6 + Math.random() * 0.4;
      const turbidity = 2 + Math.random() * 2;
      const waveHeight = Math.max(0.5, current.wind_speed_10m / 10 + Math.random() * 0.5);
      const rainfall = Math.random() * 50;

      const newMetrics = [
        {
          key: "temp",
          title: "Sea Temperature",
          unit: "°C",
          value: Number(seaTemp.toFixed(2)),
          icon: Thermometer,
          history: Array(6).fill(0).map((_, i) => seaTemp - (5 - i) * 0.2),
          source: "Simulated from air temp"
        },
        {
          key: "air_temp",
          title: "Air Temperature",
          unit: "°C",
          value: Number(current.temperature_2m.toFixed(2)),
          icon: Thermometer,
          history: Array(6).fill(0).map((_, i) => current.temperature_2m - (5 - i) * 0.3),
          source: "Open-Meteo API"
        },
        {
          key: "sal",
          title: "Salinity",
          unit: "ppt",
          value: Number(salinity.toFixed(2)),
          icon: Droplets,
          history: Array(6).fill(0).map((_, i) => salinity - (5 - i) * 0.1),
          source: "Simulated"
        },
        {
          key: "wind",
          title: "Wind Speed",
          unit: "km/h",
          value: Number(current.wind_speed_10m.toFixed(2)),
          icon: Wind,
          history: Array(6).fill(0).map((_, i) => current.wind_speed_10m - (5 - i) * 0.5),
          source: "Open-Meteo API"
        },
        {
          key: "rain",
          title: "Rainfall (24h)",
          unit: "mm",
          value: Number(rainfall.toFixed(2)),
          icon: CloudRain,
          history: Array(6).fill(0).map((_, i) => rainfall * (i / 5)),
          source: "Simulated"
        },
        {
          key: "do",
          title: "Dissolved Oxygen",
          unit: "mg/L",
          value: Number(dissolvedOxygen.toFixed(2)),
          icon: Beaker,
          history: Array(6).fill(0).map((_, i) => dissolvedOxygen - (5 - i) * 0.1),
          source: "Simulated"
        },
        {
          key: "ph",
          title: "pH Level",
          unit: "",
          value: Number(ph.toFixed(2)),
          icon: FlaskConical,
          history: Array(6).fill(0).map(() => ph + (Math.random() - 0.5) * 0.1),
          source: "Simulated"
        },
        {
          key: "turb",
          title: "Turbidity",
          unit: "NTU",
          value: Number(turbidity.toFixed(2)),
          icon: Activity,
          history: Array(6).fill(0).map((_, i) => turbidity - (5 - i) * 0.2),
          source: "Simulated"
        },
        {
          key: "wave",
          title: "Wave Height",
          unit: "m",
          value: Number(waveHeight.toFixed(2)),
          icon: Waves,
          history: Array(6).fill(0).map((_, i) => waveHeight - (5 - i) * 0.1),
          source: "Calculated from wind"
        },
        {
          key: "humidity",
          title: "Air Humidity",
          unit: "%",
          value: Number(current.relative_humidity_2m.toFixed(2)),
          icon: Cloud,
          history: Array(6).fill(0).map((_, i) => current.relative_humidity_2m - (5 - i) * 1),
          source: "Open-Meteo API"
        },
        {
          key: "pressure",
          title: "Pressure",
          unit: "hPa",
          value: Number(current.surface_pressure.toFixed(2)),
          icon: Gauge,
          history: Array(6).fill(0).map((_, i) => current.surface_pressure - (5 - i) * 0.5),
          source: "Open-Meteo API"
        },
        {
          key: "cloudcover",
          title: "Cloud Cover",
          unit: "%",
          value: Number(current.cloud_cover.toFixed(2)),
          icon: Eye,
          history: Array(6).fill(0).map((_, i) => current.cloud_cover - (5 - i) * 2),
          source: "Open-Meteo API"
        },
      ];

      setMetrics(newMetrics);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Failed to fetch weather data. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    const id = setInterval(() => fetchWeatherData(location), 300000); // Refresh every 5 minutes
    return () => clearInterval(id);
  }, [location]);

  const handleExport = () => {
    const rows = metrics.map((m) => ({
      location: `${location.name}, ${location.state}`,
      metric: m.title,
      value: m.value,
      unit: m.unit,
      source: m.source,
      updated: lastUpdated.toLocaleString(),
    }));
    downloadCSV(rows, `environment_data_${location.name.toLowerCase()}.csv`);
  };

  const filteredLocations = INDIAN_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && metrics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-sky-400" />
          <p className="text-xl">Loading environment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-gray-300 mt-1 flex items-center gap-2">
            <MapPin size={16} className="text-sky-400" />
            {location.name}, {location.state} ({location.type}) — Real-time monitoring
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowLocationPicker(true)}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition-all"
          >
            <Compass size={16} /> 
            Change Location
          </button>

          <button
            onClick={() => fetchWeatherData(location)}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> 
            Refresh
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 flex items-center gap-2 transition-all"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-red-400" size={20} />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          const status = metricStatus(m.key, m.value);
          const trendUp = Array.isArray(m.history) && m.history[m.history.length - 1] >= m.history[0];

          return (
            <div
              key={m.key}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer shadow-lg"
              onClick={() => setSelected(m)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  {Icon && <Icon className="w-5 h-5 text-sky-400" />}
                  {m.title}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${status.color} bg-white/5`}>
                  {status.label}
                </div>
              </div>

              <div className="mt-3 text-3xl font-bold">
                {m.value} <span className="text-lg ml-1 text-gray-400">{m.unit}</span>
              </div>

              <div className="mt-3 opacity-80">
                <Sparkline data={m.history} width={120} height={40} />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  {trendUp ? (
                    <ArrowUp size={14} className="text-emerald-400" />
                  ) : (
                    <ArrowDown size={14} className="text-red-400" />
                  )}
                  <span>
                    {Array.isArray(m.history) && m.history.length > 1
                      ? (((m.history.at(-1) - m.history[0]) / Math.max(0.0001, Math.abs(m.history[0]))) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
                <div className="text-gray-500 text-xs">{m.source}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-yellow-400" />
          <span>Thresholds applied · Monitor critical values closely</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Node: Coastal-01</span>
          <span>•</span>
          <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/20 w-full max-w-3xl shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {selected.icon && React.createElement(selected.icon, { className: "w-8 h-8 text-sky-400" })}
                <div>
                  <h2 className="text-2xl font-bold">{selected.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">Node: Coastal-01 • {selected.source}</p>
                </div>
              </div>

              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <Sparkline data={selected.history} width={Math.min(700, window.innerWidth - 100)} height={150} />
            </div>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="font-semibold">Current Value:</span>
                <span className="text-2xl font-bold text-sky-400">
                  {selected.value} {selected.unit}
                </span>
              </div>

              <p className="text-sm leading-relaxed">
                This metric is crucial for marine conditions and fish population prediction in AquaPredict. 
                Real-time monitoring helps identify environmental changes that may affect aquatic ecosystems.
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400">Minimum</p>
                  <p className="text-lg font-semibold">{Math.min(...selected.history).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400">Maximum</p>
                  <p className="text-lg font-semibold">{Math.max(...selected.history).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  downloadCSV(
                    [{ 
                      metric: selected.title, 
                      current: selected.value,
                      unit: selected.unit,
                      history: selected.history.join("|"),
                      source: selected.source
                    }], 
                    `${selected.key}_history.csv`
                  )
                }
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
              >
                Export History
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 border border-white/20 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Select Location</h2>
              <button 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors" 
                onClick={() => {
                  setShowLocationPicker(false);
                  setSearchQuery("");
                }}
              >
                Close
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-sky-400"
            />

            <div className="overflow-y-auto flex-1 space-y-2">
              {filteredLocations.map((loc) => (
                <button
                  key={`${loc.name}-${loc.state}`}
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationPicker(false);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    location.name === loc.name
                      ? "bg-sky-600 hover:bg-sky-700"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{loc.name}</p>
                      <p className="text-sm text-gray-400">{loc.state}</p>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-white/10">
                      {loc.type}
                    </div>
                  </div>
                </button>
              ))}

              {filteredLocations.length === 0 && (
                <p className="text-center text-gray-400 py-8">No locations found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnvironmentPage;