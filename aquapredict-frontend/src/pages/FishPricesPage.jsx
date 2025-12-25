import React, { useState, useEffect } from "react";

export default function FishPricesPage() {
  const [state, setState] = useState("Tamil Nadu");
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/fish-prices?state=${state}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching prices:", err);
      }
    };

    fetchPrices();
  }, [state]); 

  return (
    <div className="text-white space-y-4">
      <h2 className="text-xl font-bold">Market Fish Prices - India</h2>

      <select
        className="bg-slate-800 p-2 rounded"
        value={state}
        onChange={(e) => setState(e.target.value)}
      >
        <option>Tamil Nadu</option>
        <option>Kerala</option>
        <option>Maharashtra</option>
        <option>Goa</option>
        <option>West Bengal</option>
      </select>

      <table className="w-full text-left bg-slate-900 rounded-xl overflow-hidden">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-2">Fish</th>
            <th className="p-2">Market</th>
            <th className="p-2">Price (₹/kg)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((x, i) => (
            <tr key={i} className="border-b border-slate-700">
              <td className="p-2">{x.fish}</td>
              <td className="p-2">{x.market}</td>
              <td className="p-2 text-sky-400 font-semibold">₹{x.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
