import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Ship,
  Fuel,
  Weight,
  Anchor,
  AlertTriangle,
  TrendingUp,
  Brain,
  Download,
} from "lucide-react";
import FishRecommendationCard from "../components/FishRecommendationCard";


/* =========================
   USER-LEVEL INPUT MODELS
========================= */
const REGIONS = [
  "Chennai Coast",
  "Goa Coast",
  "Mumbai Harbor",
  "Andaman Sea",
];

const GEAR_TYPES = [
  "Trawl Net",
  "Gillnet",
  "Longline",
  "Cast Net",
];

/* =========================
   API CONFIG
========================= */
const API_URL = "http://localhost:5000/api/harvest/plan"; 
// ⬆️ replace with real ML endpoint later

/* =========================
   MAIN COMPONENT
========================= */
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

  /* =========================
     FETCH ML PLAN
  ========================= */
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
      } catch (err) {
        // 🔁 fallback heuristic (keeps app usable)
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

  /* =========================
     EXPORT PLAN
  ========================= */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harvest_plan_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* INPUTS */}
        <section className="grid lg:grid-cols-3 gap-6">
          <Panel title="Fishing Details">
            <Select label="Fishing Area" value={inputs.region} options={REGIONS}
              onChange={(v) => setInputs({ ...inputs, region: v })} />
            <Select label="Gear Used" value={inputs.gear} options={GEAR_TYPES}
              onChange={(v) => setInputs({ ...inputs, gear: v })} />
            <Number label="Number of Boats" value={inputs.vessels}
              onChange={(v) => setInputs({ ...inputs, vessels: v })} />
          </Panel>

          <Panel title="Trip Planning">
            <Number label="Trip Duration (days)" value={inputs.days}
              onChange={(v) => setInputs({ ...inputs, days: v })} />
            <Number label="Storage per Boat (kg)" value={inputs.storageKg}
              onChange={(v) => setInputs({ ...inputs, storageKg: v })} />
            <Number label="Fuel Price (₹/L)" value={inputs.fuelPrice}
              onChange={(v) => setInputs({ ...inputs, fuelPrice: v })} />
          </Panel>

          <Panel title="AI Summary">
            {loading && <p className="text-slate-400">AI computing plan…</p>}

            {result && (
              <>
                {/* 
                AI CARD */}
                <FishRecommendationCard
                  rec={result.allocation?.[0]}
                  fallback={usingFallback}
                />

                <Metric
                  label="Expected Profit"
                  value={`₹${result.netProfit.toLocaleString()}`}
                  good
                />
                <Metric
                  label="Fuel Cost"
                  value={`₹${result.fuelCost.toLocaleString()}`}
                />
                <Metric
                  label="AI Confidence"
                  value={`${result.confidence}%`}
                />
                <RiskBadge level={result.risk} />
              </>
            )}

            {usingFallback && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠ Using rule-based fallback (ML offline)
              </p>
            )}
          </Panel>

        </section>

        {/* PLAN TABLE */}
        {result && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <h3 className="font-semibold">Recommended Catch Plan</h3>
              <button
                onClick={exportJSON}
                className="flex items-center gap-2 px-3 py-2 bg-sky-600 rounded-md text-sm"
              >
                <Download size={14} /> Export
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-3 text-left">Species</th>
                  <th className="p-3">Catch (kg)</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Why AI chose this</th>
                </tr>
              </thead>
              <tbody>
                {result.allocation.map((a) => (
                  <tr key={a.species} className="border-t border-slate-800">
                    <td className="p-3 font-medium">{a.species}</td>
                    <td className="p-3">{a.weight}</td>
                    <td className="p-3 text-green-400">
                      ₹{a.revenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-xs text-slate-400">
                      {a.reasons.join(" • ")}
                    </td>
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

/* =========================
   FALLBACK LOGIC (NO ML)
========================= */
function buildFallbackPlan(inputs) {
  const baseRevenue =
    inputs.vessels * inputs.days * inputs.storageKg * 120;

  const fuelCost =
    inputs.fuelPrice * inputs.days * inputs.vessels * 30;

  return {
    netProfit: Math.round(baseRevenue - fuelCost),
    fuelCost: Math.round(fuelCost),
    confidence: 62,
    risk: "Medium",
    allocation: [
      {
        species: "Mackerel",
        weight: Math.round(baseRevenue / 120),
        revenue: Math.round(baseRevenue),
        reasons: ["Stable market", "Low fuel risk"],
      },
    ],
  };
}

/* =========================
   SMALL UI PARTS
========================= */
const Panel = ({ title, children }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
    <h3 className="text-sm text-slate-300">{title}</h3>
    {children}
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-xs text-slate-400">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 p-2 rounded mt-1"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const Number = ({ label, value, onChange }) => (
  <div>
    <label className="text-xs text-slate-400">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="w-full bg-slate-800 p-2 rounded mt-1"
    />
  </div>
);

const Metric = ({ label, value, good }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`text-xl font-bold ${good ? "text-green-400" : ""}`}>
      {value}
    </p>
  </div>
);

const RiskBadge = ({ level }) => (
  <div
    className={`p-2 rounded text-xs ${
      level === "High"
        ? "bg-red-500/20 text-red-400"
        : level === "Medium"
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-green-500/20 text-green-400"
    }`}
  >
    Risk Level: {level}
  </div>
);
