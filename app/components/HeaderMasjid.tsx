import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';

interface HeaderMasjidProps {
  nama?: string;
  alamat?: string;
}

export default function HeaderMasjid({ nama, alamat }: HeaderMasjidProps) {
  const { config } = useGlobalContext();
  const isNeumorph = config.tema_warna === 'neumorph';

  return (
    <div className="mb-8 mt-1">
      <h1 className={`text-3xl font-black tracking-tighter leading-tight transition-all theme-transition ${isNeumorph ? 'text-foreground' : 'text-slate-900'}`}>
        {nama || config.nama_masjid || 'Masjid Al-Istiqomah'}
      </h1>
      <p className={`text-[10px] font-black uppercase tracking-[3px] mt-1 transition-all theme-transition ${isNeumorph ? 'text-primary' : 'text-blue-600'}`}>
        📍 {alamat || config.alamat || 'Sukabumi, Jawa Barat'}
      </p>
    </div>
  );
}

