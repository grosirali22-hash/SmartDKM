import React from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'danger' | 'warning';
  className?: string;
}

export default function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const styles = {
    info: 'bg-slate-100 text-slate-600',
    success: 'bg-blue-50 text-blue-700',
    danger: 'bg-rose-50 text-rose-600',
    warning: 'bg-amber-50 text-amber-700',
  };

  return (
    <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter theme-transition ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

