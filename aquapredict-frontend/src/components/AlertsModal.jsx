// src/components/AlertsModal.jsx
import React, { useState } from "react";
import useAlerts from "../hooks/useAlerts";

export default function AlertsModal({ speciesList = [], open, onClose, onCreate }) {
  const { rules, addRule, removeRule, toggleRule } = useAlerts();
  const [species, setSpecies] = useState(speciesList[0] || "");
  const [type, setType] = useState("gte");
  const [threshold, setThreshold] = useState("");

  if (!open) return null;

  const handleAdd = () => {
    if (!species || !threshold) return alert("Pick species and threshold.");
    addRule({ species, type, threshold: Number(threshold) });
    setThreshold("");
    onCreate?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Price Alerts</h3>
          <button onClick={onClose} className="text-sm text-slate-500">Close</button>
        </div>

        <div className="space-y-3 mb-3">
          <div>
            <label className="block text-xs text-slate-500">Species</label>
            <select value={species} onChange={(e)=>setSpecies(e.target.value)} className="w-full p-2 bg-slate-800 text-white rounded">
              {speciesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select value={type} onChange={(e)=>setType(e.target.value)} className="p-2 bg-slate-800 rounded text-white">
              <option value="gte">Notify when ≥</option>
              <option value="lte">Notify when ≤</option>
            </select>
            <input value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="Price (₹)" className="p-2 col-span-2 bg-slate-800 rounded text-white" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-sky-600 px-3 py-2 rounded text-white">Create</button>
            <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(rules,null,2)); alert("Copied rules") }} className="px-3 py-2 rounded bg-slate-700 text-white">Export</button>
          </div>
        </div>

        <div>
          <h4 className="text-sm mb-2">Active Rules</h4>
          <div className="space-y-2 max-h-40 overflow-auto">
            {rules.length ? rules.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm">
                <div>
                  <div className="font-medium">{r.species}</div>
                  <div className="text-xs text-slate-400">{r.type === "gte" ? `≥ ${r.threshold}` : `≤ ${r.threshold}`}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>toggleRule(r.id)} className="text-xs px-2 py-1 bg-slate-700 rounded">{r.enabled ? "On" : "Off"}</button>
                  <button onClick={()=>removeRule(r.id)} className="text-xs px-2 py-1 bg-red-600 rounded">Delete</button>
                </div>
              </div>
            )) : <div className="text-xs text-slate-400">No rules yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
