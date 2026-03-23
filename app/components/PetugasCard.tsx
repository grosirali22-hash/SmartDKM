import React from 'react';
import Divider from './ui/Divider';

interface PetugasCardProps {
  waktu: string;
  imam?: string;
  khatib?: string;
  muadzin?: string;
}

export default function PetugasCard({ waktu, imam, khatib, muadzin }: PetugasCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-100 mb-5 shadow-sm">
      <p className="text-blue-700 font-black text-[10px] uppercase tracking-[4px] mb-4 text-center">
        {waktu}
      </p>

      {khatib && (
        <div className="text-center mb-4">
          <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">Khatib & Imam</p>
          <p className="text-slate-900 font-black text-lg">{khatib}</p>
        </div>
      )}

      {!khatib && imam && (
        <div className="text-center mb-4">
          <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">Imam Shalat</p>
          <p className="text-slate-900 font-black text-lg">{imam}</p>
        </div>
      )}

      <Divider className="my-2 opacity-50" />

      <div className="text-center mt-2">
        <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">Muadzin</p>
        <p className="text-slate-800 font-bold">{muadzin}</p>
      </div>
    </div>
  );
}

