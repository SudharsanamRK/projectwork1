import React from "react";

const RecentPredictionsTable = () => {
  // Dummy prediction data
  const predictions = [
    { fish: "Tuna", confidence: 95, date: "2025-11-02" },
    { fish: "Salmon", confidence: 89, date: "2025-11-01" },
    { fish: "Mackerel", confidence: 91, date: "2025-10-30" },
    { fish: "Pomfret", confidence: 86, date: "2025-10-29" },
    { fish: "Sardine", confidence: 90, date: "2025-10-28" },
  ];

  return (
    <div className="bg-[#0b203a] text-white p-5 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">🧠 Recent Predictions</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-600">
            <th className="p-3">Fish Name</th>
            <th className="p-3">Confidence</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p, index) => (
            <tr
              key={index}
              className="border-b border-gray-700 hover:bg-gray-800 transition"
            >
              <td className="p-3">{p.fish}</td>
              <td className="p-3 text-green-400 font-medium">
                {p.confidence}%
              </td>
              <td className="p-3 text-gray-300">{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentPredictionsTable;
