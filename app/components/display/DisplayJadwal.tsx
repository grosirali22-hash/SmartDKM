'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useJadwalShalat } from '../../hooks/useJadwalShalat';
import { Sun, Sunrise, Sunset, Moon, CloudSun, Clock } from 'lucide-react';

const WAKTU_KEYS = [
  { key: 'imsyak',  label: 'Imsyak',  icon: Clock,     ramadanOnly: true  },
  { key: 'subuh',   label: 'Subuh',   icon: Sunrise,   ramadanOnly: false },
  { key: 'syuruq',  label: 'Syuruq',  icon: Sun,       ramadanOnly: true  },
  { key: 'dhuha',   label: 'Dhuha',   icon: CloudSun,  ramadanOnly: false },
  { key: 'dzuhur',  label: 'Dzuhur',  icon: Sun,       ramadanOnly: false },
  { key: 'ashar',   label: 'Ashar',   icon: CloudSun,  ramadanOnly: false },
  { key: 'maghrib', label: 'Maghrib', icon: Sunset,    ramadanOnly: false },
  { key: 'isya',    label: 'Isya',    icon: Moon,      ramadanOnly: false },
] as const;

import PrayerCountdown from '../PrayerCountdown';
import { useGlobalContext } from '../../context/GlobalContext';

/** Cek apakah hari ini bulan Ramadan berdasarkan kalender Hijriah */
function isRamadanNow(): boolean {
  try {
    const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'numeric' }).formatToParts(new Date());
    const month = parts.find(p => p.type === 'month')?.value;
    return month === '٩' || month === '9';
  } catch {
    return false;
  }
}

export default function DisplayJadwal() {
  const { config } = useGlobalContext();
  const { jadwal, isLoading } = useJadwalShalat();
  const isRamadan = isRamadanNow();

  // Filter daftar waktu: imsyak & syuruq hanya muncul saat Ramadan
  const visibleKeys = WAKTU_KEYS.filter(w => !w.ramadanOnly || isRamadan);

  const getNextPrayer = () => {
    if (!jadwal) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    // Hanya sertakan imsyak di urutan next-prayer saat Ramadan
    const prayerOrder = isRamadan
      ? ['imsyak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']
      : ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    for (const key of prayerOrder) {
      if (!jadwal[key] || jadwal[key] === '--:--') continue;
      const [h, m] = (jadwal[key] as string).split(':').map(Number);
      if (h * 60 + m > currentMinutes) return key;
    }
    return 'subuh';
  };

  const nextPrayerKey = getNextPrayer();

  return (
    <div className={`h-full w-full rounded-lg overflow-hidden flex flex-col transition-all duration-500 relative
      border shadow-2xl ${config.is_dark_mode 
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-white/10' 
          : 'bg-white border-slate-200'}`}
    >
      {/* Top glowing accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/0 via-primary to-primary/0" />

      {/* Header */}
      <div className={`px-4 pt-2 pb-2 flex flex-col gap-1 shrink-0 border-b ${config.is_dark_mode ? 'border-white/10' : 'border-slate-100'}`}>
        <h3 className={`text-2xl font-black tracking-tighter text-center ${config.is_dark_mode ? 'text-white' : 'text-slate-900'}`}>
          Jadwal Shalat
        </h3>

        {nextPrayerKey && jadwal && !isLoading && (
          <PrayerCountdown
            targetTime={(jadwal as any)[nextPrayerKey]}
            targetLabel={visibleKeys.find(w => w.key === nextPrayerKey)?.label || ''}
            className="w-full"
          />
        )}
      </div>

      {/* Prayer list */}
      <div className="flex-1 min-h-0 overflow-hidden px-2 py-2">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-lg animate-spin" />
            <p className="font-black text-[10px] uppercase tracking-widest text-white/50">
              Sinkronisasi GPS...
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-1 h-full"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.04 } }
            }}
          >
            {visibleKeys.map(({ key, label, icon: Icon }) => {
              const isNext = key === nextPrayerKey;
              // Saat bukan Ramadan hanya 6 baris → ukuran lebih besar
              const big = !isRamadan;
              return (
                <motion.div
                  key={key}
                  variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                  className={`relative rounded-md flex items-center justify-between px-3 py-1.5 overflow-hidden transition-all duration-500
                    ${isNext
                      ? config.is_dark_mode
                        ? 'bg-gradient-to-r from-primary/30 via-primary/20 to-transparent border border-primary/40 shadow-[0_0_20px_-4px_rgba(16,185,129,0.4)] scale-[1.01] z-10'
                        : 'bg-blue-50 border border-blue-200 scale-[1.01] z-10'
                      : config.is_dark_mode
                        ? 'bg-white/5 border border-white/5'
                        : 'bg-slate-50 border border-slate-100'
                    }`}
                >
                  {/* Glow strip for next */}
                  {isNext && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                  {isNext && (
                    <div className="absolute inset-0 animate-pulse bg-primary/5 pointer-events-none rounded-lg" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon className={`shrink-0 transition-all duration-500
                      ${big ? 'w-6 h-6' : 'w-5 h-5'}
                      ${isNext
                        ? (config.is_dark_mode ? 'text-primary drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'text-blue-600')
                        : (config.is_dark_mode ? 'text-white/25' : 'text-slate-300')
                      }`}
                    />
                    <p className={`font-black uppercase tracking-[2px] transition-all duration-500
                      ${big ? 'text-base' : 'text-sm'}
                      ${isNext
                        ? (config.is_dark_mode ? 'text-white' : 'text-blue-700')
                        : (config.is_dark_mode ? 'text-white/40' : 'text-slate-400')
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                  <p className={`font-black tabular-nums tracking-tighter transition-all duration-500
                    ${big ? 'text-3xl' : 'text-2xl'}
                    ${isNext
                      ? (config.is_dark_mode ? 'text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'text-blue-600')
                      : (config.is_dark_mode ? 'text-white/50' : 'text-slate-500')
                    }`}
                  >
                    {jadwal ? (jadwal as any)[key] : '--:--'}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
