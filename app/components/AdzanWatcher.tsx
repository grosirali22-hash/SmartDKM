'use client';

import React, { useState, useEffect } from 'react';
import AdzanOverlay from './AdzanOverlay';
import { useJadwalShalat } from '../hooks/useJadwalShalat';

// Nama shalat sesuai output hook
const SHALAT_NAMES: Record<string, string> = {
  subuh: 'SUBUH',
  dzuhur: 'DZUHUR',
  ashar: 'ASHAR',
  maghrib: 'MAGHRIB',
  isya: 'ISYA',
};

import { usePathname } from 'next/navigation';

export default function AdzanWatcher() {
  const pathname = usePathname();
  const { jadwal } = useJadwalShalat();
  const [showAdzan, setShowAdzan] = useState(false);
  const [namaShalat, setNamaShalat] = useState('');

  useEffect(() => {
    if (!jadwal || pathname?.startsWith('/login')) return;

    const checkTime = setInterval(() => {
      const now = new Date();
      const jamMenit = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const detik = now.getSeconds();

      if (showAdzan) return;

      // 1. TARTIL / TAHRIM (5 menit sebelum Adzan)
      // Kita cek selisih waktu secara manual atau loop
      for (const [key, waktu] of Object.entries(jadwal)) {
        if (!SHALAT_NAMES[key]) continue;

        const [h, m] = waktu.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(h, m, 0);
        
        const diffMs = prayerDate.getTime() - now.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        // Play Tartil jika selisih 5 menit
        if (diffMin === 5 && detik === 0) {
          playAudio('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'); // Placeholder Tartil
        }

        // 2. BEEP (1 menit sebelum Adzan)
        if (diffMin === 1 && detik === 0) {
          playAudio('/audio/beep.mp3');
        }

        // 3. ADZAN (Saat waktu tiba)
        if (jamMenit === waktu && detik === 0) {
          setNamaShalat(SHALAT_NAMES[key]);
          setShowAdzan(true);
          playAudio('/audio/adzan.mp3');
          // Overlay otomatis tutup setelah 15 menit
          setTimeout(() => {
            setShowAdzan(false);
            playAudio('/audio/iqomah.mp3');
          }, 15 * 60 * 1000);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [jadwal, showAdzan]);

  const playAudio = (src: string) => {
    try {
      const audio = new Audio(src);
      audio.play().catch(e => console.warn("Audio play blocked by browser policy. Interaction required.", e));
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  return (
    <AdzanOverlay
      visible={showAdzan}
      namaShalat={namaShalat}
      onClose={() => setShowAdzan(false)}
    />
  );
}
