'use client';

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { useGlobalContext } from '../context/GlobalContext';
import { GlobalConfig } from '../types/config';

interface PrayerCountdownProps {
  targetTime: string; // "HH:MM"
  targetLabel: string; // "Maghrib"
  className?: string;
}

export default function PrayerCountdown({ targetTime, targetLabel, className }: PrayerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const { config } = useGlobalContext() as { config: GlobalConfig };
  const isNeumorph = config.tema_warna === 'neumorph';

  useEffect(() => {
    if (!targetTime || targetTime === '--:--') return;

    const [targetH, targetM] = targetTime.split(':').map(Number);

    const calculateTimeLeft = () => {
      const now = new Date();
      
      const target = new Date();
      target.setHours(targetH, targetM, 0, 0);

      if (target.getTime() < now.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      
      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  if (!timeLeft) return null;

  return (
    <div className={`flex items-center gap-4 self-start px-6 py-4 rounded-lg transition-all duration-500 
      ${isNeumorph 
        ? 'nm-inset !bg-transparent' 
        : (config.is_dark_mode 
            ? 'bg-zinc-900/30 backdrop-blur-md border border-white/10' 
            : 'bg-white shadow-xl shadow-red-900/5 border border-slate-100')
      } ${className || 'mt-6'}`}>
      <div className={`flex items-center gap-3 ${isNeumorph ? 'text-primary' : (config.is_dark_mode ? 'text-red-400' : 'text-red-600')}`}>
        <Timer className="w-6 h-6" />
        <span className={`text-[10px] font-black uppercase tracking-[3px] leading-tight transition-all 
          ${config.is_dark_mode ? 'text-white/60' : 'text-slate-500'}`}>
          Menuju<br/>{targetLabel}
        </span>
      </div>
      
      <div className={`flex items-center gap-2 font-black text-3xl tabular-nums tracking-tighter transition-all 
        ${isNeumorph ? 'text-foreground' : (config.is_dark_mode ? 'text-red-400' : 'text-red-600')}`}>
        <div className="w-11 text-center">{String(timeLeft.hours).padStart(2, '0')}</div>
        <span className={`opacity-40 text-2xl pb-1 ${isNeumorph ? 'text-primary' : (config.is_dark_mode ? 'text-red-400' : 'text-red-600')}`}>:</span>
        <div className="w-11 text-center">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <span className={`opacity-40 text-2xl pb-1 ${isNeumorph ? 'text-primary' : (config.is_dark_mode ? 'text-red-400' : 'text-red-600')}`}>:</span>
        <div className="w-11 text-center">{String(timeLeft.seconds).padStart(2, '0')}</div>
      </div>
    </div>
  );
}
