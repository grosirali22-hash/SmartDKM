'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar } from 'lucide-react';

export default function PHBICountdown() {
  const [nextEvent, setNextEvent] = useState<{ nama: string; tanggal: string } | null>(null);

  useEffect(() => {
    const fetchNextPhbi = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('phbi_events')
        .select('nama, tanggal')
        .gte('tanggal', today)
        .order('tanggal', { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setNextEvent(data);
      }
    };
    fetchNextPhbi();
  }, []);

  if (!nextEvent) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(nextEvent.tanggal);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate.getTime() - today.getTime();
  const sisaHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (sisaHari < 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="flex items-center gap-3 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-md shadow-sm">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-0.5">
            Agenda Terdekat
          </p>
          <h4 className="text-xs font-bold text-card-foreground truncate leading-tight">
            {nextEvent.nama}
          </h4>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 leading-none">
            {sisaHari === 0 ? 'Hari Ini' : 'Sisa'}
          </p>
          <p className="text-lg font-black text-primary tabular-nums leading-none">
            {sisaHari === 0 ? 'LIVE' : `H-${sisaHari}`}
          </p>
        </div>
      </div>
    </div>
  );
}
