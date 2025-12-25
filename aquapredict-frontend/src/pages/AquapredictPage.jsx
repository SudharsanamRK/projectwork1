import React, { useEffect, useState } from "react";
import {
  BarChart2,
  History,
  MapPin,
  SlidersHorizontal,
  Thermometer,
  Droplets,
  CloudRain,
  ChevronRight
} from "lucide-react";
import { FLASK, getJSON, postJSON } from "../utils/api";

/* Leaflet */
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

/* =======================
   REGION COORDINATES
======================= */
const REGION_COORDS = {
  "Chennai Coast": [13.08, 80.27],
  "Goa Coast": [15.29, 74.12],
  "Mumbai Harbor": [18.93, 72.83],
  "Andaman Sea": [11.74, 92.65],
};

const DEFAULT_CENTER = REGION_COORDS["Chennai Coast"];

/* =======================
   HEAT COLOR LOGIC
======================= */
function getHeatColor(score) {
  if (score >= 0.75) return "#22d3ee"; // Cyan
  if (score >= 0.5) return "#38bdf8";  // Sky
  if (score >= 0.3) return "#facc15";  // Yellow
  return "#fb7185";                    // Rose
}

/* =======================
   COMPONENTS
======================= */

function MapLegend() {
  const categories = [
    { label: "Critical Peak", color: "#22d3ee", range: "75%+" },
    { label: "High Activity", color: "#38bdf8", range: "50-75%" },
    { label: "Moderate", color: "#facc15", range: "30-50%" },
    { label: "Low Presence", color: "#fb7185", range: "< 30%" },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-lg">
      <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">
        Map Legend
      </h3>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}66` }}
              />
              <span className="text-[11px] text-slate-300 font-medium">{cat.label}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{cat.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapView({ region }) {
  const [points, setPoints] = useState([]);
  const center = REGION_COORDS[region] || DEFAULT_CENTER;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getJSON(`${FLASK}/heatmap`);
        if (mounted && Array.isArray(res?.locations)) {
          setPoints(res.locations.map((p) => ({
            lat: Number(p.lat),
            lon: Number(p.lon),
            score: Math.min(Math.max(Number(p.score), 0.1), 0.9),
          })));
        }
      } catch {
        // Fallback mock data
        setPoints([
          { lat: center[0] + 0.3, lon: center[1] + 0.2, score: 0.7 },
          { lat: center[0] - 0.2, lon: center[1] - 0.3, score: 0.45 },
          { lat: center[0] + 0.1, lon: center[1] - 0.4, score: 0.3 },
        ]);
      }
    })();
    return () => (mounted = false);
  }, [region, center]);

  return (
    <div className="flex-grow min-h-[450px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={center}>
          <Popup>{region}</Popup>
        </Marker>

        {points.map((p, i) => {
          const color = getHeatColor(p.score);
          const radius = 24000 + p.score * 42000;
          return (
            <React.Fragment key={i}>
              <Circle
                center={[p.lat, p.lon]}
                radius={radius}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.3, weight: 1 }}
              />
              <Circle
                center={[p.lat, p.lon]}
                radius={radius * 1.5}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.1, weight: 0 }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

/* =======================
   MAIN PAGE
======================= */
export default function AquapredictPage() {
  const [mode, setMode] = useState("advanced");
  const [form, setForm] = useState({
    date: "",
    region: "Chennai Coast",
    temperature: "",
    salinity: "",
    rainfall: "",
    effort: 5,
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("aq_history") || "[]");
    setHistory(saved);
  }, []);

  const handlePredict = async () => {
    try {
      const res = await postJSON(`${FLASK}/advanced_predict`, {
        region: form.region,
        temperature: Number(form.temperature || 28),
        salinity: Number(form.salinity || 32),
        rainfall: Number(form.rainfall || 0),
        fishingEffort: Number(form.effort),
      });

      const entry = { species: res.species, region: form.region, confidence: res.probability };
      setResult(entry);
      const updated = [entry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("aq_history", JSON.stringify(updated));
    } catch {
      alert("Prediction service unavailable");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: CONFIG */}
        <aside className="lg:col-span-3 space-y-6 flex flex-col">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex-grow shadow-lg">
            <h3 className="text-xs uppercase tracking-[0.2em] text-sky-500 font-bold mb-8 flex items-center gap-2">
              <BarChart2 size={16} /> Configuration
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => setMode(mode === "simple" ? "advanced" : "simple")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  mode === "simple" ? "bg-sky-600 border-sky-400 text-white" : "bg-slate-800/50 border-white/10 text-slate-400"
                }`}
              >
                <span className="flex items-center gap-2"><SlidersHorizontal size={14}/> {mode} Mode</span>
                <ChevronRight size={14} />
              </button>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 ml-2">Date & Location</label>
                <input type="date" className="w-full bg-slate-950/50 border border-white/5 p-4 rounded-2xl text-sm focus:ring-2 ring-sky-500 outline-none transition-all" 
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <select className="w-full bg-slate-950/50 border border-white/5 p-4 rounded-2xl text-sm outline-none cursor-pointer"
                  value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                  {Object.keys(REGION_COORDS).map((r) => <option key={r} className="bg-slate-900">{r}</option>)}
                </select>
              </div>

              {mode === "advanced" && (
                <div className="space-y-3 pt-2">
                   <label className="text-[10px] uppercase text-slate-500 ml-2">Parameters</label>
                   <div className="relative group">
                      <Thermometer className="absolute left-4 top-4 text-slate-500 group-focus-within:text-sky-500 transition-colors" size={16} />
                      <input placeholder="Temp (°C)" className="w-full bg-slate-950/50 border border-white/5 p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-1 ring-sky-500/50" 
                        onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
                   </div>
                   <div className="relative group">
                      <Droplets className="absolute left-4 top-4 text-slate-500 group-focus-within:text-sky-500 transition-colors" size={16} />
                      <input placeholder="Salinity (ppt)" className="w-full bg-slate-950/50 border border-white/5 p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-1 ring-sky-500/50" 
                        onChange={(e) => setForm({ ...form, salinity: e.target.value })} />
                   </div>
                   <div className="relative group">
                      <CloudRain className="absolute left-4 top-4 text-slate-500 group-focus-within:text-sky-500 transition-colors" size={16} />
                      <input placeholder="Rainfall (mm)" className="w-full bg-slate-950/50 border border-white/5 p-4 pl-12 rounded-2xl text-sm outline-none focus:ring-1 ring-sky-500/50" 
                        onChange={(e) => setForm({ ...form, rainfall: e.target.value })} />
                   </div>
                </div>
              )}
            </div>

            <button onClick={handlePredict} className="w-full mt-8 bg-gradient-to-r from-sky-600 to-blue-600 hover:scale-[1.02] active:scale-95 transition-all py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(2,132,199,0.3)]">
              Initialize Prediction
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-white/10 rounded-3xl">
            <p className="text-[11px] text-slate-400 leading-relaxed italic text-center">
              "{mode === "simple" ? "Using historical seasonal patterns..." : "ML model evaluating environmental parameters..."}"
            </p>
          </div>
        </aside>

        {/* CENTER COLUMN: MAIN DISPLAY */}
        <main className="lg:col-span-6 flex flex-col space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 flex flex-col h-full shadow-2xl">
            <div className="mb-8">
               <p className="text-xs uppercase tracking-[0.3em] text-slate-500 text-center mb-2">Identified Peak Species</p>
               <h1 className="text-7xl font-black text-center bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent py-2">
                {result?.species || "—"}
               </h1>
               
               {result && (
                <div className="max-w-md mx-auto mt-4">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-sky-400 mb-2 px-1">
                    <span>Confidence Score</span>
                    <span>{(result.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                </div>
               )}
            </div>

            <HeatmapView region={form.region} />
          </div>
        </main>

        {/* RIGHT COLUMN: HISTORY & LEGEND */}
        <aside className="lg:col-span-3 flex flex-col space-y-6">
          
          {/* RECENT ACTIVITY - Shortened and Scrollable */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-lg flex flex-col max-h-[480px]">
            <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-6 flex items-center gap-2 shrink-0">
              <History size={16} /> Recent Activity
            </h3>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {history.length ? history.map((h, i) => (
                <div key={i} className="group p-5 bg-slate-950/40 hover:bg-slate-800/60 border border-white/5 rounded-[1.5rem] transition-all cursor-default">
                  <p className="font-bold text-lg group-hover:text-sky-400 transition-colors">{h.species}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-tighter">
                      <MapPin size={12} className="text-sky-500" /> {h.region}
                    </span>
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-1 rounded-md font-bold">
                      {(h.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )) : (
                <div className="h-32 flex flex-col items-center justify-center opacity-20 text-center">
                   <History size={32} />
                   <p className="text-[10px] mt-4 uppercase tracking-widest">No predictions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* NEW LEGEND BOX */}
          <MapLegend />
          
        </aside>
      </div>

      {/* CUSTOM SCROLLBAR STYLES */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.5);
        }
      `}</style>
    </div>
  );
}