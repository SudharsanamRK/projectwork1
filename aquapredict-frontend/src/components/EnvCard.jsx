import React from "react";

const EnvCard = ({ icon: Icon, title, value, color = "sky" }) => {
  // Safely handle Tailwind colors using template literals + mapping
  const colorClasses = {
    sky: "text-sky-600 dark:text-sky-400",
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    teal: "text-teal-600 dark:text-teal-400",
    purple: "text-purple-600 dark:text-purple-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    violet: "text-violet-600 dark:text-violet-400",
    pink: "text-pink-600 dark:text-pink-400",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 
                    hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
      <div className={`flex items-center gap-3 mb-4 ${colorClasses[color]}`}>
        {Icon && <Icon className="w-5 h-5" />}
        <span className="font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
          {title}
        </span>
      </div>
      <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Updated just now</div>
    </div>
  );
};

export default EnvCard;
