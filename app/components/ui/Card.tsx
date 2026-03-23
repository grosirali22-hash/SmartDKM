import React from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`p-5 rounded-sm transition-all theme-transition bg-white border border-slate-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
