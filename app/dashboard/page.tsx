'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useJadwalShalat } from '../hooks/useJadwalShalat';
import { useGlobalContext } from '../context/GlobalContext';
import { supabase } from '../lib/supabase';
import HeaderMasjid from '../components/HeaderMasjid';
import RunningText from '../components/RunningText';
import PrayerCountdown from '../components/PrayerCountdown';
import { Users, BookOpen, Film, Star, Calendar, Clock, CalendarDays, MapPin, Wallet, Heart, Type, Settings } from 'lucide-react';

const WAKTU_KEYS = [
  { key: 'imsyak', label: 'Imsyak', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { key: 'subuh', label: 'Subuh', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'syuruq', label: 'Syuruq', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'dhuha', label: 'Dhuha', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { key: 'dzuhur', label: 'Dzuhur', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'ashar', label: 'Ashar', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { key: 'maghrib', label: 'Maghrib', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { key: 'isya', label: 'Isya', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
] as const;

// Cari waktu shalat berikutnya
function getNextPrayer(jadwal: Record<string, string>): { key: string; label: string; waktu: string } | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Hanya waktu shalat wajib + imsyak untuk penanda
  const prayerOrder = ['imsyak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];

  for (const key of prayerOrder) {
    const waktu = jadwal[key];
    if (!waktu || waktu === '--:--') continue;
    const [h, m] = waktu.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      const found = WAKTU_KEYS.find((w) => w.key === key);
      return { key, label: found?.label || key, waktu };
    }
  }
  // Jika semua sudah lewat, kembali ke imsyak besok
  return { key: 'imsyak', label: 'Imsyak', waktu: jadwal.imsyak || '--:--' };
}

export default function DashboardPage() {
  const { jadwal, lokasiNama, isLoading: jadwalLoading } = useJadwalShalat();
  const { config, profile, user } = useGlobalContext();

  const [totalKas, setTotalKas] = useState<number>(0);

  useEffect(() => {
    async function fetchTotalKas() {
      const CACHE_KEY = 'smartdkm_total_kas';
      const CACHE_TTL = 3600000; // 1 Jam

      // Try cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { total, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setTotalKas(total);
          }
        }
      } catch (e) {
        console.warn("Cache error:", e);
      }

      const { data, error } = await supabase.from('keuangan').select('tipe, nominal');
      if (!error && data) {
        const total = data.reduce((acc, curr) => 
          curr.tipe === 'debit' ? acc + curr.nominal : acc - curr.nominal, 0
        );
        setTotalKas(total);
        
        // Save to cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            total,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn("Cache save error:", e);
        }
      }
    }
    fetchTotalKas();
  }, []);

  const hariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextPrayer = jadwal ? getNextPrayer(jadwal as Record<string, string>) : null;

  const quickStats = [
    { label: 'Kas Masjid', value: `Rp ${totalKas.toLocaleString('id-ID')}`, icon: Wallet, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Donasi Masuk', value: 'Lihat Detail', icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Petugas Shalat', value: 'Lengkap', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pengurus DKM', value: '12 Orang', icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div className="space-y-8 pt-4 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Assalamu'alaikum, {profile?.name || 'Admin'}</h1>
          <p className="text-muted-foreground font-medium">Selamat datang di dashboard {config.nama_masjid}.</p>
        </div>
        <div className="flex items-center gap-2 bg-card text-card-foreground px-4 py-2 rounded-lg border border-border shadow-sm">
          <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold">{hariIni}</span>
        </div>
      </div>

      {/* Hero: Next Prayer Highlighting */}
      <div className="relative overflow-hidden bg-zinc-900 rounded-lg p-5 md:p-12 text-white shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                Waktu Shalat Berikutnya: {nextPrayer?.label || '...'}
              </p>
            </div>
            
            <h2 className="text-7xl md:text-8xl font-black mb-4 tracking-tighter tabular-nums text-white lg:-ml-1">
              {jadwalLoading ? '--:--' : (nextPrayer?.waktu || '--:--')}
            </h2>
            
            <div className="flex items-center gap-4 text-blue-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-bold">{jadwalLoading ? 'Mencari lokasi...' : lokasiNama}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {!jadwalLoading && nextPrayer && (
              <PrayerCountdown targetTime={nextPrayer.waktu} targetLabel={nextPrayer.label} />
            )}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card text-card-foreground p-5 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-lg font-black text-foreground">{stat.value}</h4>
            </div>
          );
        })}
      </div>

      {/* Prayer Times Grid */}
      <div className="bg-card text-card-foreground rounded-lg border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Jadwal Shalat Hari Ini</h3>
            <p className="text-muted-foreground text-xs font-medium mt-1">Estimasi waktu shalat berdasarkan koordinat geografis.</p>
          </div>
          <Link href="/jadwal" className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-bold hover:bg-secondary/80 transition-colors uppercase tracking-widest">
            Detail →
          </Link>
        </div>

        {jadwalLoading ? (
          <div className="py-12 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Sinkronisasi Jadwal...</p>
          </div>
        ) : jadwal ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WAKTU_KEYS.map(({ key, label, color, bg }) => (
              <div
                key={key}
                className={`relative group rounded-lg p-5 transition-all duration-300 border ${
                  nextPrayer?.key === key 
                    ? 'bg-blue-600 dark:bg-blue-600 border-blue-600 ring-4 ring-blue-500/10' 
                    : 'bg-card border-border hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-[2px] mb-2 ${nextPrayer?.key === key ? 'text-blue-100' : 'text-muted-foreground'}`}>{label}</p>
                <div className="flex items-center justify-between">
                  <p className={`text-2xl font-black tabular-nums tracking-tight ${nextPrayer?.key === key ? 'text-white' : 'text-foreground'}`}>
                    {(jadwal as any)[key] || '--:--'}
                  </p>
                  {nextPrayer?.key === key && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 bg-muted/50 rounded-lg text-center border-2 border-solid border-border">
             <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
             <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Jadwal Tidak Tersedia</p>
          </div>
        )}
      </div>

    </div>
  );
}


