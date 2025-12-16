import React from 'react';

const StatCard = ({ title, value, unit, icon: Icon, color = 'sky', trend }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-slate-700">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
        <Icon size={24} className={`text-${color}-600 dark:text-${color}-400`} />
      </div>
      {trend !== null && (
        <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '+' : ''}
          {trend}%
        </span>
      )}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 font-semibold text-sm uppercase mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
      {value}
      {unit && <span className="text-gray-500 dark:text-gray-400 text-lg ml-1">{unit}</span>}
    </p>
  </div>
);

export default StatCard;
