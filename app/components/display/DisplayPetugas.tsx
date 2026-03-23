'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, Star } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

export default function DisplayPetugas() {
  const { config } = useGlobalContext();
  const [petugas, setPetugas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPetugas = async () => {
      const today = new Date().toISOString().split('T')[0];
      const CACHE_KEY = 'smartdkm_petugas_cache';
      const CACHE_TTL = 12 * 60 * 60 * 1000;

      // Try cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setPetugas(data);
          setLoading(false);
          // Still fetch in background but don't show loading
        }
      }

      const { data } = await supabase
        .from('petugas_shalat')
        .select('*')
        .eq('jenis', 'Jumat')
        .gte('tanggal', today)
        .order('tanggal', { ascending: true })
        .limit(1)
        .single();

      if (data) {
        const finalData = [data];
        setPetugas(finalData);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: finalData,
          timestamp: Date.now()
        }));
      }
      setLoading(false);
    };
    fetchPetugas();

    // Real-time: update Petugas lineup
    const channel = supabase
      .channel('officials_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mosque_officials' }, () => {
        fetchPetugas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return (
    <div className="h-full rounded-lg flex items-center justify-center transition-all duration-500 bg-gradient-to-br from-violet-950 via-slate-900 to-slate-900 border border-violet-500/20">
      <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const data = petugas[0];

  return (
    <div className={`h-full rounded-lg overflow-hidden flex flex-col relative transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-br from-violet-950 via-slate-900 to-slate-900 border-violet-500/20 shadow-violet-900/20' 
          : 'bg-white border-slate-200 shadow-violet-900/5'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500/0 via-violet-400 to-violet-500/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.06] ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-400'}`}>
        <Users className="w-32 h-32" />
      </div>

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 flex items-center gap-3 shrink-0 border-b ${config.is_dark_mode ? 'border-violet-500/15' : 'border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.is_dark_mode ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-violet-50 text-violet-600 border border-violet-100'}`}>
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-sm font-black uppercase tracking-[4px] leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>Petugas Jumat</h3>
          <p className={`text-[10px] font-black tracking-[1px] mt-1.5 ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-600'}`}>
            {data ? new Date(data.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}
          </p>
        </div>
      </div>

      {/* Roles grid */}
      <div className="flex-1 min-h-0 grid grid-rows-3 gap-2 p-3">
        {/* Khatib */}
        <div className={`rounded-lg px-4 py-3 flex flex-col justify-center transition-all duration-500 relative overflow-hidden
          ${config.is_dark_mode ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-100'}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Star className={`w-3 h-3 ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-600'}`} />
            <p className={`text-[10px] font-black uppercase tracking-[2px] ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-600'}`}>Khatib</p>
          </div>
          <p className={`text-lg font-black truncate leading-none transition-all duration-500 ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
            {data?.khatib || '—'}
          </p>
        </div>

        {/* Imam */}
        <div className={`rounded-lg px-4 py-3 flex flex-col justify-center transition-all duration-500
          ${config.is_dark_mode ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-100'}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Star className={`w-3 h-3 ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-600'}`} />
            <p className={`text-[10px] font-black uppercase tracking-[2px] ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-600'}`}>Imam</p>
          </div>
          <p className={`text-lg font-black truncate leading-none transition-all duration-500 ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
            {data?.imam || '—'}
          </p>
        </div>

        {/* Muadzin & Bilal */}
        <div className={`rounded-lg px-4 py-3 flex flex-col justify-center transition-all duration-500
          ${config.is_dark_mode ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-100'}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Star className={`w-3 h-3 ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-600'}`} />
            <p className={`text-[10px] font-black uppercase tracking-[2px] ${config.is_dark_mode ? 'text-violet-400' : 'text-violet-600'}`}>Muadzin &amp; Bilal</p>
          </div>
          <p className={`text-base font-black truncate leading-none transition-all duration-500 ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
            {data?.muadzin || '—'} &amp; {data?.bilal || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
