'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { GlobalConfig } from '../types/config';
import { supabase } from '../lib/supabase';

interface RunningTextProps {
  teks?: string; // Optional fallback
}

export default function RunningText({ teks }: RunningTextProps) {
  const { config } = useGlobalContext() as { config: GlobalConfig };
  const isNeumorph = config.tema_warna === 'neumorph';
  const [activeTexts, setActiveTexts] = useState<string>('');

  useEffect(() => {
    const fetchTexts = async () => {
      const { data } = await supabase
        .from('running_texts')
        .select('teks')
        .eq('aktif', true)
        .order('urutan', { ascending: true });
      
      if (data && data.length > 0) {
        // Join active texts with a separator
        setActiveTexts(data.map(d => d.teks).join('   •   '));
      } else {
        setActiveTexts('');
      }
    };

    fetchTexts();

    // Subscribe to changes in the running_texts table
    const sub = supabase
      .channel('running-texts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'running_texts' },
        () => fetchTexts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const displayTeks = activeTexts || teks || config.running_text || 'Selamat Datang di Portal Informasi Masjid — Smart DKM';
  const content = displayTeks.length > 100 ? `${displayTeks}   •   ${displayTeks}` : `${displayTeks}   •   ${displayTeks}   •   ${displayTeks}   •   ${displayTeks}`;

  return (
    <div className={`relative overflow-hidden shrink-0 transition-all duration-500
      ${isNeumorph
        ? 'nm-inset py-2 bg-background border-0'
        : `border-t ${config.is_dark_mode 
            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-white/10' 
            : 'bg-white border-slate-200 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]'}`
      }`}
    >
      {/* Top accent line */}
      {!isNeumorph && (
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r 
          ${config.is_dark_mode 
            ? 'from-primary/0 via-primary/60 to-primary/0' 
            : 'from-slate-300/0 via-slate-300/50 to-slate-300/0'}`
        } />
      )}
      <div className="animate-marquee whitespace-nowrap py-1.5 flex items-center">
        <span className={`text-sm tracking-[3px] transition-colors duration-500
          ${isNeumorph
            ? 'text-foreground font-black'
            : (config.is_dark_mode ? 'text-primary' : 'text-blue-700') + ' font-black uppercase'
          }`}
        >
          {content}
        </span>
      </div>
    </div>
  );
}
