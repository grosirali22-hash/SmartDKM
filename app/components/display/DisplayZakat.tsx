'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Coins, Heart, Wallet, Scale } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

export default function DisplayZakat() {
  const { config } = useGlobalContext();
  const [summary, setSummary] = useState({
    uang: 0,
    beras_kg: 0,
    beras_liter: 0,
    fitrahCount: 0,
    lastTransactions: [] as any[]
  });

  const fetchZakatData = async () => {
    const { data: trx } = await supabase
      .from('zakat_transaksi')
      .select('*, muzaki(nama)')
      .eq('tipe', 'masuk')
      .order('waktu', { ascending: false });

    if (trx) {
      const uang = trx.filter(t => t.satuan === 'uang').reduce((acc, t) => acc + Number(t.jumlah), 0);
      const beras_kg = trx.filter(t => t.satuan === 'beras' && t.unit_beras === 'kg').reduce((acc, t) => acc + Number(t.jumlah), 0);
      const beras_liter = trx.filter(t => t.satuan === 'beras' && t.unit_beras === 'liter').reduce((acc, t) => acc + Number(t.jumlah), 0);
      const fitrahEntries = trx.filter(t => t.jenis_zakat === 'Fitrah').length;
      
      setSummary({
        uang,
        beras_kg,
        beras_liter,
        fitrahCount: fitrahEntries,
        lastTransactions: trx.slice(0, 3)
      });
    }
  };

  useEffect(() => {
    fetchZakatData();

    const channel = supabase
      .channel('zakat_display_realtime_refined')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zakat_transaksi' }, () => {
        fetchZakatData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={`h-full rounded-lg overflow-hidden flex flex-col relative transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 border-blue-500/20 shadow-blue-900/20' 
          : 'bg-white border-slate-200 shadow-blue-900/5'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500/0 via-blue-400 to-blue-500/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.06] ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-400'}`}>
        <Scale className="w-32 h-32" />
      </div>

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 flex items-center gap-3 shrink-0 border-b ${config.is_dark_mode ? 'border-blue-500/15' : 'border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.is_dark_mode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
          <Heart className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-black uppercase tracking-[4px] leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>Laporan Zakat</h3>
          <p className={`text-[10px] font-black tracking-[1px] mt-1.5 uppercase ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-500'}`}>Penerimaan Fitrah & Maal</p>
        </div>
      </div>

      {/* Main Totals */}
      <div className="px-4 py-4 flex-1 flex flex-col justify-center gap-4">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${config.is_dark_mode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Wallet className="w-6 h-6" />
           </div>
           <div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${config.is_dark_mode ? 'text-blue-500/60' : 'text-slate-400'}`}>Total Uang Tunai</p>
              <h4 className={`text-2xl font-black tracking-tighter tabular-nums ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
                Rp {summary.uang.toLocaleString()}
              </h4>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${config.is_dark_mode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
              <Coins className="w-6 h-6" />
           </div>
           <div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${config.is_dark_mode ? 'text-amber-500/60' : 'text-slate-400'}`}>Stok Beras</p>
              <h4 className={`text-xl font-black tracking-tighter tabular-nums ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
                {summary.beras_kg} <span className="text-[10px] opacity-50">kg</span> / {summary.beras_liter} <span className="text-[10px] opacity-50">L</span>
              </h4>
           </div>
        </div>
      </div>

      {/* Recent Muzaki */}
      <div className={`px-4 py-3 shrink-0 border-t ${config.is_dark_mode ? 'border-blue-500/10 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[8px] font-black uppercase tracking-widest ${config.is_dark_mode ? 'text-white/30' : 'text-slate-400'}`}>Muzaki Terbaru</span>
            <span className={`text-[8px] font-black uppercase tracking-widest ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-600'}`}>{summary.fitrahCount} Jiwa</span>
          </div>
          <div className="space-y-1.5">
            {summary.lastTransactions.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <p className={`text-[10px] font-bold truncate max-w-[120px] ${config.is_dark_mode ? 'text-white/80' : 'text-slate-900'}`}>{t.muzaki?.nama || 'Hamba Allah'}</p>
                <div className="text-right">
                  <p className={`text-[10px] font-black tabular-nums leading-none ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {t.satuan === 'uang' ? `Rp ${t.jumlah.toLocaleString()}` : `${t.jumlah}${t.unit_beras === 'kg' ? 'kg' : 'L'}`}
                  </p>
                  <p className={`text-[7px] font-black uppercase opacity-40 leading-none mt-1 ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>{t.jenis_zakat}</p>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}


