'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Wallet, Heart } from 'lucide-react';
import { useGlobalContext } from '../../context/GlobalContext';

export default function DisplayDonasi() {
  const { config } = useGlobalContext();
  const [qrisData, setQrisData] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchDonasi = async () => {
      const { data } = await supabase
        .from('donasi_info')
        .select('*')
        .eq('aktif', true)
        .order('created_at', { ascending: false });

      if (data) {
        setQrisData(data.map(item => ({ ...item, nomor_rekening: item.no_rekening })));
      }
    };
    fetchDonasi();

    // Real-time: update Donation info
    const channel = supabase
      .channel('donasi_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donasi_info' }, () => {
        fetchDonasi();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (qrisData.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % qrisData.length);
    }, 15000);
    return () => clearInterval(timer);
  }, [qrisData]);

  if (qrisData.length === 0) return (
    <div className={`h-full rounded-lg flex items-center justify-center p-4 border transition-all duration-500 ${config.is_dark_mode ? 'bg-slate-900/80 border-white/10 opacity-60' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
      <p className="font-black text-xs tracking-[4px] text-slate-500 uppercase text-center">Data Donasi Kosong</p>
    </div>
  );

  const current = qrisData[activeIdx];

  return (
    <div className={`h-full rounded-lg overflow-hidden flex flex-col relative transition-all duration-500
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-slate-900 border-blue-500/20 shadow-blue-900/20' 
          : 'bg-white border-slate-200 shadow-blue-900/5'}`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500/0 via-blue-400 to-blue-500/0" />

      {/* Decorative bg icon */}
      <div className={`absolute -right-6 -bottom-4 opacity-[0.06] ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-400'}`}>
        <Heart className="w-32 h-32" />
      </div>

      {/* Header */}
      <div className={`px-4 pt-4 pb-3 flex items-center justify-between shrink-0 border-b ${config.is_dark_mode ? 'border-blue-500/15' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.is_dark_mode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-[4px] leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
              Donasi
            </h3>
            <p className={`text-[10px] font-black tracking-[2px] mt-1.5 uppercase ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-600'}`}>
              Scan &amp; Transfer
            </p>
          </div>
        </div>

        {/* Dot indicator */}
        {qrisData.length > 1 && (
          <div className="flex gap-1.5">
            {qrisData.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIdx ? 'w-5 bg-blue-400' : 'w-1.5 bg-white/15'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* QRIS kiri + Info rekening kanan */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {current.qris_url ? (
          <>
            {/* QRIS — gambar langsung tanpa frame/border */}
            <motion.div
              className="w-1/2 shrink-0 p-2 flex items-center justify-center overflow-hidden"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={current.qris_url}
                alt="QRIS"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Info rekening — kanan */}
            <div className={`flex-1 flex flex-col justify-center px-4 gap-3 border-l transition-all duration-500
              ${config.is_dark_mode ? 'border-blue-500/15' : 'border-slate-100'}`}
            >
              <div>
                <p className={`text-[9px] font-black uppercase tracking-[2px] mb-1 ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Bank
                </p>
                <p className={`text-base font-black tracking-tighter leading-none ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
                  {current.nama_bank || '—'}
                </p>
              </div>
              <div>
                <p className={`text-[9px] font-black uppercase tracking-[2px] mb-1 ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-600'}`}>
                  No. Rekening
                </p>
                <p className={`text-lg font-black tabular-nums tracking-tighter leading-none ${config.is_dark_mode ? 'text-white drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]' : 'text-slate-900'}`}>
                  {current.nomor_rekening || '—'}
                </p>
              </div>
              <div>
                <p className={`text-[9px] font-black uppercase tracking-[2px] mb-1 ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Atas Nama
                </p>
                <p className={`text-sm font-black tracking-tight leading-snug line-clamp-2 ${config.is_dark_mode ? 'text-white/70' : 'text-slate-600'}`}>
                  {current.atas_nama || '—'}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Kalau tidak ada QRIS URL, tampilkan info rekening saja fullwidth */
          <div className={`w-full flex flex-col items-center justify-center gap-3 px-4 transition-all duration-500`}>
            <p className={`font-black text-xl tabular-nums tracking-tighter text-center ${config.is_dark_mode ? 'text-blue-200' : 'text-slate-900'}`}>
              {current.nomor_rekening}
            </p>
            <p className={`text-[11px] font-black uppercase tracking-[2px] ${config.is_dark_mode ? 'text-blue-400' : 'text-blue-600'}`}>
              {current.nama_bank}
            </p>
            <p className={`text-[10px] font-black uppercase tracking-[1px] opacity-60 ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
              A.N {current.atas_nama}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
