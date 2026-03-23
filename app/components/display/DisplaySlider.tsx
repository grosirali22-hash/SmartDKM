'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useGlobalContext } from '../../context/GlobalContext';

export default function DisplaySlider() {
  const { config } = useGlobalContext();
  const [slides, setSlides] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data } = await supabase
        .from('slider')
        .select('*')
        .eq('aktif', true)
        .order('urutan', { ascending: true });
      if (data) setSlides(data);
    };
    fetchSlides();

    // Real-time: update Slider when database changes
    const channel = supabase
      .channel('slider_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slider' }, () => {
        fetchSlides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [slides]);

  if (slides.length === 0) return (
    <div className={`h-full w-full rounded-lg flex items-center justify-center transition-all duration-500 
      ${config.is_dark_mode ? 'bg-slate-800 border-4 border-slate-700 shadow-2xl' : 'bg-slate-50 border-4 border-slate-100'}`}>
      <p className="text-slate-500 font-black uppercase tracking-[4px] text-xs">Tidak ada slide aktif</p>
    </div>
  );

  const current = slides[activeIdx];

  return (
    <div className={`h-full w-full rounded-lg relative overflow-hidden transition-all duration-500 
      ${config.is_dark_mode ? 'bg-slate-900 border border-white/5' : 'bg-white border border-slate-200'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* 1. Background Blur Layer */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm opacity-100 scale-105"
            style={{ backgroundImage: `url(${current.image_url})` }}
          />

          {/* 2. Main Media Layer */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-2">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-full h-full rounded-lg transition-all duration-500 overflow-hidden"
            >
              <img 
                src={current.image_url} 
                alt={current.judul || 'Slider'} 
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>

          {/* Premium Overlay for Neumorph */}
          {current.judul && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent flex flex-col justify-end p-10"
            >
              <h2 className={`text-4xl font-black leading-tight tracking-tighter drop-shadow-sm transition-all duration-500 
                ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
                {current.judul}
              </h2>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Indicators hidden for cleaner TV display */}
    </div>
  );
}
