import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-gray-50/50 border border-gray-200 text-gray-900 text-[17px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ios-blue/20 focus:border-ios-blue transition-all placeholder:text-gray-400 min-h-[48px] touch-manipulation ${className}`}
        {...props}
      />
    </div>
  );
};