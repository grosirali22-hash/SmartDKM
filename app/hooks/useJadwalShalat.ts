'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface JadwalShalat {
  imsyak: string;
  subuh: string;
  syuruq: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  [key: string]: string;
}

export function useJadwalShalat() {
  const [jadwal, setJadwal] = useState<JadwalShalat | null>(null);
  const [lokasiNama, setLokasiNama] = useState('Mencari lokasi...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getJadwal = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const CACHE_KEY = 'smartdkm_prayer_cache';
      const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 jam

      try {
        // --- 0. Progress Caching ---
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, lokasi, timestamp, date } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_TTL;
          if (date === todayStr && !isExpired) {
            setJadwal(data);
            setLokasiNama(lokasi);
            setIsLoading(false);
            return; // Gunakan cache, stop di sini
          }
        }

        setIsLoading(true);

        // 1. Cek dulu di database Supabase untuk koreksi/override hari ini
        const { data: dbData, error: dbError } = await supabase
          .from('jadwal_shalat')
          .select('*')
          .eq('tanggal', todayStr)
          .eq('tampilkan', true)
          .maybeSingle();

        if (dbData && !dbError) {
          const k = dbData.koreksi_menit || 0;
          const applyK = (t: string, offset: number) => {
             if (!t || t === '--:--') return t;
             const [h, m] = t.split(':').map(Number);
             const total = (h * 60 + m + offset + 1440) % 1440;
             return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
          };

          const finalJadwal = {
            imsyak: applyK(dbData.imsyak, k),
            subuh: applyK(dbData.subuh, k),
            syuruq: applyK(dbData.syuruq, k),
            dhuha: applyK(dbData.dhuha, k),
            dzuhur: applyK(dbData.dzuhur, k),
            ashar: applyK(dbData.ashar, k),
            maghrib: applyK(dbData.maghrib, k),
            isya: applyK(dbData.isya, k),
          };

          setJadwal(finalJadwal);
          setLokasiNama('Jadwal Dikoreksi (Local)');
          setIsLoading(false);
          
          // Save to cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: finalJadwal,
            lokasi: 'Jadwal Dikoreksi (Local)',
            timestamp: Date.now(),
            date: todayStr
          }));
          return;
        }

        // 2. Jika tidak ada di DB, Minta izin GPS via Browser Geolocation API
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
          });
        });

        const { latitude, longitude } = position.coords;

        // 3. Reverse geocode via nominatim
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const geoData = await geoRes.json();
        const kota =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.county ||
          'Jakarta';
        const provinsi = geoData.address?.state || 'DKI Jakarta';
        const finalLokasi = `${kota}, ${provinsi}`;
        setLokasiNama(finalLokasi);

        // 4. Ambil Jadwal dari API EQuran.id
        const response = await fetch('https://equran.id/api/v2/shalat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provinsi: provinsi,
            kabkota: kota,
            bulan: new Date().getMonth() + 1,
            tahun: new Date().getFullYear(),
          }),
        });

        const resJson = await response.json();
        if (resJson.code === 200) {
          const tglHariIni = new Date().getDate();
          const jadwalHariIni = resJson.data.jadwal.find(
            (j: { tanggal: number }) => j.tanggal === tglHariIni
          );
          if (jadwalHariIni) {
            const finalJadwal = {
              imsyak: jadwalHariIni.imsak || jadwalHariIni.imsyak || '',
              subuh: jadwalHariIni.subuh || '',
              syuruq: jadwalHariIni.terbit || jadwalHariIni.syuruq || '',
              dhuha: jadwalHariIni.dhuha || '',
              dzuhur: jadwalHariIni.dzuhur || '',
              ashar: jadwalHariIni.ashar || '',
              maghrib: jadwalHariIni.maghrib || '',
              isya: jadwalHariIni.isya || '',
            };
            setJadwal(finalJadwal);

            // Save to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: finalJadwal,
              lokasi: finalLokasi,
              timestamp: Date.now(),
              date: todayStr
            }));
          }
        }
      } catch {
        // Fallback
        const fallbackLokasi = 'Jakarta (Default)';
        const fallbackJadwal = {
          imsyak: '04:25',
          subuh: '04:35',
          syuruq: '05:50',
          dhuha: '06:15',
          dzuhur: '12:05',
          ashar: '15:15',
          maghrib: '18:10',
          isya: '19:20',
        };
        setLokasiNama(fallbackLokasi);
        setJadwal(fallbackJadwal);
      } finally {
        setIsLoading(false);
      }
    };

    getJadwal();
  }, []);

  return { jadwal, lokasiNama, isLoading };
}
