import React from 'react';

interface JadwalItemProps {
  nama: string;
  waktu?: string;
  isActive?: boolean;
}

export default function JadwalItem({ nama, waktu, isActive = false }: JadwalItemProps) {
  return (
    <div
      className={`flex justify-between items-center py-5 border-b border-slate-100 last:border-0 ${
        isActive ? 'bg-red-50/50 -mx-6 px-5' : ''
      }`}
    >
      <span
        className={`font-bold uppercase text-[10px] tracking-[3px] ${
          isActive ? 'text-red-700' : 'text-slate-400'
        }`}
      >
        {nama}
      </span>
      <div className="flex items-center gap-2">
        {isActive && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
        <span
          className={`text-2xl font-black ${
            isActive ? 'text-blue-800' : 'text-slate-900'
          }`}
        >
          {waktu || '--:--'}
        </span>
      </div>
    </div>
  );
}

