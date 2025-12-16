// src/pages/AquapredictPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Thermometer, Waves, CloudRain, MapPin, Database, BarChart2, Copy } from "lucide-react";
import { FLASK, getJSON, postJSON } from "../utils/api";

/* Leaflet */
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

/* =======================
   Region/constants & util
   ======================= */
const REGION_COORDS = {
  "Andaman Sea": [11.7401, 92.6586],
  "Chennai Coast": [13.0827, 80.2707],
  "Chennai": [13.0827, 80.2707],
  "Goa Coast": [15.2993, 74.1240],
  "Goa Bay": [15.2993, 74.1240],
  "Panaji": [15.4909, 73.8278],
  "Kerala Coast": [9.9312, 76.2673],
  "Kochi Backwaters": [9.9312, 76.2673],
  "Mumbai Harbor": [18.9388, 72.8356],
  "Rameswaram": [9.2888, 79.3129],
  "Visakhapatnam": [17.6868, 83.2185]
};

const DEFAULT_CENTER = REGION_COORDS["Chennai Coast"] || [13.0827, 80.2707];
const FALLBACK_REGIONS = Object.keys(REGION_COORDS);

/* ----------------- CSV helper ----------------- */
const downloadCSV = (rows = [], filename = "aquapredict_export.csv") => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]).join(",") + "\n";
  const body = rows
    .map((r) =>
      Object.values(r)
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
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

/* ---------------- RegionMap component ---------------- */
function RegionMap({ selectedRegion, showHeatmap = true }) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!selectedRegion) {
      setCenter(DEFAULT_CENTER);
      return;
    }
    if (REGION_COORDS[selectedRegion]) {
      setCenter(REGION_COORDS[selectedRegion]);
      return;
    }
    const key = Object.keys(REGION_COORDS).find((k) =>
      k.toLowerCase().includes(selectedRegion.toLowerCase()) ||
      selectedRegion.toLowerCase().includes(k.toLowerCase())
    );
    if (key) setCenter(REGION_COORDS[key]);
  }, [selectedRegion]);

  useEffect(() => {
    if (!showHeatmap) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getJSON(`${FLASK}/heatmap`, { timeout: 4000 });
        if (!mounted) return;
        if (data?.locations && Array.isArray(data.locations)) {
          const pts = data.locations
            .filter((p) => p.lat != null && p.lon != null)
            .map((p) => ({ lat: Number(p.lat), lon: Number(p.lon), score: Number(p.score ?? 0), state: p.state ?? "" }));
          setPoints(pts);
        } else {
          setPoints([]);
        }
      } catch (err) {
        // non-fatal
        // eslint-disable-next-line no-console
        console.warn("RegionMap: heatmap fetch failed:", err);
        setPoints([]);
      }
    })();
    return () => { mounted = false; };
  }, [showHeatmap]);

  return (
    <div className="w-full h-56 rounded-lg overflow-hidden border border-slate-800">
      <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} dragging={true}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={center}>
          <Popup>
            {selectedRegion || "Selected region"}
            <br />
            Lat: {Number(center[0]).toFixed(3)}, Lon: {Number(center[1]).toFixed(3)}
          </Popup>
        </Marker>

        {points.map((p, i) => (
          <Circle
            key={i}
            center={[p.lat, p.lon]}
            radius={20000 + p.score * 20000}
            pathOptions={{ color: p.score > 0.5 ? "#16a34a" : "#f97316", fillOpacity: 0.12 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

/* ---------------- NotesDrawer small component ---------------- */
function NotesDrawer({ open, onClose, notes, setNotes }) {
  const handleSave = () => {
    localStorage.setItem("aq_notes", notes || "");
    // small visual confirm (non-blocking): use alert? keep silent; here we'll do small toast via console
    // eslint-disable-next-line no-console
    console.log("Notes saved");
  };

  const handleExport = () => {
    const blob = new Blob([notes || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aqua_notes_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* drawer */}
      <aside className="relative ml-auto w-full max-w-md h-full bg-slate-900 text-slate-100 p-4 border-l border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Notes</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="text-sm px-3 py-1 rounded bg-slate-800/60 hover:bg-slate-800"
              title="Export notes"
            >
              Export
            </button>
            <button onClick={() => { handleSave(); onClose(); }} className="text-sm px-3 py-1 rounded bg-sky-600 hover:bg-sky-500">
              Save & Close
            </button>
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write notes for this project, observations, or reminders..."
          className="w-full h-[70%] p-3 bg-slate-800 border border-slate-700 rounded resize-none outline-none text-sm"
        />

        <div className="mt-3 text-xs text-slate-400">
          Notes are stored locally in your browser. They do not leave your machine.
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={handleSave} className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-sm">Save</button>
          <button onClick={() => { setNotes(""); localStorage.removeItem("aq_notes"); }} className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm">Clear</button>
          <button onClick={onClose} className="ml-auto px-3 py-2 rounded bg-transparent border border-slate-700 text-sm">Close</button>
        </div>
      </aside>
    </div>
  );
}

/* ----------------- Main Page ----------------- */
function AquapredictPage() {
  const [form, setForm] = useState({ date: "", region: "", temperature: "", salinity: "", rainfall: "", fishingEffort: 5, marketPrice: "" });
  const [regions, setRegions] = useState(FALLBACK_REGIONS);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);
  const [recent, setRecent] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem("aq_notes") || "");

  useEffect(() => {
    // load recent predictions from localStorage
    const saved = JSON.parse(localStorage.getItem("aq_recent") || "[]");
    setRecent(Array.isArray(saved) ? saved.slice(0, 20) : []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getJSON(`${FLASK}/regions`, { timeout: 3000 });
        if (data?.regions && Array.isArray(data.regions) && data.regions.length) setRegions(data.regions);
        else if (Array.isArray(data) && data.length) setRegions(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Could not load regions from backend — using fallback.", err);
      }
    })();
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleRange = (e) => setForm((prev) => ({ ...prev, fishingEffort: Number(e.target.value) }));

  const saveRecent = useCallback((row) => {
    const next = [row, ...recent].slice(0, 20);
    setRecent(next);
    localStorage.setItem("aq_recent", JSON.stringify(next));
    localStorage.setItem("aq_lastSaved", new Date().toISOString()); // used by global Header for Auto-saved
  }, [recent]);

  async function handlePredict(e) {
    e?.preventDefault();
    if (!form.date || !form.region) {
      alert("Please select Date and Region");
      return;
    }

    setLoading(true);
    const oxygen = 7.0 - Number(form.rainfall || 0) * 0.03;
    const month = new Date(form.date).toLocaleString("en-US", { month: "long" });

    const payload = {
      region: form.region,
      month,
      temperature: Number(form.temperature || 0),
      salinity: Number(form.salinity || 0),
      oxygen,
      fishingEffort: form.fishingEffort,
      marketPrice: Number(form.marketPrice || 0),
    };

    try {
      const res = await postJSON(`${FLASK}/advanced_predict`, payload, { timeout: 12000 });

      setPrediction(res.species ?? "Unknown");
      setMarketInsights({
        catchKg: res.catchKg ?? "-",
        priceForecast: res.price ?? "N/A",
        recommendation: res.message ?? res.recommendation ?? "—",
        probability: res.probability ?? null,
        best_time: res.best_time ?? null,
        risk: res.risk ?? null,
      });

      const savedRow = {
        time: new Date().toLocaleString(),
        region: form.region,
        month,
        species: res.species ?? "Unknown",
        probability: res.probability ?? "-",
        price: res.price ?? "-",
      };

      saveRecent(savedRow);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Prediction error:", err);
      alert("Prediction failed — check backend console and browser network tab.\n\n" + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  const handleExportRecent = useCallback(() => {
    if (!recent.length) return alert("No recent predictions to export.");
    downloadCSV(recent, "aquapredict_recent_predictions.csv");
  }, [recent]);

  /* --------------- Header event handlers --------------- */
  useEffect(() => {
    const onExport = () => handleExportRecent();
    const onCopy = async () => {
      if (!recent.length) return alert("No recent predictions to copy.");
      try {
        await navigator.clipboard.writeText(JSON.stringify(recent, null, 2));
        alert("Recent predictions copied to clipboard.");
      } catch {
        alert("Copy failed. Please export CSV instead.");
      }
    };

    // Toggle notes now opens our drawer instead of an alert
    const onToggleNotes = () => setNotesOpen((s) => !s);

    window.addEventListener("export-csv", onExport);
    window.addEventListener("copy-json", onCopy);
    window.addEventListener("toggle-notes", onToggleNotes);

    return () => {
      window.removeEventListener("export-csv", onExport);
      window.removeEventListener("copy-json", onCopy);
      window.removeEventListener("toggle-notes", onToggleNotes);
    };
  }, [recent, handleExportRecent]);

  /* ----------------- Page JSX ----------------- */
  return (
    <>
      <div className="min-h-screen bg-[#071025] text-white text-lg">
        <div className="w-full max-w-full mx-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left — Control panel */}
            <section className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Control Panel</h3>
                <div className="text-sm text-slate-400">Inputs</div>
              </div>

              <form onSubmit={handlePredict} className="space-y-3">
                <div>
                  <label className="text-sm text-slate-300">Date</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full p-3 mt-2 bg-slate-800 border border-slate-700 rounded-md text-white text-base" disabled={loading} />
                </div>

                <div>
                  <label className="text-sm text-slate-300 flex items-center gap-2">Region <MapPin size={14} className="text-slate-400" /></label>
                  <select name="region" value={form.region} onChange={handleChange} className="w-full p-3 mt-2 bg-slate-800 border border-slate-700 rounded-md text-white text-base" disabled={loading}>
                    <option value="">Select Region</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-300 flex items-center gap-2"><Thermometer size={14} className="text-slate-400" /> Temp (°C)</label>
                    <input name="temperature" value={form.temperature} onChange={handleChange} type="number" step="0.1" className="w-full p-3 mt-2 bg-slate-800 border border-slate-700 rounded-md text-white text-base" placeholder="e.g. 28.5" disabled={loading} />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 flex items-center gap-2"><Waves size={14} className="text-slate-400" /> Salinity (ppt)</label>
                    <input name="salinity" value={form.salinity} onChange={handleChange} type="number" step="0.1" className="w-full p-3 mt-2 bg-slate-800 border border-slate-700 rounded-md text-white text-base" placeholder="e.g. 32" disabled={loading} />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 flex items-center gap-2"><CloudRain size={14} className="text-slate-400" /> Rainfall (mm)</label>
                  <input name="rainfall" value={form.rainfall} onChange={handleChange} type="number" step="0.1" className="w-full p-3 mt-2 bg-slate-800 border border-slate-700 rounded-md text-white text-base" placeholder="Recent rainfall" disabled={loading} />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Fishing Effort: <span className="text-slate-200 font-medium">{form.fishingEffort}</span></label>
                  <input type="range" min="0" max="10" value={form.fishingEffort} onChange={handleRange} className="w-full mt-3" disabled={loading} />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Local Market Price (₹/kg)</label>
                  <input name="marketPrice" value={form.marketPrice} onChange={handleChange} type="number" className="w-full p-3 mt-2 bg-slate-800 border border-slate-700 rounded-md text-white text-base" placeholder="e.g. 450" disabled={loading} />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold shadow text-base">
                    {loading ? "Predicting…" : "Run Prediction"}
                  </button>
                </div>
              </form>

              <div className="mt-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h4 className="text-sm text-slate-300 mb-3">Quick Stats</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 rounded-md text-center border border-slate-800">
                    <div className="text-xs text-slate-400">Nodes</div>
                    <div className="font-bold text-sky-400 text-lg">6</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-md text-center border border-slate-800">
                    <div className="text-xs text-slate-400">Models</div>
                    <div className="font-bold text-sky-400 text-lg">3</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-md text-center border border-slate-800">
                    <div className="text-xs text-slate-400">Markets</div>
                    <div className="font-bold text-sky-400 text-lg">4</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Center — Prediction output */}
            <section className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Prediction Output</h3>
                <div className="text-sm text-slate-400">Model insights</div>
              </div>

              <div className="flex-1 overflow-auto space-y-4">
                <div className="p-4 rounded-lg border border-dashed border-slate-800 bg-slate-800 text-center">
                  <div className="text-sm text-slate-400">Best Catch Species</div>
                  <div className="mt-3 text-2xl font-extrabold text-sky-400">{prediction ?? "—"}</div>

                  {marketInsights && (
                    <div className="mt-3 text-base text-slate-300">
                      <div>Expected Catch: <strong className="text-white">{marketInsights.catchKg} kg</strong></div>
                      <div>Price Outlook: <strong className="text-white">{marketInsights.priceForecast}</strong></div>
                      <div>Market Advice: <strong className="text-white">{marketInsights.recommendation}</strong></div>
                      {marketInsights.probability != null && <div className="mt-2 text-sm text-slate-400">Confidence: {(marketInsights.probability * 100).toFixed(0)}%</div>}
                      {marketInsights.best_time && <div className="text-sm text-slate-400">Best time: {marketInsights.best_time}</div>}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="text-sm text-slate-400">Environmental Score</div>
                    <div className="mt-2 h-10 bg-slate-900 rounded-md flex items-center justify-between px-3">
                      <div className="text-sky-400 font-semibold text-lg">78</div>
                      <div className="text-sm text-slate-400">Good</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="text-sm text-slate-400">Short-term Price Trend</div>
                    <div className="mt-2 text-sky-400 font-semibold text-lg">{marketInsights?.priceForecast ?? "—"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Regional Map</div>
                  <RegionMap selectedRegion={form.region} showHeatmap={true} />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => navigator.clipboard?.writeText(JSON.stringify({ prediction, marketInsights }))} className="flex-1 py-2 rounded-md border border-slate-700 text-slate-300">
                  Copy Result
                </button>

                <button onClick={() => downloadCSV(recent, "aquapredict_recent.csv")} className="py-2 px-4 bg-slate-800 border border-slate-700 rounded-md text-sky-400">
                  Download
                </button>
              </div>
            </section>

            {/* Right — Market insights + recent */}
            <section className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Market Analysis</h3>
                <div className="text-sm text-slate-400">Signals</div>
              </div>

              <div className="space-y-4 flex-1 overflow-auto pr-1">
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400">Top Recommendation</div>
                  <div className="mt-2 font-semibold text-sky-400">Sell at peak — Chennai markets expected +8% next week</div>
                </div>

                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400">Demand Signals</div>
                  <ul className="mt-2 text-base text-slate-300 list-disc pl-5">
                    <li>Local restaurants demand rising for small pelagic fish</li>
                    <li>Export demand to SE Asia stable</li>
                    <li>Price sensitivity high in Goa Coast</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div>Recent Predictions</div>
                    <div className="text-sm text-slate-400">{recent.length} saved</div>
                  </div>

                  <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
                    {recent.length ? (
                      recent.map((r, i) => (
                        <div key={i} className="p-3 bg-slate-900 rounded-md border border-slate-800 flex justify-between items-center text-base">
                          <div>
                            <div className="font-medium text-slate-200">{r.species}</div>
                            <div className="text-sm text-slate-400">{r.region} • {r.time}</div>
                          </div>
                          <div className="text-sm text-slate-400">{r.probability ?? r.price}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-400">No saved predictions yet.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-right">
                <button onClick={() => setNotesOpen(true)} className="text-sm text-sky-400 font-medium flex items-center gap-2">
                  <Copy size={14} /> Notes
                </button>
              </div>
            </section>
          </div>

          <div className="mt-6 text-sm text-slate-400 text-center">Built with AquaPredict · AI Fishing & Regional Market Analysis</div>
        </div>
      </div>

      {/* Notes Drawer */}
      <NotesDrawer open={notesOpen} onClose={() => setNotesOpen(false)} notes={notes} setNotes={setNotes} />
    </>
  );
}

export default AquapredictPage;
