import React, { useState } from "react";
import { Fish, Gauge, Droplets, Cloud } from "lucide-react";

const FishPredictor = () => {
  const [formData, setFormData] = useState({
    region: "",
    month: "",
    temperature: "",
    salinity: "",
    oxygen: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Unable to connect to backend. Check Flask server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white bg-linear-to-br from-slate-900 to-slate-800 min-h-screen rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Fish className="text-sky-400" /> Fish Species Predictor
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-800/60 p-6 rounded-xl shadow-inner"
      >
        {/* REGION */}
        <select
          name="region"
          value={formData.region}
          onChange={handleChange}
          required
          className="p-3 rounded-lg bg-slate-700 text-white border border-slate-600"
        >
          <option value="">Select Region</option>
          <option value="Chennai Coast">Chennai Coast</option>
          <option value="Kochi Backwaters">Kochi Backwaters</option>
          <option value="Goa Bay">Goa Bay</option>
          <option value="Mumbai Harbor">Mumbai Harbor</option>
          <option value="Andaman Sea">Andaman Sea</option>
        </select>

        {/* MONTH */}
        <select
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
          className="p-3 rounded-lg bg-slate-700 text-white border border-slate-600"
        >
          <option value="">Select Month</option>
          {[
            "January","February","March","April","May","June",
            "July","August","September","October","November","December",
          ].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* TEMPERATURE */}
        <div className="flex items-center gap-2 bg-slate-700 p-3 rounded-lg border border-slate-600">
          <Gauge className="text-sky-400" size={18} />
          <input
            type="number"
            name="temperature"
            placeholder="Temperature (°C)"
            onChange={handleChange}
            className="bg-transparent w-full focus:outline-none"
            required
          />
        </div>

        {/* SALINITY */}
        <div className="flex items-center gap-2 bg-slate-700 p-3 rounded-lg border border-slate-600">
          <Droplets className="text-sky-400" size={18} />
          <input
            type="number"
            name="salinity"
            placeholder="Salinity (PSU)"
            onChange={handleChange}
            className="bg-transparent w-full focus:outline-none"
            required
          />
        </div>

        {/* OXYGEN */}
        <div className="flex items-center gap-2 bg-slate-700 p-3 rounded-lg border border-slate-600 md:col-span-2">
          <Cloud className="text-sky-400" size={18} />
          <input
            type="number"
            name="oxygen"
            placeholder="Oxygen (mg/L)"
            onChange={handleChange}
            className="bg-transparent w-full focus:outline-none"
            required
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 font-semibold transition-all duration-200"
        >
          {loading ? "Predicting..." : "Predict Species"}
        </button>
      </form>

      {result && (
        <div className="mt-8 bg-slate-800/80 p-6 rounded-xl border border-slate-700">
          <h3 className="text-2xl font-semibold mb-2 text-sky-400">Prediction Result</h3>
          <p className="text-lg">
            <b>Species:</b> {result.species}
          </p>
          <p className="text-lg">
            <b>Abundance:</b> {result.abundance}
          </p>
        </div>
      )}
    </div>
  );
};

export default FishPredictor;
