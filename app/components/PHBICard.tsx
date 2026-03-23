import React, { useState, useEffect } from 'react';
import Badge from './ui/Badge';
import { useGlobalContext } from '../context/GlobalContext';

interface PHBICardProps {
  nama: string;
  tanggalTarget: string; // ISO format: '2026-03-20'
}

export default function PHBICard({ nama, tanggalTarget }: PHBICardProps) {
  const { config } = useGlobalContext();
  const isNeumorph = config.tema_warna === 'neumorph';
  const [sisaHari, setSisaHari] = useState<number | null>(null);

  useEffect(() => {
    const calc = () => {
      const hariIni = new Date();
      hariIni.setHours(0, 0, 0, 0); // Normalisasi ke tengah malam
      const target = new Date(tanggalTarget);
      target.setHours(0, 0, 0, 0);
      
      const diffTime = target.getTime() - hariIni.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    setSisaHari(calc());

    const timer = setInterval(() => setSisaHari(calc()), 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, [tanggalTarget]);

  const isUrgent = sisaHari !== null && sisaHari <= 7 && sisaHari >= 0;

  const formatTanggal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (sisaHari === null) return null; 

  return (
    <div className={`p-5 rounded-lg flex items-center mb-4 transition-all duration-500 ${isNeumorph ? 'nm-card !border-0' : 'bg-white border border-slate-100 shadow-sm'}`}>
      {/* Box Angka Countdown */}
      <div
        className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center mr-5 flex-shrink-0 transition-all duration-500 ${
          isNeumorph ? 'nm-inset' : (isUrgent ? 'bg-rose-50' : 'bg-blue-50')
        }`}
      >
        <span className={`text-2xl font-black transition-all duration-500 ${isNeumorph ? 'text-primary' : (isUrgent ? 'text-rose-600' : 'text-blue-700')}`}>
          {sisaHari < 0 ? '0' : sisaHari}
        </span>
        <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-500 ${isNeumorph ? 'text-foreground/30' : 'text-slate-400'}`}>Hari</span>
      </div>

      <div className="flex-1">
        <p className={`font-black text-lg leading-tight transition-all duration-500 ${isNeumorph ? 'text-foreground' : 'text-slate-800'}`}>{nama}</p>
        <p className={`text-[10px] font-black uppercase tracking-[2px] mt-1.5 transition-all duration-500 ${isNeumorph ? 'text-primary' : 'text-slate-400'}`}>
          {formatTanggal(tanggalTarget)}
        </p>
      </div>

      {isUrgent && <Badge variant="danger" className={isNeumorph ? 'nm-convex' : ''}>Segera</Badge>}
    </div>
  );
}

