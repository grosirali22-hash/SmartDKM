'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Sparkles, CalendarDays, Timer, Calendar } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

const DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const formatIndoDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function DisplayPHBI() {
  const { config } = useGlobalContext();
  const [phbiData, setPhbiData] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const fetchPhbi = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: dbData } = await supabase
        .from('phbi_events')
        .select('*')
        .gte('tanggal', today)
        .order('tanggal', { ascending: true });

      let combined = dbData ? dbData.map(item => ({ ...item, nama_acara: item.nama })) : [];

      // Fetch Holidays from API with Caching
      try {
        const CACHE_KEY = 'smartdkm_holiday_cache';
        const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 Jam
        let holData = [];

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            holData = data;
          }
        }

        if (holData.length === 0) {
          const year = new Date().getFullYear();
          const res = await fetch(`https://libur.deno.dev/api?year=${year}`);
          holData = await res.json();
          if (Array.isArray(holData)) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: holData,
              timestamp: Date.now()
            }));
          }
        }
        
        if (Array.isArray(holData)) {
          holData.forEach(h => {
             if (h.date >= today) {
                // Avoid duplicates if already in DB (name match or date match)
                const exists = combined.find(c => c.tanggal === h.date);
                if (!exists) {
                   combined.push({
                      id: `hol-${h.date}`,
                      tanggal: h.date,
                      nama_acara: h.name,
                      is_holiday: true
                   });
                }
             }
          });
        }
      } catch (err) {
        console.error("Gagal ambil libur API di TV:", err);
      }

      // Sort by date
      combined.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
      setPhbiData(combined);
    };
    fetchPhbi();

    // Real-time: update PHBI events
    const channel = supabase
      .channel('phbi_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'phbi_events' }, () => {
        fetchPhbi();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (phbiData.length <= 1) return;
    const rotateTimer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % phbiData.length);
    }, 12000);
    return () => clearInterval(rotateTimer);
  }, [phbiData]);

  useEffect(() => {
    if (phbiData.length === 0) return;
    const calculateTimeLeft = () => {
      const current = phbiData[activeIdx];
      const now = new Date();
      const target = new Date(current.tanggal);
      target.setHours(0, 0, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
      return {
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [phbiData, activeIdx]);

    <div className="h-full rounded-lg flex items-center justify-center p-4 border transition-all duration-500 bg-slate-900/80 border-white/10 opacity-60">
      <p className="font-black text-xs tracking-[4px] text-white/40 uppercase text-center">Tidak Ada Agenda PHBI</p>
    </div>

  const current = phbiData[activeIdx];
  const daysLeft = timeLeft?.d ?? 0;

  return (
    <div className={`h-full rounded-lg overflow-hidden flex flex-col relative transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 border-amber-500/20' 
          : 'bg-white border-slate-200 shadow-amber-900/5'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-6 -top-4 opacity-[0.06] ${config.is_dark_mode ? 'text-amber-400' : 'text-amber-400'}`}>
        <Sparkles className="w-36 h-36" />
      </div>

      {/* Header */}
      <div className={`px-4 pt-2 pb-2 shrink-0 border-b flex items-center justify-between ${config.is_dark_mode ? 'border-amber-500/20' : 'border-slate-100'}`}>
        <h3 className={`text-sm font-black uppercase tracking-widest ${config.is_dark_mode ? 'text-amber-500' : 'text-slate-900'}`}>
          Agenda & Hari Besar
        </h3>
        {/* Dot indicator */}
        {phbiData.length > 1 && (
          <div className="flex gap-1.5 shrink-0">
            {phbiData.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIdx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/15'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Event name */}
      <div className="px-4 py-3 flex-1 min-h-0 flex flex-col justify-center">
        <div className={`relative rounded-lg p-3 h-full overflow-hidden transition-all duration-500
          ${config.is_dark_mode 
              ? 'bg-slate-900/50 border border-white/5 hover:bg-slate-900/80 shadow-lg shadow-black/20' 
              : 'bg-slate-50 border border-slate-100 hover:bg-slate-100/80'}
          `}
        >
          <div className="relative z-10 flex flex-col h-full justify-between gap-1">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${config.is_dark_mode ? 'text-amber-500' : 'text-blue-600'}`}>
                {DAYS_FULL[new Date(current.tanggal).getDay()]}
              </p>
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider
                ${config.is_dark_mode ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-100 text-blue-700'}
                `}
              >
                {daysLeft === 0 ? 'HARI INI' : `${daysLeft} HARI LAGI`}
              </div>
            </div>

            <div>
              <p className={`text-sm font-black leading-tight mb-1 line-clamp-2 ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
                {current.nama_acara}
              </p>
              <p className={`text-[10px] font-black flex items-center gap-1 ${config.is_dark_mode ? 'text-white/40' : 'text-slate-500'}`}>
                <Calendar className="w-3 h-3" />
                {formatIndoDate(current.tanggal)}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        {timeLeft && (timeLeft.d > 0 || timeLeft.h > 0 || timeLeft.m > 0) && (
          <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 bg-amber-500/10 border border-amber-500/20">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${config.is_dark_mode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <Timer className="w-4 h-4" />
            </div>
            <div className={`flex items-baseline gap-1.5 font-black tabular-nums tracking-tighter ${config.is_dark_mode ? 'text-amber-200' : 'text-amber-200'}`}>
              {timeLeft.d > 0 && (
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">H-{timeLeft.d}</span>
              )}
              <span className={`text-sm ${timeLeft.d > 0 ? 'opacity-30 mx-1' : 'hidden'}`}>|</span>
              <span className="text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="px-4 pb-4 shrink-0 border-t pt-3 border-amber-500/10">
        <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[3px] transition-all duration-500
          ${timeLeft?.d === 0 && timeLeft?.h === 0
            ? 'bg-amber-400 text-slate-900 shadow-[0_0_16px_rgba(251,191,36,0.5)] animate-pulse'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {timeLeft?.d === 0 && timeLeft?.h === 0 ? '🎉 Hari Ini' : 'Mendatang'}
        </span>
      </div>
    </div>
  );
}
