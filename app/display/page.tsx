'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { supabase } from '../lib/supabase';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DisplayHeader from '../components/display/DisplayHeader';
import DisplayJadwal from '../components/display/DisplayJadwal';
import DisplaySlider from '../components/display/DisplaySlider';
import DisplayDonasi from '../components/display/DisplayDonasi';
import DisplayPHBIOrKajian from '../components/display/DisplayPHBIOrKajian';
import DisplayKasOrZakat from '../components/display/DisplayKasOrZakat';
import RunningText from '../components/RunningText';

export default function DisplayPage() {
  const { config, setConfig } = useGlobalContext();
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<any[]>([]);

  const toggleDarkMode = async () => {
    const newMode = !config.is_dark_mode;
    
    // Update local state first for instant feedback
    setConfig(prev => ({ ...prev, is_dark_mode: newMode }));
    
    // Sync to database
    try {
      await supabase
        .from('settings')
        .update({ is_dark_mode: newMode })
        .eq('id', 1);
    } catch (err) {
      console.error("Gagal update dark mode:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const fetchLayout = async () => {
      const { data } = await supabase.from('signage_layout').select('*').order('urutan', { ascending: true });
      if (data) setLayout(data);
    };
    fetchLayout();
  }, []);

  if (!mounted) return (
    <div className={`fixed inset-0 w-full h-full ${config.is_dark_mode ? 'bg-slate-950' : 'bg-slate-50'}`} />
  );

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden flex flex-col theme-blue ${config.is_dark_mode ? 'dark' : ''} transition-colors duration-500
      ${config.is_dark_mode ? 'bg-slate-950' : 'bg-slate-50'}`}
    >

      {/* 3-Column Grid Layout */}
      <div className="flex-1 flex overflow-hidden p-1 gap-1 min-h-0">

        {/* Left Column (20%) — Header Info + Prayer Times */}
        <div className="w-[20%] flex flex-col gap-1 overflow-hidden">
          {/* Mosque Identity & Clock */}
          <div className="shrink-0" style={{ height: '25%' }}>
            <DisplayHeader />
          </div>

          {/* Prayer Times */}
          <div className="flex-1 overflow-hidden min-h-0">
            <DisplayJadwal />
          </div>
        </div>

        {/* Center Column — Main Media */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`h-full w-full rounded-lg relative overflow-hidden transition-all duration-700
            p-1 border shadow-2xl ${config.is_dark_mode ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'}
            `}
          >
            <div className="w-full h-full rounded-lg overflow-hidden">
              <DisplaySlider />
            </div>
          </div>
        </div>

        {/* Right Column (20%) — Info Modules */}
        <div className="w-[20%] flex flex-col gap-1 overflow-hidden">
          <div className="flex-1 min-h-0">
            <DisplayKasOrZakat />
          </div>
          <div className="flex-1 min-h-0">
            <DisplayDonasi />
          </div>
          <div className="flex-1 min-h-0">
            <DisplayPHBIOrKajian />
          </div>
        </div>

      </div>

      {/* FOOTER: Fixed Running Text */}
      <div className="w-full shrink-0 relative z-50">
        <RunningText teks={config.running_text || 'Selamat Datang di Portal Informasi Masjid — Smart DKM by Antigravity Digital Signage System'} />
      </div>

      {/* Floating Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-24 right-8 z-[999] w-14 h-14 rounded-lg flex items-center justify-center shadow-2xl transition-all duration-500
          ${config.is_dark_mode 
              ? 'bg-slate-800 text-amber-400 border border-slate-700' 
              : 'bg-white text-slate-700 border border-slate-200 shadow-xl'
          }`}
      >
        <AnimatePresence mode="wait">
          {config.is_dark_mode ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Sun className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <Moon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Global CSS for marquee and hide bar */}
      <style jsx global>{`
        body {
          cursor: none;
          background: ${config.is_dark_mode ? '#020617' : '#f8fafc'};
        }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
}
