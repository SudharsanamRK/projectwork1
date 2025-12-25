import React, { useEffect, useState } from "react";
import {
  MapPin, Ship, Anchor, Fuel, Weight, Calendar,
  AlertTriangle, TrendingUp, Brain, Download, Info, Clock, Map
} from "lucide-react";
import FishRecommendationCard from "../components/FishRecommendationCard";

const REGIONS = ["Chennai Coast", "Goa Coast", "Mumbai Harbor", "Andaman Sea"];
const GEAR_TYPES = ["Trawl Net", "Gillnet", "Longline", "Cast Net"];
const API_URL = "http://localhost:5000/api/harvest/plan";

export default function HarvestPlannerPage() {
  const [inputs, setInputs] = useState({
    region: "Chennai Coast",
    gear: "Trawl Net",
    vessels: 2,
    days: 5,
    storageKg: 500,
    fuelPrice: 95,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchPlan() {
      setLoading(true);
      setUsingFallback(false);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
        });
        if (!res.ok) throw new Error("ML unavailable");
        const data = await res.json();
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) {
          setUsingFallback(true);
          setResult(buildFallbackPlan(inputs));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPlan();
    return () => (cancelled = true);
  }, [inputs]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harvest_plan_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        <div className="grid lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Panel title="Fishing Logistics" icon={<Ship size={16}/>}>
                <Select
                  label="Target Region"
                  value={inputs.region}
                  options={REGIONS}
                  icon={<MapPin size={14}/>}
                  onChange={(v) => setInputs({ ...inputs, region: v })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Gear Type"
                    value={inputs.gear}
                    options={GEAR_TYPES}
                    icon={<Anchor size={14}/>}
                    onChange={(v) => setInputs({ ...inputs, gear: v })}
                  />
                  <Number
                    label="Vessel Count"
                    value={inputs.vessels}
                    icon={<Ship size={14}/>}
                    onChange={(v) => setInputs({ ...inputs, vessels: v })}
                  />
                </div>
              </Panel>

              <Panel title="Trip Economics" icon={<Clock size={16}/>}>
                <Number
                  label="Duration (Days)"
                  value={inputs.days}
                  icon={<Calendar size={14}/>}
                  onChange={(v) => setInputs({ ...inputs, days: v })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Number
                    label="Storage (kg)"
                    value={inputs.storageKg}
                    icon={<Weight size={14}/>}
                    onChange={(v) => setInputs({ ...inputs, storageKg: v })}
                  />
                  <Number
                    label="Fuel (₹/L)"
                    value={inputs.fuelPrice}
                    icon={<Fuel size={14}/>}
                    onChange={(v) => setInputs({ ...inputs, fuelPrice: v })}
                  />
                </div>
              </Panel>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-6 flex items-center gap-2">
                <Brain size={16}/> AI Intelligence Summary
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : result && (
                <>
                  <FishRecommendationCard rec={result.allocation?.[0]} fallback={usingFallback} />

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Metric label="Net Profit" value={`₹${result.netProfit.toLocaleString()}`} accent />
                    <Metric label="Fuel Cost" value={`₹${result.fuelCost.toLocaleString()}`} />
                  </div>

                  <RiskBadge level={result.risk} />

                  {usingFallback && (
                    <div className="mt-4 flex gap-2 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                      <AlertTriangle size={14} className="text-yellow-400"/>
                      <p className="text-[10px] text-yellow-200">
                        ML unavailable. Using heuristic estimates.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        {result && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Map size={16} className="text-sky-400"/> Deployment Plan
              </h3>
              <button onClick={exportJSON} className="px-4 py-1.5 bg-sky-600 rounded-lg text-xs font-bold">
                <Download size={14}/> EXPORT
              </button>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {result.allocation.map((a) => (
                  <tr key={a.species} className="border-t border-slate-800">
                    <td className="p-4 font-bold">{a.species}</td>
                    <td className="p-4 text-center">{a.weight} kg</td>
                    <td className="p-4 text-center text-emerald-400">₹{a.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

const Panel = ({ title, icon, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
      {icon}
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
    </div>
    {children}
  </div>
);

const Select = ({ label, value, options, onChange, icon }) => (
  <div>
    <label className="text-[10px] font-bold uppercase text-slate-500 flex gap-1.5">
      {icon} {label}
    </label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const Number = ({ label, value, onChange, icon }) => (
  <div>
    <label className="text-[10px] font-bold uppercase text-slate-500 flex gap-1.5">
      {icon} {label}
    </label>
    <input type="number" value={value} onChange={(e) => onChange(+e.target.value)} className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"/>
  </div>
);

const Metric = ({ label, value, accent }) => (
  <div className={`p-4 rounded-xl border ${accent ? "border-emerald-500/20 bg-emerald-500/5" : "border-slate-800 bg-slate-950"}`}>
    <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const RiskBadge = ({ level }) => (
  <div className="flex justify-between items-center p-3 border border-slate-800 rounded-lg">
    <span className="text-xs font-bold uppercase">Risk</span>
    <span className="text-xs font-black">{level}</span>
  </div>
);

function buildFallbackPlan(inputs) {
  const baseRevenue = inputs.vessels * inputs.days * inputs.storageKg * 120;
  const fuelCost = inputs.fuelPrice * inputs.days * inputs.vessels * 30;
  return {
    netProfit: baseRevenue - fuelCost,
    fuelCost,
    confidence: 62,
    risk: "Medium",
    allocation: [{ species: "Mackerel", weight: baseRevenue / 120, revenue: baseRevenue }],
  };
}
