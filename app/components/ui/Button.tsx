import React from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'outline';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    success: 'bg-blue-600 text-white hover:bg-blue-700',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    outline: 'border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} py-3 px-6 rounded-lg items-center justify-center font-black uppercase tracking-widest text-[10px] transition-all theme-transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full ${className}`}
    >
      {children}
    </button>
  );
}

