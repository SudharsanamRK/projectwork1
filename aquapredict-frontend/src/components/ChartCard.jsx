import React from 'react';

const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-slate-700">
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{title}</h3>
    {children}
  </div>
);

export default ChartCard;
