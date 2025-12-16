import React from "react";

const InputField = ({ icon: Icon, label, ...props }) => (
  <div className="flex flex-col gap-2">
    {/* Label with icon on left */}
    <label className="font-semibold text-gray-700 text-sm flex items-center gap-2">
      {Icon && <Icon size={18} className="text-sky-500" />} {label}
    </label>

    {/* Plain input box */}
    <input
      {...props}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 
      bg-white text-gray-800 placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-sky-400 
      hover:border-sky-300 transition-all duration-200"
    />
  </div>
);

export default InputField;
