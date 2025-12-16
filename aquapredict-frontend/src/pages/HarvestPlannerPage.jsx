// HarvestPlannerPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DownloadCloud, Calendar, Layers, ShieldCheck, Copy } from "lucide-react";

/* ---------- Helpers & mock (same as before) ---------- */
const round = (n, d = 0) => Number(Number(n).toFixed(d));

function buildSpeciesPlan(speciesList, regionBoost = 1, targetRevenue = 50000, conservationWeight = 0.5) {
  const maxPrice = Math.max(...speciesList.map((s) => s.avgPrice));
  const scored = speciesList.map((s) => {
    const priceScore = s.avgPrice / (maxPrice || 1);
    const sustainScore = s.sustainabilityIndex;
    const weight = priceScore * (1 - conservationWeight) + sustainScore * conservationWeight;
    const availability = s.seasonalFactor * regionBoost;
    return { ...s, weight, availability };
  });

  const totalWeight = scored.reduce((acc, s) => acc + s.weight * s.availability, 0) || 1;

  const rows = scored.map((s) => {
    const share = (s.weight * s.availability) / totalWeight;
    const revenue = targetRevenue * share;
    const qty = revenue / (s.avgPrice || 1);
    return {
      species: s.name,
      avgPrice: s.avgPrice,
      qty: round(qty, 2),
      revenue: round(revenue, 0),
      sustainabilityIndex: s.sustainabilityIndex,
      share: round(share * 100, 2),
    };
  });

  const totalRevenue = rows.reduce((a, b) => a + b.revenue, 0);
  const totalKg = round(rows.reduce((a, b) => a + b.qty, 0), 2);
  const rawSust = rows.reduce((a, b) => a + b.sustainabilityIndex * b.revenue, 0) / (totalRevenue || 1);
  const sustainabilityScore = Math.round(rawSust * 100);

  return { rows, totalRevenue, totalKg, sustainabilityScore };
}

const MOCK_SPECIES = [
  { id: "tuna", name: "Tuna", avgPrice: 350, seasonalFactor: 1.0, sustainabilityIndex: 0.6 },
  { id: "mackerel", name: "Mackerel", avgPrice: 110, seasonalFactor: 1.1, sustainabilityIndex: 0.9 },
  { id: "sardine", name: "Sardine", avgPrice: 70, seasonalFactor: 0.9, sustainabilityIndex: 0.95 },
  { id: "pomfret", name: "Pomfret", avgPrice: 420, seasonalFactor: 0.8, sustainabilityIndex: 0.5 },
  { id: "seer", name: "Seer Fish", avgPrice: 300, seasonalFactor: 1.05, sustainabilityIndex: 0.65 },
];

/* ---------- small UI subcomponents (kept local) ---------- */
const KPICard = ({ title, value, sub }) => (
  <div className="bg-slate-800 p-3 rounded-lg">
    <div className="text-slate-400 text-xs">{title}</div>
    <div className="text-lg font-semibold">{value}</div>
    {sub && <div className="text-slate-400 text-xs mt-1">{sub}</div>}
  </div>
);

