'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

export default function DisplayLaporanKas() {
  const { config } = useGlobalContext();
  const [dataKas, setDataKas] = useState<any>(null);

  useEffect(() => {
    const fetchKas = async () => {
      const { data, error } = await supabase
        .from('keuangan')
        .select('tipe, nominal, waktu');

      if (!error && data) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let saldoAkhir = 0, pemasukanBulanIni = 0, pengeluaranBulanIni = 0;
        data.forEach(item => {
          const tgl = new Date(item.waktu);
          const amt = Number(item.nominal);
          if (item.tipe === 'debit') {
            saldoAkhir += amt;
            if (tgl >= firstDayOfMonth) pemasukanBulanIni += amt;
          } else {
            saldoAkhir -= amt;
            if (tgl >= firstDayOfMonth) pengeluaranBulanIni += amt;
          }
        });
        setDataKas({ saldo_akhir: saldoAkhir, pemasukan_bulan_ini: pemasukanBulanIni, pengeluaran_bulan_ini: pengeluaranBulanIni, last_update: now.toISOString() });
      } else {
        setDataKas({ saldo_akhir: 0, pemasukan_bulan_ini: 0, pengeluaran_bulan_ini: 0, last_update: new Date().toISOString() });
      }
    };
    fetchKas();

    // Real-time: update Kas report
    const channel = supabase
      .channel('keuangan_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'keuangan' }, () => {
        fetchKas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!dataKas) return null;

  const formatRp = (angka: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  return (
    <div className={`h-full rounded-lg overflow-hidden flex flex-col relative transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 border-blue-500/20' 
          : 'bg-white border-slate-200 shadow-blue-900/5'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500/0 via-blue-400 to-blue-500/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-8 -bottom-6 opacity-[0.06] ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-400'}`}>
        <Wallet className="w-40 h-40" />
      </div>

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 flex items-center gap-3 shrink-0 border-b ${config.is_dark_mode ? 'border-blue-500/15' : 'border-slate-100'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.is_dark_mode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-sm font-black uppercase tracking-[4px] leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
            Kas Masjid
          </h3>
          <p className={`text-[10px] font-black tracking-[1px] mt-1.5 uppercase ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-500'}`}>
            {new Date(dataKas.last_update).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Saldo */}
      <div className={`relative z-10 mx-3 mt-3 p-4 rounded-lg flex-1 flex flex-col justify-center min-h-0 transition-all duration-500
        ${config.is_dark_mode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-50 border border-slate-100'}`}
      >
        <p className={`text-[10px] font-black uppercase tracking-[3px] mb-2 ${config.is_dark_mode ? 'text-blue-400/60' : 'text-slate-400'}`}>
          Saldo Akhir
        </p>
        <p className={`text-3xl font-black tracking-tighter tabular-nums leading-none transition-all duration-500
          ${config.is_dark_mode ? 'text-blue-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'text-blue-600'}`}
        >
          {formatRp(dataKas.saldo_akhir)}
        </p>
      </div>

      {/* Pemasukan / Pengeluaran */}
      <div className="grid grid-cols-2 gap-2 p-3 shrink-0">
        <div className={`p-3 rounded-lg transition-all duration-500 ${config.is_dark_mode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
          <p className={`text-[9px] opacity-60 uppercase font-black tracking-[2px] flex items-center gap-1.5 mb-1.5 ${config.is_dark_mode ? 'text-blue-300' : 'text-emerald-700'}`}>
            <ArrowUpRight className={`w-3.5 h-3.5 ${config.is_dark_mode ? 'text-blue-400' : 'text-emerald-500'}`} /> Masuk
          </p>
          <p className={`font-black text-base tracking-tight tabular-nums ${config.is_dark_mode ? 'text-blue-300' : 'text-emerald-600'}`}>
            {formatRp(dataKas.pemasukan_bulan_ini)}
          </p>
        </div>
        <div className={`p-3 rounded-lg transition-all duration-500 ${config.is_dark_mode ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-rose-50 border border-rose-100'}`}>
          <p className={`text-[9px] opacity-60 uppercase font-black tracking-[2px] flex items-center gap-1.5 mb-1.5 ${config.is_dark_mode ? 'text-rose-300' : 'text-rose-700'}`}>
            <ArrowDownRight className={`w-3.5 h-3.5 ${config.is_dark_mode ? 'text-rose-400' : 'text-rose-500'}`} /> Keluar
          </p>
          <p className={`font-black text-base tracking-tight tabular-nums ${config.is_dark_mode ? 'text-rose-300' : 'text-rose-600'}`}>
            {formatRp(dataKas.pengeluaran_bulan_ini)}
          </p>
        </div>
      </div>
    </div>
  );
}


