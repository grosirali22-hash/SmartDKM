'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, User } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

export default function DisplayStruktur() {
  const { config } = useGlobalContext();
  const [pengurus, setPengurus] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchStruktur = async () => {
      const { data, error } = await supabase
        .from('dkm_structure')
        .select('*')
        .order('urutan', { ascending: true });

      if (!error && data) {
        setPengurus(data.map(item => ({
          nama: item.nama,
          jabatan: item.jabatan,
          avatar: item.foto_url || '/avatar-placeholder.png'
        })));
      }
    };
    fetchStruktur();

    // Real-time: update DKM structure
    const channel = supabase
      .channel('structure_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dkm_structure' }, () => {
        fetchStruktur();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (pengurus.length <= 1) return;
    const timer = setInterval(() => setActiveIdx((prev) => (prev + 1) % pengurus.length), 8000);
    return () => clearInterval(timer);
  }, [pengurus]);

  if (pengurus.length === 0) return null;
  const current = pengurus[activeIdx];

  return (
    <div className={`h-full rounded-lg overflow-hidden flex flex-col relative transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-indigo-500/20 shadow-indigo-900/20' 
          : 'bg-white border-slate-200 shadow-indigo-900/5'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500/0 via-indigo-400 to-indigo-500/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.06] ${config.is_dark_mode ? 'text-indigo-400' : 'text-indigo-400'}`}>
        <ShieldCheck className="w-36 h-36" />
      </div>

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 flex items-center gap-3 shrink-0 border-b ${config.is_dark_mode ? 'border-indigo-500/15' : 'border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.is_dark_mode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-black uppercase tracking-[4px] leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>Susunan DKM</h3>
          <p className={`text-[10px] font-black tracking-[1px] mt-1.5 uppercase ${config.is_dark_mode ? 'text-indigo-400' : 'text-indigo-600'}`}>Struktur Organisasi</p>
        </div>

        {/* Dot indicator */}
        {pengurus.length > 1 && (
          <div className="flex gap-1.5 shrink-0">
            {pengurus.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIdx ? 'w-5 bg-indigo-400' : 'w-1.5 bg-white/15'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Profile card */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-3">
        {/* Avatar circle with glow */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500
          ${(config.is_dark_mode 
                ? 'bg-indigo-500/20 text-indigo-300 border-2 border-indigo-400/40 shadow-[0_0_24px_-4px_rgba(129,140,248,0.5)]' 
                : 'bg-indigo-50 text-indigo-600 border-2 border-indigo-100 shadow-[0_10px_20px_-5px_rgba(79,70,229,0.1)]')
          }`}
        >
          <User className="w-8 h-8" />
        </div>

        {/* Jabatan badge */}
        <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[3px] mb-3 transition-all duration-500
          ${(config.is_dark_mode 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                : 'bg-indigo-50 text-indigo-600 border border-indigo-100')
          }`}
        >
          {current.jabatan}
        </span>

        {/* Name */}
        <p className={`text-2xl font-black text-center leading-tight tracking-tighter line-clamp-2 transition-all duration-500
          ${config.is_dark_mode ? 'text-white drop-shadow-[0_0_12px_rgba(129,140,248,0.3)]' : 'text-slate-900'}`}
        >
          {current.nama}
        </p>
      </div>
    </div>
  );
}
