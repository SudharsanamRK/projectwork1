import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const fishData = {
  Tuna: [
    { month: "Jan", forecast: 22.4, actual: 22.1 },
    { month: "Feb", forecast: 23.5, actual: 23.1 },
    { month: "Mar", forecast: 24.0, actual: 23.8 },
    { month: "Apr", forecast: 25.5, actual: 25.1 },
    { month: "May", forecast: 26.0, actual: 25.8 },
  ],
  Salmon: [
    { month: "Jan", forecast: 18.2, actual: 18.0 },
    { month: "Feb", forecast: 18.5, actual: 18.3 },
    { month: "Mar", forecast: 19.1, actual: 18.7 },
    { month: "Apr", forecast: 19.8, actual: 19.4 },
    { month: "May", forecast: 20.2, actual: 19.9 },
  ],
  Mackerel: [
    { month: "Jan", forecast: 14.0, actual: 13.8 },
    { month: "Feb", forecast: 14.5, actual: 14.2 },
    { month: "Mar", forecast: 14.8, actual: 14.6 },
    { month: "Apr", forecast: 15.0, actual: 14.9 },
    { month: "May", forecast: 15.4, actual: 15.0 },
  ],
};

function MarketForecastChart() {
  const [selectedFish, setSelectedFish] = useState("Tuna");
  const [chartData, setChartData] = useState(fishData["Tuna"]);

  useEffect(() => {
    setChartData(fishData[selectedFish]);
  }, [selectedFish]);

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Market Price Forecast ($/kg)
        </h2>
        <select
          value={selectedFish}
          onChange={(e) => setSelectedFish(e.target.value)}
          className="bg-gray-800 text-white px-3 py-1 rounded-md border border-gray-700 focus:outline-none"
        >
          {Object.keys(fishData).map((fish) => (
            <option key={fish} value={fish}>
              {fish}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#34d399"
            name="AI Forecast"
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#818cf8"
            name="Actual Price"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MarketForecastChart;
