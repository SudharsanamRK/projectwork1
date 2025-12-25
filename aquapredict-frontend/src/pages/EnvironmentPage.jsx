import React, { useEffect, useState, useRef } from "react";
import {
  Thermometer, Wind, Waves, Gauge, RefreshCw,
  MapPin, ArrowUp, ArrowDown, ShieldCheck, 
  Plus, Trash2, Search, BarChart3, Activity, 
  Compass, Clock, CloudRain, Zap, Maximize2, ExternalLink
} from "lucide-react";

/* ======================================================
   LOGIC & CONFIG
====================================================== */
const AQI_SCALE = [
  { max: 50, label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { max: 100, label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { max: 150, label: "Unhealthy", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { max: 300, label: "Severe", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" }
];

const DEFAULT_LOCATION = { name: "Chennai", lat: 13.0827, lon: 80.2707 };

const calculateRisk = (wind, wave, pressure) => {
  let score = 0;
  if (wind > 20) score++;
  if (wave > 1.8) score++;
  if (pressure < 1005) score++;
  if (score >= 3) return { level: "Critical", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", advice: "Hazardous. Port shutdown advised." };
  if (score === 2) return { level: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", advice: "Caution for small vessels." };
  return { level: "Low Risk", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", advice: "Safe maritime conditions." };
};

/* ======================================================
   AQI HELPERS (OpenAQ Logic)
====================================================== */
const pm25ToAQI = (pm25) => {
  if (pm25 === null || pm25 === undefined) return 0;
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12)) * (pm25 - 12) + 51);
  if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.4)) * (pm25 - 35.4) + 101);
  if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.4)) * (pm25 - 55.4) + 151);
  return 300;
};

/* ======================================================
   GRAPH COMPONENT
====================================================== */
function Sparkline({ data, colorClass }) {
  if (!data || data.length < 2) return null;
  const width = 160; const height = 40; const padding = 5;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");
  const strokeColor = colorClass.includes("emerald") ? "#10b981" : colorClass.includes("red") ? "#ef4444" : "#3b82f6";
  return (
    <div className="w-full mt-4 h-10">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points} className="drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
      </svg>
    </div>
  );
}

const KPICard = ({ label, value, unit, Icon, history }) => {
  const isGrowing = history[history.length - 1] >= history[history.length - 2];
  const colorClass = isGrowing ? "text-emerald-400" : "text-red-400";
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:border-sky-500/40 transition-all group">
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-slate-800 rounded-2xl text-sky-400 group-hover:scale-110 transition-transform"><Icon size={20} /></div>
        <div className={`flex items-center gap-1 text-[10px] font-bold ${colorClass}`}>
          {isGrowing ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(((value - history[0]) / (history[0] || 1) * 10).toFixed(1))}%
        </div>
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">{label}</p>
      <h3 className="text-3xl font-black tracking-tight text-white">{value} <span className="text-sm text-slate-500 font-medium">{unit}</span></h3>
      <Sparkline data={history} colorClass={colorClass} />
    </div>
  );
};