/* ---------- Page ---------- */
export default function HarvestPlannerPage() {
  const [form, setForm] = useState(() => {
    try {
      const s = localStorage.getItem("harvestPlannerForm");
      return s ? JSON.parse(s) : { region: "Chennai Coast", days: 3, targetRevenue: 50000, conservationWeight: 0.35, vessels: 3 };
    } catch {
      return { region: "Chennai Coast", days: 3, targetRevenue: 50000, conservationWeight: 0.35, vessels: 3 };
    }
  });

  const [notesOpen, setNotesOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  // save autosave timestamp and form
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("harvestPlannerForm", JSON.stringify(form));
      const now = new Date().toISOString();
      localStorage.setItem("harvestPlannerLastSaved", now); // header reads this key
      // also set a separate key used by Header
    }, 300);
    return () => clearTimeout(t);
  }, [form]);

  // wire global header events (export / copy / notes)
  useEffect(() => {
    const onExport = () => {
      exportCSV(plan.rows);
    };
    const onCopy = () => {
      copyJSON(plan.rows);
    };
    const onToggleNotes = () => setNotesOpen((s) => !s);

    window.addEventListener("export-csv", onExport);
    window.addEventListener("copy-json", onCopy);
    window.addEventListener("toggle-notes", onToggleNotes);

    return () => {
      window.removeEventListener("export-csv", onExport);
      window.removeEventListener("copy-json", onCopy);
      window.removeEventListener("toggle-notes", onToggleNotes);
    };
  }, []); // eslint-disable-line

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const regionModifiers = { "Chennai Coast": 1.0, "Kochi Backwaters": 0.9, "Goa Bay": 1.05, "Mumbai Harbor": 0.95, "Andaman Sea": 1.15 };

  const plan = useMemo(() => {
    const regionBoost = regionModifiers[form.region] ?? 1.0;
    return buildSpeciesPlan(MOCK_SPECIES, regionBoost, form.targetRevenue, form.conservationWeight);
  }, [form.region, form.targetRevenue, form.conservationWeight]);

  const vesselAllocation = useMemo(() => {
    const totalKg = plan.totalKg || 0;
    const vCount = Math.max(1, Math.floor(form.vessels || 1));
    const per = round(totalKg / vCount, 2);
    return Array.from({ length: vCount }).map((_, i) => ({ id: `Vessel-${i + 1}`, assignedKg: per }));
  }, [plan.totalKg, form.vessels]);

  const suggestedDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < Math.max(1, Math.floor(form.days || 1)); i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, [form.days]);

  // CSV export and JSON copy (same logic)
  const exportCSV = useCallback((rows = []) => {
    if (!rows || !rows.length) return alert("No plan to export");
    const header = ["Species", "Qty (kg)", "Est. Revenue (₹)", "SustainabilityIndex"];
    const csv = [header, ...rows.map((r) => [r.species, r.qty, r.revenue, r.sustainabilityIndex])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harvest-plan-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const copyJSON = useCallback(async (rows = []) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Copy failed — please export CSV instead.");
    }
  }, []);

  // simple validation
  const invalid = useMemo(() => {
    const errs = [];
    if (!form.region) errs.push("Region is required");
    if (!form.targetRevenue || form.targetRevenue < 1000) errs.push("Target revenue must be >= 1000");
    if (form.days < 1 || form.days > 14) errs.push("Days window must be between 1 and 14");
    if (form.vessels < 1) errs.push("At least 1 vessel is required");
    return errs;
  }, [form]);

  return (
    <div className="min-h-screen p-6 text-white space-y-6">
      {/* Notice: Page header (title/actions) has been moved to global Header component.
          This page focuses on the planner UI only. */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* planner form - left column */}
        <div className="lg:col-span-1 bg-slate-900 p-5 rounded-2xl shadow space-y-4">
          <div className="text-slate-300 text-sm">Plan Parameters</div>

          <label className="block text-slate-400 text-sm">Region</label>
          <select value={form.region} onChange={(e) => setField("region", e.target.value)} className="w-full p-3 mt-1 bg-slate-800 rounded-md border border-slate-700">
            <option>Chennai Coast</option>
            <option>Kochi Backwaters</option>
            <option>Goa Bay</option>
            <option>Mumbai Harbor</option>
            <option>Andaman Sea</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-sm">Window (days)</label>
              <input type="number" value={form.days} onChange={(e) => setField("days", Math.max(1, Math.min(14, Number(e.target.value || 1))))} className="w-full p-3 mt-1 bg-slate-800 rounded-md border border-slate-700" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm">Vessels</label>
              <input type="number" value={form.vessels} onChange={(e) => setField("vessels", Math.max(1, Number(e.target.value || 1)))} className="w-full p-3 mt-1 bg-slate-800 rounded-md border border-slate-700" />
            </div>
          </div>

          <label className="block text-slate-400 text-sm">Target Revenue (₹)</label>
          <input type="number" value={form.targetRevenue} onChange={(e) => setField("targetRevenue", Math.max(1000, Number(e.target.value || 1000)))} className="w-full p-3 mt-1 bg-slate-800 rounded-md border border-slate-700" />

          <label className="block text-slate-400 text-sm">Conservation Priority</label>
          <div className="flex items-center gap-3">
            <input type="range" min="0" max="1" step="0.05" value={form.conservationWeight} onChange={(e) => setField("conservationWeight", Number(e.target.value))} className="w-full" />
            <div className="text-sm w-16 text-right">{Math.round(form.conservationWeight * 100)}%</div>
          </div>

          {invalid.length > 0 && <div className="text-rose-400 text-sm">{invalid.map((m) => <div key={m}>{m}</div>)}</div>}

          <div className="pt-2">
            <button onClick={() => setField("targetRevenue", Math.round(form.targetRevenue * (0.95 + Math.random() * 0.1)))} className="w-full bg-sky-500 hover:bg-sky-600 transition-colors p-3 rounded-md font-semibold">Recalculate Plan</button>
          </div>
        </div>

        {/* results - right 2 columns */}
        <div className="lg:col-span-2 bg-slate-900 p-5 rounded-2xl shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Suggested Plan</h2>
              <div className="text-slate-400 text-sm">Based on selected region & conservation target</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-400">Est. Revenue</div>
              <div className="text-xl font-bold">₹ {plan.totalRevenue}</div>
            </div>
          </div>

          {/* species table */}
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left">
                  <th className="py-2 pr-4">Species</th>
                  <th className="py-2 pr-4">Qty (kg)</th>
                  <th className="py-2 pr-4">Est. Revenue (₹)</th>
                  <th className="py-2 pr-4">Sustainability</th>
                  <th className="py-2 pr-4">Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((r) => (
                  <tr key={r.species} className="border-t border-slate-800">
                    <td className="py-3 pr-4 font-medium">{r.species}</td>
                    <td className="py-3 pr-4">{r.qty}</td>
                    <td className="py-3 pr-4">₹ {r.revenue}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-slate-300">{Math.round(r.sustainabilityIndex * 100)}%</div>
                        <div className="w-32 h-2 bg-slate-800 rounded"><div style={{ width: `${r.sustainabilityIndex * 100}%` }} className="h-2 bg-emerald-500 rounded" /></div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{r.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard title="Total Harvest (kg)" value={`${plan.totalKg} kg`} />
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-slate-400 text-sm">Vessel Allocation</div>
              <div className="text-sm mt-2 space-y-2">
                {vesselAllocation.map((v) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <div>{v.id}</div>
                    <div className="font-medium">{v.assignedKg} kg</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2"><ShieldCheck /><div className="text-slate-400 text-sm">Sustainability Score</div></div>
              <div className="text-2xl font-bold mt-2">{plan.sustainabilityScore}/100</div>
              <div className="text-xs text-slate-400 mt-1">Higher is better — increases when plan favors species with stronger sustainability indexes.</div>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Calendar className="text-sky-400" /><div className="font-semibold">Suggested Harvest Dates</div></div>
              <div className="text-slate-400 text-sm">{form.days} day window</div>
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              {suggestedDates.map((d) => (<div key={d} className="bg-slate-900 px-3 py-2 rounded-md select-text">{d}</div>))}
            </div>
          </div>

          {notesOpen && (
            <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-300">
              <div className="font-semibold flex items-center gap-2"><Layers /> Planner Notes</div>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Model uses mock seasonal & region modifiers — replace with live sensors / catch data for accuracy.</li>
                <li>Conservation Priority increases allocation toward species with higher sustainability index.</li>
                <li>Vessel allocation is simplistic — consider matching species with gear/vessel capabilities in future iterations.</li>
                <li>Plan is a recommendation. Observe regulations & quotas before harvesting.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="text-slate-500 text-sm">Tip: Increase Conservation Priority to protect sensitive stocks and still meet revenue goals by diversifying species mix.</div>
    </div>
  );
}
