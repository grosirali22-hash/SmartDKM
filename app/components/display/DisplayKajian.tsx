'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, MapPin, Clock } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

export default function DisplayKajian() {
  const { config } = useGlobalContext();
  const [kajian, setKajian] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchKajian = async () => {
      const { data, error } = await supabase
        .from('kajian_rutin')
        .select('*')
        .order('hari', { ascending: true })
        .limit(5);

      if (!error && data && data.length > 0) {
        setKajian(data.map(item => ({
          judul: item.judul,
          ustadz: item.ustadz,
          waktu: `${item.hari} - Jam ${item.jam}`,
          tempat: item.kitab ? `📖 ${item.kitab}` : 'Masjid Al-Istiqomah'
        })));
      } else {
        setKajian([
          { judul: 'Kajian Tafsir Al-Jalalain', ustadz: 'Ustadz Abdul Somad, Lc. MA', waktu: "Setiap Ba'da Maghrib (Senin)", tempat: 'Ruang Utama Masjid' },
          { judul: 'Kajian Fiqih Sunnah', ustadz: 'Ustadz Adi Hidayat, Lc. MA', waktu: "Setiap Ba'da Subuh (Ahad)", tempat: 'Serambi Masjid' }
        ]);
      }
    };
    fetchKajian();

    // Real-time: update Kajian schedule
    const channel = supabase
      .channel('kajian_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kajian_rutin' }, () => {
        fetchKajian();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (kajian.length <= 1) return;
    const timer = setInterval(() => setActiveIdx((prev) => (prev + 1) % kajian.length), 10000);
    return () => clearInterval(timer);
  }, [kajian]);

  if (kajian.length === 0) return null;
  const current = kajian[activeIdx];

  return (
    <div className={`h-full rounded-lg overflow-hidden flex flex-col relative transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-br from-teal-950 via-slate-900 to-slate-900 border-teal-500/20 shadow-teal-900/20' 
          : 'bg-white border-slate-200 shadow-teal-900/5'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500/0 via-teal-400 to-teal-500/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.07] ${config.is_dark_mode ? 'text-teal-400' : 'text-teal-400'}`}>
        <BookOpen className="w-32 h-32" />
      </div>

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 flex items-center gap-3 shrink-0 border-b ${config.is_dark_mode ? 'border-teal-500/15' : 'border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.is_dark_mode ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-black uppercase tracking-[4px] leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>Info Kajian</h3>
          <p className={`text-[10px] font-black tracking-[1px] mt-1.5 uppercase ${config.is_dark_mode ? 'text-teal-400' : 'text-teal-600'}`}>Jadwal Rutin</p>
        </div>

        {/* Dot indicator */}
        {kajian.length > 1 && (
          <div className="flex gap-1.5 shrink-0">
            {kajian.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIdx ? 'w-5 bg-teal-400' : 'w-1.5 bg-white/15'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3 flex-1 min-h-0 flex flex-col justify-center">
        <h2 className={`text-xl font-black tracking-tighter leading-tight line-clamp-2 mb-2 transition-all duration-500
          ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}
        >
          {current.judul}
        </h2>
        <p className={`text-base font-black leading-snug line-clamp-1 transition-all duration-500
          ${config.is_dark_mode ? 'text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]' : 'text-teal-600'}`}
        >
          {current.ustadz}
        </p>
      </div>

      {/* Schedule & Location */}
      <div className={`px-4 pb-4 pt-3 shrink-0 border-t space-y-2 ${config.is_dark_mode ? 'border-teal-500/10' : 'border-slate-100 bg-slate-50/50'}`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 shrink-0 ${config.is_dark_mode ? 'text-teal-400' : 'text-teal-600'}`} />
          <p className={`text-[10px] font-black uppercase tracking-[1px] truncate ${config.is_dark_mode ? 'text-white/50' : 'text-slate-500'}`}>{current.waktu}</p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className={`w-3.5 h-3.5 shrink-0 ${config.is_dark_mode ? 'text-teal-400' : 'text-teal-600'}`} />
          <p className={`text-[10px] font-black uppercase tracking-[1px] truncate ${config.is_dark_mode ? 'text-white/50' : 'text-slate-500'}`}>{current.tempat || 'Masjid'}</p>
        </div>
      </div>
    </div>
  );
}
