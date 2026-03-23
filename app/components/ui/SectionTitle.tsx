import React from 'react';
import { useGlobalContext } from '../../context/GlobalContext';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-black tracking-tighter transition-all theme-transition text-slate-900">{title}</h2>
      {subtitle && (
        <p className="text-[11px] font-black uppercase tracking-[4px] mt-1 transition-all theme-transition text-blue-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}

