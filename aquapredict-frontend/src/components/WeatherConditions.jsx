import React from "react";
import { Thermometer, Droplet, Waves, CloudSun } from "lucide-react";

const WeatherConditions = () => {
  const conditions = [
    {
      icon: <CloudSun className="text-yellow-400" />,
      title: "Current Conditions",
      value: "21°C",
      desc: "Mostly Sunny",
      info: ["Wind: 12 km/h W", "Humidity: 68%", "Tide: High at 4:30 PM"],
    },
    {
      icon: <Thermometer className="text-red-400" />,
      title: "Sea Surface Temp.",
      value: "18.2°C",
      desc: "↑ +0.3°C vs yesterday",
      info: ["Normal range: 17–19°C"],
    },
    {
      icon: <Droplet className="text-blue-400" />,
      title: "Salinity",
      value: "34.5 PSU",
      desc: "↓ 0.1 vs yesterday",
      info: ["Slight variation detected"],
    },
    {
      icon: <Waves className="text-cyan-400" />,
      title: "Wave Activity",
      value: "0.8 m",
      desc: "↓ Calm Sea",
      info: ["Safe for fishing today"],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {conditions.map((c, i) => (
        <div
          key={i}
          className="bg-[#0b203a] p-5 rounded-2xl text-white flex flex-col gap-1 shadow-md"
        >
          <div className="flex items-center gap-2">
            {c.icon}
            <h3 className="font-semibold">{c.title}</h3>
          </div>
          <h2 className="text-3xl font-bold">{c.value}</h2>
          <p className="text-sm">{c.desc}</p>
          <div className="text-xs text-gray-400">
            {c.info.map((line, j) => (
              <p key={j}>{line}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherConditions;
