import React from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({
  label,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 text-slate-400">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full p-4 rounded-lg transition-all theme-transition font-sans font-bold placeholder-slate-400 focus:outline-none bg-slate-50 border border-slate-100 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