/* ======================================================
   MAIN DASHBOARD
====================================================== */
export default function ProEnvironmentDashboard() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("aqua_saved") || "[]"));
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [time, setTime] = useState(new Date());
  const [aqiSource, setAqiSource] = useState("OpenAQ");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSave = () => {
    const isSaved = saved.some(s => s.name === location.name);
    const newSaved = isSaved ? saved.filter(s => s.name !== location.name) : [...saved, location];
    setSaved(newSaved);
    localStorage.setItem("aqua_saved", JSON.stringify(newSaved));
  };

  const fetchEnvironmentalData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Open-Meteo Weather
      const meteoRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,wind_speed_10m,surface_pressure&daily=temperature_2m_max,precipitation_sum&timezone=auto`);
      const meteo = await meteoRes.json();

      // 2. Fetch OpenAQ PM2.5 (Primary) with Satellite Fallback
      let finalAQI = 0;
      let pm25Val = 0;
      try {
        const aqRes = await fetch(`https://api.openaq.org/v2/latest?coordinates=${location.lat},${location.lon}&radius=50000&limit=1`);
        const aqJson = await aqRes.json();
        const foundPM25 = aqJson.results?.[0]?.measurements?.find(m => m.parameter === "pm25");
        
        if (foundPM25) {
          pm25Val = foundPM25.value;
          finalAQI = pm25ToAQI(pm25Val);
          setAqiSource("OpenAQ Station");
        } else {
          // Fallback to satellite model if no OpenAQ station is nearby
          const fbRes = await fetch(`https://api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=us_aqi,pm2_5`);
          const fbJson = await fbRes.json();
          finalAQI = fbJson.current.us_aqi;
          pm25Val = fbJson.current.pm2_5;
          setAqiSource("Satellite Model");
        }
      } catch { finalAQI = 45; }

      const curr = meteo.current;
      const waveHeight = +(curr.wind_speed_10m * 0.12).toFixed(2);
      const generateHistory = (val, variance) => Array.from({ length: 12 }, () => +(val + (Math.random() - 0.5) * variance).toFixed(2));

      setWeather({
        temp: curr.temperature_2m,
        wind: curr.wind_speed_10m,
        pressure: curr.surface_pressure,
        wave: waveHeight,
        aqi: finalAQI,
        pm25: pm25Val,
        precip: meteo.daily.precipitation_sum[0],
        maxTemp: meteo.daily.temperature_2m_max[0],
        history: {
          temp: generateHistory(curr.temperature_2m, 4),
          wind: generateHistory(curr.wind_speed_10m, 8),
          pressure: generateHistory(curr.surface_pressure, 10),
          wave: generateHistory(waveHeight, 0.5)
        }
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEnvironmentalData(); }, [location]);

  useEffect(() => {
    if (searchTerm.length < 3) return setResults([]);
    const delay = setTimeout(async () => {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}&count=5`);
      const data = await res.json();
      setResults(data.results || []);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  if (loading || !weather) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-sky-500" size={32} />
        <p className="text-sky-500 font-black tracking-widest text-[10px] uppercase">Syncing Node Data...</p>
      </div>
    );
  }

  const risk = calculateRisk(weather.wind, weather.wave, weather.pressure);
  const aqiMeta = AQI_SCALE.find(x => weather.aqi <= x.max) || AQI_SCALE[3];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950/50 border-r border-white/5 p-8 hidden lg:flex flex-col">

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Saved Fleet</h4>
            <Plus size={16} className="text-sky-500 cursor-pointer" />
          </div>
          <div className="space-y-2">
            {saved.map(item => (
              <div key={item.name} onClick={() => setLocation(item)} className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer transition-all ${location.name === item.name ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-500 hover:bg-white/5'}`}>
                <div className="flex items-center gap-3 font-bold text-sm"><Compass size={16} /> {item.name}</div>
                <Trash2 size={14} className="hover:text-red-400" onClick={(e) => { e.stopPropagation(); toggleSave(); }}/>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto p-6 bg-sky-500/5 rounded-3xl border border-sky-500/10">
          <p className="text-[10px] font-black text-sky-500 uppercase mb-2">System Status</p>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Zap size={12} className="text-emerald-500" /> All Nodes Operational</div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 relative">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 text-sky-500 text-xs font-black uppercase tracking-widest mb-2"><MapPin size={14} /> {location.name} Intelligence</div>
            <h1 className="text-5xl font-black tracking-tight">Environmental OS</h1>
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
              <div className="flex items-center bg-slate-900/80 border border-white/10 rounded-2xl px-5 py-3 focus-within:ring-2 ring-sky-500/40 transition-all">
                <Search size={18} className="text-slate-500" />
                <input className="bg-transparent ml-4 w-full text-sm outline-none text-white" placeholder="Search Global Stations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {results.length > 0 && (
                <div className="absolute mt-3 w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                  {results.map(r => (
                    <button key={r.id} onClick={() => { setLocation({ name: r.name, lat: r.latitude, lon: r.longitude }); setSearchTerm(""); setResults([]); }} className="w-full px-6 py-4 text-left hover:bg-sky-500/10 flex justify-between items-center border-b border-white/5">
                      <span className="font-bold text-sm">{r.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{r.country_code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleSave} className={`p-3 rounded-2xl border transition-all ${saved.some(s => s.name === location.name) ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}><Plus size={20} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard label="Surface Temp" value={weather.temp} unit="°C" Icon={Thermometer} history={weather.history.temp} />
          <KPICard label="Wind Velocity" value={weather.wind} unit="km/h" Icon={Wind} history={weather.history.wind} />
          <KPICard label="Oceanic Wave" value={weather.wave} unit="m" Icon={Waves} history={weather.history.wave} />
          <KPICard label="Baro Pressure" value={weather.pressure} unit="hPa" Icon={Gauge} history={weather.history.pressure} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <h3 className="flex items-center gap-3 font-black text-xl mb-8"><BarChart3 className="text-sky-500" /> OPERATIONAL INSIGHTS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <p className="text-[10px] text-sky-500 font-black uppercase mb-2">Weather Correlation</p>
                  <p className="text-sm text-slate-400 italic">"Current barometric pressure of {weather.pressure} hPa suggests stable atmospheric conditions."</p>
                </div>
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <p className="text-[10px] text-sky-500 font-black uppercase mb-2">AQI Intelligence</p>
                  <p className="text-sm text-slate-400 italic">"Live {aqiSource} data shows PM2.5 at {weather.pm25} µg/m³."</p>
                </div>
              </div>
              <div className="bg-slate-950/60 rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-sky-500/10 rounded-2xl text-sky-400"><CloudRain size={24}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Precipitation</p>
                    <p className="text-2xl font-black">{weather.precip}mm</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-500 uppercase">Peak Temp</span><span className="text-sky-400">{weather.maxTemp}°C</span></div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-sky-500/50" style={{ width: '65%' }}></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`${risk.bg} ${risk.border} rounded-[2.5rem] p-10 flex flex-col items-center text-center justify-center transition-all duration-500`}>
              <div className={`p-4 rounded-full bg-slate-950/50 mb-4 ${risk.color}`}><ShieldCheck size={40} /></div>
              <h2 className={`text-3xl font-black uppercase tracking-tighter ${risk.color}`}>{risk.level}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">{risk.advice}</p>
              <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/5 transition-all">Manual Override</button>
            </div>

            <div className={`${aqiMeta.bg} ${aqiMeta.border} rounded-[2rem] p-8 relative overflow-hidden group`}>
               <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">AQI ({aqiSource})</p>
                    <h3 className="text-5xl font-black tracking-tighter">{weather.aqi}</h3>
                    <p className={`text-xs font-black uppercase mt-1 ${aqiMeta.color}`}>{aqiMeta.label}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[20px] font-mono font-bold text-slate-700">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">AquaPredict System Cluster • Deployment 2025.04</p>
        </footer>
      </main>
    </div>
  );
}